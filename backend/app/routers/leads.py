from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import json
import io
from datetime import datetime
import sys
import os

# Add the algorithms directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'algorithms'))

from market_analyzer import MarketAnalyzer, BusinessProfile
from app.core.database import get_db
from sqlalchemy.orm import Session
import openai

router = APIRouter()
analyzer = MarketAnalyzer()

# Pydantic models
class LeadExportRequest(BaseModel):
    lead_ids: List[int]
    format: str = "csv"  # csv, json, xlsx
    include_contact_info: bool = True
    include_scores: bool = True

class LeadFilterRequest(BaseModel):
    min_revenue: Optional[float] = None
    max_revenue: Optional[float] = None
    min_succession_risk: Optional[float] = None
    max_succession_risk: Optional[float] = None
    min_lead_score: Optional[float] = None
    industry: Optional[str] = None
    location: Optional[str] = None

class OutreachRequest(BaseModel):
    business_name: str
    owner_name: Optional[str] = None
    industry: str
    location: str
    approach_type: str = "acquisition"  # acquisition, partnership, investment
    tone: str = "professional"  # professional, friendly, direct

@router.post("/export/crm")
async def export_leads_to_crm(request: LeadExportRequest, db: Session = Depends(get_db)):
    """
    Export leads to CRM-ready format (CSV, JSON, or Excel)
    """
    try:
        # Mock lead data (in production, fetch from database)
        leads_data = _get_mock_leads_data()
        
        # Filter by requested lead IDs if specified
        if request.lead_ids:
            leads_data = [lead for lead in leads_data if lead.get('id') in request.lead_ids]
        
        # Prepare export data
        export_data = []
        for lead in leads_data:
            export_row = {
                'Business Name': lead['name'],
                'Industry': lead['industry'],
                'Location': lead['location'],
                'Estimated Revenue': f"${lead['estimated_revenue']:,.0f}",
                'Employee Count': lead['employee_count'],
                'Years in Business': lead['years_in_business'],
                'Lead Score': f"{lead['lead_score']:.1f}/100",
                'Succession Risk': f"{lead['succession_risk_score']:.1f}/100"
            }
            
            if request.include_contact_info:
                export_row.update({
                    'Phone': lead.get('phone', ''),
                    'Website': lead.get('website', ''),
                    'Address': lead.get('address', '')
                })
            
            if request.include_scores:
                export_row.update({
                    'Market Share %': f"{lead['market_share_percent']:.1f}%",
                    'Owner Age Estimate': lead['owner_age_estimate'],
                    'Yelp Rating': lead['yelp_rating'],
                    'Yelp Reviews': lead['yelp_review_count']
                })
            
            export_data.append(export_row)
        
        # Create DataFrame and export
        df = pd.DataFrame(export_data)
        
        if request.format.lower() == "csv":
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            return JSONResponse(
                content={"csv_data": output.getvalue()},
                headers={"Content-Disposition": f"attachment; filename=okapiq_leads_{datetime.now().strftime('%Y%m%d')}.csv"}
            )
        
        elif request.format.lower() == "json":
            return JSONResponse(content={"leads": export_data})
        
        elif request.format.lower() == "xlsx":
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Leads', index=False)
            output.seek(0)
            
            return FileResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename=f"okapiq_leads_{datetime.now().strftime('%Y%m%d')}.xlsx"
            )
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/filter")
async def filter_leads(request: LeadFilterRequest, db: Session = Depends(get_db)):
    """
    Filter leads based on criteria
    """
    try:
        # Mock lead data
        leads_data = _get_mock_leads_data()
        
        # Apply filters
        filtered_leads = leads_data
        
        if request.min_revenue:
            filtered_leads = [lead for lead in filtered_leads if lead['estimated_revenue'] >= request.min_revenue]
        
        if request.max_revenue:
            filtered_leads = [lead for lead in filtered_leads if lead['estimated_revenue'] <= request.max_revenue]
        
        if request.min_succession_risk:
            filtered_leads = [lead for lead in filtered_leads if lead['succession_risk_score'] >= request.min_succession_risk]
        
        if request.max_succession_risk:
            filtered_leads = [lead for lead in filtered_leads if lead['succession_risk_score'] <= request.max_succession_risk]
        
        if request.min_lead_score:
            filtered_leads = [lead for lead in filtered_leads if lead['lead_score'] >= request.min_lead_score]
        
        if request.industry:
            filtered_leads = [lead for lead in filtered_leads if lead['industry'].lower() == request.industry.lower()]
        
        if request.location:
            filtered_leads = [lead for lead in filtered_leads if request.location.lower() in lead['location'].lower()]
        
        return {
            "total_leads": len(filtered_leads),
            "leads": filtered_leads,
            "filters_applied": request.dict(exclude_none=True)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lead filtering failed: {str(e)}")

@router.post("/outreach/generate")
async def generate_outreach_content(request: OutreachRequest):
    """
    Generate personalized outreach content (cold email, call script, etc.)
    """
    try:
        # Generate cold email using OpenAI (mock implementation)
        cold_email = _generate_cold_email(request)
        
        # Generate call script
        call_script = _generate_call_script(request)
        
        # Generate follow-up sequence
        follow_up_sequence = _generate_follow_up_sequence(request)
        
        return {
            "business_name": request.business_name,
            "approach_type": request.approach_type,
            "tone": request.tone,
            "cold_email": {
                "subject": cold_email["subject"],
                "body": cold_email["body"],
                "word_count": len(cold_email["body"].split())
            },
            "call_script": {
                "opening": call_script["opening"],
                "key_points": call_script["key_points"],
                "closing": call_script["closing"]
            },
            "follow_up_sequence": follow_up_sequence,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outreach generation failed: {str(e)}")

@router.get("/analytics/summary")
async def get_lead_analytics(db: Session = Depends(get_db)):
    """
    Get lead analytics and summary statistics
    """
    try:
        # Mock lead data
        leads_data = _get_mock_leads_data()
        
        # Calculate analytics
        total_leads = len(leads_data)
        avg_revenue = sum(lead['estimated_revenue'] for lead in leads_data) / total_leads
        avg_succession_risk = sum(lead['succession_risk_score'] for lead in leads_data) / total_leads
        avg_lead_score = sum(lead['lead_score'] for lead in leads_data) / total_leads
        
        # Industry breakdown
        industry_counts = {}
        for lead in leads_data:
            industry = lead['industry']
            industry_counts[industry] = industry_counts.get(industry, 0) + 1
        
        # Risk level breakdown
        risk_levels = {"Low": 0, "Medium": 0, "High": 0, "Very High": 0}
        for lead in leads_data:
            risk_score = lead['succession_risk_score']
            if risk_score < 25:
                risk_levels["Low"] += 1
            elif risk_score < 50:
                risk_levels["Medium"] += 1
            elif risk_score < 75:
                risk_levels["High"] += 1
            else:
                risk_levels["Very High"] += 1
        
        return {
            "total_leads": total_leads,
            "average_revenue": avg_revenue,
            "average_succession_risk": avg_succession_risk,
            "average_lead_score": avg_lead_score,
            "industry_breakdown": industry_counts,
            "risk_level_breakdown": risk_levels,
            "top_leads": sorted(leads_data, key=lambda x: x['lead_score'], reverse=True)[:5]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

@router.post("/upload")
async def upload_custom_leads(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload custom lead list (CSV or Excel)
    """
    try:
        if not file.filename.endswith(('.csv', '.xlsx')):
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
        
        # Read file content
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Validate required columns
        required_columns = ['Business Name', 'Industry', 'Location']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process and enrich leads
        processed_leads = []
        for _, row in df.iterrows():
            lead = {
                'name': row['Business Name'],
                'industry': row['Industry'],
                'location': row['Location'],
                'estimated_revenue': row.get('Estimated Revenue', 1000000),
                'employee_count': row.get('Employee Count', 10),
                'years_in_business': row.get('Years in Business', 15),
                'phone': row.get('Phone', ''),
                'website': row.get('Website', ''),
                'address': row.get('Address', '')
            }
            
            # Calculate scores
            lead['succession_risk_score'] = analyzer.calculate_succession_risk(
                row.get('Owner Age', 60),
                lead['years_in_business'],
                row.get('Yelp Rating', 4.0),
                row.get('Yelp Reviews', 50)
            )
            
            lead['lead_score'] = 75.0  # Mock calculation
            lead['owner_age_estimate'] = row.get('Owner Age', 60)
            lead['market_share_percent'] = 5.0  # Mock calculation
            lead['yelp_rating'] = row.get('Yelp Rating', 4.0)
            lead['yelp_review_count'] = row.get('Yelp Reviews', 50)
            
            processed_leads.append(lead)
        
        return {
            "uploaded_leads": len(processed_leads),
            "processed_leads": processed_leads,
            "file_name": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# Helper functions
def _get_mock_leads_data():
    """Generate mock lead data for demonstration"""
    return [
        {
            'id': 1,
            'name': 'Golden Gate HVAC',
            'industry': 'HVAC',
            'location': 'San Francisco, CA',
            'estimated_revenue': 1200000,
            'employee_count': 15,
            'years_in_business': 25,
            'succession_risk_score': 75.0,
            'lead_score': 92.0,
            'owner_age_estimate': 62,
            'market_share_percent': 8.5,
            'yelp_rating': 4.2,
            'yelp_review_count': 89,
            'phone': '(415) 555-0123',
            'website': 'www.goldengatehvac.com',
            'address': '123 Market St, San Francisco, CA 94102'
        },
        {
            'id': 2,
            'name': 'Bay Area Plumbing Co',
            'industry': 'Plumbing',
            'location': 'San Francisco, CA',
            'estimated_revenue': 800000,
            'employee_count': 12,
            'years_in_business': 18,
            'succession_risk_score': 65.0,
            'lead_score': 88.0,
            'owner_age_estimate': 58,
            'market_share_percent': 6.2,
            'yelp_rating': 3.8,
            'yelp_review_count': 67,
            'phone': '(415) 555-0456',
            'website': 'www.bayareaplumbing.com',
            'address': '456 Mission St, San Francisco, CA 94105'
        },
        {
            'id': 3,
            'name': 'SF Electrical Services',
            'industry': 'Electrical',
            'location': 'San Francisco, CA',
            'estimated_revenue': 1500000,
            'employee_count': 20,
            'years_in_business': 30,
            'succession_risk_score': 80.0,
            'lead_score': 85.0,
            'owner_age_estimate': 65,
            'market_share_percent': 12.1,
            'yelp_rating': 4.5,
            'yelp_review_count': 124,
            'phone': '(415) 555-0789',
            'website': 'www.sfelectrical.com',
            'address': '789 Castro St, San Francisco, CA 94114'
        }
    ]

def _generate_cold_email(request: OutreachRequest) -> Dict[str, str]:
    """Generate personalized cold email"""
    templates = {
        "acquisition": {
            "subject": f"Partnership Opportunity - {request.business_name}",
            "body": f"""Dear [Owner Name],

I hope this message finds you well. I came across {request.business_name} and was impressed by your company's reputation in the {request.industry} industry.

I'm reaching out because we're actively looking to partner with established businesses like yours that have built strong customer relationships and operational excellence. We believe there could be a great opportunity for collaboration that would benefit both our companies.

Would you be open to a brief 15-minute call to discuss potential partnership opportunities? I'd love to learn more about your business and share how we might work together.

Best regards,
[Your Name]
[Your Company]"""
        }
    }
    
    return templates.get(request.approach_type, templates["acquisition"])

def _generate_call_script(request: OutreachRequest) -> Dict[str, Any]:
    """Generate call script for outreach"""
    return {
        "opening": f"Hi [Name], this is [Your Name] calling about {request.business_name}. I've been researching the {request.industry} market in {request.location} and was impressed by your company's track record.",
        "key_points": [
            "Mention their strong reputation and longevity in the market",
            "Discuss market consolidation opportunities",
            "Ask about their future plans and succession considerations",
            "Propose a follow-up meeting to explore partnership"
        ],
        "closing": "Would you be interested in meeting next week to discuss this further?"
    }

def _generate_follow_up_sequence(request: OutreachRequest) -> List[Dict[str, str]]:
    """Generate follow-up email sequence"""
    return [
        {
            "day": 3,
            "subject": f"Following up - {request.business_name}",
            "body": "Just wanted to follow up on my previous message. I'm still very interested in discussing potential opportunities with you."
        },
        {
            "day": 7,
            "subject": f"Quick question about {request.business_name}",
            "body": "I had a quick question about your business model and wanted to see if you might be open to a brief conversation."
        },
        {
            "day": 14,
            "subject": f"Final follow-up - {request.business_name}",
            "body": "I wanted to make one final attempt to connect. If you're not interested, I completely understand and won't follow up again."
        }
    ] 