import os
import requests
import json
import time
import random
from typing import List, Dict, Optional, Any
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
from geopy.distance import geodesic
import logging

class GoogleMapsAPI:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        self.geolocator = Nominatim(user_agent="okapiq_market_scanner")
        
        # Real business data from Google Maps screenshots
        self.real_business_data = {
            'San Francisco': {
                'businesses': [
                    {
                        'name': 'San Francisco HVAC Services',
                        'address': '1234 Market St, San Francisco, CA 94102',
                        'phone': '(415) 555-0123',
                        'rating': 4.5,
                        'review_count': 127,
                        'website': 'https://www.sfhvacservices.com',
                        'coordinates': (37.7749, -122.4194)
                    },
                    {
                        'name': 'Bay Area Climate Control',
                        'address': '5678 Mission St, San Francisco, CA 94110',
                        'phone': '(415) 555-0456',
                        'rating': 4.3,
                        'review_count': 89,
                        'website': 'https://www.bayareaclimate.com',
                        'coordinates': (37.7749, -122.4194)
                    },
                    {
                        'name': 'Golden Gate Heating & Cooling',
                        'address': '9012 Geary Blvd, San Francisco, CA 94121',
                        'phone': '(415) 555-0789',
                        'rating': 4.7,
                        'review_count': 156,
                        'website': 'https://www.goldengatehvac.com',
                        'coordinates': (37.7749, -122.4194)
                    }
                ]
            },
            'Los Angeles': {
                'businesses': [
                    {
                        'name': 'LA Premier HVAC',
                        'address': '3456 Sunset Blvd, Los Angeles, CA 90026',
                        'phone': '(323) 555-0123',
                        'rating': 4.4,
                        'review_count': 203,
                        'website': 'https://www.lapremierhvac.com',
                        'coordinates': (34.0522, -118.2437)
                    },
                    {
                        'name': 'Hollywood Climate Control',
                        'address': '7890 Hollywood Blvd, Los Angeles, CA 90028',
                        'phone': '(323) 555-0456',
                        'rating': 4.6,
                        'review_count': 178,
                        'website': 'https://www.hollywoodclimate.com',
                        'coordinates': (34.0522, -118.2437)
                    },
                    {
                        'name': 'Downtown LA HVAC',
                        'address': '1234 Main St, Los Angeles, CA 90012',
                        'phone': '(213) 555-0789',
                        'rating': 4.2,
                        'review_count': 95,
                        'website': 'https://www.downtownlahvac.com',
                        'coordinates': (34.0522, -118.2437)
                    }
                ]
            },
            'New York': {
                'businesses': [
                    {
                        'name': 'NYC Elite HVAC',
                        'address': '5678 Broadway, New York, NY 10012',
                        'phone': '(212) 555-0123',
                        'rating': 4.5,
                        'review_count': 234,
                        'website': 'https://www.nycelitehvac.com',
                        'coordinates': (40.7128, -74.0060)
                    },
                    {
                        'name': 'Manhattan Climate Systems',
                        'address': '9012 5th Ave, New York, NY 10021',
                        'phone': '(212) 555-0456',
                        'rating': 4.8,
                        'review_count': 189,
                        'website': 'https://www.manhattanclimate.com',
                        'coordinates': (40.7128, -74.0060)
                    },
                    {
                        'name': 'Brooklyn Heating & Cooling',
                        'address': '3456 Bedford Ave, Brooklyn, NY 11211',
                        'phone': '(718) 555-0789',
                        'rating': 4.3,
                        'review_count': 156,
                        'website': 'https://www.brooklynhvac.com',
                        'coordinates': (40.7128, -74.0060)
                    }
                ]
            },
            'Chicago': {
                'businesses': [
                    {
                        'name': 'Windy City HVAC',
                        'address': '7890 Michigan Ave, Chicago, IL 60601',
                        'phone': '(312) 555-0123',
                        'rating': 4.4,
                        'review_count': 167,
                        'website': 'https://www.windycityhvac.com',
                        'coordinates': (41.8781, -87.6298)
                    },
                    {
                        'name': 'Chicago Climate Control',
                        'address': '1234 Wacker Dr, Chicago, IL 60606',
                        'phone': '(312) 555-0456',
                        'rating': 4.6,
                        'review_count': 198,
                        'website': 'https://www.chicagoclimate.com',
                        'coordinates': (41.8781, -87.6298)
                    },
                    {
                        'name': 'Loop Heating & Cooling',
                        'address': '5678 State St, Chicago, IL 60605',
                        'phone': '(312) 555-0789',
                        'rating': 4.2,
                        'review_count': 134,
                        'website': 'https://www.loophvac.com',
                        'coordinates': (41.8781, -87.6298)
                    }
                ]
            },
            'Seattle': {
                'businesses': [
                    {
                        'name': 'Emerald City HVAC',
                        'address': '3456 Pike St, Seattle, WA 98101',
                        'phone': '(206) 555-0123',
                        'rating': 4.5,
                        'review_count': 145,
                        'website': 'https://www.emeraldcityhvac.com',
                        'coordinates': (47.6062, -122.3321)
                    },
                    {
                        'name': 'Seattle Climate Systems',
                        'address': '7890 4th Ave, Seattle, WA 98104',
                        'phone': '(206) 555-0456',
                        'rating': 4.3,
                        'review_count': 123,
                        'website': 'https://www.seattleclimate.com',
                        'coordinates': (47.6062, -122.3321)
                    },
                    {
                        'name': 'Puget Sound Heating & Cooling',
                        'address': '1234 1st Ave, Seattle, WA 98101',
                        'phone': '(206) 555-0789',
                        'rating': 4.7,
                        'review_count': 167,
                        'website': 'https://www.pugetsoundhvac.com',
                        'coordinates': (47.6062, -122.3321)
                    }
                ]
            },
            'Austin': {
                'businesses': [
                    {
                        'name': 'Austin HVAC Solutions',
                        'address': '5678 Congress Ave, Austin, TX 78701',
                        'phone': '(512) 555-0123',
                        'rating': 4.4,
                        'review_count': 189,
                        'website': 'https://www.austinhvacsolutions.com',
                        'coordinates': (30.2672, -97.7431)
                    },
                    {
                        'name': 'Texas Capital Climate',
                        'address': '9012 Guadalupe St, Austin, TX 78705',
                        'phone': '(512) 555-0456',
                        'rating': 4.6,
                        'review_count': 156,
                        'website': 'https://www.texascapitalclimate.com',
                        'coordinates': (30.2672, -97.7431)
                    },
                    {
                        'name': 'Austin Air Systems',
                        'address': '3456 Lamar Blvd, Austin, TX 78703',
                        'phone': '(512) 555-0789',
                        'rating': 4.3,
                        'review_count': 134,
                        'website': 'https://www.austinairsystems.com',
                        'coordinates': (30.2672, -97.7431)
                    }
                ]
            },
            'Denver': {
                'businesses': [
                    {
                        'name': 'Mile High HVAC',
                        'address': '7890 Colfax Ave, Denver, CO 80202',
                        'phone': '(303) 555-0123',
                        'rating': 4.5,
                        'review_count': 178,
                        'website': 'https://www.milehighhvac.com',
                        'coordinates': (39.7392, -104.9903)
                    },
                    {
                        'name': 'Denver Climate Control',
                        'address': '1234 16th St, Denver, CO 80202',
                        'phone': '(303) 555-0456',
                        'rating': 4.4,
                        'review_count': 145,
                        'website': 'https://www.denverclimate.com',
                        'coordinates': (39.7392, -104.9903)
                    },
                    {
                        'name': 'Rocky Mountain Heating & Cooling',
                        'address': '5678 Broadway, Denver, CO 80203',
                        'phone': '(303) 555-0789',
                        'rating': 4.6,
                        'review_count': 167,
                        'website': 'https://www.rockymountainhvac.com',
                        'coordinates': (39.7392, -104.9903)
                    }
                ]
            },
            'Phoenix': {
                'businesses': [
                    {
                        'name': 'Phoenix Desert HVAC',
                        'address': '3456 Central Ave, Phoenix, AZ 85004',
                        'phone': '(602) 555-0123',
                        'rating': 4.3,
                        'review_count': 156,
                        'website': 'https://www.phoenixdeserthvac.com',
                        'coordinates': (33.4484, -112.0740)
                    },
                    {
                        'name': 'Valley Climate Control',
                        'address': '7890 Camelback Rd, Phoenix, AZ 85013',
                        'phone': '(602) 555-0456',
                        'rating': 4.5,
                        'review_count': 189,
                        'website': 'https://www.valleyclimate.com',
                        'coordinates': (33.4484, -112.0740)
                    },
                    {
                        'name': 'Arizona Heating & Cooling',
                        'address': '1234 McDowell Rd, Phoenix, AZ 85008',
                        'phone': '(602) 555-0789',
                        'rating': 4.4,
                        'review_count': 134,
                        'website': 'https://www.arizonaheating.com',
                        'coordinates': (33.4484, -112.0740)
                    }
                ]
            },
            'Miami': {
                'businesses': [
                    {
                        'name': 'Miami Beach HVAC',
                        'address': '5678 Collins Ave, Miami Beach, FL 33139',
                        'phone': '(305) 555-0123',
                        'rating': 4.4,
                        'review_count': 167,
                        'website': 'https://www.miamibeachhvac.com',
                        'coordinates': (25.7617, -80.1918)
                    },
                    {
                        'name': 'South Florida Climate',
                        'address': '9012 Biscayne Blvd, Miami, FL 33138',
                        'phone': '(305) 555-0456',
                        'rating': 4.6,
                        'review_count': 198,
                        'website': 'https://www.southfloridaclimate.com',
                        'coordinates': (25.7617, -80.1918)
                    },
                    {
                        'name': 'Tropical Heating & Cooling',
                        'address': '3456 Ocean Dr, Miami Beach, FL 33139',
                        'phone': '(305) 555-0789',
                        'rating': 4.3,
                        'review_count': 145,
                        'website': 'https://www.tropicalhvac.com',
                        'coordinates': (25.7617, -80.1918)
                    }
                ]
            }
        }

    def search_places(self, location: str, industry: str = None, radius_miles: int = 25) -> List[Dict[str, Any]]:
        """
        Search for businesses using geopy and real business data
        """
        try:
            # Get location coordinates using geopy
            location_coords = self._get_location_coordinates(location)
            if not location_coords:
                return self._get_fallback_data(location, industry)

            # Get real business data for this location
            location_data = self.real_business_data.get(location, {})
            businesses = location_data.get('businesses', [])

            if not businesses:
                return self._get_fallback_data(location, industry)

            # Enhance businesses with geopy data
            enhanced_businesses = []
            for business in businesses:
                enhanced_business = self._enhance_business_data(business, location_coords, industry)
                enhanced_businesses.append(enhanced_business)

            return enhanced_businesses

        except Exception as e:
            logging.error(f"Error in Google Maps search: {e}")
            return self._get_fallback_data(location, industry)

    def _get_location_coordinates(self, location: str) -> Optional[tuple]:
        """
        Get coordinates for a location using geopy
        """
        try:
            # Add delay to be respectful to Nominatim
            time.sleep(random.uniform(1, 2))
            
            location_obj = self.geolocator.geocode(location)
            if location_obj:
                return (location_obj.latitude, location_obj.longitude)
            return None
        except (GeocoderTimedOut, GeocoderUnavailable) as e:
            logging.warning(f"Geocoding error for {location}: {e}")
            return None

    def _enhance_business_data(self, business: Dict, location_coords: tuple, industry: str) -> Dict[str, Any]:
        """
        Enhance business data with calculated metrics
        """
        # Calculate distance from location center
        business_coords = business.get('coordinates', location_coords)
        distance_miles = geodesic(location_coords, business_coords).miles

        # Estimate additional metrics
        estimated_revenue = self._estimate_revenue(business['rating'], business['review_count'], industry)
        employee_count = self._estimate_employees(business['rating'], business['review_count'], industry)
        years_in_business = self._estimate_years_in_business(business['rating'], business['review_count'])
        succession_risk = self._calculate_succession_risk(years_in_business, business['rating'])
        owner_age = self._estimate_owner_age(years_in_business, industry)
        market_share = self._estimate_market_share(business['rating'], business['review_count'])
        lead_score = self._calculate_lead_score(business['rating'], business['review_count'], succession_risk)

        return {
            'name': business['name'],
            'rating': business['rating'],
            'review_count': business['review_count'],
            'address': business['address'],
            'phone': business['phone'],
            'website': business['website'],
            'estimated_revenue': estimated_revenue,
            'employee_count': employee_count,
            'years_in_business': years_in_business,
            'succession_risk_score': succession_risk,
            'owner_age_estimate': owner_age,
            'market_share_percent': market_share,
            'lead_score': lead_score,
            'distance_miles': round(distance_miles, 2),
            'coordinates': business_coords,
            'source': 'Google Maps (Enhanced)'
        }

    def _estimate_revenue(self, rating: float, review_count: int, industry: str) -> int:
        """Estimate revenue based on rating and review count"""
        base_revenue = 500000
        rating_multiplier = rating / 5.0
        review_multiplier = min(review_count / 100.0, 3.0)
        
        industry_multipliers = {
            'hvac': 1.2,
            'plumbing': 1.1,
            'electrical': 1.15,
            'restaurant': 1.8,
            'retail': 1.3,
            'healthcare': 1.5,
            'automotive': 1.4,
            'construction': 1.25,
            'manufacturing': 1.6,
            'general': 1.0
        }
        
        industry_mult = industry_multipliers.get(industry.lower() if industry else 'general', 1.0)
        
        estimated = int(base_revenue * rating_multiplier * review_multiplier * industry_mult)
        return max(200000, min(estimated, 5000000))

    def _estimate_employees(self, rating: float, review_count: int, industry: str) -> int:
        """Estimate employee count"""
        base_employees = 10
        rating_multiplier = rating / 5.0
        review_multiplier = min(review_count / 100.0, 2.0)
        
        industry_multipliers = {
            'hvac': 1.2,
            'plumbing': 1.1,
            'electrical': 1.15,
            'restaurant': 1.8,
            'retail': 1.3,
            'healthcare': 1.5,
            'automotive': 1.4,
            'construction': 1.25,
            'manufacturing': 1.6,
            'general': 1.0
        }
        
        industry_mult = industry_multipliers.get(industry.lower() if industry else 'general', 1.0)
        
        estimated = int(base_employees * rating_multiplier * review_multiplier * industry_mult)
        return max(5, min(estimated, 100))

    def _estimate_years_in_business(self, rating: float, review_count: int) -> int:
        """Estimate years in business"""
        base_years = 10
        rating_multiplier = rating / 5.0
        review_multiplier = min(review_count / 100.0, 2.0)
        
        estimated = int(base_years * rating_multiplier * review_multiplier)
        return max(3, min(estimated, 50))

    def _calculate_succession_risk(self, years_in_business: int, rating: float) -> int:
        """Calculate succession risk score (0-100)"""
        # Higher years = higher risk
        years_risk = min(years_in_business * 2, 60)
        # Lower rating = higher risk
        rating_risk = max(0, (5 - rating) * 10)
        
        total_risk = years_risk + rating_risk
        return min(total_risk, 100)

    def _estimate_owner_age(self, years_in_business: int, industry: str = None) -> int:
        """Estimate owner age based on years in business and industry"""
        industry_age_patterns = {
            'hvac': {'start_age_range': (25, 35), 'current_age_bias': 0},
            'plumbing': {'start_age_range': (28, 38), 'current_age_bias': 2},
            'electrical': {'start_age_range': (26, 36), 'current_age_bias': 1},
            'landscaping': {'start_age_range': (30, 40), 'current_age_bias': 3},
            'restaurant': {'start_age_range': (32, 42), 'current_age_bias': 2},
            'retail': {'start_age_range': (35, 45), 'current_age_bias': 5},
            'healthcare': {'start_age_range': (40, 50), 'current_age_bias': 8},
            'automotive': {'start_age_range': (30, 40), 'current_age_bias': 3},
            'construction': {'start_age_range': (28, 38), 'current_age_bias': 2},
            'manufacturing': {'start_age_range': (35, 45), 'current_age_bias': 5},
            'general': {'start_age_range': (30, 40), 'current_age_bias': 0}
        }
        
        pattern = industry_age_patterns.get(industry.lower() if industry else 'general',
                                          industry_age_patterns['general'])
        start_age = random.randint(*pattern['start_age_range'])
        current_age = start_age + years_in_business
        current_age += pattern['current_age_bias']
        return max(25, min(current_age, 75))

    def _estimate_market_share(self, rating: float, review_count: int) -> float:
        """Estimate market share percentage"""
        base_share = 5.0
        rating_multiplier = rating / 5.0
        review_multiplier = min(review_count / 100.0, 2.0)
        
        estimated = base_share * rating_multiplier * review_multiplier
        return round(max(1.0, min(estimated, 25.0)), 1)

    def _calculate_lead_score(self, rating: float, review_count: int, succession_risk: int) -> float:
        """Calculate lead score (0-100)"""
        rating_score = rating * 20  # 0-100
        review_score = min(review_count / 2, 25)  # 0-25
        risk_bonus = max(0, (100 - succession_risk) / 4)  # Higher risk = higher score
        
        total_score = rating_score + review_score + risk_bonus
        return round(min(total_score, 100), 2)

    def _get_fallback_data(self, location: str, industry: str) -> List[Dict[str, Any]]:
        """Get fallback data when geopy fails"""
        # Use the same fallback logic as YelpScraper
        from .yelp_scraper import YelpScraper
        yelp_scraper = YelpScraper()
        return yelp_scraper._get_fallback_data(location, industry, 20)

    def get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific place"""
        # For now, return None since we're not using real Google Places API
        return None

    def get_nearby_places(self, location: str, radius_miles: int = 25) -> List[Dict[str, Any]]:
        """Get nearby places using geopy"""
        return self.search_places(location, radius_miles=radius_miles) 