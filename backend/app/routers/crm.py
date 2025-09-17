from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import logging
from datetime import datetime

router = APIRouter()

# Pydantic models
class CampaignExecutionRequest(BaseModel):
    client_name: str
    deal_name: str
    campaign_type: str  # "outreach", "acquisition", "franchise_conversion", "market_analysis"
    target_details: Dict[str, Any]
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    special_instructions: Optional[str] = None
    contact_email: str
    contact_phone: Optional[str] = None

class CampaignExecutionResponse(BaseModel):
    success: bool
    campaign_id: str
    message: str
    estimated_timeline: str
    next_steps: List[str]

# Configure logger
logger = logging.getLogger(__name__)

@router.post("/execute-campaign", response_model=CampaignExecutionResponse)
async def execute_campaign(request: CampaignExecutionRequest):
    """
    Execute end-to-end campaign for client by notifying Okapiq team
    """
    try:
        # Generate unique campaign ID
        campaign_id = f"CAM_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{request.client_name[:3].upper()}"
        
        # Prepare campaign details for Okapiq team
        campaign_details = {
            "campaign_id": campaign_id,
            "timestamp": datetime.now().isoformat(),
            "client_info": {
                "name": request.client_name,
                "email": request.contact_email,
                "phone": request.contact_phone
            },
            "campaign_specs": {
                "deal_name": request.deal_name,
                "type": request.campaign_type,
                "target_details": request.target_details,
                "budget_range": request.budget_range,
                "timeline": request.timeline,
                "special_instructions": request.special_instructions
            }
        }
        
        # Send notification to Okapiq team
        notification_sent = await send_campaign_notification(campaign_details)
        
        if not notification_sent:
            raise HTTPException(status_code=500, detail="Failed to send campaign notification")
        
        # Determine estimated timeline based on campaign type
        timeline_map = {
            "outreach": "3-5 business days",
            "acquisition": "1-2 weeks", 
            "franchise_conversion": "2-3 weeks",
            "market_analysis": "5-7 business days"
        }
        
        estimated_timeline = timeline_map.get(request.campaign_type, "1-2 weeks")
        
        # Define next steps based on campaign type
        next_steps = [
            f"Campaign {campaign_id} initiated and logged",
            "Okapiq team notified and will begin execution within 24 hours",
            f"Initial progress update expected within {estimated_timeline}",
            "Client will receive direct communication from execution team",
            "Campaign status tracking available in CRM dashboard"
        ]
        
        logger.info(f"Campaign execution requested: {campaign_id} for {request.client_name}")
        
        return CampaignExecutionResponse(
            success=True,
            campaign_id=campaign_id,
            message=f"Campaign '{request.deal_name}' successfully queued for execution",
            estimated_timeline=estimated_timeline,
            next_steps=next_steps
        )
        
    except Exception as e:
        logger.error(f"Campaign execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Campaign execution failed: {str(e)}")

async def send_campaign_notification(campaign_details: Dict[str, Any]) -> bool:
    """
    Send campaign execution request to Okapiq team
    """
    try:
        # Email configuration (using a simple notification approach)
        # In production, you'd want to use proper email service like SendGrid, SES, etc.
        
        osiris_email = "osiris@okapiq.com"
        
        # Create email content
        subject = f"🚀 Campaign Execution Request - {campaign_details['campaign_id']}"
        
        html_body = f"""
        <html>
        <head></head>
        <body>
            <h2>🎯 New Campaign Execution Request</h2>
            
            <h3>📋 Campaign Details</h3>
            <ul>
                <li><strong>Campaign ID:</strong> {campaign_details['campaign_id']}</li>
                <li><strong>Timestamp:</strong> {campaign_details['timestamp']}</li>
                <li><strong>Deal Name:</strong> {campaign_details['campaign_specs']['deal_name']}</li>
                <li><strong>Campaign Type:</strong> {campaign_details['campaign_specs']['type'].title()}</li>
            </ul>
            
            <h3>👤 Client Information</h3>
            <ul>
                <li><strong>Name:</strong> {campaign_details['client_info']['name']}</li>
                <li><strong>Email:</strong> {campaign_details['client_info']['email']}</li>
                <li><strong>Phone:</strong> {campaign_details['client_info'].get('phone', 'Not provided')}</li>
            </ul>
            
            <h3>🎯 Target Details</h3>
            <ul>
                <li><strong>Budget Range:</strong> {campaign_details['campaign_specs'].get('budget_range', 'Not specified')}</li>
                <li><strong>Timeline:</strong> {campaign_details['campaign_specs'].get('timeline', 'Flexible')}</li>
                <li><strong>Target Info:</strong> {str(campaign_details['campaign_specs']['target_details'])}</li>
            </ul>
            
            <h3>📝 Special Instructions</h3>
            <p>{campaign_details['campaign_specs'].get('special_instructions', 'None provided')}</p>
            
            <hr>
            <p><em>This request was generated automatically from the Okapiq CRM Acquisition Assistant.</em></p>
            <p><strong>Action Required:</strong> Please initiate campaign execution and contact the client directly.</p>
        </body>
        </html>
        """
        
        # For now, we'll log the notification (in production, send actual email)
        logger.info(f"Campaign notification prepared for {osiris_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Campaign Details: {campaign_details}")
        
        # In production environment, uncomment below to send actual email:
        # await send_email(osiris_email, subject, html_body)
        
        # For development, we'll simulate success
        return True
        
    except Exception as e:
        logger.error(f"Failed to send campaign notification: {str(e)}")
        return False

@router.get("/campaigns/status/{campaign_id}")
async def get_campaign_status(campaign_id: str):
    """
    Get status of a specific campaign
    """
    # Mock campaign status - in production, this would query a database
    mock_statuses = ["initiated", "in_progress", "under_review", "executed", "completed"]
    
    return {
        "campaign_id": campaign_id,
        "status": "initiated",  # Default for new campaigns
        "last_updated": datetime.now().isoformat(),
        "progress_percentage": 15,
        "next_milestone": "Initial target research and contact strategy development",
        "estimated_completion": "5-7 business days"
    }

@router.get("/campaigns/types")
async def get_campaign_types():
    """
    Get available campaign types and their descriptions
    """
    return {
        "campaign_types": [
            {
                "id": "outreach",
                "name": "Direct Outreach Campaign", 
                "description": "Targeted outreach to specific businesses for acquisition opportunities",
                "estimated_duration": "3-5 business days",
                "typical_budget": "$500-2,000"
            },
            {
                "id": "acquisition",
                "name": "Full Acquisition Campaign",
                "description": "End-to-end acquisition process including due diligence and negotiation support", 
                "estimated_duration": "1-2 weeks",
                "typical_budget": "$2,000-10,000"
            },
            {
                "id": "franchise_conversion",
                "name": "Franchise Conversion Campaign",
                "description": "Convert independent businesses to franchise opportunities",
                "estimated_duration": "2-3 weeks", 
                "typical_budget": "$1,500-5,000"
            },
            {
                "id": "market_analysis",
                "name": "Market Intelligence Campaign",
                "description": "Deep market analysis and competitive intelligence gathering",
                "estimated_duration": "5-7 business days",
                "typical_budget": "$800-3,000"
            }
        ]
    }

@router.get("/health")
async def crm_health():
    """Health check endpoint for CRM service"""
    return {"status": "healthy", "service": "crm"}
