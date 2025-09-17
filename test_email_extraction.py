#!/usr/bin/env python3
"""Test email extraction from business websites"""

import requests
import json
import time

def test_email_extraction():
    """Test email extraction for different industries"""
    
    base_url = "http://localhost:8000"
    
    # Test different industries
    test_cases = [
        {
            "industry": "restaurant",
            "location": "San Francisco",
            "expected_fields": ["name", "website", "email", "phone"]
        },
        {
            "industry": "plumbing",
            "location": "San Francisco",
            "expected_fields": ["name", "website", "email", "phone"]
        },
        {
            "industry": "electrical",
            "location": "San Francisco",
            "expected_fields": ["name", "website", "email", "phone"]
        }
    ]
    
    print("\n" + "="*80)
    print("EMAIL EXTRACTION TEST - BUSINESS WEBSITES")
    print("="*80)
    
    for test in test_cases:
        print(f"\n📧 Testing {test['industry'].upper()} in {test['location']}")
        print("-"*60)
        
        payload = {
            "location": test["location"],
            "industry": test["industry"],
            "radius_miles": 15,
            "max_businesses": 5,
            "crawl_sources": ["yelp", "google_serp"],
            "use_cache": False
        }
        
        try:
            response = requests.post(
                f"{base_url}/intelligence/scan",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                businesses = data.get("businesses", [])[:3]  # Check first 3
                
                if businesses:
                    email_count = 0
                    website_count = 0
                    
                    for biz in businesses:
                        name = biz.get("name", "Unknown")
                        contact = biz.get("contact", {})
                        website = contact.get("website", "")
                        email = contact.get("email", "")
                        phone = contact.get("phone", "")
                        
                        # Skip Yelp URLs
                        if website and "yelp.com" not in website:
                            website_count += 1
                            
                        if email:
                            email_count += 1
                            
                        print(f"\n  🏢 {name}")
                        print(f"     Website: {website[:60]}..." if len(website) > 60 else f"     Website: {website}")
                        print(f"     Email: {email if email else '❌ Not found'}")
                        print(f"     Phone: {phone if phone else '❌ Not found'}")
                    
                    coverage = (email_count / len(businesses)) * 100 if businesses else 0
                    website_coverage = (website_count / len(businesses)) * 100 if businesses else 0
                    
                    print(f"\n  📊 Coverage Stats:")
                    print(f"     - Websites (non-Yelp): {website_count}/{len(businesses)} ({website_coverage:.0f}%)")
                    print(f"     - Emails extracted: {email_count}/{len(businesses)} ({coverage:.0f}%)")
                    
                    if coverage > 30:
                        print(f"  ✅ Good email extraction rate!")
                    elif coverage > 0:
                        print(f"  ⚠️  Some emails found, but coverage could be better")
                    else:
                        print(f"  ❌ No emails extracted - may need to check website enrichment")
                        
                else:
                    print("  ❌ No businesses returned")
                    
            else:
                print(f"  ❌ API Error: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            
        time.sleep(2)  # Rate limiting
    
    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)
    print("\n💡 Note: Email extraction depends on:")
    print("   1. Businesses having real websites (not Yelp URLs)")
    print("   2. Websites displaying contact emails publicly")
    print("   3. SERP API for website enrichment (if available)")
    print("   4. Successful website crawling within timeout limits")

if __name__ == "__main__":
    test_email_extraction()
