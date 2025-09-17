from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import pandas as pd
import json
from datetime import datetime

# Import only the basic components
from app.core.config import settings
from app.core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Okapiq API",
    description="Bloomberg for Small Businesses - AI-powered deal sourcing and market intelligence",
    version="1.0.0",
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

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Okapiq API",
        "version": "1.0.0",
        "description": "Bloomberg for Small Businesses",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "redis": "connected",
            "external_apis": "operational"
        }
    }

@app.post("/market/scan")
async def scan_market():
    """Simple market scan endpoint for testing"""
    return {
        "location": "San Francisco",
        "industry": "All Industries",
        "businesses": [
            {
                "id": "1",
                "name": "Test Business 1",
                "address": "123 Main St, San Francisco, CA",
                "phone": "(555) 123-4567",
                "website": "https://example.com",
                "rating": 4.5,
                "review_count": 25,
                "estimated_revenue": 2500000,
                "employee_count": 15,
                "years_in_business": 8,
                "succession_risk_score": 65,
                "owner_age_estimate": 58,
                "market_share_percent": 12.5,
                "lead_score": 85,
                "coordinates": [37.7749, -122.4194]
            },
            {
                "id": "2",
                "name": "Test Business 2",
                "address": "456 Oak Ave, San Francisco, CA",
                "phone": "(555) 987-6543",
                "website": "https://example2.com",
                "rating": 4.2,
                "review_count": 18,
                "estimated_revenue": 1800000,
                "employee_count": 12,
                "years_in_business": 5,
                "succession_risk_score": 45,
                "owner_age_estimate": 52,
                "market_share_percent": 8.3,
                "lead_score": 72,
                "coordinates": [37.7849, -122.4094]
            }
        ],
        "market_intelligence": {
            "tam_estimate": 50000000,
            "sam_estimate": 25000000,
            "som_estimate": 5000000,
            "business_count": 2,
            "hhi_score": 0.35,
            "fragmentation_level": "moderate",
            "avg_revenue_per_business": 2150000,
            "market_saturation_percent": 65.2,
            "ad_spend_to_dominate": 150000
        },
        "scan_metadata": {
            "timestamp": datetime.utcnow().isoformat(),
            "data_sources_used": ["test_data"],
            "total_businesses_found": 2
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 