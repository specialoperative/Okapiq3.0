"""
Market Analyzer for Okapiq
Provides market analysis and business intelligence algorithms
"""

from typing import List, Dict, Any, Optional
import random
import time

class MarketAnalyzer:
    """Market analysis algorithms for business intelligence"""
    
    def __init__(self):
        pass
    
    def calculate_succession_risk(
        self, 
        owner_age: int, 
        years_in_business: int, 
        yelp_rating: float, 
        yelp_review_count: int
    ) -> int:
        """Calculate succession risk score (0-100, higher = higher risk)"""
        # Older businesses with lower ratings have higher succession risk
        age_risk = min(years_in_business * 2, 40)  # 0-40 points for age
        rating_risk = max(0, (3.5 - yelp_rating) * 20)  # 0-30 points for low rating
        
        base_risk = age_risk + rating_risk
        return min(100, max(30, int(base_risk)))
    
    def calculate_lead_score(self, business_data: Dict[str, Any], market_metrics: Dict[str, Any]) -> int:
        """Calculate lead score for a business"""
        # Base score from business metrics
        base_score = 50
        
        # Rating factor (0-20 points)
        rating = business_data.get('rating', 0)
        rating_score = min(20, rating * 4)
        
        # Review count factor (0-15 points)
        review_count = business_data.get('review_count', 0)
        review_score = min(15, review_count / 10)
        
        # Revenue factor (0-10 points)
        revenue = business_data.get('estimated_revenue', 0)
        revenue_score = min(10, revenue / 2000000 * 10)
        
        # Succession risk factor (0-15 points, inverse)
        succession_risk = business_data.get('succession_risk_score', 50)
        risk_score = max(0, 15 - (succession_risk - 50) / 3.33)
        
        # Calculate total lead score
        total_score = base_score + rating_score + review_score + revenue_score + risk_score
        
        # Ensure score is within bounds
        return min(100, max(0, total_score))
    
    def analyze_market_fragmentation(self, businesses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze market fragmentation and consolidation opportunities"""
        if not businesses:
            return {
                "hhi_score": 0.0,
                "fragmentation_level": "unknown",
                "roll_up_potential": "unknown",
                "consolidation_opportunity": "unknown",
                "avg_revenue_per_business": 0,
                "total_market_value": 0
            }
        
        # Calculate market shares
        total_revenue = sum(b.get('estimated_revenue', 0) for b in businesses)
        
        if total_revenue == 0:
            return {
                "hhi_score": 0.0,
                "fragmentation_level": "unknown",
                "roll_up_potential": "unknown",
                "consolidation_opportunity": "unknown",
                "avg_revenue_per_business": 0,
                "total_market_value": 0
            }
        
        # Calculate HHI
        hhi_score = 0.0
        for business in businesses:
            revenue = business.get('estimated_revenue', 0)
            market_share = revenue / total_revenue
            hhi_score += market_share ** 2
        
        # Determine fragmentation level
        if hhi_score < 0.15:
            fragmentation_level = "highly_fragmented"
            roll_up_potential = "high"
            consolidation_opportunity = "excellent"
        elif hhi_score < 0.25:
            fragmentation_level = "moderately_fragmented"
            roll_up_potential = "medium"
            consolidation_opportunity = "good"
        else:
            fragmentation_level = "concentrated"
            roll_up_potential = "low"
            consolidation_opportunity = "limited"
        
        avg_revenue_per_business = total_revenue / len(businesses) if businesses else 0
        
        return {
            "hhi_score": hhi_score,
            "fragmentation_level": fragmentation_level,
            "roll_up_potential": roll_up_potential,
            "consolidation_opportunity": consolidation_opportunity,
            "avg_revenue_per_business": avg_revenue_per_business,
            "total_market_value": total_revenue
        }
    
    def calculate_tam_sam_som(self, zip_code: str, industry: str, business_count: int) -> Dict[str, Any]:
        """Calculate TAM/SAM/SOM estimates"""
        # Mock calculation - in production, use real market data
        base_tam = 5000000  # Base TAM for the market
        tam_variation = random.uniform(0.7, 1.3)  # ±30% variation
        tam_estimate = base_tam * tam_variation
        
        # SAM is typically 25% of TAM
        sam_estimate = tam_estimate * 0.25
        
        # SOM is typically 10% of SAM
        som_estimate = sam_estimate * 0.1
        
        return {
            "tam_estimate": tam_estimate,
            "sam_estimate": sam_estimate,
            "som_estimate": som_estimate,
            "avg_revenue_per_business": tam_estimate / business_count if business_count > 0 else 0
        } 