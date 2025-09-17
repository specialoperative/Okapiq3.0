from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import uuid
from enum import Enum

router = APIRouter()

# Pydantic Models
class ContactStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    OPPORTUNITY = "opportunity"
    CUSTOMER = "customer"
    LOST = "lost"

class ActivityType(str, Enum):
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"
    NOTE = "note"
    TASK = "task"
    DEAL_UPDATE = "deal_update"

class SocialProfiles(BaseModel):
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None

class CompanyInfo(BaseModel):
    size: Optional[str] = None
    revenue: Optional[str] = None
    website: Optional[str] = None
    employees: Optional[int] = None

class Activity(BaseModel):
    id: str
    type: ActivityType
    title: str
    description: str
    date: str
    completed: bool
    contact_id: str
    user_id: Optional[str] = None

class Contact(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = None
    score: Optional[int] = 50
    status: ContactStatus = ContactStatus.NEW
    tags: List[str] = []
    last_contact: Optional[str] = None
    next_follow_up: Optional[str] = None
    notes: Optional[str] = None
    social_profiles: Optional[SocialProfiles] = None
    company_info: Optional[CompanyInfo] = None
    deal_value: Optional[float] = None
    probability: Optional[int] = None
    activities: List[Activity] = []
    custom_fields: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ContactFilter(BaseModel):
    status: Optional[ContactStatus] = None
    industry: Optional[str] = None
    source: Optional[str] = None
    score_min: Optional[int] = None
    score_max: Optional[int] = None
    tags: Optional[List[str]] = None
    search_query: Optional[str] = None

class BulkAction(BaseModel):
    action: str  # "delete", "tag", "export", "campaign", "update_status"
    contact_ids: List[str]
    parameters: Optional[Dict[str, Any]] = None

class Campaign(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    status: str = "draft"
    contact_ids: List[str] = []
    template_id: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    scheduled_date: Optional[str] = None
    metrics: Optional[Dict[str, int]] = None
    created_at: Optional[str] = None

class EmailTemplate(BaseModel):
    id: Optional[str] = None
    name: str
    subject: str
    content: str
    type: str  # "welcome", "follow_up", "proposal", "custom"
    variables: List[str] = []
    created_at: Optional[str] = None

class SavedSearch(BaseModel):
    id: Optional[str] = None
    name: str
    filters: Dict[str, Any]
    user_id: Optional[str] = None
    created_at: Optional[str] = None

class DataEnrichment(BaseModel):
    contact_id: str
    enriched_data: Dict[str, Any]
    source: str  # "clearbit", "hunter", "linkedin", "apollo"
    confidence_score: float

# In-memory storage (replace with database in production)
contacts_db: Dict[str, Contact] = {}
campaigns_db: Dict[str, Campaign] = {}
templates_db: Dict[str, EmailTemplate] = {}
saved_searches_db: Dict[str, SavedSearch] = {}
activities_db: Dict[str, Activity] = {}

# Contact Management Endpoints
@router.post("/contacts", response_model=Contact)
async def create_contact(contact: Contact):
    """Create a new contact"""
    contact.id = str(uuid.uuid4())
    contact.created_at = datetime.now().isoformat()
    contact.updated_at = contact.created_at
    
    contacts_db[contact.id] = contact
    return contact

@router.get("/contacts", response_model=List[Contact])
async def get_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    status: Optional[ContactStatus] = None,
    industry: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None
):
    """Get contacts with filtering and pagination"""
    contacts = list(contacts_db.values())
    
    # Apply filters
    if status:
        contacts = [c for c in contacts if c.status == status]
    if industry:
        contacts = [c for c in contacts if c.industry == industry]
    if source:
        contacts = [c for c in contacts if c.source == source]
    if search:
        search_lower = search.lower()
        contacts = [c for c in contacts if 
                   search_lower in c.name.lower() or 
                   search_lower in (c.email or "").lower() or
                   search_lower in (c.company or "").lower()]
    
    # Sort by updated_at desc
    contacts.sort(key=lambda x: x.updated_at or "", reverse=True)
    
    return contacts[skip:skip + limit]

@router.get("/contacts/{contact_id}", response_model=Contact)
async def get_contact(contact_id: str):
    """Get a specific contact by ID"""
    if contact_id not in contacts_db:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contacts_db[contact_id]

@router.put("/contacts/{contact_id}", response_model=Contact)
async def update_contact(contact_id: str, contact_update: Contact):
    """Update an existing contact"""
    if contact_id not in contacts_db:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact_update.id = contact_id
    contact_update.updated_at = datetime.now().isoformat()
    
    contacts_db[contact_id] = contact_update
    return contact_update

@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str):
    """Delete a contact"""
    if contact_id not in contacts_db:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    del contacts_db[contact_id]
    return {"message": "Contact deleted successfully"}

# Bulk Operations
@router.post("/contacts/bulk-action")
async def bulk_action(action: BulkAction):
    """Perform bulk actions on multiple contacts"""
    affected_contacts = []
    
    for contact_id in action.contact_ids:
        if contact_id in contacts_db:
            contact = contacts_db[contact_id]
            
            if action.action == "delete":
                del contacts_db[contact_id]
            elif action.action == "tag" and action.parameters:
                new_tags = action.parameters.get("tags", [])
                contact.tags.extend(new_tags)
                contact.tags = list(set(contact.tags))  # Remove duplicates
                contact.updated_at = datetime.now().isoformat()
            elif action.action == "update_status" and action.parameters:
                contact.status = ContactStatus(action.parameters.get("status"))
                contact.updated_at = datetime.now().isoformat()
            
            affected_contacts.append(contact_id)
    
    return {
        "message": f"Bulk action '{action.action}' completed",
        "affected_contacts": len(affected_contacts),
        "contact_ids": affected_contacts
    }

# Activity Management
@router.post("/contacts/{contact_id}/activities", response_model=Activity)
async def create_activity(contact_id: str, activity: Activity):
    """Create a new activity for a contact"""
    if contact_id not in contacts_db:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    activity.id = str(uuid.uuid4())
    activity.contact_id = contact_id
    activity.date = datetime.now().isoformat()
    
    activities_db[activity.id] = activity
    
    # Add to contact's activities
    contact = contacts_db[contact_id]
    contact.activities.append(activity)
    contact.last_contact = activity.date
    contact.updated_at = datetime.now().isoformat()
    
    return activity

@router.get("/contacts/{contact_id}/activities", response_model=List[Activity])
async def get_contact_activities(contact_id: str):
    """Get all activities for a contact"""
    if contact_id not in contacts_db:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return contacts_db[contact_id].activities

# Campaign Management
@router.post("/campaigns", response_model=Campaign)
async def create_campaign(campaign: Campaign):
    """Create a new email campaign"""
    campaign.id = str(uuid.uuid4())
    campaign.created_at = datetime.now().isoformat()
    campaign.metrics = {"sent": 0, "opened": 0, "clicked": 0, "replied": 0}
    
    campaigns_db[campaign.id] = campaign
    return campaign

@router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns():
    """Get all campaigns"""
    return list(campaigns_db.values())

@router.post("/campaigns/{campaign_id}/send")
async def send_campaign(campaign_id: str):
    """Send a campaign to all contacts"""
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign = campaigns_db[campaign_id]
    campaign.status = "active"
    
    # Simulate sending emails
    sent_count = len(campaign.contact_ids)
    campaign.metrics["sent"] = sent_count
    
    return {
        "message": f"Campaign sent to {sent_count} contacts",
        "campaign_id": campaign_id,
        "sent_count": sent_count
    }

# Email Templates
@router.post("/templates", response_model=EmailTemplate)
async def create_template(template: EmailTemplate):
    """Create a new email template"""
    template.id = str(uuid.uuid4())
    template.created_at = datetime.now().isoformat()
    
    templates_db[template.id] = template
    return template

@router.get("/templates", response_model=List[EmailTemplate])
async def get_templates():
    """Get all email templates"""
    return list(templates_db.values())

# Saved Searches
@router.post("/saved-searches", response_model=SavedSearch)
async def create_saved_search(search: SavedSearch):
    """Save a search query"""
    search.id = str(uuid.uuid4())
    search.created_at = datetime.now().isoformat()
    
    saved_searches_db[search.id] = search
    return search

@router.get("/saved-searches", response_model=List[SavedSearch])
async def get_saved_searches():
    """Get all saved searches"""
    return list(saved_searches_db.values())

# Data Enrichment
@router.post("/contacts/{contact_id}/enrich")
async def enrich_contact_data(contact_id: str):
    """Enrich contact data using external APIs"""
    if contact_id not in contacts_db:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact = contacts_db[contact_id]
    
    # Simulate data enrichment
    enriched_data = {
        "company_size": "50-100 employees",
        "annual_revenue": "$5M-10M",
        "technologies": ["Salesforce", "HubSpot", "Slack"],
        "social_media": {
            "linkedin_followers": 1250,
            "twitter_followers": 890
        },
        "funding_info": {
            "total_funding": "$2.5M",
            "last_round": "Series A"
        }
    }
    
    # Update contact with enriched data
    if not contact.company_info:
        contact.company_info = CompanyInfo()
    
    contact.company_info.size = enriched_data["company_size"]
    contact.company_info.revenue = enriched_data["annual_revenue"]
    
    if not contact.custom_fields:
        contact.custom_fields = {}
    
    contact.custom_fields.update({
        "technologies": enriched_data["technologies"],
        "social_media": enriched_data["social_media"],
        "funding_info": enriched_data["funding_info"]
    })
    
    contact.updated_at = datetime.now().isoformat()
    
    return {
        "message": "Contact data enriched successfully",
        "enriched_fields": list(enriched_data.keys()),
        "contact": contact
    }

# Analytics and Reporting
@router.get("/analytics/overview")
async def get_analytics_overview():
    """Get CRM analytics overview"""
    total_contacts = len(contacts_db)
    
    # Calculate status distribution
    status_counts = {}
    for contact in contacts_db.values():
        status = contact.status.value
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Calculate conversion rates
    conversion_rates = {}
    if total_contacts > 0:
        for status in ContactStatus:
            count = status_counts.get(status.value, 0)
            conversion_rates[status.value] = round((count / total_contacts) * 100, 2)
    
    # Calculate average deal value
    deal_values = [c.deal_value for c in contacts_db.values() if c.deal_value]
    avg_deal_value = sum(deal_values) / len(deal_values) if deal_values else 0
    
    # Calculate pipeline value
    pipeline_value = sum(
        c.deal_value * (c.probability / 100) 
        for c in contacts_db.values() 
        if c.deal_value and c.probability and c.status in [ContactStatus.QUALIFIED, ContactStatus.OPPORTUNITY]
    )
    
    return {
        "total_contacts": total_contacts,
        "status_distribution": status_counts,
        "conversion_rates": conversion_rates,
        "average_deal_value": round(avg_deal_value, 2),
        "pipeline_value": round(pipeline_value, 2),
        "total_campaigns": len(campaigns_db),
        "total_activities": len(activities_db)
    }

@router.get("/analytics/performance")
async def get_performance_metrics():
    """Get detailed performance metrics"""
    # Calculate metrics by source
    source_performance = {}
    for contact in contacts_db.values():
        source = contact.source or "Unknown"
        if source not in source_performance:
            source_performance[source] = {
                "total_contacts": 0,
                "qualified_contacts": 0,
                "customers": 0,
                "total_deal_value": 0
            }
        
        source_performance[source]["total_contacts"] += 1
        
        if contact.status in [ContactStatus.QUALIFIED, ContactStatus.OPPORTUNITY, ContactStatus.CUSTOMER]:
            source_performance[source]["qualified_contacts"] += 1
        
        if contact.status == ContactStatus.CUSTOMER:
            source_performance[source]["customers"] += 1
        
        if contact.deal_value:
            source_performance[source]["total_deal_value"] += contact.deal_value
    
    # Calculate conversion rates by source
    for source_data in source_performance.values():
        total = source_data["total_contacts"]
        if total > 0:
            source_data["qualification_rate"] = round((source_data["qualified_contacts"] / total) * 100, 2)
            source_data["conversion_rate"] = round((source_data["customers"] / total) * 100, 2)
        else:
            source_data["qualification_rate"] = 0
            source_data["conversion_rate"] = 0
    
    return {
        "source_performance": source_performance,
        "top_performing_sources": sorted(
            source_performance.items(),
            key=lambda x: x[1]["conversion_rate"],
            reverse=True
        )[:5]
    }

# Market Scanner Integration
@router.post("/import/market-scanner")
async def import_market_scanner_results(results: Dict[str, Any]):
    """Import contacts from Market Scanner results"""
    imported_contacts = []
    
    businesses = results.get("businesses", [])
    
    for business in businesses:
        contact = Contact(
            name=business.get("name", "Unknown Business"),
            email=business.get("email", ""),
            phone=business.get("phone", ""),
            company=business.get("name", "Unknown Business"),
            title="Business Owner",
            industry=business.get("category", "Unknown"),
            location=f"{business.get('address', {}).get('city', '')}, {business.get('address', {}).get('state', '')}".strip(),
            source="Market Scanner",
            score=int(business.get("succession_risk", business.get("digital_opportunity", 50))),
            status=ContactStatus.NEW,
            tags=["Market Scanner Import", business.get("category", "Business")],
            notes=f"Imported from Market Scanner. Revenue: {business.get('estimated_revenue', 'Unknown')}. Rating: {business.get('rating', 'N/A')}",
            company_info=CompanyInfo(
                size=f"{business.get('employee_count', 'Unknown')} employees" if business.get('employee_count') else "Unknown",
                revenue=business.get("estimated_revenue", "Unknown"),
                website=business.get("website", ""),
                employees=business.get("employee_count", 0)
            ),
            deal_value=float(business.get("estimated_revenue", "0").replace("$", "").replace(",", "").replace("K", "000").replace("M", "000000")) if business.get("estimated_revenue") else None,
            probability=25,
            custom_fields={
                "rating": business.get("rating"),
                "reviews": business.get("reviews"),
                "succession_risk": business.get("succession_risk"),
                "digital_opportunity": business.get("digital_opportunity"),
                "coordinates": business.get("coordinates")
            }
        )
        
        contact.id = str(uuid.uuid4())
        contact.created_at = datetime.now().isoformat()
        contact.updated_at = contact.created_at
        
        contacts_db[contact.id] = contact
        imported_contacts.append(contact)
    
    return {
        "message": f"Successfully imported {len(imported_contacts)} contacts from Market Scanner",
        "imported_count": len(imported_contacts),
        "contacts": imported_contacts
    }

# Health Check
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "total_contacts": len(contacts_db),
        "total_campaigns": len(campaigns_db),
        "total_templates": len(templates_db)
    }
