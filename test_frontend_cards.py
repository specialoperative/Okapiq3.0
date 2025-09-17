#!/usr/bin/env python3
"""
Test that result cards display properly on frontend with all required fields
"""
import requests
import json
import time

def test_industry_scan(industry, location="San Francisco"):
    """Test scanning for a specific industry and verify data structure"""
    url = "http://localhost:8000/intelligence/scan"
    
    payload = {
        "location": location,
        "industry": industry,
        "radius_miles": 15,
        "max_businesses": 10,
        "crawl_sources": ["google_serp", "apify_gmaps", "yelp"],
        "use_cache": False
    }
    
    print(f"\n🔍 Testing {industry}...")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            businesses = data.get('businesses', [])
            
            print(f"  ✅ Found {len(businesses)} businesses")
            
            # Check data completeness for frontend display
            required_fields = {
                'name': 0,
                'website': 0,
                'phone': 0,
                'address': 0,
                'city': 0,
                'state': 0,
                'zip_code': 0,
                'rating': 0,
                'business_type': 0
            }
            
            for biz in businesses:
                # Check main fields
                if biz.get('name'):
                    required_fields['name'] += 1
                
                # Check contact fields
                contact = biz.get('contact', {})
                if contact.get('website'):
                    required_fields['website'] += 1
                if contact.get('phone'):
                    required_fields['phone'] += 1
                
                # Check address fields
                address = biz.get('address', {})
                if address.get('formatted_address') or address.get('line1'):
                    required_fields['address'] += 1
                if address.get('city'):
                    required_fields['city'] += 1
                if address.get('state'):
                    required_fields['state'] += 1
                if address.get('zip_code'):
                    required_fields['zip_code'] += 1
                
                # Check metrics
                metrics = biz.get('metrics', {})
                if metrics.get('rating'):
                    required_fields['rating'] += 1
                
                # Check category/type
                if biz.get('category') or biz.get('industry'):
                    required_fields['business_type'] += 1
            
            # Display coverage statistics
            total = len(businesses)
            if total > 0:
                print("\n  📊 Field Coverage:")
                for field, count in required_fields.items():
                    percentage = (count / total) * 100
                    status = "✅" if percentage >= 80 else "⚠️" if percentage >= 50 else "❌"
                    print(f"    {status} {field}: {count}/{total} ({percentage:.0f}%)")
            
            # Show sample businesses for verification
            if businesses:
                print("\n  📋 Sample Businesses (first 3):")
                for i, biz in enumerate(businesses[:3], 1):
                    name = biz.get('name', 'Unknown')
                    website = biz.get('contact', {}).get('website', 'No website')
                    phone = biz.get('contact', {}).get('phone', 'No phone')
                    rating = biz.get('metrics', {}).get('rating', 'N/A')
                    
                    print(f"\n    {i}. {name}")
                    print(f"       Website: {website}")
                    print(f"       Phone: {phone}")
                    print(f"       Rating: {rating}")
            
            return {
                'success': True,
                'total': total,
                'field_coverage': required_fields
            }
        else:
            print(f"  ❌ API Error: {response.status_code}")
            return {'success': False, 'error': response.status_code}
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return {'success': False, 'error': str(e)}

def main():
    print("🚀 Testing Frontend Result Card Data Completeness\n")
    print("This test verifies that the backend provides all required fields")
    print("for proper display in the frontend result cards.")
    print("=" * 60)
    
    industries = [
        "restaurant",
        "hvac",
        "electrical", 
        "plumbing",
        "accounting firms",
        "security guards",
        "fire and safety"
    ]
    
    results = {}
    
    for industry in industries:
        result = test_industry_scan(industry)
        results[industry] = result
        time.sleep(2)  # Rate limiting
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 OVERALL SUMMARY")
    print("=" * 60)
    
    successful = sum(1 for r in results.values() if r.get('success'))
    print(f"\n✅ Successful API calls: {successful}/{len(industries)}")
    
    # Calculate average field coverage
    if successful > 0:
        field_totals = {}
        for industry, result in results.items():
            if result.get('success'):
                coverage = result.get('field_coverage', {})
                total = result.get('total', 1)
                for field, count in coverage.items():
                    if field not in field_totals:
                        field_totals[field] = []
                    field_totals[field].append((count / total * 100) if total > 0 else 0)
        
        print("\n📈 Average Field Coverage Across All Industries:")
        for field, percentages in field_totals.items():
            avg = sum(percentages) / len(percentages)
            status = "✅" if avg >= 80 else "⚠️" if avg >= 50 else "❌"
            print(f"  {status} {field}: {avg:.0f}%")
    
    print("\n✨ Test complete!")
    print("\n💡 Frontend should display result cards with:")
    print("  • Business name and type")
    print("  • Website (with clickable links)")
    print("  • Phone number")
    print("  • Full address (street, city, state, zip)")
    print("  • Google Maps rating")
    print("  • Revenue estimates")
    print("  • Number of locations")
    print("  • Data source attribution")

if __name__ == "__main__":
    main()
