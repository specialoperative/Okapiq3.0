"""
Okapiq Market Intelligence Engine
Core algorithms for TAM/SAM/SOM, HHI, and succession risk analysis
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import json
from datetime import datetime, timedelta
import requests
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

@dataclass
class MarketMetrics:
    """Container for market intelligence metrics"""
    tam_estimate: float
    sam_estimate: float
    som_estimate: float
    business_count: int
    hhi_score: float
    fragmentation_level: str
    avg_revenue_per_business: float
    market_saturation_percent: float
    ad_spend_to_dominate: float
    succession_risk_avg: float
    roll_up_potential_score: float

@dataclass
class BusinessProfile:
    """Container for individual business data"""
    name: str
    estimated_revenue: float
    employee_count: int
    years_in_business: int
    yelp_rating: float
    yelp_review_count: int
    succession_risk_score: float
    owner_age_estimate: int
    market_share_percent: float
    lead_score: float

class MarketAnalyzer:
    """Core market intelligence engine"""
    
    def __init__(self):
        # Industry revenue benchmarks (from IBISWorld, BLS, Census)
        self.industry_benchmarks = {
            "hvac": {"avg_revenue": 850000, "avg_employees": 12, "growth_rate": 0.045},
            "plumbing": {"avg_revenue": 720000, "avg_employees": 10, "growth_rate": 0.038},
            "electrical": {"avg_revenue": 680000, "avg_employees": 8, "growth_rate": 0.042},
            "landscaping": {"avg_revenue": 450000, "avg_employees": 6, "growth_rate": 0.035},
            "restaurant": {"avg_revenue": 950000, "avg_employees": 15, "growth_rate": 0.028},
            "retail": {"avg_revenue": 650000, "avg_employees": 8, "growth_rate": 0.032},
            "automotive": {"avg_revenue": 1200000, "avg_employees": 14, "growth_rate": 0.025},
            "healthcare": {"avg_revenue": 1800000, "avg_employees": 20, "growth_rate": 0.055},
            "construction": {"avg_revenue": 1100000, "avg_employees": 12, "growth_rate": 0.040}
        }
        
        # Geographic multipliers (based on cost of living and market density)
        self.geographic_multipliers = {
            "CA": 1.4, "NY": 1.3, "TX": 0.9, "FL": 0.95, "IL": 1.1,
            "PA": 0.95, "OH": 0.85, "GA": 0.9, "NC": 0.9, "MI": 0.85
        }
    
    def calculate_tam_sam_som(self, 
                             location: str, 
                             industry: str, 
                             business_count: int,
                             avg_revenue: Optional[float] = None) -> Dict[str, float]:
        """
        Calculate Total Addressable Market (TAM), Serviceable Available Market (SAM), 
        and Serviceable Obtainable Market (SOM)
        
        Args:
            location: ZIP code or city
            industry: Industry category
            business_count: Number of businesses in the market
            avg_revenue: Average revenue per business (if not provided, uses benchmark)
        
        Returns:
            Dictionary with TAM, SAM, and SOM estimates
        """
        
        # Get industry benchmark
        benchmark = self.industry_benchmarks.get(industry.lower(), 
                                                self.industry_benchmarks["retail"])
        
        # Use provided avg_revenue or benchmark
        if avg_revenue is None:
            avg_revenue = benchmark["avg_revenue"]
        
        # Apply geographic multiplier
        state = self._extract_state(location)
        geo_multiplier = self.geographic_multipliers.get(state, 1.0)
        adjusted_avg_revenue = avg_revenue * geo_multiplier
        
        # Calculate TAM (Total Addressable Market)
        tam = business_count * adjusted_avg_revenue
        
        # Calculate SAM (Serviceable Available Market) - typically 20-40% of TAM
        sam_percentage = 0.25  # 25% of TAM is serviceable
        sam = tam * sam_percentage
        
        # Calculate SOM (Serviceable Obtainable Market) - typically 5-15% of SAM
        som_percentage = 0.10  # 10% of SAM is obtainable
        som = sam * som_percentage
        
        return {
            "tam_estimate": tam,
            "sam_estimate": sam,
            "som_estimate": som,
            "avg_revenue_per_business": adjusted_avg_revenue,
            "business_count": business_count
        }
    
    def calculate_hhi(self, businesses: List[BusinessProfile]) -> Tuple[float, str]:
        """
        Calculate Herfindahl-Hirschman Index (HHI) for market concentration
        
        Args:
            businesses: List of business profiles with revenue data
        
        Returns:
            Tuple of (HHI score, fragmentation level)
        """
        if not businesses:
            return 0.0, "unknown"
        
        # Calculate total market revenue
        total_revenue = sum(b.estimated_revenue for b in businesses)
        
        if total_revenue == 0:
            return 0.0, "unknown"
        
        # Calculate market shares and HHI
        hhi = 0.0
        for business in businesses:
            market_share = business.estimated_revenue / total_revenue
            hhi += market_share ** 2
        
        # Determine fragmentation level
        if hhi < 0.15:
            fragmentation_level = "highly_fragmented"
        elif hhi < 0.25:
            fragmentation_level = "moderately_fragmented"
        else:
            fragmentation_level = "consolidated"
        
        return hhi, fragmentation_level
    
    def calculate_succession_risk(self, 
                                 owner_age: int,
                                 years_in_business: int,
                                 yelp_rating: float,
                                 yelp_review_count: int,
                                 website_activity: Optional[float] = None) -> float:
        """
        Calculate succession risk score (0-100) for a business
        
        Args:
            owner_age: Estimated owner age
            years_in_business: Years the business has been operating
            yelp_rating: Yelp rating (1-5)
            yelp_review_count: Number of Yelp reviews
            website_activity: Website activity score (optional)
        
        Returns:
            Succession risk score (0-100, higher = higher risk)
        """
        
        # Age factor (40% weight)
        if owner_age >= 65:
            age_score = 100
        elif owner_age >= 60:
            age_score = 80
        elif owner_age >= 55:
            age_score = 60
        elif owner_age >= 50:
            age_score = 40
        else:
            age_score = 20
        
        # Business age factor (20% weight)
        if years_in_business >= 30:
            business_age_score = 80
        elif years_in_business >= 20:
            business_age_score = 60
        elif years_in_business >= 10:
            business_age_score = 40
        else:
            business_age_score = 20
        
        # Online presence factor (25% weight)
        if yelp_review_count < 10:
            online_score = 70
        elif yelp_rating < 3.5:
            online_score = 60
        elif yelp_review_count < 50:
            online_score = 40
        else:
            online_score = 20
        
        # Website activity factor (15% weight)
        if website_activity is None:
            website_score = 50  # Neutral if no data
        elif website_activity < 0.3:
            website_score = 80
        elif website_activity < 0.6:
            website_score = 50
        else:
            website_score = 20
        
        # Calculate weighted average
        succession_risk = (
            age_score * 0.40 +
            business_age_score * 0.20 +
            online_score * 0.25 +
            website_score * 0.15
        )
        
        return min(100, max(0, succession_risk))
    
    def calculate_lead_score(self, 
                           business: BusinessProfile,
                           market_metrics: MarketMetrics) -> float:
        """
        Calculate lead quality score (0-100) for prioritization
        
        Args:
            business: Business profile
            market_metrics: Market intelligence metrics
        
        Returns:
            Lead score (0-100, higher = better lead)
        """
        
        # Revenue factor (30% weight)
        revenue_score = min(100, (business.estimated_revenue / 1000000) * 50)
        
        # Succession risk factor (25% weight) - higher risk = better lead
        succession_score = business.succession_risk_score
        
        # Market position factor (20% weight)
        market_position_score = min(100, business.market_share_percent * 10)
        
        # Online presence factor (15% weight)
        if business.yelp_review_count >= 100 and business.yelp_rating >= 4.0:
            online_score = 100
        elif business.yelp_review_count >= 50 and business.yelp_rating >= 3.5:
            online_score = 75
        elif business.yelp_review_count >= 20:
            online_score = 50
        else:
            online_score = 25
        
        # Fragmentation factor (10% weight) - higher fragmentation = better for roll-ups
        if market_metrics.fragmentation_level == "highly_fragmented":
            fragmentation_score = 100
        elif market_metrics.fragmentation_level == "moderately_fragmented":
            fragmentation_score = 75
        else:
            fragmentation_score = 25
        
        # Calculate weighted average
        lead_score = (
            revenue_score * 0.30 +
            succession_score * 0.25 +
            market_position_score * 0.20 +
            online_score * 0.15 +
            fragmentation_score * 0.10
        )
        
        return min(100, max(0, lead_score))
    
    def calculate_ad_spend_to_dominate(self, 
                                     location: str,
                                     industry: str,
                                     business_count: int) -> float:
        """
        Calculate estimated ad spend needed to dominate local market
        
        Args:
            location: ZIP code or city
            industry: Industry category
            business_count: Number of competitors
        
        Returns:
            Monthly ad spend estimate in USD
        """
        
        # Base CPC by industry (Google Ads data)
        industry_cpc = {
            "hvac": 15.50,
            "plumbing": 12.80,
            "electrical": 14.20,
            "landscaping": 8.90,
            "restaurant": 2.40,
            "retail": 1.80,
            "automotive": 2.20,
            "healthcare": 6.80,
            "construction": 9.50
        }
        
        base_cpc = industry_cpc.get(industry.lower(), 5.0)
        
        # Estimate monthly search volume (based on population and industry)
        estimated_monthly_searches = business_count * 50  # Rough estimate
        
        # Calculate cost to dominate (target 40% of searches)
        target_clicks = estimated_monthly_searches * 0.4
        monthly_cost = target_clicks * base_cpc
        
        return monthly_cost
    
    def analyze_market_fragmentation(self, 
                                   businesses: List[BusinessProfile]) -> Dict[str, float]:
        """
        Analyze market fragmentation for roll-up opportunities
        
        Args:
            businesses: List of business profiles
        
        Returns:
            Dictionary with fragmentation analysis
        """
        
        if not businesses:
            return {"roll_up_potential": 0, "consolidation_opportunity": 0}
        
        # Calculate HHI
        hhi, fragmentation_level = self.calculate_hhi(businesses)
        
        # Calculate roll-up potential score (0-100)
        if hhi < 0.15:
            roll_up_potential = 100 - (hhi * 500)  # Higher potential for lower HHI
        else:
            roll_up_potential = max(0, 100 - (hhi * 200))
        
        # Calculate consolidation opportunity
        avg_revenue = np.mean([b.estimated_revenue for b in businesses])
        total_market_value = sum(b.estimated_revenue for b in businesses)
        
        # Opportunity increases with fragmentation and market size
        consolidation_opportunity = min(100, (roll_up_potential * total_market_value) / 1000000)
        
        return {
            "hhi_score": hhi,
            "fragmentation_level": fragmentation_level,
            "roll_up_potential": roll_up_potential,
            "consolidation_opportunity": consolidation_opportunity,
            "avg_revenue_per_business": avg_revenue,
            "total_market_value": total_market_value
        }
    
    def _extract_state(self, location: str) -> str:
        """Extract state from location string"""
        # Simple extraction - could be enhanced with geocoding
        if len(location) == 2:
            return location.upper()
        elif len(location) == 5 and location.isdigit():
            # ZIP code - would need ZIP to state mapping
            return "CA"  # Default for demo
        else:
            # City name - would need city to state mapping
            return "CA"  # Default for demo

# Example usage and testing
if __name__ == "__main__":
    analyzer = MarketAnalyzer()
    
    # Example market analysis
    print("=== Okapiq Market Intelligence Engine ===")
    
    # Sample business data
    sample_businesses = [
        BusinessProfile("Golden Gate HVAC", 1200000, 15, 25, 4.2, 89, 75, 62, 8.5, 0),
        BusinessProfile("Bay Area Plumbing Co", 800000, 12, 18, 3.8, 67, 65, 58, 6.2, 0),
        BusinessProfile("SF Electrical Services", 1500000, 20, 30, 4.5, 124, 80, 65, 12.1, 0),
        BusinessProfile("Mission HVAC", 950000, 14, 22, 4.1, 78, 70, 60, 7.8, 0),
        BusinessProfile("Pacific Plumbing", 1100000, 16, 28, 4.3, 95, 78, 63, 9.2, 0)
    ]
    
    # Calculate market metrics
    market_data = analyzer.calculate_tam_sam_som("94102", "hvac", len(sample_businesses))
    hhi_score, fragmentation_level = analyzer.calculate_hhi(sample_businesses)
    
    print(f"Market Analysis for San Francisco (94102) - HVAC Industry")
    print(f"TAM: ${market_data['tam_estimate']:,.0f}")
    print(f"SAM: ${market_data['sam_estimate']:,.0f}")
    print(f"SOM: ${market_data['som_estimate']:,.0f}")
    print(f"HHI Score: {hhi_score:.3f} ({fragmentation_level})")
    print(f"Business Count: {len(sample_businesses)}")
    
    # Calculate lead scores
    for business in sample_businesses:
        business.lead_score = analyzer.calculate_lead_score(business, 
            MarketMetrics(market_data['tam_estimate'], market_data['sam_estimate'], 
                         market_data['som_estimate'], len(sample_businesses), hhi_score,
                         fragmentation_level, market_data['avg_revenue_per_business'],
                         0, 0, 0, 0))
        print(f"{business.name}: Lead Score {business.lead_score:.1f}/100") 