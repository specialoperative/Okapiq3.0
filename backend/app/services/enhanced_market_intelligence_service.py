import asyncio
import logging
from typing import List, Dict, Any, Optional
from ..data_collectors.yelp_scraper import YelpScraper
from ..data_collectors.google_maps_api import GoogleMapsAPI
from ..data_collectors.bizbuysell_scraper import BizBuySellScraper
from ..data_collectors.glencoco_integration import GlencocoIntegration
from ..data_collectors.berkeley_databases import BerkeleyDatabaseCollector
from ..data_collectors.advanced_scraper import AdvancedScraper

class EnhancedMarketIntelligenceService:
    """
    Enhanced market intelligence service with advanced scraping and signal detection
    """
    
    def __init__(self):
        self.yelp_scraper = YelpScraper()
        self.google_maps = GoogleMapsAPI()
        self.bizbuysell_scraper = BizBuySellScraper()
        self.glencoco = GlencocoIntegration()
        self.berkeley = BerkeleyDatabaseCollector()
        self.advanced_scraper = AdvancedScraper()
        
    async def get_comprehensive_market_data(self, location: str, industry: str = None, radius_miles: int = 25) -> Dict[str, Any]:
        """
        Get comprehensive market data with advanced signal detection
        """
        try:
            # Normalize industry
            if industry:
                industry = industry.lower().strip()
            
            print(f"Collecting business data for {location}, {industry}")
            
            # Collect data from all sources concurrently
            tasks = [
                self._get_yelp_data(location, industry),
                self._get_google_maps_data(location, industry),
                self._get_bizbuysell_data(location, industry),
                self._get_glencoco_data(location, industry),
                self._get_berkeley_data(location, industry),
                self._get_advanced_bizbuysell_data(location, industry)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            yelp_data = results[0] if not isinstance(results[0], Exception) else []
            google_maps_data = results[1] if not isinstance(results[1], Exception) else []
            bizbuysell_data = results[2] if not isinstance(results[2], Exception) else []
            glencoco_data = results[3] if not isinstance(results[3], Exception) else []
            berkeley_data = results[4] if not isinstance(results[4], Exception) else {}
            advanced_bizbuysell_data = results[5] if not isinstance(results[5], Exception) else []
            
            # Merge and deduplicate business data
            all_businesses = self._merge_business_data([
                yelp_data, google_maps_data, bizbuysell_data, 
                glencoco_data, advanced_bizbuysell_data
            ])
            
            # Add signal detection to businesses
            businesses_with_signals = await self._add_signal_detection(all_businesses, location, industry)
            
            # Calculate market metrics
            market_metrics = self._calculate_market_metrics(businesses_with_signals, berkeley_data)
            
            # Prepare comprehensive response
            comprehensive_data = {
                'location': location,
                'industry': industry or 'general',
                'business_count': len(businesses_with_signals),
                'businesses': businesses_with_signals,
                'market_metrics': market_metrics,
                'berkeley_research': berkeley_data,
                'data_sources': {
                    'yelp': len(yelp_data),
                    'google_maps': len(google_maps_data),
                    'bizbuysell': len(bizbuysell_data),
                    'glencoco': len(glencoco_data),
                    'advanced_bizbuysell': len(advanced_bizbuysell_data),
                    'berkeley': 1 if berkeley_data else 0
                },
                'timestamp': asyncio.get_event_loop().time()
            }
            
            return comprehensive_data
            
        except Exception as e:
            logging.error(f"Error in comprehensive market data collection: {e}")
            return {
                'location': location,
                'industry': industry or 'general',
                'business_count': 0,
                'businesses': [],
                'market_metrics': {},
                'berkeley_research': {},
                'data_sources': {},
                'timestamp': asyncio.get_event_loop().time()
            }
    
    async def _get_yelp_data(self, location: str, industry: str) -> List[Dict]:
        """Get data from Yelp scraper"""
        try:
            return self.yelp_scraper.scrape_businesses(location, industry)
        except Exception as e:
            print(f"Error scraping Yelp: {e}")
            return []
    
    async def _get_google_maps_data(self, location: str, industry: str) -> List[Dict]:
        """Get data from Google Maps API using geopy"""
        try:
            return self.google_maps.search_places(location, industry, radius_miles=25)
        except Exception as e:
            print(f"Error getting Google Maps data: {e}")
            return []
    
    async def _get_bizbuysell_data(self, location: str, industry: str) -> List[Dict]:
        """Get data from BizBuySell scraper"""
        try:
            return await self.bizbuysell_scraper.scrape_businesses_for_sale(location, industry)
        except Exception as e:
            print(f"Error scraping BizBuySell: {e}")
            return []
    
    async def _get_glencoco_data(self, location: str, industry: str) -> List[Dict]:
        """Get data from Glencoco integration"""
        try:
            return await self.glencoco.get_business_intelligence(location, industry)
        except Exception as e:
            print(f"Error getting Glencoco data: {e}")
            return []
    
    async def _get_berkeley_data(self, location: str, industry: str) -> Dict:
        """Get data from UC Berkeley databases"""
        try:
            return self.berkeley.get_market_intelligence(location, industry)
        except Exception as e:
            print(f"Error getting Berkeley data: {e}")
            return {}
    
    async def _get_advanced_bizbuysell_data(self, location: str, industry: str) -> List[Dict]:
        """Get data from advanced BizBuySell scraper with ghost browser"""
        try:
            async with self.advanced_scraper:
                return await self.advanced_scraper.scrape_bizbuysell_advanced(location, industry)
        except Exception as e:
            print(f"Error in advanced BizBuySell scraping: {e}")
            return []
    
    def _merge_business_data(self, business_lists: List[List[Dict]]) -> List[Dict]:
        """Merge and deduplicate business data from multiple sources"""
        merged_businesses = []
        seen_names = set()
        
        for business_list in business_lists:
            for business in business_list:
                # Create a unique identifier
                business_name = business.get('name', '').lower().strip()
                business_address = business.get('address', '').lower().strip()
                unique_id = f"{business_name}_{business_address}"
                
                if unique_id not in seen_names:
                    seen_names.add(unique_id)
                    
                    # Add source information
                    business['data_sources'] = business.get('data_sources', [])
                    if 'source' in business:
                        business['data_sources'].append(business['source'])
                    
                    merged_businesses.append(business)
        
        return merged_businesses
    
    async def _add_signal_detection(self, businesses: List[Dict], location: str, industry: str) -> List[Dict]:
        """Add selling signal detection to businesses"""
        businesses_with_signals = []
        
        for business in businesses:
            try:
                # Get comprehensive signals for the business
                signals = await self.advanced_scraper.get_comprehensive_signals(
                    business.get('name', ''),
                    location,
                    industry or 'general'
                )
                
                # Add signals to business data
                business['selling_signals'] = signals
                
                # Add coordinates if not present
                if 'coordinates' not in business and 'address' in business:
                    # Simulate coordinates based on address
                    business['coordinates'] = self._get_coordinates_from_address(business['address'])
                
                businesses_with_signals.append(business)
                
            except Exception as e:
                print(f"Error adding signal detection for {business.get('name', '')}: {e}")
                # Add default signals
                business['selling_signals'] = {
                    'web_signals': {},
                    'linkedin_signals': {},
                    'reddit_signals': {},
                    'total_signal_score': 0,
                    'recommendation': 'No signals detected'
                }
                businesses_with_signals.append(business)
        
        return businesses_with_signals
    
    def _get_coordinates_from_address(self, address: str) -> Optional[List[float]]:
        """Get coordinates from address (simulated)"""
        # This would normally use a geocoding service
        # For now, return simulated coordinates
        import random
        return [
            37.7749 + random.uniform(-0.1, 0.1),  # San Francisco area
            -122.4194 + random.uniform(-0.1, 0.1)
        ]
    
    def _calculate_market_metrics(self, businesses: List[Dict], berkeley_data: Dict) -> Dict[str, Any]:
        """Calculate comprehensive market metrics"""
        try:
            if not businesses:
                return {}
            
            # Basic metrics
            total_revenue = sum(b.get('estimated_revenue', 0) for b in businesses)
            total_employees = sum(b.get('employee_count', 0) for b in businesses)
            avg_revenue = total_revenue / len(businesses) if businesses else 0
            avg_employees = total_employees / len(businesses) if businesses else 0
            
            # Lead scoring
            lead_scores = [b.get('lead_score', 0) for b in businesses]
            avg_lead_score = sum(lead_scores) / len(lead_scores) if lead_scores else 0
            
            # Signal analysis
            signal_scores = [b.get('selling_signals', {}).get('total_signal_score', 0) for b in businesses]
            businesses_with_signals = len([s for s in signal_scores if s > 0])
            avg_signal_score = sum(signal_scores) / len(signal_scores) if signal_scores else 0
            
            # Market concentration (HHI)
            market_shares = [b.get('market_share_percent', 0) for b in businesses]
            hhi_score = sum(share ** 2 for share in market_shares)
            
            # Fragmentation level
            if hhi_score > 2500:
                fragmentation_level = 'highly_concentrated'
            elif hhi_score > 1500:
                fragmentation_level = 'moderately_concentrated'
            else:
                fragmentation_level = 'fragmented'
            
            # TAM/SAM/SOM estimates from Berkeley data
            tam_estimate = berkeley_data.get('industry_analysis', {}).get('market_size', 0)
            sam_estimate = tam_estimate * 0.1  # Assume 10% of TAM is addressable
            som_estimate = sam_estimate * 0.05  # Assume 5% of SAM is obtainable
            
            return {
                'tam_estimate': tam_estimate,
                'sam_estimate': sam_estimate,
                'som_estimate': som_estimate,
                'hhi_score': hhi_score,
                'fragmentation_level': fragmentation_level,
                'avg_revenue_per_business': avg_revenue,
                'avg_employees_per_business': avg_employees,
                'avg_lead_score': avg_lead_score,
                'avg_signal_score': avg_signal_score,
                'businesses_with_signals': businesses_with_signals,
                'market_saturation_percent': (len(businesses) / 1000) * 100,  # Simulated
                'ad_spend_to_dominate': avg_revenue * 0.1,  # Simulated
                'total_revenue': total_revenue,
                'total_employees': total_employees
            }
            
        except Exception as e:
            print(f"Error calculating market metrics: {e}")
            return {}
    
    async def get_signal_analysis(self, business_name: str, location: str, industry: str) -> Dict[str, Any]:
        """Get detailed signal analysis for a specific business"""
        try:
            async with self.advanced_scraper:
                signals = await self.advanced_scraper.get_comprehensive_signals(business_name, location, industry)
                return signals
        except Exception as e:
            print(f"Error in signal analysis: {e}")
            return {
                'web_signals': {},
                'linkedin_signals': {},
                'reddit_signals': {},
                'total_signal_score': 0,
                'recommendation': 'Error in signal analysis'
            }
    
    async def get_advanced_business_data(self, location: str, industry: str = None) -> List[Dict]:
        """Get advanced business data with enhanced scraping"""
        try:
            async with self.advanced_scraper:
                # Get advanced BizBuySell data
                bizbuysell_data = await self.advanced_scraper.scrape_bizbuysell_advanced(location, industry)
                
                # Add signal detection to each business
                businesses_with_signals = []
                for business in bizbuysell_data:
                    signals = await self.advanced_scraper.get_comprehensive_signals(
                        business.get('name', ''),
                        location,
                        industry or 'general'
                    )
                    business['selling_signals'] = signals
                    businesses_with_signals.append(business)
                
                return businesses_with_signals
                
        except Exception as e:
            print(f"Error getting advanced business data: {e}")
            return [] 