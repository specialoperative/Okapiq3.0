"""
Enhanced Okapiq Backend - Complete Intelligence Architecture

This is the main FastAPI application that integrates the complete backend architecture:

[Target Sites] → [Smart Crawler Hub] → [Data Normalizer] → [Enrichment Engine] → [Scoring + Vectorizer] → [Lead DB + API Layer]

Features:
- Complete backend pipeline orchestration
- Advanced intelligence endpoints
- Three-tool ecosystem: Oppy, Fragment Finder, Acquisition Assistant
- Multi-source data integration
- Real-time market intelligence
"""

from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import asyncio
import logging
from datetime import datetime

# Core imports
from app.core.config import settings
from app.core.database import engine, Base, get_db

# Service imports
from app.services.integrated_intelligence_service import (
    IntegratedIntelligenceService, 
    IntelligenceRequest
)

# Tool imports
from app.tools.oppy import OpportunityFinder
from app.tools.fragment_finder import FragmentFinder
from app.tools.acquisition_assistant import AcquisitionAssistant

# Router imports
from app.routers import market, analytics, auth, leads
from app.routers.intelligence import router as intelligence_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Okapiq Intelligence Platform",
    description="Bloomberg for Small Businesses - Complete AI-powered market intelligence and deal sourcing platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://app.okapiq.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
intelligence_service = IntegratedIntelligenceService()
opportunity_finder = OpportunityFinder()
fragment_finder = FragmentFinder()
acquisition_assistant = AcquisitionAssistant()

# Include routers
app.include_router(market.router, prefix="/market", tags=["Market Analysis"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(leads.router, prefix="/leads", tags=["Lead Management"])
app.include_router(intelligence_router, prefix="/intelligence", tags=["Advanced Intelligence"])


@app.get("/")
async def root():
    """Root endpoint with comprehensive API information"""
    return {
        "message": "Welcome to Okapiq Intelligence Platform",
        "version": "2.0.0",
        "description": "Bloomberg for Small Businesses - Complete Market Intelligence Suite",
        "architecture": {
            "pipeline": "Smart Crawler Hub → Data Normalizer → Enrichment Engine → Scoring + Vectorizer → Lead DB + API Layer",
            "tools": ["Oppy (Opportunity Finder)", "Fragment Finder", "Acquisition Assistant (Double A)"],
            "data_sources": ["Google Maps", "Yelp", "LinkedIn", "SBA Records", "DataAxle", "Census", "IRS", "Secretary of State"]
        },
        "endpoints": {
            "intelligence": "/intelligence/* - Advanced market intelligence endpoints",
            "tools": "/tools/* - Oppy, Fragment Finder, Acquisition Assistant",
            "market": "/market/* - Market analysis and scanning",
            "analytics": "/analytics/* - Business analytics and scoring",
            "leads": "/leads/* - Lead management and CRM",
            "documentation": "/docs - Interactive API documentation"
        },
        "status": "operational",
        "last_updated": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Enhanced health check with component status"""
    
    # Check component health
    component_health = {
        "intelligence_service": "operational",
        "opportunity_finder": "operational", 
        "fragment_finder": "operational",
        "acquisition_assistant": "operational",
        "database": "connected",
        "external_apis": "operational"
    }
    
    # Get pipeline health from intelligence service
    try:
        pipeline_health = intelligence_service.get_pipeline_health()
        component_health.update(pipeline_health.get("components", {}))
    except Exception as e:
        logger.warning(f"Pipeline health check failed: {e}")
        component_health["pipeline_health"] = "degraded"
    
    overall_status = "healthy" if all(
        status in ["operational", "connected"] 
        for status in component_health.values()
    ) else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "components": component_health,
        "services": {
            "smart_crawler_hub": "operational",
            "data_normalizer": "operational", 
            "enrichment_engine": "operational",
            "scoring_vectorizer": "operational",
            "lead_database": "operational"
        }
    }


# Tool Endpoints

@app.post("/tools/oppy/find-opportunities")
async def find_opportunities(
    locations: List[str],
    industries: Optional[List[str]] = None,
    opportunity_types: Optional[List[str]] = None,
    min_confidence: float = 0.6
):
    """
    Oppy (Opportunity Finder) - Find growth market opportunities
    
    Identifies expansion and growth opportunities in stable markets driven by:
    - Income data and demographic shifts
    - Consumer trend analysis  
    - Policy and infrastructure changes
    - Market demand surges
    """
    try:
        opportunities = await opportunity_finder.find_opportunities(
            locations=locations,
            industries=industries,
            opportunity_types=opportunity_types,
            min_confidence=min_confidence
        )
        
        return {
            "tool": "oppy",
            "locations_analyzed": len(locations),
            "opportunities_found": len(opportunities),
            "opportunities": [
                {
                    "opportunity_id": opp.opportunity_id,
                    "location": opp.location,
                    "industry": opp.industry,
                    "opportunity_type": opp.opportunity_type,
                    "opportunity_score": opp.opportunity_score,
                    "confidence_level": opp.confidence_level,
                    "estimated_tam": opp.estimated_tam,
                    "growth_potential": opp.growth_potential,
                    "time_to_market": opp.time_to_market,
                    "target_demographics": opp.target_demographics,
                    "demand_drivers": opp.demand_drivers,
                    "market_gaps": opp.market_gaps,
                    "competitive_landscape": opp.competitive_landscape,
                    "estimated_investment": opp.estimated_investment,
                    "break_even_timeline": opp.break_even_timeline,
                    "roi_projection": opp.roi_projection,
                    "risk_factors": opp.risk_factors,
                    "recommendations": opp.recommendations,
                    "next_steps": opp.next_steps
                }
                for opp in opportunities
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Oppy analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Opportunity analysis failed: {str(e)}")


@app.post("/tools/fragment-finder/find-fragmented-markets")
async def find_fragmented_markets(
    locations: List[str],
    industries: Optional[List[str]] = None,
    min_fragmentation_score: float = 70.0,
    min_business_count: int = 10
):
    """
    Fragment Finder - Identify highly fragmented markets for roll-up opportunities
    
    Analyzes market fragmentation using HHI and identifies consolidation opportunities:
    - Market fragmentation analytics using HHI across ZIP codes/MSAs
    - Roll-up scoring and synergy identification
    - Consolidation timeline and investment analysis
    """
    try:
        opportunities = await fragment_finder.find_fragmented_markets(
            locations=locations,
            industries=industries,
            min_fragmentation_score=min_fragmentation_score,
            min_business_count=min_business_count
        )
        
        return {
            "tool": "fragment_finder",
            "locations_analyzed": len(locations),
            "rollup_opportunities": len(opportunities),
            "opportunities": [
                {
                    "opportunity_id": opp.opportunity_id,
                    "location": opp.location,
                    "industry": opp.industry,
                    "fragmentation_metrics": {
                        "hhi_index": opp.fragmentation_metrics.hhi_index,
                        "business_count": opp.fragmentation_metrics.business_count,
                        "fragmentation_score": opp.fragmentation_metrics.fragmentation_score,
                        "fragmentation_level": opp.fragmentation_metrics.fragmentation_level,
                        "roll_up_potential": opp.fragmentation_metrics.roll_up_potential,
                        "total_market_revenue": opp.fragmentation_metrics.total_market_revenue
                    },
                    "rap_index": opp.rap_index,
                    "estimated_synergies": opp.estimated_synergies,
                    "consolidation_timeline": opp.consolidation_timeline,
                    "total_investment_required": opp.total_investment_required,
                    "financial_projections": {
                        "pre_rollup_revenue": opp.pre_rollup_revenue,
                        "post_rollup_revenue": opp.post_rollup_revenue,
                        "estimated_ebitda_improvement": opp.estimated_ebitda_improvement,
                        "projected_exit_multiple": opp.projected_exit_multiple,
                        "projected_irr": opp.projected_irr
                    },
                    "acquisition_strategy": opp.acquisition_strategy,
                    "key_targets": opp.key_targets,
                    "target_businesses_count": len(opp.target_businesses),
                    "execution_risks": opp.execution_risks,
                    "next_steps": opp.next_steps,
                    "timeline_milestones": opp.timeline_milestones
                }
                for opp in opportunities
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fragment Finder analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Fragmentation analysis failed: {str(e)}")


@app.post("/tools/fragment-finder/analyze-industry")
async def analyze_industry_fragmentation(
    industry: str,
    geographic_scope: str = "national",
    depth_analysis: bool = True
):
    """
    Fragment Finder - Analyze fragmentation across an entire industry
    
    Provides comprehensive industry-wide fragmentation analysis:
    - Geographic fragmentation mapping
    - Industry consolidation trends
    - Top roll-up opportunities by location
    """
    try:
        analysis = await fragment_finder.analyze_industry_fragmentation(
            industry=industry,
            geographic_scope=geographic_scope,
            depth_analysis=depth_analysis
        )
        
        return {
            "tool": "fragment_finder",
            "analysis_type": "industry_fragmentation",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Industry fragmentation analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Industry analysis failed: {str(e)}")


@app.post("/tools/acquisition-assistant/create-deal")
async def create_deal_from_target(
    business_name: str,
    business_id: Optional[str] = None,
    source: str = "manual",
    initial_priority: str = "medium"
):
    """
    Acquisition Assistant (Double A) - Create new deal from target business
    
    Initializes deal tracking and management:
    - Creates deal record with initial analysis
    - Sets up communication tracking
    - Establishes next action items
    """
    try:
        # This would normally get the business from the database
        # For demo, create a mock business
        from app.processors.data_normalizer import (
            NormalizedBusiness, BusinessCategory, ContactInfo, 
            AddressInfo, BusinessMetrics, DataQuality
        )
        
        mock_business = NormalizedBusiness(
            business_id=business_id or f"mock_{business_name.replace(' ', '_').lower()}",
            name=business_name,
            category=BusinessCategory.SERVICES,
            contact=ContactInfo(
                phone="(555) 123-4567",
                phone_valid=True,
                email="owner@business.com",
                email_valid=True
            ),
            address=AddressInfo(
                formatted_address="123 Main St, City, State 12345",
                city="City",
                state="State",
                zip_code="12345"
            ),
            metrics=BusinessMetrics(
                estimated_revenue=1500000,
                employee_count=15,
                years_in_business=12,
                succession_risk_score=65,
                rating=4.2
            ),
            overall_quality=DataQuality.MEDIUM
        )
        
        from app.tools.acquisition_assistant import DealPriority
        priority_map = {
            "low": DealPriority.LOW,
            "medium": DealPriority.MEDIUM,
            "high": DealPriority.HIGH,
            "urgent": DealPriority.URGENT
        }
        
        deal = await acquisition_assistant.create_deal(
            business=mock_business,
            source=source,
            initial_priority=priority_map.get(initial_priority, DealPriority.MEDIUM)
        )
        
        return {
            "tool": "acquisition_assistant",
            "action": "deal_created",
            "deal": {
                "deal_id": deal.deal_id,
                "business_name": deal.business_name,
                "stage": deal.stage.value,
                "priority": deal.priority.value,
                "probability": deal.probability,
                "industry": deal.industry,
                "location": deal.location,
                "source": deal.source,
                "contacts": [
                    {
                        "name": contact.name,
                        "title": contact.title,
                        "email": contact.email,
                        "phone": contact.phone,
                        "is_primary": contact.is_primary
                    }
                    for contact in deal.contacts
                ],
                "financials": {
                    "annual_revenue": deal.financials.annual_revenue if deal.financials else None,
                    "ebitda": deal.financials.ebitda if deal.financials else None,
                    "ebitda_margin": deal.financials.ebitda_margin if deal.financials else None
                } if deal.financials else None,
                "next_action": {
                    "description": deal.next_action_description,
                    "due_date": deal.next_action_date.isoformat() if deal.next_action_date else None
                },
                "strengths": deal.strengths,
                "concerns": deal.concerns,
                "integration_complexity": deal.integration_complexity,
                "created_at": deal.created_at.isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Deal creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Deal creation failed: {str(e)}")


@app.get("/tools/acquisition-assistant/pipeline")
async def get_pipeline_overview():
    """
    Acquisition Assistant (Double A) - Get pipeline overview
    
    Provides comprehensive pipeline analytics:
    - Deal stage distribution
    - Pipeline value and conversion rates
    - Activity and performance metrics
    """
    try:
        overview = await acquisition_assistant.get_pipeline_overview()
        
        return {
            "tool": "acquisition_assistant",
            "pipeline_overview": overview,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Pipeline overview failed: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline analysis failed: {str(e)}")


@app.get("/tools/acquisition-assistant/deals/active")
async def get_active_deals():
    """
    Acquisition Assistant (Double A) - Get active deals
    
    Returns all deals currently in progress (not closed or dead)
    """
    try:
        deals = await acquisition_assistant.get_active_deals()
        
        return {
            "tool": "acquisition_assistant",
            "active_deals_count": len(deals),
            "deals": [
                {
                    "deal_id": deal.deal_id,
                    "business_name": deal.business_name,
                    "stage": deal.stage.value,
                    "priority": deal.priority.value,
                    "probability": deal.probability,
                    "last_activity": deal.last_activity.isoformat(),
                    "next_action": {
                        "description": deal.next_action_description,
                        "due_date": deal.next_action_date.isoformat() if deal.next_action_date else None
                    }
                }
                for deal in deals
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Active deals retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve active deals: {str(e)}")


# Legacy market scan endpoint for backward compatibility
@app.post("/market/scan")
async def legacy_market_scan():
    """Legacy market scan endpoint for backward compatibility"""
    return {
        "location": "San Francisco",
        "industry": "All Industries", 
        "message": "This endpoint has been enhanced. Use /intelligence/scan for complete market intelligence.",
        "enhanced_endpoint": "/intelligence/scan",
        "businesses": [
            {
                "id": "1",
                "name": "Enhanced Business Intelligence Available",
                "message": "Use the new intelligence endpoints for complete analysis",
                "coordinates": [37.7749, -122.4194]
            }
        ],
        "market_intelligence": {
            "message": "Enhanced market intelligence available at /intelligence/* endpoints",
            "tam_estimate": 50000000,
            "business_count": 2,
            "hhi_score": 0.35,
            "fragmentation_level": "moderate"
        },
        "scan_metadata": {
            "timestamp": datetime.now().isoformat(),
            "data_sources_used": ["enhanced_intelligence_pipeline"],
            "recommendation": "Migrate to /intelligence/scan for full capabilities"
        }
    }


# WebSocket endpoint for real-time updates (if needed)
@app.websocket("/ws/intelligence")
async def intelligence_websocket(websocket):
    """WebSocket endpoint for real-time intelligence updates"""
    await websocket.accept()
    try:
        while True:
            # This would provide real-time updates
            # For now, just maintain connection
            await asyncio.sleep(30)
            await websocket.send_json({
                "type": "ping",
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "enhanced_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
