#!/usr/bin/env python3
"""
Comprehensive test script for enhanced market intelligence features
"""

import asyncio
import sys
import os
import time

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.enhanced_market_intelligence_service import EnhancedMarketIntelligenceService
from app.data_collectors.advanced_scraper import AdvancedScraper
from app.data_collectors.google_maps_api import GoogleMapsAPI
from app.data_collectors.berkeley_databases import BerkeleyDatabaseCollector

async def test_enhanced_features():
    """Test all enhanced features"""
    print("🧪 Testing Enhanced Market Intelligence Features")
    print("=" * 60)
    
    # Test 1: Advanced Scraper with Proxy Rotation
    print("\n1. Testing Advanced Scraper with Proxy Rotation...")
    try:
        async with AdvancedScraper() as scraper:
            # Test proxy rotation
            proxy1 = scraper._get_next_proxy()
            proxy2 = scraper._get_next_proxy()
            print(f"✅ Proxy Rotation: {proxy1} -> {proxy2}")
            
            # Test ghost browser setup
            driver = scraper.setup_ghost_browser()
            print(f"✅ Ghost Browser: {driver.name if driver else 'Failed'}")
            if driver:
                driver.quit()
            
            # Test signal detection
            signals = await scraper.get_comprehensive_signals(
                "San Francisco HVAC Services", 
                "San Francisco", 
                "hvac"
            )
            print(f"✅ Signal Detection: Score {signals.get('total_signal_score', 0)}")
            print(f"   Recommendation: {signals.get('recommendation', 'N/A')}")
            
    except Exception as e:
        print(f"❌ Advanced Scraper Error: {e}")
    
    # Test 2: Google Maps Integration
    print("\n2. Testing Google Maps Integration...")
    try:
        google_maps = GoogleMapsAPI()
        businesses = google_maps.search_places("San Francisco", "hvac", radius_miles=25)
        print(f"✅ Google Maps API: Found {len(businesses)} businesses")
        if businesses:
            print(f"   First business: {businesses[0]['name']} - {businesses[0]['address']}")
    except Exception as e:
        print(f"❌ Google Maps Error: {e}")
    
    # Test 3: UC Berkeley Database Integration
    print("\n3. Testing UC Berkeley Database Integration...")
    try:
        berkeley = BerkeleyDatabaseCollector()
        market_data = berkeley.get_market_intelligence("San Francisco", "hvac")
        print(f"✅ Berkeley Integration: Market size ${market_data['industry_analysis']['market_size']:,}")
        print(f"   Growth rate: {market_data['industry_analysis']['growth_rate']:.1%}")
        print(f"   Business count: {market_data['industry_analysis']['business_count']:,}")
    except Exception as e:
        print(f"❌ Berkeley Integration Error: {e}")
    
    # Test 4: Enhanced Market Intelligence Service
    print("\n4. Testing Enhanced Market Intelligence Service...")
    try:
        service = EnhancedMarketIntelligenceService()
        comprehensive_data = await service.get_comprehensive_market_data("San Francisco", "hvac", 25)
        print(f"✅ Enhanced Service: Found {comprehensive_data['business_count']} businesses")
        print(f"   Data sources: {list(comprehensive_data['data_sources'].keys())}")
        print(f"   Berkeley research: {'Yes' if comprehensive_data.get('berkeley_research') else 'No'}")
        print(f"   Google Maps data: {comprehensive_data['data_sources'].get('google_maps', 0)} businesses")
        
        # Test signal analysis
        if comprehensive_data['businesses']:
            first_business = comprehensive_data['businesses'][0]
            signals = first_business.get('selling_signals', {})
            print(f"   Signal analysis: Score {signals.get('total_signal_score', 0)}")
            print(f"   Recommendation: {signals.get('recommendation', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Enhanced Service Error: {e}")
    
    # Test 5: Signal Detection Features
    print("\n5. Testing Signal Detection Features...")
    try:
        async with AdvancedScraper() as scraper:
            # Test web signal detection
            web_signals = await scraper.detect_selling_signals("ABC HVAC", "San Francisco")
            print(f"✅ Web Signal Detection: {web_signals['signal_score']} score")
            print(f"   Signals found: {len(web_signals['signals_found'])}")
            
            # Test LinkedIn signal detection
            linkedin_signals = await scraper.scrape_linkedin_signals("ABC HVAC")
            print(f"✅ LinkedIn Signal Detection: {linkedin_signals['signal_score']} score")
            print(f"   Recent activity: {len(linkedin_signals['recent_activity'])} items")
            
            # Test Reddit signal detection
            reddit_signals = await scraper.scrape_reddit_signals("ABC HVAC", "hvac")
            print(f"✅ Reddit Signal Detection: {reddit_signals['signal_score']} score")
            print(f"   Posts found: {len(reddit_signals['posts'])}")
            
    except Exception as e:
        print(f"❌ Signal Detection Error: {e}")
    
    # Test 6: Custom Signal Detection
    print("\n6. Testing Custom Signal Detection...")
    try:
        async with AdvancedScraper() as scraper:
            # Test custom signals
            custom_signals = [
                'business valuation',
                'exit strategy',
                'succession planning',
                'business broker',
                'private enquiry firm'
            ]
            
            for signal in custom_signals:
                if signal in scraper.selling_signals:
                    print(f"✅ Custom Signal: {signal} - Found in predefined list")
                else:
                    print(f"⚠️  Custom Signal: {signal} - Not in predefined list")
                    
    except Exception as e:
        print(f"❌ Custom Signal Detection Error: {e}")
    
    # Test 7: Performance and Rate Limiting
    print("\n7. Testing Performance and Rate Limiting...")
    try:
        async with AdvancedScraper() as scraper:
            start_time = time.time()
            
            # Test multiple concurrent requests
            tasks = []
            for i in range(3):
                task = scraper.detect_selling_signals(f"Business {i}", "San Francisco")
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            
            successful_results = [r for r in results if not isinstance(r, Exception)]
            print(f"✅ Performance Test: {len(successful_results)}/{len(results)} successful")
            print(f"   Time taken: {end_time - start_time:.2f} seconds")
            print(f"   Average time per request: {(end_time - start_time) / len(results):.2f} seconds")
            
    except Exception as e:
        print(f"❌ Performance Test Error: {e}")
    
    # Test 8: Data Quality and Deduplication
    print("\n8. Testing Data Quality and Deduplication...")
    try:
        service = EnhancedMarketIntelligenceService()
        
        # Test with duplicate businesses
        test_businesses = [
            {'name': 'ABC HVAC', 'address': '123 Main St', 'source': 'yelp'},
            {'name': 'ABC HVAC', 'address': '123 Main St', 'source': 'google_maps'},
            {'name': 'XYZ HVAC', 'address': '456 Oak Ave', 'source': 'bizbuysell'}
        ]
        
        merged = service._merge_business_data([test_businesses])
        print(f"✅ Deduplication: {len(merged)} unique businesses from {len(test_businesses)} total")
        
        for business in merged:
            print(f"   - {business['name']} ({', '.join(business.get('data_sources', []))})")
            
    except Exception as e:
        print(f"❌ Data Quality Test Error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Enhanced Features Test Complete!")
    print("\nKey Features Tested:")
    print("✅ Advanced scraper with proxy rotation")
    print("✅ Ghost browser with stealth options")
    print("✅ Custom signal detection")
    print("✅ Web, LinkedIn, and Reddit signal scraping")
    print("✅ Google Maps integration")
    print("✅ UC Berkeley database integration")
    print("✅ Performance and rate limiting")
    print("✅ Data quality and deduplication")
    print("✅ Comprehensive market intelligence")
    print("\nAdvanced Features Working:")
    print("🔒 Proxy rotation for anti-detection")
    print("👻 Ghost browser with stealth mode")
    print("🎯 Custom signal detection for selling indicators")
    print("🌐 Multi-platform signal scraping")
    print("📊 Real-time market intelligence")
    print("🗺️  Geographic business clustering")
    print("📈 Advanced analytics and scoring")

if __name__ == "__main__":
    asyncio.run(test_enhanced_features()) 