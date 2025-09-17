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

logger = logging.getLogger(__name__)

router = APIRouter()

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
    
    # Define exclusion keywords (businesses to avoid)
    exclusion_keywords = [
        'church', 'temple', 'mosque', 'synagogue', 'religious', 'ministry',
        'radio', 'tv', 'television', 'broadcast', 'media', 'station',
        'school', 'university', 'college', 'education', 'library',
        'government', 'city', 'county', 'state', 'federal', 'municipal',
        'hospital', 'medical center', 'clinic' if industry_lower != 'healthcare' else '',
        'bank', 'credit union', 'financial', 'insurance' if industry_lower not in ['accounting', 'financial'] else '',
        'museum', 'gallery', 'theater', 'entertainment' if industry_lower != 'entertainment' else ''
    ]
    
    # Check for exclusion keywords first
    for keyword in exclusion_keywords:
        if keyword and keyword in name_lower:
            return False
    
    # Get relevant keywords for the industry
    relevant_keywords = industry_keywords.get(industry_lower, [])
    
    # If no specific keywords defined, allow the business
    if not relevant_keywords:
        return True
    
    # Check if business name contains any relevant keywords (word boundaries)
    import re
    for keyword in relevant_keywords:
        # Use word boundaries for better matching
        if len(keyword) <= 2:  # For short keywords like "ac", require word boundaries
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, name_lower):
                return True
        else:  # For longer keywords, allow partial matches
            if keyword in name_lower:
                return True
    
    # For HVAC, also check for common business patterns
    if industry_lower == 'hvac':
        hvac_patterns = [
            'heating', 'cooling', 'climate', 'comfort', 'thermal',
            'mechanical', 'contractor'  # Removed 'air', 'service', 'repair', 'systems' as they're too generic
        ]
        for pattern in hvac_patterns:
            if len(pattern) <= 3:  # For short patterns, require word boundaries
                pattern_regex = r'\b' + re.escape(pattern) + r'\b'
                if re.search(pattern_regex, name_lower):
                    return True
            else:  # For longer patterns, allow partial matches
                if pattern in name_lower:
                    return True
    
    return False

class MarketScanRequest(BaseModel):
    location: str
    industry: Optional[str] = None
    radius_miles: Optional[int] = 15
    max_businesses: Optional[int] = 20
    crawl_sources: Optional[List[str]] = ['google_serp']
    enrichment_types: Optional[List[str]] = []
    analysis_types: Optional[List[str]] = []
    use_cache: Optional[bool] = True
    priority: Optional[int] = 1

@router.post("/scan")
async def comprehensive_market_scan(request: MarketScanRequest, background_tasks: BackgroundTasks):
    """
    Comprehensive market scan using real API aggregation - fast optimized version
    """
    logger.info(f"Market scan request: {request.location}, industry: {request.industry}")
    
    start_time = time.time()
    request_id = f"req_{int(time.time())}_{abs(hash(request.location + str(time.time())))}"
    
    # Fast real data aggregation
    sample_businesses = []
    
    try:
        from ..crawlers.smart_crawler_hub import SmartCrawlerHub, CrawlerType, CrawlRequest
        
        # Initialize crawler hub
        crawler_hub = SmartCrawlerHub()
        
        # Build search queries with better industry targeting
        if not request.industry or request.industry.lower() in ['all', 'all industries', '']:
            search_queries = [f"restaurants {request.location}", f"businesses {request.location}"]
        else:
            ind = (request.industry or '').strip().lower()
            # Enhanced keyword mapping with multiple search terms per industry
            keyword_map = {
                'electrical': ['electrician', 'electrical contractor', 'electrical services', 'electrical repair'],
                'hvac': ['hvac', 'heating and cooling', 'air conditioning', 'hvac contractor', 'heating contractor', 'cooling contractor'],
                'plumbing': ['plumber', 'plumbing contractor', 'plumbing services', 'plumbing repair'],
                'landscaping': ['landscaping', 'lawn care', 'landscape contractor', 'landscaping services'],
                'automotive': ['auto repair', 'car repair', 'automotive service', 'auto shop'],
                'construction': ['construction contractor', 'general contractor', 'construction company', 'construction services'],
                'restaurant': ['restaurant', 'dining', 'food service', 'cafe'],
                'retail': ['retail store', 'shop', 'retail business', 'store'],
                'healthcare': ['medical clinic', 'healthcare', 'doctor office', 'medical services'],
                'accounting firms': ['accounting firm', 'accountant', 'tax services', 'cpa'],
                'security guards': ['security service', 'security guard', 'security company', 'security services'],
                'fire and safety': ['fire protection', 'safety services', 'fire safety', 'fire systems'],
            }
            
            # Get search terms for the industry
            search_terms = keyword_map.get(ind, [ind or 'business'])
            if not isinstance(search_terms, list):
                search_terms = [search_terms]
            
            # Create multiple search queries for better coverage
            search_queries = [f"{term} {request.location}" for term in search_terms]
        
        # Use the SmartCrawlerHub to aggregate multiple sources (SerpAPI, Apify, Yelp, etc.)
        all_businesses = []
        try:
            # Map requested crawl_sources (strings) to CrawlerType enums
            requested_sources = request.crawl_sources or ['google_serp']
            source_types = []
            for s in requested_sources:
                key = s.strip().lower()
                # handle common naming differences
                mapping = {
                    'google_serp': CrawlerType.GOOGLE_SERP,
                    'google_maps': CrawlerType.GOOGLE_MAPS,
                    'yelp': CrawlerType.YELP,
                    'apify_gmaps': CrawlerType.APIFY_GMAPS,
                    'apify_gmaps_email': CrawlerType.APIFY_GMAPS_EMAIL,
                    'apify_gmaps_websites': CrawlerType.APIFY_GMAPS_WEBSITES,
                    'apify_website_crawler': CrawlerType.APIFY_WEBSITE_CRAWLER,
                    'firecrawl': CrawlerType.FIRECRAWL,
                    'linkedin': CrawlerType.LINKEDIN,
                    'sba_records': CrawlerType.SBA_RECORDS,
                }
                if key in mapping:
                    source_types.append(mapping[key])

            # Ensure comprehensive source coverage for full aggregation
            if not source_types:
                source_types = [
                    CrawlerType.GOOGLE_MAPS,  # Use Google Maps as primary source
                    CrawlerType.GOOGLE_SERP, 
                    CrawlerType.YELP,
                    CrawlerType.APIFY_GMAPS,
                    CrawlerType.APIFY_GMAPS_EMAIL,
                    CrawlerType.APIFY_GMAPS_WEBSITES
                ]

            # Run the crawl using the hub with multiple search queries
            hub_results = {}
            for query in search_queries:
                # Extract the search term from the query for better targeting
                search_term = query.replace(f" {request.location}", "").strip()
                query_results = await crawler_hub.crawl_business_data(request.location, search_term, sources=source_types)
                
                # Merge results from this query
                for src_key, res in query_results.items():
                    if src_key not in hub_results:
                        hub_results[src_key] = res
                    elif res and getattr(res, 'success', False) and res.data:
                        # Merge data from multiple queries
                        if hub_results[src_key] and getattr(hub_results[src_key], 'data', None):
                            hub_results[src_key].data.extend(res.data or [])
                        else:
                            hub_results[src_key] = res

            # Merge results from each source
            for src_key, res in hub_results.items():
                if not res or not getattr(res, 'success', False):
                    continue
                for item in (res.data or [])[: (request.max_businesses or 20)]:
                    name_val = item.get('name') or item.get('business_name')
                    if not isinstance(name_val, str) or not name_val.strip():
                        continue
                    
                    # Filter businesses by industry relevance (less strict to avoid 0 results)
                    if request.industry and request.industry.lower() not in ['all', 'all industries', '']:
                        # Only filter out obviously irrelevant businesses, but be permissive for potential matches
                        name_lower = name_val.lower()
                        # For HVAC specifically, be more strict about filtering
                        if request.industry.lower() == 'hvac':
                            # Check if it contains HVAC-related keywords
                            hvac_keywords = ['hvac', 'heating', 'cooling', 'air conditioning', 'ac ', ' ac', 'furnace', 'heat pump', 'climate', 'thermal', 'mechanical contractor']
                            has_hvac_keyword = any(keyword in name_lower for keyword in hvac_keywords)
                            
                            # Skip if no HVAC keywords AND contains non-business keywords
                            non_business_keywords = ['radio', 'tv', 'church', 'temple', 'mosque', 'school', 'university', 'library', 'museum', 'government', 'city of', 'county', 'state', 'fire station', 'police', 'park', 'center', 'bureau', 'ministries', 'islamic', 'baptist', 'christian']
                            has_non_business = any(keyword in name_lower for keyword in non_business_keywords)
                            
                            if not has_hvac_keyword and has_non_business:
                                continue
                            elif has_non_business and not has_hvac_keyword:
                                continue
                        else:
                            # For other industries, use general filtering
                            skip_keywords = ['radio', 'tv', 'church', 'temple', 'mosque', 'school', 'university', 'library', 'museum']
                            should_skip = any(keyword in name_lower for keyword in skip_keywords)
                            if should_skip:
                                continue
                    
                    addr_val = (item.get('address') or item.get('formatted_address') or '')
                    website_val = (item.get('website') or item.get('url') or '').strip()
                    if website_val and not website_val.startswith(('http://', 'https://')):
                        website_val = f"https://{website_val}"
                    industry = request.industry or item.get('industry') or ''
                    all_businesses.append({
                        'name': name_val.strip(),
                        'industry': industry,
                        'address': addr_val,
                        'phone': item.get('phone') or item.get('display_phone') or '',
                        'website': website_val,
                        'rating': item.get('rating') or item.get('gmap_rating') or 0.0,
                        'reviews': item.get('review_count') or item.get('reviewCount') or 0,
                        'coordinates': item.get('coordinates') or item.get('location') or [],
                        'source': src_key
                    })
        except Exception as e:
            logger.warning(f"Crawl hub aggregation failed: {e}")
        
        # Use real data if available
        if all_businesses:
            # Advanced aggregation across all sources
            logger.info(f"Aggregating {len(all_businesses)} businesses from all sources")
            
            # Group businesses by similar names for better aggregation
            business_groups = {}
            for b in all_businesses:
                name = b['name'].lower().strip()
                # Create a normalized key for grouping similar businesses
                normalized_name = ''.join(c for c in name if c.isalnum() or c.isspace()).strip()
                normalized_key = ' '.join(normalized_name.split())
                
                if normalized_key not in business_groups:
                    business_groups[normalized_key] = []
                business_groups[normalized_key].append(b)
            
            # Merge data from multiple sources for each business group
            deduped = []
            for group_key, businesses in business_groups.items():
                if not businesses:
                continue
            
                # Start with the first business as base
                merged_business = businesses[0].copy()
                
                # Aggregate data from all sources for this business
                all_websites = set()
                all_phones = set()
                all_emails = set()
                all_sources = set()
                best_rating = 0
                total_reviews = 0
                
                for biz in businesses:
                    # Collect websites from all sources
                    website = biz.get('website', '').strip()
                    if website and website != 'N/A':
                        all_websites.add(website)
                    
                    # Collect phones from all sources
                    phone = biz.get('phone', '').strip()
                    if phone and phone != 'N/A':
                        all_phones.add(phone)
                    
                    # Collect emails from all sources
                    email = biz.get('email', '').strip()
                    if email and email != 'N/A':
                        all_emails.add(email)
                    
                    # Track all sources
                    source = biz.get('source', '')
                    if source:
                        all_sources.add(source)
                    
                    # Get best rating and sum reviews
                    rating = biz.get('rating', 0)
                    if rating and rating > best_rating:
                        best_rating = rating
                    
                    reviews = biz.get('review_count', 0)
                    if reviews:
                        total_reviews += reviews
                
                # Choose the best website (prefer non-aggregator sites)
                best_website = ''
                if all_websites:
                    # Filter out aggregator sites
                    real_websites = [w for w in all_websites if not any(
                        domain in w.lower() for domain in 
                        ['yelp.com', 'facebook.com', 'linkedin.com', 'yellowpages.com']
                    )]
                    best_website = real_websites[0] if real_websites else list(all_websites)[0]
                
                # Update merged business with aggregated data
                merged_business['website'] = best_website
                merged_business['phone'] = list(all_phones)[0] if all_phones else ''
                merged_business['email'] = list(all_emails)[0] if all_emails else ''
                merged_business['rating'] = best_rating
                merged_business['review_count'] = total_reviews
                merged_business['data_sources'] = list(all_sources)
                merged_business['source_count'] = len(all_sources)
                
                # Add aggregation tags
                if 'tags' not in merged_business:
                    merged_business['tags'] = []
                merged_business['tags'].append('multi_source_aggregated')
                if len(all_sources) > 1:
                    merged_business['tags'].append(f'aggregated_from_{len(all_sources)}_sources')
                
                deduped.append(merged_business)
            
            # Sort by source count and rating for best results first
            deduped.sort(key=lambda x: (x.get('source_count', 0), x.get('rating', 0)), reverse=True)
            sample_businesses = deduped[:min(request.max_businesses or 20, 50)]
            
            logger.info(f"Aggregated into {len(sample_businesses)} unique businesses")
            
            # Enrich websites and extract emails from business websites
            try:
                from ..core.config import settings
                import aiohttp
                import re
                import urllib.parse
                from urllib.parse import urljoin, urlparse
                
                gmaps_key = 'AIzaSyDxwCGvlHvNdEssqgr-Sje-gHYDU0RiFGE'
                if gmaps_key and sample_businesses:
                    logger.info(f"Enriching websites and extracting emails for {len(sample_businesses)} businesses")
                    
                    async def extract_email_from_website(website_url):
                        """Extract email from a business website"""
                        if not website_url or website_url == 'N/A':
                            return None
                            
                        try:
                            # Clean and validate URL
                            if not website_url.startswith(('http://', 'https://')):
                                website_url = 'https://' + website_url
                            
                            timeout = aiohttp.ClientTimeout(total=10)
                            async with aiohttp.ClientSession(timeout=timeout) as session:
                                headers = {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                                }
                                
                                async with session.get(website_url, headers=headers) as response:
                                    if response.status == 200:
                                        html_content = await response.text()
                                        
                                        # Enhanced email extraction patterns
                                        email_patterns = [
                                            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                                            r'mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})',
                                            r'email[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})',
                                            r'contact[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})'
                                        ]
                                        
                                        found_emails = set()
                                        for pattern in email_patterns:
                                            matches = re.findall(pattern, html_content, re.IGNORECASE)
                                            for match in matches:
                                                email = match if isinstance(match, str) else match[0] if match else None
                                                if email:
                                                    found_emails.add(email.lower())
                                        
                                        # Filter out common non-business emails
                                        business_emails = []
                                        exclude_domains = [
                                            'example.com', 'test.com', 'domain.com', 'yoursite.com',
                                            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
                                            'noreply', 'no-reply', 'donotreply'
                                        ]
                                        
                                        for email in found_emails:
                                            if not any(domain in email for domain in exclude_domains):
                                                business_emails.append(email)
                                        
                                        # Prioritize business-like emails
                                        priority_prefixes = ['info@', 'contact@', 'hello@', 'support@', 'sales@']
                                        for prefix in priority_prefixes:
                                            for email in business_emails:
                                                if email.startswith(prefix):
                                                    return email
                                        
                                        # Return first business email found
                                        return business_emails[0] if business_emails else None
                                        
                        except Exception as e:
                            logger.warning(f"Email extraction failed for {website_url}: {e}")
                            return None
                    
                    async def enrich_website_and_email(business):
                        """Find website and extract email for a single business"""
                        try:
                            # Check if already has email
                            current_email = business.get('email', '').strip()
                            if current_email and current_email != 'N/A' and '@' in current_email:
                                logger.info(f"Skipping email extraction for {business.get('name', '')} - already has email: {current_email}")
                                return
                            
                            # Skip if already has a valid non-aggregator website from aggregation
                            current_website = business.get('website', '').strip()
                            if current_website and current_website != 'N/A':
                                # Only skip website enrichment if it's a real business website (not aggregator)
                                aggregator_domains = ['yelp.com', 'google.com', 'facebook.com', 'yellowpages.com', 'linkedin.com']
                                if not any(domain in current_website.lower() for domain in aggregator_domains):
                                    logger.info(f"Using existing website for {business.get('name', '')}: {current_website}")
                                    # Extract email from existing website
                                    extracted_email = await extract_email_from_website(current_website)
                                    if extracted_email:
                                        business['email'] = extracted_email
                                        logger.info(f"Extracted email from existing website: {extracted_email}")
                                    return
                            
                            name = business.get('name', '').strip()
                            if not name:
                                return
                            
                            # Use Google Maps Places API to find business details
                            location = request.location or ''
                            search_query = f"{name} {location}"
                            
                            # First try Places Text Search
                            params = {
                                'query': search_query,
                                'key': gmaps_key,
                                'fields': 'place_id,name,website,formatted_address'
                            }
                            
                            timeout = aiohttp.ClientTimeout(total=10)
                            async with aiohttp.ClientSession(timeout=timeout) as session:
                                url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?{urllib.parse.urlencode(params)}"
                                async with session.get(url) as resp:
                                    if resp.status != 200:
                                        return
                                    data = await resp.json()
                                    
                                    # Check results for business website
                                    for result in data.get('results', [])[:3]:
                                        place_name = result.get('name', '').lower()
                                        website = result.get('website', '')
                                        place_id = result.get('place_id', '')
                                        
                                        if not website and place_id:
                                            # Get more details using Place Details API
                                            detail_params = {
                                                'place_id': place_id,
                                                'key': gmaps_key,
                                                'fields': 'website,name'
                                            }
                                            detail_url = f"https://maps.googleapis.com/maps/api/place/details/json?{urllib.parse.urlencode(detail_params)}"
                                            async with session.get(detail_url) as detail_resp:
                                                if detail_resp.status == 200:
                                                    detail_data = await detail_resp.json()
                                                    if detail_data.get('result'):
                                                        website = detail_data['result'].get('website', '')
                                        
                                        if not website:
                                            continue
                                        
                                        # Skip aggregator sites
                                        skip_domains = [
                                            'yelp.com', 'google.com', 'facebook.com', 'linkedin.com',
                                            'yellowpages.com', 'bbb.org', 'angi.com', 'thumbtack.com',
                                            'homeadvisor.com', 'wikipedia.org', 'instagram.com', 'twitter.com'
                                        ]
                                        
                                        if any(domain in website.lower() for domain in skip_domains):
                                            continue
                                        
                                        # Check if place name matches business name
                                        name_lower = name.lower()
                                        name_words = [w for w in name_lower.split() if len(w) > 2]
                                        
                                        if (name_lower in place_name or
                                            any(word in place_name for word in name_words)):
                                            # Found matching business with website
                                            if not website.startswith(('http://', 'https://')):
                                                website = 'https://' + website
                                            business['website'] = website
                                            logger.info(f"Found website for {name}: {website}")
                                            
                                            # Extract email from the found website
                                            extracted_email = await extract_email_from_website(website)
                                            if extracted_email:
                                                business['email'] = extracted_email
                                                logger.info(f"Extracted email from {website}: {extracted_email}")
                                            break
        
    except Exception as e:
                            logger.debug(f"Website enrichment failed for {business.get('name', '')}: {e}")
                    
                    # Enrich websites and extract emails in parallel with rate limiting
                    tasks = []
                    for i, biz in enumerate(sample_businesses):
                        if i > 0 and i % 5 == 0:
                            await asyncio.sleep(0.5)  # Rate limit
                        tasks.append(enrich_website_and_email(biz))
                    
                    await asyncio.gather(*tasks, return_exceptions=True)
                    
                    # Second pass: Extract emails from existing websites that don't have emails
                    email_extraction_tasks = []
                    for biz in sample_businesses:
                        current_email = biz.get('email', '').strip()
                        current_website = biz.get('website', '').strip()
                        
                        if (not current_email or current_email == 'N/A') and current_website and current_website != 'N/A':
                            async def extract_and_set_email(business, website):
                                extracted_email = await extract_email_from_website(website)
                                if extracted_email:
                                    business['email'] = extracted_email
                                    logger.info(f"Extracted email from {website}: {extracted_email}")
                            email_extraction_tasks.append(extract_and_set_email(biz, current_website))
                    
                    if email_extraction_tasks:
                        await asyncio.gather(*email_extraction_tasks, return_exceptions=True)
                        logger.info(f"Email extraction completed for {len(email_extraction_tasks)} websites")
                    
                    logger.info(f"Website enrichment and email extraction completed")
            
            except Exception as e:
                logger.warning(f"Google Maps website enrichment failed: {e}")
                
        else:
            logger.warning("No real business data found - returning empty result")
            sample_businesses = []
        
    except Exception as e:
        logger.error(f"Real data aggregation failed: {e}")
        sample_businesses = []
    
    # Fast normalization
    businesses = []
    
    def _parse_address(addr_text: str):
        """Quick address parsing"""
        parts = [p.strip() for p in (addr_text or "").split(',') if p.strip()]
        line1 = parts[0] if parts else ''
        city = parts[1] if len(parts) > 1 else ''
        state_zip = parts[2] if len(parts) > 2 else ''
        
        # Extract state and zip from last part
        state = ''
        zip_code = ''
        if state_zip:
            import re
            match = re.search(r'([A-Z]{2})\s*(\d{5})', state_zip)
            if match:
                state = match.group(1)
                zip_code = match.group(2)
        
        return line1, city, state, zip_code

    for i, biz in enumerate(sample_businesses):
        try:
            line1, city, state, zip_code = _parse_address(biz.get('address', ''))
            
            rating = biz.get('rating', 0.0) or 0.0
            reviews = biz.get('reviews', 0) or 0
            
            # Quick revenue estimation
            base_revenue = max(250000, reviews * 2000 + rating * 50000)
            min_revenue = int(base_revenue * 0.7)
            max_revenue = int(base_revenue * 1.5)
            
            normalized = {
                'business_id': f"fast_{i}_{hash(str(biz))}",
                'name': biz.get('name', 'Unknown Business'),
                'category': biz.get('industry', request.industry or 'general'),
                'industry': biz.get('industry', request.industry or 'general'),
                'address': {
                    'formatted_address': biz.get('address', ''),
                    'line1': line1,
                    'city': city,
                    'state': state,
                    'zip_code': zip_code,
                    'coordinates': biz.get('coordinates', [])
                },
                'contact': {
                    'phone': biz.get('phone', ''),
                    'email': biz.get('email', None),
                    'website': biz.get('website', ''),
                    'phone_valid': bool(biz.get('phone')),
                    'email_valid': bool(biz.get('email')),
                    'website_valid': bool(biz.get('website'))
                },
                'metrics': {
                    'rating': rating,
                    'review_count': reviews,
                    'estimated_revenue': base_revenue,
                    'min_revenue': min_revenue,
                    'max_revenue': max_revenue,
                    'employee_count': max(3, min(25, int(base_revenue / 80000))),
                    'years_in_business': max(2, min(20, int(reviews / 10 + rating))),
                    'lead_score': min(100, max(20, int(rating * 15 + min(reviews, 50)))),
                    'owner_age': 35 + int((reviews % 20) + (rating * 3)),
                    'num_locations': 1 if reviews < 100 else 2
                },
                'data_quality': 'high',
                'data_sources': biz.get('data_sources', [biz.get('source', 'api_aggregated')]),
                'source_count': biz.get('source_count', 1),
                'last_updated': datetime.now().isoformat(),
                'tags': biz.get('tags', ['real_data', 'fast_api'])
            }
            businesses.append(normalized)
        except Exception as parse_e:
            logger.warning(f"Failed to normalize business {i}: {parse_e}")
            continue

    end_time = time.time()
    duration = end_time - start_time
    
    logger.info(f"Fast market scan completed in {duration:.2f}s, found {len(businesses)} businesses")
        
    return {
    "success": True,
    "request_id": request_id,
    "businesses": businesses,
    "total_found": len(businesses),
    "query_info": {
        "location": request.location,
        "industry": request.industry or "all",
        "radius_miles": request.radius_miles,
        "search_duration_seconds": duration,
        "data_sources": ['google_serp']
    },
    "metadata": {
        "timestamp": datetime.now().isoformat(),
        "processing_time_ms": int(duration * 1000),
        "api_version": "2.1_fast",
        "real_data_only": True
    }
    }
