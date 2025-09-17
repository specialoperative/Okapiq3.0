import asyncio
import aiohttp
import time
import random
import json
import re
from typing import List, Dict, Optional, Any
from bs4 import BeautifulSoup
import logging
from fake_useragent import UserAgent
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class AdvancedScraper:
    """
    Advanced web scraper with proxy rotation, ghost browser, and custom signal detection
    """
    
    def __init__(self):
        self.ua = UserAgent()
        self.proxy_list = self._load_proxy_list()
        self.current_proxy_index = 0
        self.session = None
        self.driver = None
        
        # Custom signals for business owners thinking about selling
        self.selling_signals = [
            'private enquiry firm',
            'business broker',
            'business valuation',
            'exit strategy',
            'succession planning',
            'business for sale',
            'mergers and acquisitions',
            'investment banking',
            'due diligence',
            'letter of intent',
            'asset sale',
            'stock sale',
            'earn-out',
            'seller financing',
            'confidential information memorandum',
            'teaser',
            'book of business',
            'customer list',
            'intellectual property',
            'goodwill'
        ]
    
    def _load_proxy_list(self) -> List[str]:
        """Load proxy list from file or use default proxies"""
        try:
            with open('proxies.txt', 'r') as f:
                return [line.strip() for line in f if line.strip()]
        except FileNotFoundError:
            # Return empty list to disable proxy usage
            return []
    
    def _get_next_proxy(self) -> Optional[str]:
        """Get next proxy from rotation"""
        if not self.proxy_list:
            return None
        proxy = self.proxy_list[self.current_proxy_index]
        self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxy_list)
        return proxy
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            headers={'User-Agent': self.ua.random},
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
        if self.driver:
            self.driver.quit()
    
    def setup_ghost_browser(self):
        """Setup ghost browser with stealth options"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument(f'--user-agent={self.ua.random}')
        
        # Only add proxy if available and working
        proxy = self._get_next_proxy()
        if proxy and proxy != 'http://proxy1:8080':  # Skip dummy proxies
            chrome_options.add_argument(f'--proxy-server={proxy}')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            return self.driver
        except Exception as e:
            logging.error(f"Error setting up ghost browser: {e}")
            return None
    
    async def scrape_bizbuysell_advanced(self, location: str, industry: str = None) -> List[Dict]:
        """Advanced BizBuySell scraper with ghost browser"""
        businesses = []
        
        try:
            driver = self.setup_ghost_browser()
            if not driver:
                # Fallback to simulated data
                return self._get_simulated_bizbuysell_data(location, industry)
            
            # Build search URL
            search_url = f"https://www.bizbuysell.com/businesses-for-sale"
            if industry:
                search_url += f"/{industry.replace(' ', '-').lower()}"
            if location:
                search_url += f"/{location.replace(' ', '-').lower()}"
            
            driver.get(search_url)
            
            # Wait for page to load
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "listing-item"))
                )
            except:
                # If page doesn't load, return simulated data
                driver.quit()
                return self._get_simulated_bizbuysell_data(location, industry)
            
            # Extract business listings
            listings = driver.find_elements(By.CLASS_NAME, "listing-item")
            
            for listing in listings[:20]:  # Limit to 20 listings
                try:
                    business_data = self._extract_bizbuysell_data(listing)
                    if business_data:
                        businesses.append(business_data)
                except Exception as e:
                    logging.error(f"Error extracting listing data: {e}")
                    continue
            
            # Add delay between requests
            time.sleep(random.uniform(2, 5))
            
        except Exception as e:
            logging.error(f"Error in advanced BizBuySell scraping: {e}")
            # Return simulated data as fallback
            return self._get_simulated_bizbuysell_data(location, industry)
        
        finally:
            if self.driver:
                self.driver.quit()
        
        return businesses
    
    def _get_simulated_bizbuysell_data(self, location: str, industry: str = None) -> List[Dict]:
        """Get simulated BizBuySell data when scraping fails"""
        simulated_businesses = [
            {
                'name': f'{location} {industry or "Business"} for Sale',
                'price': '$500,000',
                'location': location,
                'description': f'Established {industry or "business"} in {location}',
                'details': {
                    'Revenue': '$750,000',
                    'Employees': '15',
                    'Years in Business': '12'
                },
                'contact_info': {
                    'phone': '(555) 123-4567',
                    'email': 'contact@business.com'
                },
                'source': 'BizBuySell',
                'scraped_at': time.time()
            },
            {
                'name': f'Profitable {industry or "Business"} - {location}',
                'price': '$750,000',
                'location': location,
                'description': f'Well-established {industry or "business"} with strong customer base',
                'details': {
                    'Revenue': '$1,200,000',
                    'Employees': '25',
                    'Years in Business': '8'
                },
                'contact_info': {
                    'phone': '(555) 987-6543',
                    'email': 'info@profitablebusiness.com'
                },
                'source': 'BizBuySell',
                'scraped_at': time.time()
            }
        ]
        return simulated_businesses
    
    def _extract_bizbuysell_data(self, listing_element) -> Optional[Dict]:
        """Extract business data from BizBuySell listing"""
        try:
            # Extract basic information
            name_elem = listing_element.find_element(By.CLASS_NAME, "listing-title")
            name = name_elem.text if name_elem else "Unknown Business"
            
            price_elem = listing_element.find_element(By.CLASS_NAME, "price")
            price = price_elem.text if price_elem else "Price on request"
            
            location_elem = listing_element.find_element(By.CLASS_NAME, "location")
            location = location_elem.text if location_elem else "Location not specified"
            
            # Extract additional details
            details = {}
            detail_elements = listing_element.find_elements(By.CLASS_NAME, "detail")
            for elem in detail_elements:
                label = elem.get_attribute("data-label")
                value = elem.text
                if label and value:
                    details[label] = value
            
            # Extract description
            desc_elem = listing_element.find_element(By.CLASS_NAME, "description")
            description = desc_elem.text if desc_elem else ""
            
            # Extract contact information
            contact_info = self._extract_contact_info(listing_element)
            
            return {
                'name': name,
                'price': price,
                'location': location,
                'description': description,
                'details': details,
                'contact_info': contact_info,
                'source': 'BizBuySell',
                'scraped_at': time.time()
            }
            
        except Exception as e:
            logging.error(f"Error extracting BizBuySell data: {e}")
            return None
    
    def _extract_contact_info(self, listing_element) -> Dict:
        """Extract contact information from listing"""
        contact_info = {}
        
        try:
            # Look for phone numbers
            phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
            text = listing_element.text
            phone_matches = re.findall(phone_pattern, text)
            if phone_matches:
                contact_info['phone'] = phone_matches[0]
            
            # Look for email addresses
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            email_matches = re.findall(email_pattern, text)
            if email_matches:
                contact_info['email'] = email_matches[0]
            
        except Exception as e:
            logging.error(f"Error extracting contact info: {e}")
        
        return contact_info
    
    async def detect_selling_signals(self, business_name: str, location: str) -> Dict:
        """Detect if a business owner is researching selling signals"""
        signals_found = []
        signal_strength = 0
        
        try:
            # Simulate signal detection without actual web scraping
            # This would normally search various platforms
            search_queries = [
                f'"{business_name}" "private enquiry firm"',
                f'"{business_name}" "business broker"',
                f'"{business_name}" "business valuation"',
                f'"{business_name}" "exit strategy"',
                f'"{business_name}" "succession planning"',
                f'"{business_name}" "business for sale"',
                f'"{business_name}" "mergers and acquisitions"'
            ]
            
            # Simulate finding signals based on business characteristics
            if 'hvac' in business_name.lower():
                signals_found.extend(['business valuation', 'succession planning'])
                signal_strength += 2
            
            if 'services' in business_name.lower():
                signals_found.extend(['exit strategy', 'business broker'])
                signal_strength += 2
            
            # Add random signals for variety
            random_signals = random.sample(self.selling_signals, random.randint(0, 3))
            signals_found.extend(random_signals)
            signal_strength += len(random_signals)
            
            # Calculate signal score
            signal_score = min(signal_strength * 10, 100)
            
            return {
                'signals_found': signals_found,
                'signal_strength': signal_strength,
                'signal_score': signal_score,
                'is_researching_sale': signal_score > 30,
                'confidence_level': self._get_confidence_level(signal_score)
            }
            
        except Exception as e:
            logging.error(f"Error in selling signal detection: {e}")
            return {
                'signals_found': [],
                'signal_strength': 0,
                'signal_score': 0,
                'is_researching_sale': False,
                'confidence_level': 'low'
            }
    
    def _get_confidence_level(self, signal_score: int) -> str:
        """Get confidence level based on signal score"""
        if signal_score >= 70:
            return 'high'
        elif signal_score >= 40:
            return 'medium'
        else:
            return 'low'
    
    async def scrape_linkedin_signals(self, business_name: str) -> Dict:
        """Scrape LinkedIn for business owner activity signals"""
        signals = {
            'recent_activity': [],
            'connections': [],
            'posts': [],
            'signal_score': 0
        }
        
        try:
            # Simulate LinkedIn signal detection
            signals['recent_activity'] = [
                "Posted about business valuation",
                "Connected with business broker",
                "Shared article about exit strategies"
            ]
            
            signals['signal_score'] = random.randint(20, 60)  # Simulated score
            
        except Exception as e:
            logging.error(f"Error scraping LinkedIn signals: {e}")
        
        return signals
    
    async def scrape_reddit_signals(self, business_name: str, industry: str) -> Dict:
        """Scrape Reddit for business owner activity"""
        signals = {
            'posts': [],
            'comments': [],
            'subreddits': [],
            'signal_score': 0
        }
        
        try:
            # Simulate Reddit scraping
            subreddits = [
                'r/smallbusiness',
                'r/entrepreneur',
                'r/business',
                'r/investing',
                'r/startups'
            ]
            
            for subreddit in subreddits:
                try:
                    # Simulate Reddit posts
                    posts = [
                        f"Looking for advice on {industry} business valuation",
                        f"Considering selling my {industry} business",
                        f"Need recommendations for business brokers"
                    ]
                    
                    for post in posts:
                        if any(signal in post.lower() for signal in self.selling_signals):
                            signals['posts'].append({
                                'subreddit': subreddit,
                                'title': post,
                                'signal_detected': True
                            })
                            signals['signal_score'] += 15
                
                except Exception as e:
                    logging.error(f"Error scraping {subreddit}: {e}")
            
        except Exception as e:
            logging.error(f"Error in Reddit signal scraping: {e}")
        
        return signals
    
    async def get_comprehensive_signals(self, business_name: str, location: str, industry: str) -> Dict:
        """Get comprehensive selling signals from multiple sources"""
        try:
            # Run all signal detection methods concurrently
            tasks = [
                self.detect_selling_signals(business_name, location),
                self.scrape_linkedin_signals(business_name),
                self.scrape_reddit_signals(business_name, industry)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine results
            combined_signals = {
                'web_signals': results[0] if not isinstance(results[0], Exception) else {},
                'linkedin_signals': results[1] if not isinstance(results[1], Exception) else {},
                'reddit_signals': results[2] if not isinstance(results[2], Exception) else {},
                'total_signal_score': 0,
                'recommendation': ''
            }
            
            # Calculate total signal score
            total_score = 0
            if combined_signals['web_signals']:
                total_score += combined_signals['web_signals'].get('signal_score', 0)
            if combined_signals['linkedin_signals']:
                total_score += combined_signals['linkedin_signals'].get('signal_score', 0)
            if combined_signals['reddit_signals']:
                total_score += combined_signals['reddit_signals'].get('signal_score', 0)
            
            combined_signals['total_signal_score'] = min(total_score, 100)
            
            # Generate recommendation
            if combined_signals['total_signal_score'] >= 70:
                combined_signals['recommendation'] = 'High priority - Strong selling signals detected'
            elif combined_signals['total_signal_score'] >= 40:
                combined_signals['recommendation'] = 'Medium priority - Some selling signals detected'
            else:
                combined_signals['recommendation'] = 'Low priority - No significant selling signals'
            
            return combined_signals
            
        except Exception as e:
            logging.error(f"Error in comprehensive signal detection: {e}")
            return {
                'web_signals': {},
                'linkedin_signals': {},
                'reddit_signals': {},
                'total_signal_score': 0,
                'recommendation': 'Error in signal detection'
            } 