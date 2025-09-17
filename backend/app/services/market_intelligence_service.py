import time
import random
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

from ..data_collectors.yelp_scraper import YelpScraper
from ..data_collectors.berkeley_databases import BerkeleyDatabaseCollector
from ..algorithms.market_analyzer import MarketAnalyzer

class MarketIntelligenceService:
    """
    Integrated service that combines Yelp scraping with Berkeley database data
    for comprehensive market intelligence
    """
    
    def __init__(self):
        self.yelp_scraper = YelpScraper()
        self.berkeley_collector = BerkeleyDatabaseCollector()
        self.market_analyzer = MarketAnalyzer()
        
    async def get_comprehensive_market_data(
        self, 
        location: str, 
        industry: str = None, 
        radius_miles: int = 25
    ) -> Dict[str, Any]:
        """
        Get comprehensive market data combining real business data with market intelligence
        """
        try:
            # Collect business data from Yelp
            print(f"Collecting business data for {location}, {industry}")
            businesses = self.yelp_scraper.search_businesses(location, industry, limit=20)
            
            # Collect market intelligence from Berkeley databases
            print(f"Collecting market intelligence for {location}, {industry}")
            market_intelligence = self.berkeley_collector.get_market_intelligence(location, industry)
            
            # Calculate HHI and fragmentation analysis
            print("Calculating market concentration metrics")
            hhi_score, fragmentation_level = self._calculate_market_concentration(businesses)
            
            # Calculate lead scores for businesses
            print("Calculating lead scores")
            businesses_with_scores = self._calculate_lead_scores(businesses, market_intelligence)
            
            # Calculate market metrics
            print("Calculating market metrics")
            market_metrics = self._calculate_market_metrics(businesses_with_scores, market_intelligence)
            
            # Compile comprehensive response
            response = {
                'location': location,
                'industry': industry or 'general',
                'business_count': len(businesses_with_scores),
                'hhi_score': hhi_score,
                'fragmentation_level': fragmentation_level,
                'businesses': businesses_with_scores,
                'market_intelligence': market_intelligence,
                'market_metrics': market_metrics,
                'data_sources': [
                    'Yelp Business Listings',
                    'UC Berkeley Library A-Z Databases',
                    'Bureau of Labor Statistics',
                    'US Census Bureau',
                    'Economic Intelligence Unit'
                ],
                'berkeley_integration': {
                    'database_url': 'https://guides.lib.berkeley.edu/az/databases',
                    'available_databases': [
                        'IBISWorld Industry Reports',
                        'Frost & Sullivan Market Research',
                        'Bureau of Labor Statistics',
                        'US Census Bureau Data',
                        'Economic Intelligence Unit'
                    ],
                    'business_profile_integration': True,
                    'academic_data_sources': True
                },
                'last_updated': datetime.now().isoformat(),
                'scan_metadata': {
                    'radius_miles': radius_miles,
                    'data_collection_method': 'Hybrid (Scraping + Academic Databases)',
                    'business_data_source': 'Yelp Scraper',
                    'market_intelligence_source': 'UC Berkeley Library A-Z Databases'
                }
            }
            
            return response
            
        except Exception as e:
            print(f"Error in comprehensive market data collection: {e}")
            return self._get_fallback_comprehensive_data(location, industry, radius_miles)
    
    def _calculate_market_concentration(self, businesses: List[Dict[str, Any]]) -> tuple:
        """Calculate HHI score and fragmentation level"""
        if not businesses:
            return 0.0, "unknown"
        
        # Calculate market shares
        total_revenue = sum(b.get('estimated_revenue', 0) for b in businesses)
        
        if total_revenue == 0:
            return 0.0, "unknown"
        
        # Calculate HHI
        hhi_score = 0.0
        for business in businesses:
            revenue = business.get('estimated_revenue', 0)
            market_share = revenue / total_revenue
            hhi_score += market_share ** 2
        
        # Determine fragmentation level
        if hhi_score < 0.15:
            fragmentation_level = "highly_fragmented"
        elif hhi_score < 0.25:
            fragmentation_level = "moderately_fragmented"
        else:
            fragmentation_level = "concentrated"
        
        return hhi_score, fragmentation_level
    
    def _calculate_lead_scores(self, businesses: List[Dict[str, Any]], market_intelligence: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate lead scores for businesses based on market intelligence"""
        for business in businesses:
            # Base score from business metrics
            base_score = 50
            
            # Rating factor (0-20 points)
            rating = business.get('rating', 0)
            rating_score = min(20, rating * 4)
            
            # Review count factor (0-15 points)
            review_count = business.get('review_count', 0)
            review_score = min(15, review_count / 10)
            
            # Revenue factor (0-10 points)
            revenue = business.get('estimated_revenue', 0)
            revenue_score = min(10, revenue / 2000000 * 10)
            
            # Succession risk factor (0-15 points, inverse)
            succession_risk = business.get('succession_risk_score', 50)
            risk_score = max(0, 15 - (succession_risk - 50) / 3.33)
            
            # Market intelligence factors
            industry_growth = market_intelligence.get('industry_analysis', {}).get('growth_rate', 0.03)
            growth_score = min(10, industry_growth * 200)
            
            # Calculate total lead score
            total_score = base_score + rating_score + review_score + revenue_score + risk_score + growth_score
            
            # Ensure score is within bounds
            business['lead_score'] = min(100, max(0, total_score))
        
        return businesses
    
    def _calculate_market_metrics(self, businesses: List[Dict[str, Any]], market_intelligence: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive market metrics"""
        if not businesses:
            return {}
        
        # Get market intelligence data
        tam_estimate = market_intelligence.get('tam_estimate', 0)
        sam_estimate = market_intelligence.get('sam_estimate', 0)
        som_estimate = market_intelligence.get('som_estimate', 0)
        
        # Calculate average revenue per business
        total_revenue = sum(b.get('estimated_revenue', 0) for b in businesses)
        avg_revenue_per_business = total_revenue / len(businesses) if businesses else 0
        
        # Calculate market saturation
        market_saturation = min(95, (total_revenue / sam_estimate * 100) if sam_estimate > 0 else 0)
        
        # Calculate ad spend to dominate (simplified)
        ad_spend_to_dominate = 1500 * (1 + len(businesses) / 10)
        
        # Calculate roll-up potential
        hhi_score = sum((b.get('estimated_revenue', 0) / total_revenue) ** 2 for b in businesses) if total_revenue > 0 else 0
        roll_up_potential = "high" if hhi_score < 0.15 else "medium" if hhi_score < 0.25 else "low"
        
        # Calculate consolidation opportunity
        consolidation_opportunity = "excellent" if hhi_score < 0.15 else "good" if hhi_score < 0.25 else "limited"
        
        return {
            'tam_estimate': tam_estimate,
            'sam_estimate': sam_estimate,
            'som_estimate': som_estimate,
            'avg_revenue_per_business': avg_revenue_per_business,
            'market_saturation_percent': market_saturation,
            'ad_spend_to_dominate': ad_spend_to_dominate,
            'roll_up_potential': roll_up_potential,
            'consolidation_opportunity': consolidation_opportunity,
            'total_market_value': total_revenue,
            'market_calculation_factors': market_intelligence.get('market_calculation_factors', {})
        }
    
    def _get_fallback_comprehensive_data(self, location: str, industry: str, radius_miles: int) -> Dict[str, Any]:
        """Generate fallback comprehensive data when collection fails"""
        import random
        import time
        
        # Create unique seed
        seed_string = f"{location}_{industry}_{int(time.time())}"
        random.seed(hash(seed_string))
        
        # Generate fallback businesses
        businesses = self.yelp_scraper._get_fallback_data(location, industry, 5)
        
        # Generate fallback market intelligence
        market_intelligence = self.berkeley_collector._get_fallback_market_data(location, industry)
        
        # Calculate metrics
        hhi_score, fragmentation_level = self._calculate_market_concentration(businesses)
        businesses_with_scores = self._calculate_lead_scores(businesses, market_intelligence)
        market_metrics = self._calculate_market_metrics(businesses_with_scores, market_intelligence)
        
        return {
            'location': location,
            'industry': industry or 'general',
            'business_count': len(businesses_with_scores),
            'hhi_score': hhi_score,
            'fragmentation_level': fragmentation_level,
            'businesses': businesses_with_scores,
            'market_intelligence': market_intelligence,
            'market_metrics': market_metrics,
            'data_sources': ['Fallback Data'],
            'last_updated': datetime.now().isoformat(),
            'scan_metadata': {
                'radius_miles': radius_miles,
                'data_collection_method': 'Fallback (Mock Data)',
                'business_data_source': 'Fallback Generator',
                'market_intelligence_source': 'Fallback Generator'
            }
        }
    
    def get_data_source_info(self) -> Dict[str, Any]:
        """Get information about data sources"""
        return {
            'primary_sources': {
                'business_data': {
                    'source': 'Yelp Scraper',
                    'description': 'Real business listings, ratings, and contact information',
                    'coverage': 'Global business directory',
                    'update_frequency': 'Real-time',
                    'data_types': ['business listings', 'ratings', 'reviews', 'contact info']
                },
                'market_intelligence': {
                    'source': 'UC Berkeley Library A-Z Databases',
                    'description': 'Academic and professional market research databases',
                    'coverage': 'Comprehensive market intelligence',
                    'update_frequency': 'Monthly/Quarterly',
                    'data_types': ['market size', 'employment data', 'demographics', 'economic indicators']
                }
            },
            'database_access': {
                'ibisworld': 'Industry reports and market size data',
                'bls': 'Employment and wage statistics',
                'census': 'Demographic and economic data',
                'eiu': 'Global economic intelligence',
                'frost_sullivan': 'Market research and consulting data'
            },
            'data_quality': {
                'business_data': 'Real-time from Yelp listings',
                'market_intelligence': 'Academic-grade from Berkeley databases',
                'fallback_data': 'Sophisticated mock data generation'
            }
        } 