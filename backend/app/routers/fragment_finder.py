"""
Fragment Finder API Endpoints

Provides comprehensive market fragmentation analysis with real business data:
- Business density analysis
- HHI fragmentation scoring
- Succession risk analysis (age demographics)
- Homeownership analysis
- Interactive mapping data
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from ..services.fragment_finder_service import FragmentFinderService, FragmentFinderResult

logger = logging.getLogger(__name__)

router = APIRouter()

class FragmentFinderRequest(BaseModel):
    location: str
    industry: str
    search_radius_miles: Optional[int] = 25

class FragmentFinderResponse(BaseModel):
    success: bool
    message: str
    location: str
    industry: str
    total_businesses: int
    businesses: List[Dict[str, Any]]
    analytics: Dict[str, Any]
    map_data: Dict[str, Any]
    top_zips: List[Dict[str, Any]]

# Initialize service
fragment_finder_service = FragmentFinderService()

@router.post("/analyze", response_model=FragmentFinderResponse)
async def analyze_market_fragmentation(request: FragmentFinderRequest):
    """
    Comprehensive market fragmentation analysis
    
    Returns:
    - All businesses found in the area
    - Fragmentation metrics (HHI, density scores)
    - Succession risk analysis 
    - Homeownership rates
    - Map data for visualization
    """
    try:
        logger.info(f"Fragment Finder analysis request: {request.industry} in {request.location}")
        
        # Run comprehensive analysis
        result = await fragment_finder_service.analyze_market_fragmentation(
            location=request.location,
            industry=request.industry,
            search_radius_miles=request.search_radius_miles
        )
        
        if not result.success:
            raise HTTPException(status_code=404, detail=result.message)
        
        # Format businesses for frontend
        businesses_data = []
        for business in result.businesses:
            businesses_data.append({
                "name": business.name,
                "address": business.address,
                "latitude": business.latitude,
                "longitude": business.longitude,
                "phone": business.phone,
                "rating": business.rating,
                "review_count": business.review_count,
                "url": business.url,
                "source": business.source,
                "zip_code": business.zip_code
            })
        
        # Format analytics
        analytics_data = {
            "fragmentation_score": round(result.analytics.fragmentation_score, 1),
            "hhi_index": round(result.analytics.hhi_index, 4),
            "business_density": round(result.analytics.business_density, 2),
            "succession_risk": round(result.analytics.succession_risk, 1),
            "homeownership_rate": round(result.analytics.homeownership_rate, 1),
            "median_age": round(result.analytics.median_age, 1),
            "total_businesses": result.analytics.total_businesses,
            "businesses_per_1000_people": round(result.analytics.businesses_per_1000_people, 2)
        }
        
        # Calculate map center
        if result.businesses:
            avg_lat = sum(b.latitude for b in result.businesses) / len(result.businesses)
            avg_lng = sum(b.longitude for b in result.businesses) / len(result.businesses)
        else:
            avg_lat, avg_lng = 41.8781, -87.6298  # Default to Chicago
        
        # Map data for frontend
        map_data = {
            "center": {"lat": avg_lat, "lng": avg_lng},
            "zoom": 10,
            "businesses": businesses_data,
            "heatmap_data": [
                {"lat": b.latitude, "lng": b.longitude, "weight": (b.review_count or 1) / 10}
                for b in result.businesses
            ]
        }
        
        return FragmentFinderResponse(
            success=True,
            message=result.message,
            location=result.location,
            industry=result.industry,
            total_businesses=len(result.businesses),
            businesses=businesses_data,
            analytics=analytics_data,
            map_data=map_data,
            top_zips=result.top_zips_by_density
        )
        
    except Exception as e:
        logger.error(f"Fragment Finder API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/industries")
async def get_supported_industries():
    """Get list of supported industries for fragmentation analysis"""
    
    return {
        "industries": [
            {"value": "hvac", "label": "HVAC Services", "description": "Heating, ventilation, and air conditioning"},
            {"value": "plumbing", "label": "Plumbing Services", "description": "Residential and commercial plumbing"},
            {"value": "electrical", "label": "Electrical Services", "description": "Electrical contractors and services"},
            {"value": "landscaping", "label": "Landscaping", "description": "Lawn care and landscaping services"},
            {"value": "tree service", "label": "Tree Services", "description": "Tree removal, trimming, and arborist services"},
            {"value": "restaurant", "label": "Restaurants", "description": "Food service establishments"},
            {"value": "auto repair", "label": "Auto Repair", "description": "Automotive repair and maintenance"},
            {"value": "dentist", "label": "Dental Practices", "description": "Dental offices and practitioners"},
            {"value": "veterinary", "label": "Veterinary Clinics", "description": "Animal hospitals and veterinarians"},
            {"value": "hair salon", "label": "Hair Salons", "description": "Hair and beauty services"},
            {"value": "gym", "label": "Fitness Centers", "description": "Gyms and fitness facilities"},
            {"value": "accounting", "label": "Accounting Firms", "description": "CPA and accounting services"}
        ]
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "fragment_finder"}
