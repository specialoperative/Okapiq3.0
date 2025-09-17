#!/usr/bin/env python3
"""
Automated test script for OC Startup application
Tests crime heatmap and market scanner functionality
"""
import requests
import json
import time
import sys
from typing import Dict, List

def test_crime_heatmap():
    """Test crime heatmap tile generation"""
    print("🗺️  Testing Crime Heatmap...")
    
    # Test different cities
    cities = ["San Francisco", "New York City", "Los Angeles", "Chicago"]
    tile_url = "http://localhost:8001/analytics/crime-tiles/12/655/1583"
    
    for city in cities:
        try:
            response = requests.get(f"{tile_url}?provider=crimeometer&city={city}", timeout=10)
            if response.status_code == 200 and len(response.content) > 1000:
                print(f"  ✓ {city}: {len(response.content)} bytes")
            else:
                print(f"  ✗ {city}: Failed ({response.status_code})")
        except Exception as e:
            print(f"  ✗ {city}: Error - {e}")
    
    print()

def test_market_scanner():
    """Test market scanner for different industries"""
    print("🔍 Testing Market Scanner...")
    
    industries = [
        "restaurant", "hvac", "electrical", "plumbing", 
        "accounting firms", "security guards", "fire and safety"
    ]
    
    url = "http://localhost:8000/intelligence/scan"
    results = {}
    
    for industry in industries:
        print(f"  Testing {industry}...")
        payload = {
            "location": "San Francisco",
            "industry": industry,
            "radius_miles": 15,
            "max_businesses": 20,
            "crawl_sources": [
                "google_serp", "apify_gmaps", "apify_gmaps_email", 
                "apify_gmaps_websites", "yelp"
            ],
            "use_cache": False
        }
        
        try:
            response = requests.post(url, json=payload, timeout=60)
            if response.status_code == 200:
                data = response.json()
                count = data.get('total_found', 0)
                businesses = data.get('businesses', [])
                
                # Check for contact info coverage
                with_phone = sum(1 for b in businesses if b.get('contact', {}).get('phone'))
                with_email = sum(1 for b in businesses if b.get('contact', {}).get('email'))
                with_website = sum(1 for b in businesses if b.get('contact', {}).get('website'))
                
                results[industry] = {
                    'count': count,
                    'phone_coverage': f"{with_phone}/{count}",
                    'email_coverage': f"{with_email}/{count}",
                    'website_coverage': f"{with_website}/{count}",
                    'sample_business': businesses[0]['name'] if businesses else None
                }
                
                print(f"    ✓ Found {count} businesses")
                print(f"    📞 Phone: {with_phone}/{count}")
                print(f"    📧 Email: {with_email}/{count}")  
                print(f"    🌐 Website: {with_website}/{count}")
                if businesses:
                    print(f"    📝 Sample: {businesses[0]['name']}")
                print()
                
            else:
                print(f"    ✗ Failed: {response.status_code}")
                results[industry] = {'error': response.status_code}
                
        except Exception as e:
            print(f"    ✗ Error: {e}")
            results[industry] = {'error': str(e)}
    
    return results

def test_frontend_health():
    """Test frontend availability"""
    print("🌐 Testing Frontend...")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("  ✓ Frontend is accessible")
        else:
            print(f"  ✗ Frontend returned {response.status_code}")
    except Exception as e:
        print(f"  ✗ Frontend error: {e}")
    print()

def main():
    print("🚀 Starting Automated UI Tests for OC Startup\n")
    
    # Test components
    test_crime_heatmap()
    
    # Start backend if needed
    try:
        response = requests.get("http://localhost:8000/health", timeout=3)
        if response.status_code != 200:
            print("⚠️  Backend not healthy, results may be limited\n")
    except:
        print("⚠️  Backend not accessible, skipping market scanner tests\n")
        return
    
    scanner_results = test_market_scanner()
    test_frontend_health()
    
    # Summary
    print("📊 Test Summary:")
    print("=" * 50)
    
    total_industries = len(scanner_results)
    successful_industries = sum(1 for r in scanner_results.values() if 'count' in r and r['count'] > 0)
    
    print(f"Industries tested: {total_industries}")
    print(f"Successful scans: {successful_industries}")
    print(f"Success rate: {successful_industries/total_industries*100:.1f}%")
    
    print("\nDetailed Results:")
    for industry, result in scanner_results.items():
        if 'count' in result:
            print(f"  {industry}: {result['count']} businesses found")
        else:
            print(f"  {industry}: FAILED - {result.get('error', 'Unknown error')}")
    
    print("\n✅ Testing complete!")

if __name__ == "__main__":
    main()
