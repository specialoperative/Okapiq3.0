import aiohttp
import asyncio
import time
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import random
import logging

class BizBuySellScraper:
    def __init__(self):
        self.base_url = "https://www.bizbuysell.com"
        self.session = None
        self.rate_limit_delay = 2.0  # 2 seconds between requests
        self.max_concurrent = 3
        self.semaphore = asyncio.Semaphore(self.max_concurrent)
        
        # User agents to rotate
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={'User-Agent': random.choice(self.user_agents)},
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_businesses_for_sale(self, location: str, industry: str = None, max_pages: int = 5) -> List[Dict]:
        """
        Search for businesses for sale on BizBuySell
        """
        businesses = []
        
        try:
            # Search for businesses in the specified location and industry
            search_url = self._build_search_url(location, industry)
            
            for page in range(1, max_pages + 1):
                page_url = f"{search_url}&page={page}"
                
                async with self.semaphore:
                    page_businesses = await self._scrape_business_listings(page_url)
                    businesses.extend(page_businesses)
                    
                    # Rate limiting
                    await asyncio.sleep(self.rate_limit_delay)
                    
                    if not page_businesses:  # No more results
                        break
            
            return businesses
            
        except Exception as e:
            logging.error(f"Error scraping BizBuySell: {e}")
            return []
    
    async def scrape_businesses_for_sale(self, location: str, industry: str = None) -> List[Dict]:
        """Scrape businesses for sale from BizBuySell (alias for search_businesses_for_sale)"""
        return await self.search_businesses_for_sale(location, industry, max_pages=2)
    
    def _build_search_url(self, location: str, industry: str = None) -> str:
        """Build search URL for BizBuySell"""
        base_search = f"{self.base_url}/businesses-for-sale"
        
        # Add location parameter
        location_param = location.replace(' ', '-').lower()
        
        # Add industry parameter if specified
        if industry:
            industry_param = industry.replace(' ', '-').lower()
            return f"{base_search}/{industry_param}/{location_param}"
        else:
            return f"{base_search}/{location_param}"
    
    async def _scrape_business_listings(self, url: str) -> List[Dict]:
        """Scrape business listings from a single page"""
        businesses = []
        
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find business listing containers
                    listings = soup.find_all('div', class_='listing-item')  # Adjust selector based on actual HTML
                    
                    for listing in listings:
                        business = await self._extract_business_data(listing)
                        if business:
                            businesses.append(business)
                
        except Exception as e:
            logging.error(f"Error scraping page {url}: {e}")
        
        return businesses
    
    async def _extract_business_data(self, listing_element) -> Optional[Dict]:
        """Extract business data from a listing element"""
        try:
            # Extract basic information
            name = listing_element.find('h3', class_='listing-title')
            name = name.get_text(strip=True) if name else 'Unknown Business'
            
            # Extract price
            price_elem = listing_element.find('span', class_='price')
            price = price_elem.get_text(strip=True) if price_elem else 'Price on request'
            
            # Extract location
            location_elem = listing_element.find('span', class_='location')
            location = location_elem.get_text(strip=True) if location_elem else 'Location not specified'
            
            # Extract description
            desc_elem = listing_element.find('p', class_='description')
            description = desc_elem.get_text(strip=True) if desc_elem else ''
            
            # Extract business details
            details = {}
            detail_elements = listing_element.find_all('span', class_='detail')
            for elem in detail_elements:
                label = elem.get('data-label', '')
                value = elem.get_text(strip=True)
                if label and value:
                    details[label] = value
            
            # Extract listing URL
            link_elem = listing_element.find('a', href=True)
            listing_url = f"{self.base_url}{link_elem['href']}" if link_elem else ''
            
            return {
                'name': name,
                'price': price,
                'location': location,
                'description': description,
                'details': details,
                'listing_url': listing_url,
                'source': 'BizBuySell',
                'scraped_at': time.time()
            }
            
        except Exception as e:
            logging.error(f"Error extracting business data: {e}")
            return None
    
    async def get_business_details(self, listing_url: str) -> Optional[Dict]:
        """Get detailed information about a specific business listing"""
        try:
            async with self.session.get(listing_url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract detailed information
                    details = {
                        'financials': self._extract_financials(soup),
                        'assets': self._extract_assets(soup),
                        'reason_for_sale': self._extract_reason_for_sale(soup),
                        'contact_info': self._extract_contact_info(soup)
                    }
                    
                    return details
                    
        except Exception as e:
            logging.error(f"Error getting business details: {e}")
        
        return None
    
    def _extract_financials(self, soup) -> Dict:
        """Extract financial information from business listing"""
        financials = {}
        
        # Look for financial data sections
        financial_section = soup.find('div', class_='financials')
        if financial_section:
            # Extract revenue, cash flow, etc.
            revenue_elem = financial_section.find('span', class_='revenue')
            if revenue_elem:
                financials['revenue'] = revenue_elem.get_text(strip=True)
            
            cash_flow_elem = financial_section.find('span', class_='cash-flow')
            if cash_flow_elem:
                financials['cash_flow'] = cash_flow_elem.get_text(strip=True)
        
        return financials
    
    def _extract_assets(self, soup) -> Dict:
        """Extract asset information"""
        assets = {}
        
        # Look for asset information
        asset_section = soup.find('div', class_='assets')
        if asset_section:
            # Extract equipment, real estate, etc.
            equipment_elem = asset_section.find('span', class_='equipment')
            if equipment_elem:
                assets['equipment'] = equipment_elem.get_text(strip=True)
        
        return assets
    
    def _extract_reason_for_sale(self, soup) -> str:
        """Extract reason for sale"""
        reason_elem = soup.find('div', class_='reason-for-sale')
        return reason_elem.get_text(strip=True) if reason_elem else ''
    
    def _extract_contact_info(self, soup) -> Dict:
        """Extract contact information"""
        contact_info = {}
        
        contact_section = soup.find('div', class_='contact-info')
        if contact_section:
            phone_elem = contact_section.find('span', class_='phone')
            if phone_elem:
                contact_info['phone'] = phone_elem.get_text(strip=True)
            
            email_elem = contact_section.find('span', class_='email')
            if email_elem:
                contact_info['email'] = email_elem.get_text(strip=True)
        
        return contact_info

# Usage example:
# async def main():
#     async with BizBuySellScraper() as scraper:
#         businesses = await scraper.search_businesses_for_sale("San Francisco", "HVAC")
#         print(f"Found {len(businesses)} businesses for sale") 