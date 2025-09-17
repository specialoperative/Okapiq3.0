import logging
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from pydantic import BaseModel
import time
import re
import aiohttp
import urllib.parse
import os

logger = logging.getLogger(__name__)

router = APIRouter()

# Import settings from config
from ..core.config import settings
GOOGLE_MAPS_API_KEY = settings.GOOGLE_MAPS_API_KEY
YELP_API_KEY = settings.YELP_API_KEY

def _map_to_industry_name(google_types: List[str] = None, yelp_categories: List[str] = None, requested_industry: str = None) -> str:
    """Map Google Maps types or Yelp categories to our standard industry names"""
    
    # Standard industry names that match the frontend dropdown
    industry_mapping = {
        # HVAC related (prioritize HVAC over general contractor)
        'hvac': ['HVAC'],
        'heating': ['HVAC'],
        'cooling': ['HVAC'], 
        'air_conditioning': ['HVAC'],
        'plumber': ['Plumbing'],
        'plumbing': ['Plumbing'],
        'electrician': ['Electrical'],
        'electrical': ['Electrical'],
        'general_contractor': ['Construction'],  # Will be overridden by more specific matches
        'contractor': ['Construction'],
        'construction': ['Construction'],
        
        # Hardware and Home Improvement
        'hardware_store': ['Hardware Retail'],
        'home_goods_store': ['Home Improvement'],
        'home_improvement': ['Home Improvement'],
        'handyman': ['Handyman Services'],
        'tool_rental': ['Tool Rental'],
        'equipment_rental': ['Tool Rental'],
        
        # Landscaping and Garden
        'landscaping': ['Landscaping'],
        'lawn_care': ['Lawn & Garden'],
        'garden_center': ['Lawn & Garden'],
        'nursery': ['Lawn & Garden'],
        
        # Automotive
        'car_repair': ['Automotive'],
        'auto_repair': ['Automotive'],
        'automotive': ['Automotive'],
        'gas_station': ['Automotive'],
        
        # Food and Restaurant
        'restaurant': ['Restaurant'],
        'food': ['Restaurant'],
        'meal_takeaway': ['Restaurant'],
        'meal_delivery': ['Restaurant'],
        'cafe': ['Restaurant'],
        
        # Retail
        'store': ['Retail'],
        'shopping_mall': ['Retail'],
        'clothing_store': ['Retail'],
        
        # Healthcare
        'hospital': ['Healthcare'],
        'doctor': ['Healthcare'],
        'dentist': ['Healthcare'],
        'pharmacy': ['Healthcare'],
        
        # Services
        'real_estate_agency': ['Real Estate'],
        'accounting': ['Accounting Firms'],
        'lawyer': ['Professional Services'],
        'insurance_agency': ['Professional Services'],
        'it_services': ['IT Services'],
        'security': ['Security Guards'],
        'transportation': ['Transportation'],
        'education': ['Education'],
        'entertainment': ['Entertainment'],
        'manufacturing': ['Manufacturing']
    }
    
    # If we have a requested industry, prioritize it for relevant businesses
    if requested_industry:
        # For HVAC searches, if we see plumber + general_contractor, it's likely HVAC
        if requested_industry.upper() == 'HVAC':
            all_types = []
            if google_types:
                all_types.extend([t.lower() for t in google_types])
            if yelp_categories:
                all_types.extend([c.lower().replace(' ', '_') for c in yelp_categories])
            
            # Check if this looks like an HVAC business
            hvac_indicators = ['plumber', 'general_contractor', 'contractor', 'heating', 'cooling', 'hvac']
            has_hvac_indicators = any(indicator in all_types for indicator in hvac_indicators)
            
            if has_hvac_indicators:
                return 'HVAC'
        
        # Check if any of the types/categories match the requested industry
        all_types = []
        if google_types:
            all_types.extend([t.lower() for t in google_types])
        if yelp_categories:
            all_types.extend([c.lower().replace(' ', '_') for c in yelp_categories])
        
        # Look for direct matches first
        for type_name in all_types:
            if type_name in industry_mapping:
                mapped_industries = industry_mapping[type_name]
                # If the requested industry is in the mapped industries, return it
                if requested_industry in mapped_industries:
                    return requested_industry
        
        # If no direct match, but requested industry is standard, return it
        standard_industries = [
            'Home Improvement', 'Hardware Retail', 'Handyman Services', 'Tool Rental', 'Lawn & Garden',
            'HVAC', 'Plumbing', 'Electrical', 'Landscaping', 'Construction',
            'Restaurant', 'Retail', 'Healthcare', 'Automotive', 'Manufacturing',
            'IT Services', 'Real Estate', 'Education', 'Entertainment', 'Transportation',
            'Accounting Firms', 'Security Guards', 'Fire and Safety'
        ]
        if requested_industry in standard_industries:
            return requested_industry
    
    # Try to map from the types/categories
    all_types = []
    if google_types:
        all_types.extend([t.lower() for t in google_types])
    if yelp_categories:
        all_types.extend([c.lower().replace(' ', '_') for c in yelp_categories])
    
    for type_name in all_types:
        if type_name in industry_mapping:
            return industry_mapping[type_name][0]
    
    # Default fallback
    return requested_industry or 'General Business'

def _is_relevant_business(business_name: str, industry: str) -> bool:
    """Check if a business name is relevant to the specified industry"""
    if not business_name or not industry:
        return True
    
    name_lower = business_name.lower()
    industry_lower = industry.lower()
    
    # Define industry-specific keywords that should be present
    industry_keywords = {
        'hvac': [
            'hvac', 'heating', 'cooling', 'air conditioning', 'ac', 'furnace', 
            'heat pump', 'ductwork', 'ventilation', 'climate control', 'thermal',
            'refrigeration', 'boiler', 'geothermal'
        ],
        'plumbing': [
            'plumbing', 'plumber', 'pipe', 'drain', 'sewer', 'water heater',
            'faucet', 'toilet', 'sink', 'bathroom', 'kitchen', 'leak'
        ],
        'electrical': [
            'electric', 'electrical', 'electrician', 'wiring', 'circuit',
            'panel', 'outlet', 'lighting', 'generator', 'solar'
        ],
        'landscaping': [
            'landscape', 'landscaping', 'lawn', 'garden', 'tree', 'grass',
            'irrigation', 'sprinkler', 'yard', 'outdoor', 'nursery'
        ],
        'automotive': [
            'auto', 'car', 'vehicle', 'automotive', 'repair', 'service',
            'mechanic', 'garage', 'tire', 'oil', 'brake', 'engine'
        ],
        'restaurant': [
            'restaurant', 'cafe', 'diner', 'grill', 'kitchen', 'food',
            'dining', 'bistro', 'eatery', 'pizza', 'burger', 'bar'
        ]
    }
    
    # Get keywords for the industry
    keywords = industry_keywords.get(industry_lower, [])
    if not keywords:
        return True  # If no specific keywords, allow all
    
    # Check if any keyword is present in the business name
    for keyword in keywords:
        if len(keyword) <= 2:  # For short keywords like "ac", require word boundaries
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, name_lower):
                return True
        else:  # For longer keywords, allow partial matches
            if keyword in name_lower:
                return True
    
    return False

class MarketScanRequest(BaseModel):
    location: str
    industry: Optional[str] = None
    radius_miles: Optional[int] = 15
    max_businesses: Optional[int] = 20
    crawl_sources: Optional[List[str]] = ['google_maps', 'yelp']
    enrichment_types: Optional[List[str]] = ['website', 'email']
    analysis_types: Optional[List[str]] = []
    use_cache: Optional[bool] = True
    priority: Optional[int] = 1

async def extract_email_from_website(website_url: str) -> Optional[str]:
    """Extract email from a business website"""
    if not website_url:
                    return None
    
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            async with session.get(website_url, headers={'User-Agent': 'Mozilla/5.0'}) as response:
                if response.status == 200:
                    text = await response.text()
                    # Look for email patterns
                    email_patterns = [
                        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                        r'mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})'
                    ]
                    
                    for pattern in email_patterns:
                        matches = re.findall(pattern, text, re.IGNORECASE)
                        if matches:
                            # Filter out common non-business emails
                            filtered_emails = [
                                email for email in matches 
                                if not any(domain in email.lower() for domain in 
                                         ['noreply', 'no-reply', 'donotreply', 'example.com', 'test.com'])
                            ]
                            if filtered_emails:
                                return filtered_emails[0]
    except Exception as e:
        logger.debug(f"Email extraction failed for {website_url}: {e}")
    
    return None

async def search_google_maps_places(location: str, industry: str, max_results: int = 20) -> List[Dict]:
    """Search Google Maps Places API for businesses"""
    businesses = []
    
    try:
        # Construct search query
        query = f"{industry} in {location}" if industry else f"businesses in {location}"
        
        params = {
            'query': query,
            'key': GOOGLE_MAPS_API_KEY,
            'type': 'establishment'
        }
        
        url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?{urllib.parse.urlencode(params)}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    for place in data.get('results', [])[:max_results]:
                        # Get detailed information
                        place_id = place.get('place_id')
                        if place_id:
                            detail_params = {
                                'place_id': place_id,
                                'fields': 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,types',
                                'key': GOOGLE_MAPS_API_KEY
                            }
                            
                            detail_url = f"https://maps.googleapis.com/maps/api/place/details/json?{urllib.parse.urlencode(detail_params)}"
                            
                            async with session.get(detail_url) as detail_response:
                                if detail_response.status == 200:
                                    detail_data = await detail_response.json()
                                    place_details = detail_data.get('result', {})
                                    
                                    google_types = place_details.get('types', [])
                                    mapped_industry = _map_to_industry_name(
                                        google_types=google_types,
                                        requested_industry=industry
                                    )
                                    
                                    business = {
                                        'business_id': f"gmap_{place_id}",
                                        'name': place_details.get('name', ''),
                                        'category': ', '.join(google_types),
                                        'business_type': mapped_industry,
                                        'industry': industry or 'general',
                                        'address': {
                                            'formatted_address': place_details.get('formatted_address', ''),
                                            'coordinates': [
                                                place.get('geometry', {}).get('location', {}).get('lat', 0),
                                                place.get('geometry', {}).get('location', {}).get('lng', 0)
                                            ]
                                        },
                                        'contact': {
                                            'phone': place_details.get('formatted_phone_number', ''),
                                            'website': place_details.get('website', ''),
                                            'email': '',  # Will be extracted later
                                            'phone_valid': bool(place_details.get('formatted_phone_number')),
                                            'website_valid': bool(place_details.get('website')),
                                            'email_valid': False
                                        },
                                        'metrics': {
                                            'rating': place_details.get('rating', 0),
                                            'review_count': place_details.get('user_ratings_total', 0),
                                            'estimated_revenue': 0,  # Will be estimated
                                            'lead_score': 0,  # Will be calculated
                                            'owner_age': 0,  # Will be estimated
                                            'years_in_business': 0  # Will be estimated
                                        },
                                        'data_quality': 'high',
                                        'data_sources': ['google_maps'],
                                        'source_count': 1,
                                        'last_updated': datetime.now().isoformat(),
                                        'tags': ['google_maps', 'real_data']
                                    }
                                    
                                    # Filter by industry relevance
                                    if not industry or _is_relevant_business(business['name'], industry):
                                        businesses.append(business)
        
    except Exception as e:
        logger.error(f"Google Maps search failed: {e}")
    
    return businesses

async def search_yelp_businesses(location: str, industry: str, max_results: int = 20) -> List[Dict]:
    """Search Yelp API for businesses"""
    businesses = []
    
    try:
        headers = {
            'Authorization': f'Bearer {YELP_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        params = {
            'term': industry or 'business',
            'location': location,
            'limit': min(max_results, 50),  # Yelp API limit
            'sort_by': 'rating'
        }
        
        url = f"https://api.yelp.com/v3/businesses/search?{urllib.parse.urlencode(params)}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    for biz in data.get('businesses', []):
                        yelp_categories = [cat.get('title', '') for cat in biz.get('categories', [])]
                        mapped_industry = _map_to_industry_name(
                            yelp_categories=yelp_categories,
                            requested_industry=industry
                        )
                        
                        business = {
                            'business_id': f"yelp_{biz.get('id', '')}",
                            'name': biz.get('name', ''),
                            'category': ', '.join(yelp_categories),
                            'business_type': mapped_industry,
                            'industry': industry or 'general',
                            'address': {
                                'formatted_address': ', '.join(biz.get('location', {}).get('display_address', [])),
                                'coordinates': [
                                    biz.get('coordinates', {}).get('latitude', 0),
                                    biz.get('coordinates', {}).get('longitude', 0)
                                ]
                            },
                            'contact': {
                                'phone': biz.get('phone', ''),
                                'website': '',  # Yelp doesn't provide website directly
                                'email': '',  # Will be extracted later
                                'phone_valid': bool(biz.get('phone')),
                                'website_valid': False,
                                'email_valid': False
                            },
                            'metrics': {
                                'rating': biz.get('rating', 0),
                                'review_count': biz.get('review_count', 0),
                                'estimated_revenue': 0,  # Will be estimated
                                'lead_score': 0,  # Will be calculated
                                'owner_age': 0,  # Will be estimated
                                'years_in_business': 0  # Will be estimated
                            },
                            'data_quality': 'high',
                            'data_sources': ['yelp'],
                            'source_count': 1,
                            'last_updated': datetime.now().isoformat(),
                            'tags': ['yelp', 'real_data']
                        }
                        
                        # Filter by industry relevance
                        if not industry or _is_relevant_business(business['name'], industry):
                            businesses.append(business)
        
    except Exception as e:
        logger.error(f"Yelp search failed: {e}")
    
    return businesses

async def enrich_business_data(business: Dict) -> Dict:
    """Enrich business data with additional metrics and email extraction"""
    try:
        # Extract email from website if available
        website = business.get('contact', {}).get('website', '')
        if website and not business.get('contact', {}).get('email'):
            email = await extract_email_from_website(website)
            if email:
                business['contact']['email'] = email
                business['contact']['email_valid'] = True
        
        # Estimate revenue based on rating and review count
        rating = business.get('metrics', {}).get('rating', 0)
        review_count = business.get('metrics', {}).get('review_count', 0)
        
        # Simple revenue estimation formula
        base_revenue = 250000  # Base revenue
        rating_multiplier = max(1, rating / 5.0)  # Rating factor
        review_multiplier = min(3, 1 + (review_count / 100))  # Review factor
        
        estimated_revenue = int(base_revenue * rating_multiplier * review_multiplier)
        business['metrics']['estimated_revenue'] = estimated_revenue
        business['metrics']['min_revenue'] = int(estimated_revenue * 0.7)
        business['metrics']['max_revenue'] = int(estimated_revenue * 1.5)
        
        # Calculate lead score
        lead_score = min(100, max(20, int(rating * 15 + min(review_count, 50))))
        business['metrics']['lead_score'] = lead_score
        
        # Estimate owner age and years in business
        business['metrics']['owner_age'] = 35 + int((review_count % 20) + (rating * 3))
        business['metrics']['years_in_business'] = max(2, min(20, int(review_count / 10 + rating)))
        business['metrics']['employee_count'] = max(3, min(25, int(estimated_revenue / 80000)))
        business['metrics']['num_locations'] = 1 if review_count < 100 else 2
        
    except Exception as e:
        logger.error(f"Business enrichment failed for {business.get('name', '')}: {e}")
    
    return business

def aggregate_business_data(businesses: List[Dict]) -> List[Dict]:
    """Aggregate and deduplicate businesses from multiple sources"""
    if not businesses:
        return []
    
    # Group businesses by normalized name
    business_groups = {}
    
    for business in businesses:
        name = business.get('name', '').strip()
        if not name:
            continue
            
        # Normalize name for grouping
        normalized_name = re.sub(r'[^\w\s]', '', name.lower()).strip()
        normalized_name = re.sub(r'\s+', ' ', normalized_name)
        
        if normalized_name not in business_groups:
            business_groups[normalized_name] = []
        business_groups[normalized_name].append(business)
    
    # Merge data from multiple sources for each business group
    aggregated = []
    
    for group_name, group_businesses in business_groups.items():
        if not group_businesses:
            continue
            
        # Start with the business that has the most complete data
        base_business = max(group_businesses, key=lambda b: (
            len(b.get('contact', {}).get('website', '')),
            len(b.get('contact', {}).get('phone', '')),
            len(b.get('contact', {}).get('email', '')),
            b.get('metrics', {}).get('review_count', 0)
        ))
        
        merged_business = base_business.copy()
        
        # Aggregate data from all sources
        all_sources = set()
        all_tags = set()
        
        for biz in group_businesses:
            # Merge contact information (prefer non-empty values)
            contact = merged_business.setdefault('contact', {})
            biz_contact = biz.get('contact', {})
            
            if not contact.get('website') and biz_contact.get('website'):
                contact['website'] = biz_contact['website']
                contact['website_valid'] = biz_contact.get('website_valid', False)
            
            if not contact.get('phone') and biz_contact.get('phone'):
                contact['phone'] = biz_contact['phone']
                contact['phone_valid'] = biz_contact.get('phone_valid', False)
            
            if not contact.get('email') and biz_contact.get('email'):
                contact['email'] = biz_contact['email']
                contact['email_valid'] = biz_contact.get('email_valid', False)
            
            # Aggregate sources and tags
            all_sources.update(biz.get('data_sources', []))
            all_tags.update(biz.get('tags', []))
            
            # Use best metrics (highest rating, most reviews)
            biz_metrics = biz.get('metrics', {})
            merged_metrics = merged_business.setdefault('metrics', {})
            
            if biz_metrics.get('rating', 0) > merged_metrics.get('rating', 0):
                merged_metrics['rating'] = biz_metrics['rating']
            
            if biz_metrics.get('review_count', 0) > merged_metrics.get('review_count', 0):
                merged_metrics['review_count'] = biz_metrics['review_count']
        
        # Update aggregated fields
        merged_business['data_sources'] = list(all_sources)
        merged_business['source_count'] = len(all_sources)
        merged_business['tags'] = list(all_tags) + ['multi_source_aggregated']
        
        aggregated.append(merged_business)
    
    return aggregated

@router.post("/scan")
async def comprehensive_market_scan(request: MarketScanRequest, background_tasks: BackgroundTasks):
    """
    Comprehensive market scan using Google Maps and Yelp APIs
    """
    logger.info(f"Market scan request: {request.location}, industry: {request.industry}")
    
    start_time = time.time()
    request_id = f"req_{int(time.time())}_{abs(hash(request.location + str(time.time())))}"
    
    all_businesses = []
    
    try:
        # Search multiple sources in parallel
        tasks = []
        
        if 'google_maps' in request.crawl_sources:
            tasks.append(search_google_maps_places(
                request.location, 
                request.industry, 
                request.max_businesses
            ))
        
        if 'yelp' in request.crawl_sources:
            tasks.append(search_yelp_businesses(
                request.location, 
                request.industry, 
                request.max_businesses
            ))
        
        # Execute searches in parallel
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, list):
                    all_businesses.extend(result)
                elif isinstance(result, Exception):
                    logger.error(f"Search task failed: {result}")
        
        # Aggregate and deduplicate businesses
        aggregated_businesses = aggregate_business_data(all_businesses)
        
        # Limit results
        final_businesses = aggregated_businesses[:request.max_businesses]
        
        # Enrich business data in parallel
        if 'website' in request.enrichment_types or 'email' in request.enrichment_types:
            enrichment_tasks = [enrich_business_data(biz) for biz in final_businesses]
            enriched_businesses = await asyncio.gather(*enrichment_tasks, return_exceptions=True)
            
            final_businesses = [
                biz if not isinstance(biz, Exception) else final_businesses[i]
                for i, biz in enumerate(enriched_businesses)
            ]
        
        end_time = time.time()
        duration = end_time - start_time
        
        logger.info(f"Market scan completed in {duration:.2f}s, found {len(final_businesses)} businesses")
        
        return {
            "success": True,
            "request_id": request_id,
            "businesses": final_businesses,
            "total_found": len(final_businesses),
            "query_info": {
            "location": request.location,
                "industry": request.industry or "all",
                "radius_miles": request.radius_miles,
                "search_duration_seconds": duration,
                "data_sources": request.crawl_sources
            },
            "metadata": {
            "timestamp": datetime.now().isoformat(),
                "processing_time_ms": int(duration * 1000),
                "api_version": "2.1_real_data",
                "real_data_only": True
            }
        }
        
    except Exception as e:
        logger.error(f"Market scan failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Market scan failed: {str(e)}"
        )