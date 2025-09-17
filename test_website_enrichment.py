#!/usr/bin/env python3
"""
Test website enrichment across all industries
"""
import requests
import json
import time

def test_industry_websites(industry, location="San Francisco"):
    """Test website enrichment for a specific industry"""
    url = "http://localhost:8000/intelligence/scan"
    
    payload = {
        "location": location,
        "industry": industry,
        "radius_miles": 15,
        "max_businesses": 10,  # Smaller batch for testing
        "crawl_sources": [
            "google_serp", "apify_gmaps", "yelp"
        ],
        "use_cache": False
    }
    
    try:
        print(f"\n🔍 Testing {industry}...")
        response = requests.post(url, json=payload, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            businesses = data.get('businesses', [])
            
            # Count website coverage
            total = len(businesses)
            with_website = sum(1 for b in businesses if b.get('contact', {}).get('website'))
            
            print(f"  Total businesses: {total}")
            print(f"  With websites: {with_website}/{total} ({with_website/total*100:.1f}%)")
            
            # Show first 3 businesses with their websites
            print("  Sample results:")
            for i, biz in enumerate(businesses[:3], 1):
                name = biz.get('name', 'Unknown')
                website = biz.get('contact', {}).get('website', 'No website')
                print(f"    {i}. {name}")
                print(f"       Website: {website}")
            
            return {
                'success': True,
                'total': total,
                'with_website': with_website,
                'percentage': with_website/total*100 if total > 0 else 0
            }
        else:
            print(f"  ❌ Failed: {response.status_code}")
            return {'success': False, 'error': response.status_code}
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return {'success': False, 'error': str(e)}

def main():
    print("🚀 Testing Website Enrichment via Google SERP API\n")
    
    industries = [
        "restaurant",
        "hvac", 
        "electrical",
        "plumbing",
        "accounting firms",
        "security guards",
        "fire and safety",
        "construction",
        "landscaping",
        "automotive"
    ]
    
    results = {}
    
    for industry in industries:
        result = test_industry_websites(industry)
        results[industry] = result
        time.sleep(2)  # Rate limiting between tests
    
    # Summary
    print("\n" + "="*50)
    print("📊 WEBSITE ENRICHMENT SUMMARY")
    print("="*50)
    
    successful = [ind for ind, r in results.items() if r.get('success')]
    failed = [ind for ind, r in results.items() if not r.get('success')]
    
    print(f"\n✅ Successful: {len(successful)}/{len(industries)}")
    
    if successful:
        avg_coverage = sum(results[ind]['percentage'] for ind in successful) / len(successful)
        print(f"📈 Average website coverage: {avg_coverage:.1f}%")
        
        print("\nDetailed coverage by industry:")
        for ind in successful:
            r = results[ind]
            print(f"  • {ind}: {r['with_website']}/{r['total']} ({r['percentage']:.1f}%)")
    
    if failed:
        print(f"\n❌ Failed industries: {', '.join(failed)}")
    
    print("\n✨ Test complete!")

if __name__ == "__main__":
    main()
