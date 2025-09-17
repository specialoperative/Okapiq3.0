"""
Oppy (Opportunity Finder) - Growth market identification tool

As described in the requirements:
"A prospect discovery tool that zeroes in on income data, demographic shifts, 
and emerging consumer trends in non-fragmented or moderately consolidated markets. 
It identifies growth or expansion opportunities that may not hinge on fragmentation 
but are ripe for targeted expansions or strategic investments due to high consumer 
demand or shifting local economics."

Features:
- Opportunity Analytics using public contracts, licensing boards, Google/Ad data, transaction APIs
- Evaluates median household incomes, population growth, new business registrations
- Trend & Demand Monitoring via Google Trends, public event calendars, local government grants
- Flags policy changes or redevelopment projects that can alter demand
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import logging

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# Internal imports
from ..processors.data_normalizer import NormalizedBusiness, BusinessCategory
from ..enrichment.enrichment_engine import CensusData


@dataclass
class OpportunityMetrics:
    """Metrics for opportunity analysis"""
    market_demand_score: float = 0.0
    income_growth_score: float = 0.0
    demographic_shift_score: float = 0.0
    policy_impact_score: float = 0.0
    competition_saturation_score: float = 0.0
    consumer_trend_score: float = 0.0
    infrastructure_development_score: float = 0.0


@dataclass
class MarketOpportunity:
    """Identified market opportunity"""
    opportunity_id: str
    location: str
    industry: str
    opportunity_type: str  # "expansion", "new_market", "demographic_shift", "policy_driven"
    
    # Opportunity metrics
    opportunity_score: float
    confidence_level: float
    estimated_tam: float
    growth_potential: float
    time_to_market: int  # months
    
    # Market characteristics
    target_demographics: Dict[str, Any]
    demand_drivers: List[str]
    market_gaps: List[str]
    competitive_landscape: str
    
    # Investment requirements
    estimated_investment: int
    break_even_timeline: int  # months
    roi_projection: float
    
    # Risk factors
    risk_factors: List[str]
    risk_mitigation: List[str]
    
    # Actionable insights
    recommendations: List[str]
    next_steps: List[str]


@dataclass
class DemographicTrend:
    """Demographic trend analysis"""
    location: str
    trend_type: str  # "population_growth", "income_increase", "age_shift", "education_shift"
    trend_strength: float  # 0-1 scale
    historical_data: List[float]
    projected_impact: str
    business_implications: List[str]


@dataclass
class PolicyImpact:
    """Policy change impact analysis"""
    policy_type: str
    description: str
    effective_date: datetime
    impact_score: float
    affected_industries: List[str]
    business_opportunities: List[str]


class OpportunityFinder:
    """
    Oppy - The Opportunity Finder tool for growth market identification
    
    Focuses on non-fragmented markets with high growth potential driven by:
    - Income data and demographic shifts
    - Consumer trend analysis
    - Policy and infrastructure changes
    - Market demand surges
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Data sources and APIs
        self.census_client = None  # Would connect to Census API
        self.trends_client = None  # Would connect to Google Trends API
        self.policy_monitor = None  # Would monitor policy changes
        
        # Analysis components
        self.demographic_analyzer = DemographicAnalyzer()
        self.trend_analyzer = TrendAnalyzer()
        self.policy_analyzer = PolicyAnalyzer()
        self.opportunity_scorer = OpportunityScorer()
        
        # Cache for expensive operations
        self.opportunity_cache = {}
        self.demographic_cache = {}
    
    async def find_opportunities(
        self,
        locations: List[str],
        industries: Optional[List[str]] = None,
        opportunity_types: Optional[List[str]] = None,
        min_confidence: float = 0.6
    ) -> List[MarketOpportunity]:
        """
        Main entry point for opportunity discovery
        
        Args:
            locations: Geographic areas to analyze
            industries: Industries to focus on (None for all)
            opportunity_types: Types of opportunities to find
            min_confidence: Minimum confidence threshold
            
        Returns:
            List of identified market opportunities
        """
        
        opportunities = []
        
        for location in locations:
            try:
                self.logger.info(f"Analyzing opportunities in {location}")
                
                # Step 1: Demographic and economic analysis
                demographic_trends = await self.demographic_analyzer.analyze_trends(location)
                
                # Step 2: Consumer trend and demand analysis
                consumer_trends = await self.trend_analyzer.analyze_consumer_trends(
                    location, industries
                )
                
                # Step 3: Policy and infrastructure impact analysis
                policy_impacts = await self.policy_analyzer.analyze_policy_impacts(
                    location, industries
                )
                
                # Step 4: Market gap and demand surge identification
                market_gaps = await self._identify_market_gaps(
                    location, industries, demographic_trends
                )
                
                # Step 5: Opportunity synthesis and scoring
                location_opportunities = await self.opportunity_scorer.score_opportunities(
                    location=location,
                    demographic_trends=demographic_trends,
                    consumer_trends=consumer_trends,
                    policy_impacts=policy_impacts,
                    market_gaps=market_gaps,
                    industries=industries,
                    opportunity_types=opportunity_types
                )
                
                # Filter by confidence level
                qualified_opportunities = [
                    opp for opp in location_opportunities 
                    if opp.confidence_level >= min_confidence
                ]
                
                opportunities.extend(qualified_opportunities)
                
            except Exception as e:
                self.logger.error(f"Error analyzing {location}: {e}")
                continue
        
        # Sort by opportunity score
        opportunities.sort(key=lambda x: x.opportunity_score, reverse=True)
        
        return opportunities
    
    async def analyze_expansion_opportunities(
        self,
        current_businesses: List[NormalizedBusiness],
        expansion_radius_miles: int = 50
    ) -> List[MarketOpportunity]:
        """
        Analyze expansion opportunities for existing businesses
        
        Args:
            current_businesses: Current business portfolio
            expansion_radius_miles: Radius to search for expansion opportunities
            
        Returns:
            List of expansion opportunities
        """
        
        expansion_opportunities = []
        
        # Group businesses by category to identify expansion patterns
        category_groups = {}
        for business in current_businesses:
            category = business.category.value
            if category not in category_groups:
                category_groups[category] = []
            category_groups[category].append(business)
        
        # Analyze expansion opportunities for each category
        for category, businesses in category_groups.items():
            # Find geographic clusters
            geographic_clusters = self._identify_geographic_clusters(businesses)
            
            for cluster in geographic_clusters:
                # Find nearby high-opportunity areas
                nearby_opportunities = await self._find_nearby_opportunities(
                    cluster_center=cluster['center'],
                    industry=category,
                    radius_miles=expansion_radius_miles,
                    existing_businesses=businesses
                )
                
                expansion_opportunities.extend(nearby_opportunities)
        
        return expansion_opportunities
    
    async def monitor_emerging_trends(
        self,
        locations: List[str],
        industries: List[str],
        trend_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Monitor emerging trends that could create new opportunities
        
        Args:
            locations: Areas to monitor
            industries: Industries to focus on
            trend_threshold: Minimum trend strength to report
            
        Returns:
            List of emerging trends and their business implications
        """
        
        emerging_trends = []
        
        for location in locations:
            for industry in industries:
                # Analyze various trend indicators
                trends = await self._analyze_trend_indicators(location, industry)
                
                # Filter significant trends
                significant_trends = [
                    trend for trend in trends 
                    if trend['strength'] >= trend_threshold
                ]
                
                for trend in significant_trends:
                    # Generate business implications
                    implications = await self._generate_business_implications(
                        trend, location, industry
                    )
                    
                    emerging_trends.append({
                        'location': location,
                        'industry': industry,
                        'trend': trend,
                        'implications': implications,
                        'monitoring_date': datetime.now().isoformat()
                    })
        
        return emerging_trends
    
    async def _identify_market_gaps(
        self,
        location: str,
        industries: Optional[List[str]],
        demographic_trends: List[DemographicTrend]
    ) -> List[Dict[str, Any]]:
        """Identify market gaps and underserved segments"""
        
        market_gaps = []
        
        # Analyze demand vs supply gaps
        for trend in demographic_trends:
            if trend.trend_type == "population_growth" and trend.trend_strength > 0.6:
                # Growing population may indicate underserved markets
                gap = {
                    'gap_type': 'population_demand',
                    'location': location,
                    'description': f"Growing population in {location} may create service demand gaps",
                    'trend_strength': trend.trend_strength,
                    'business_opportunities': trend.business_implications,
                    'estimated_timeline': '6-18 months'
                }
                market_gaps.append(gap)
            
            elif trend.trend_type == "income_increase" and trend.trend_strength > 0.7:
                # Income growth may create premium service opportunities
                gap = {
                    'gap_type': 'premium_services',
                    'location': location,
                    'description': f"Rising incomes in {location} create premium service opportunities",
                    'trend_strength': trend.trend_strength,
                    'business_opportunities': [
                        'Premium service offerings',
                        'Luxury market segments',
                        'High-end customer experiences'
                    ],
                    'estimated_timeline': '3-12 months'
                }
                market_gaps.append(gap)
        
        # Analyze industry-specific gaps
        if industries:
            for industry in industries:
                industry_gaps = await self._analyze_industry_gaps(location, industry)
                market_gaps.extend(industry_gaps)
        
        return market_gaps
    
    def _identify_geographic_clusters(
        self, 
        businesses: List[NormalizedBusiness]
    ) -> List[Dict[str, Any]]:
        """Identify geographic clusters of businesses"""
        
        # Extract coordinates
        coordinates = []
        for business in businesses:
            if business.address.coordinates:
                coordinates.append([
                    business.address.coordinates.latitude,
                    business.address.coordinates.longitude
                ])
        
        if len(coordinates) < 2:
            return []
        
        # Perform clustering
        coords_array = np.array(coordinates)
        n_clusters = min(3, len(coordinates))  # Max 3 clusters
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(coords_array)
        
        # Create cluster information
        clusters = []
        for i in range(n_clusters):
            cluster_coords = coords_array[cluster_labels == i]
            center = np.mean(cluster_coords, axis=0)
            
            cluster = {
                'cluster_id': i,
                'center': {'latitude': center[0], 'longitude': center[1]},
                'business_count': len(cluster_coords),
                'businesses': [
                    businesses[j] for j in range(len(businesses)) 
                    if cluster_labels[j] == i
                ]
            }
            clusters.append(cluster)
        
        return clusters
    
    async def _find_nearby_opportunities(
        self,
        cluster_center: Dict[str, float],
        industry: str,
        radius_miles: int,
        existing_businesses: List[NormalizedBusiness]
    ) -> List[MarketOpportunity]:
        """Find expansion opportunities near existing business clusters"""
        
        opportunities = []
        
        # This would involve analyzing:
        # 1. Demographic data in surrounding areas
        # 2. Competition density
        # 3. Market demand indicators
        # 4. Infrastructure and policy factors
        
        # Mock implementation for demonstration
        opportunity = MarketOpportunity(
            opportunity_id=f"exp_{industry}_{int(datetime.now().timestamp())}",
            location=f"Near cluster at {cluster_center['latitude']:.2f}, {cluster_center['longitude']:.2f}",
            industry=industry,
            opportunity_type="expansion",
            opportunity_score=75.0,
            confidence_level=0.8,
            estimated_tam=5000000,
            growth_potential=0.25,
            time_to_market=6,
            target_demographics={
                'median_income': 65000,
                'age_range': '25-45',
                'education_level': 'college_educated'
            },
            demand_drivers=[
                'Population growth in area',
                'Successful cluster of existing businesses',
                'Underserved market segments'
            ],
            market_gaps=[
                'Limited competition in 5-mile radius',
                'Growing residential development'
            ],
            competitive_landscape="moderately_competitive",
            estimated_investment=250000,
            break_even_timeline=18,
            roi_projection=0.35,
            risk_factors=[
                'Market saturation risk',
                'Economic downturn impact'
            ],
            risk_mitigation=[
                'Phased expansion approach',
                'Local market research'
            ],
            recommendations=[
                'Conduct detailed market research',
                'Consider franchise model',
                'Partner with local businesses'
            ],
            next_steps=[
                'Site selection analysis',
                'Local permit research',
                'Financial modeling'
            ]
        )
        
        opportunities.append(opportunity)
        
        return opportunities
    
    async def _analyze_trend_indicators(
        self, 
        location: str, 
        industry: str
    ) -> List[Dict[str, Any]]:
        """Analyze various trend indicators for emerging opportunities"""
        
        trends = []
        
        # Mock trend analysis (in production, this would connect to real APIs)
        trends.append({
            'trend_type': 'consumer_behavior',
            'description': f'Increased demand for {industry} services in {location}',
            'strength': 0.75,
            'data_source': 'google_trends',
            'trend_direction': 'increasing',
            'confidence': 0.8
        })
        
        trends.append({
            'trend_type': 'demographic_shift',
            'description': f'Population growth driving {industry} demand in {location}',
            'strength': 0.65,
            'data_source': 'census_data',
            'trend_direction': 'increasing',
            'confidence': 0.9
        })
        
        return trends
    
    async def _generate_business_implications(
        self, 
        trend: Dict[str, Any], 
        location: str, 
        industry: str
    ) -> List[str]:
        """Generate business implications from trend analysis"""
        
        implications = []
        
        if trend['trend_type'] == 'consumer_behavior':
            implications.extend([
                'Increase marketing spend to capture growing demand',
                'Consider expanding service offerings',
                'Improve customer experience to retain growing customer base'
            ])
        
        elif trend['trend_type'] == 'demographic_shift':
            implications.extend([
                'Adjust service mix for changing demographics',
                'Consider new location expansion',
                'Develop targeted marketing for new demographic segments'
            ])
        
        return implications
    
    async def _analyze_industry_gaps(
        self, 
        location: str, 
        industry: str
    ) -> List[Dict[str, Any]]:
        """Analyze industry-specific market gaps"""
        
        gaps = []
        
        # Industry-specific gap analysis
        industry_gap_patterns = {
            'hvac': [
                'Smart home integration services',
                'Energy efficiency consulting',
                'Preventive maintenance programs'
            ],
            'healthcare': [
                'Telehealth services',
                'Specialized elderly care',
                'Mental health services'
            ],
            'retail': [
                'E-commerce integration',
                'Experiential retail',
                'Sustainable products'
            ],
            'restaurant': [
                'Delivery optimization',
                'Health-conscious menus',
                'Ghost kitchen concepts'
            ]
        }
        
        if industry in industry_gap_patterns:
            for gap_area in industry_gap_patterns[industry]:
                gap = {
                    'gap_type': 'service_innovation',
                    'location': location,
                    'industry': industry,
                    'description': f"Opportunity in {gap_area} for {industry} in {location}",
                    'innovation_area': gap_area,
                    'market_readiness': 'emerging',
                    'estimated_timeline': '6-24 months'
                }
                gaps.append(gap)
        
        return gaps


class DemographicAnalyzer:
    """Analyzes demographic trends and shifts"""
    
    async def analyze_trends(self, location: str) -> List[DemographicTrend]:
        """Analyze demographic trends for a location"""
        
        trends = []
        
        # Mock demographic analysis (in production, connect to Census API)
        trends.append(DemographicTrend(
            location=location,
            trend_type="population_growth",
            trend_strength=0.75,
            historical_data=[100000, 105000, 112000, 118000, 125000],
            projected_impact="high_demand_growth",
            business_implications=[
                'Increased service demand',
                'New customer acquisition opportunities',
                'Infrastructure development needs'
            ]
        ))
        
        trends.append(DemographicTrend(
            location=location,
            trend_type="income_increase",
            trend_strength=0.65,
            historical_data=[55000, 58000, 62000, 65000, 68000],
            projected_impact="premium_service_demand",
            business_implications=[
                'Opportunity for premium services',
                'Higher price points acceptable',
                'Quality over price preference'
            ]
        ))
        
        return trends


class TrendAnalyzer:
    """Analyzes consumer trends and demand patterns"""
    
    async def analyze_consumer_trends(
        self, 
        location: str, 
        industries: Optional[List[str]]
    ) -> List[Dict[str, Any]]:
        """Analyze consumer trends affecting business opportunities"""
        
        trends = []
        
        # Mock consumer trend analysis
        if not industries or 'hvac' in industries:
            trends.append({
                'trend_category': 'sustainability',
                'description': 'Increased demand for energy-efficient HVAC systems',
                'strength': 0.8,
                'growth_rate': 0.15,
                'market_segments': ['residential', 'commercial'],
                'business_opportunities': [
                    'Smart HVAC system installation',
                    'Energy audit services',
                    'Green technology consulting'
                ]
            })
        
        if not industries or 'healthcare' in industries:
            trends.append({
                'trend_category': 'digital_health',
                'description': 'Growing acceptance of telehealth and digital health services',
                'strength': 0.9,
                'growth_rate': 0.25,
                'market_segments': ['elderly_care', 'chronic_care', 'preventive_care'],
                'business_opportunities': [
                    'Telehealth platform development',
                    'Remote monitoring services',
                    'Digital health consulting'
                ]
            })
        
        return trends


class PolicyAnalyzer:
    """Analyzes policy changes and their business impact"""
    
    async def analyze_policy_impacts(
        self, 
        location: str, 
        industries: Optional[List[str]]
    ) -> List[PolicyImpact]:
        """Analyze policy changes affecting business opportunities"""
        
        impacts = []
        
        # Mock policy impact analysis
        impacts.append(PolicyImpact(
            policy_type="tax_incentive",
            description="New tax incentives for green energy businesses",
            effective_date=datetime(2024, 1, 1),
            impact_score=0.8,
            affected_industries=['hvac', 'construction', 'manufacturing'],
            business_opportunities=[
                'Green technology adoption incentives',
                'Energy efficiency service expansion',
                'Sustainable business model development'
            ]
        ))
        
        impacts.append(PolicyImpact(
            policy_type="zoning_change",
            description="New mixed-use development zoning approvals",
            effective_date=datetime(2024, 6, 1),
            impact_score=0.7,
            affected_industries=['retail', 'restaurant', 'services'],
            business_opportunities=[
                'New location opportunities',
                'Mixed-use business models',
                'Community-centered services'
            ]
        ))
        
        return impacts


class OpportunityScorer:
    """Scores and ranks business opportunities"""
    
    async def score_opportunities(
        self,
        location: str,
        demographic_trends: List[DemographicTrend],
        consumer_trends: List[Dict[str, Any]],
        policy_impacts: List[PolicyImpact],
        market_gaps: List[Dict[str, Any]],
        industries: Optional[List[str]],
        opportunity_types: Optional[List[str]]
    ) -> List[MarketOpportunity]:
        """Score and create market opportunities"""
        
        opportunities = []
        
        # Calculate base opportunity metrics
        metrics = self._calculate_opportunity_metrics(
            demographic_trends, consumer_trends, policy_impacts, market_gaps
        )
        
        # Generate opportunities based on strong signals
        if metrics.income_growth_score > 70:
            opportunity = self._create_premium_market_opportunity(
                location, metrics, demographic_trends, consumer_trends
            )
            opportunities.append(opportunity)
        
        if metrics.demographic_shift_score > 75:
            opportunity = self._create_demographic_opportunity(
                location, metrics, demographic_trends
            )
            opportunities.append(opportunity)
        
        if metrics.policy_impact_score > 65:
            opportunity = self._create_policy_driven_opportunity(
                location, metrics, policy_impacts
            )
            opportunities.append(opportunity)
        
        # Filter by requested opportunity types
        if opportunity_types:
            opportunities = [
                opp for opp in opportunities 
                if opp.opportunity_type in opportunity_types
            ]
        
        return opportunities
    
    def _calculate_opportunity_metrics(
        self,
        demographic_trends: List[DemographicTrend],
        consumer_trends: List[Dict[str, Any]],
        policy_impacts: List[PolicyImpact],
        market_gaps: List[Dict[str, Any]]
    ) -> OpportunityMetrics:
        """Calculate opportunity metrics from various inputs"""
        
        metrics = OpportunityMetrics()
        
        # Demographic analysis
        for trend in demographic_trends:
            if trend.trend_type == "income_increase":
                metrics.income_growth_score = trend.trend_strength * 100
            elif trend.trend_type == "population_growth":
                metrics.demographic_shift_score = trend.trend_strength * 100
        
        # Consumer trend analysis
        if consumer_trends:
            avg_trend_strength = sum(t['strength'] for t in consumer_trends) / len(consumer_trends)
            metrics.consumer_trend_score = avg_trend_strength * 100
        
        # Policy impact analysis
        if policy_impacts:
            avg_policy_impact = sum(p.impact_score for p in policy_impacts) / len(policy_impacts)
            metrics.policy_impact_score = avg_policy_impact * 100
        
        # Market demand (derived from gaps and trends)
        gap_strength = len(market_gaps) * 10  # Simple gap scoring
        metrics.market_demand_score = min(100, gap_strength + metrics.consumer_trend_score * 0.5)
        
        return metrics
    
    def _create_premium_market_opportunity(
        self,
        location: str,
        metrics: OpportunityMetrics,
        demographic_trends: List[DemographicTrend],
        consumer_trends: List[Dict[str, Any]]
    ) -> MarketOpportunity:
        """Create premium market opportunity"""
        
        return MarketOpportunity(
            opportunity_id=f"premium_{location}_{int(datetime.now().timestamp())}",
            location=location,
            industry="services",
            opportunity_type="premium_expansion",
            opportunity_score=metrics.income_growth_score,
            confidence_level=0.8,
            estimated_tam=8000000,
            growth_potential=0.3,
            time_to_market=9,
            target_demographics={
                'income_level': 'high',
                'lifestyle': 'quality_focused',
                'spending_pattern': 'premium_services'
            },
            demand_drivers=[
                'Rising household incomes',
                'Quality-over-price preferences',
                'Premium service gaps in market'
            ],
            market_gaps=[
                'Limited premium service providers',
                'Underserved high-income segments'
            ],
            competitive_landscape="low_premium_competition",
            estimated_investment=400000,
            break_even_timeline=15,
            roi_projection=0.45,
            risk_factors=[
                'Economic sensitivity',
                'Premium market volatility'
            ],
            risk_mitigation=[
                'Diversified service portfolio',
                'Strong brand positioning'
            ],
            recommendations=[
                'Focus on premium branding',
                'Develop high-end service packages',
                'Target affluent customer segments'
            ],
            next_steps=[
                'Premium market research',
                'Brand development strategy',
                'High-end service design'
            ]
        )
    
    def _create_demographic_opportunity(
        self,
        location: str,
        metrics: OpportunityMetrics,
        demographic_trends: List[DemographicTrend]
    ) -> MarketOpportunity:
        """Create demographic shift opportunity"""
        
        return MarketOpportunity(
            opportunity_id=f"demo_{location}_{int(datetime.now().timestamp())}",
            location=location,
            industry="general",
            opportunity_type="demographic_shift",
            opportunity_score=metrics.demographic_shift_score,
            confidence_level=0.85,
            estimated_tam=12000000,
            growth_potential=0.4,
            time_to_market=6,
            target_demographics={
                'trend': 'population_growth',
                'age_segments': 'expanding',
                'market_expansion': 'high'
            },
            demand_drivers=[
                'Population growth',
                'New household formation',
                'Expanded market base'
            ],
            market_gaps=[
                'Service capacity constraints',
                'New customer segment needs'
            ],
            competitive_landscape="expanding_market",
            estimated_investment=300000,
            break_even_timeline=12,
            roi_projection=0.4,
            risk_factors=[
                'Infrastructure capacity',
                'Service scalability'
            ],
            risk_mitigation=[
                'Capacity planning',
                'Scalable business model'
            ],
            recommendations=[
                'Scale service capacity',
                'Expand geographical coverage',
                'Develop new customer onboarding'
            ],
            next_steps=[
                'Capacity analysis',
                'Market expansion planning',
                'Infrastructure investment'
            ]
        )
    
    def _create_policy_driven_opportunity(
        self,
        location: str,
        metrics: OpportunityMetrics,
        policy_impacts: List[PolicyImpact]
    ) -> MarketOpportunity:
        """Create policy-driven opportunity"""
        
        return MarketOpportunity(
            opportunity_id=f"policy_{location}_{int(datetime.now().timestamp())}",
            location=location,
            industry="regulated",
            opportunity_type="policy_driven",
            opportunity_score=metrics.policy_impact_score,
            confidence_level=0.9,
            estimated_tam=6000000,
            growth_potential=0.35,
            time_to_market=12,
            target_demographics={
                'compliance_focused': True,
                'government_backed': True,
                'incentive_driven': True
            },
            demand_drivers=[
                'Policy changes creating demand',
                'Government incentives',
                'Regulatory compliance needs'
            ],
            market_gaps=[
                'Limited compliance services',
                'New regulatory requirements'
            ],
            competitive_landscape="emerging_regulation",
            estimated_investment=200000,
            break_even_timeline=10,
            roi_projection=0.5,
            risk_factors=[
                'Policy reversal risk',
                'Regulatory complexity'
            ],
            risk_mitigation=[
                'Stay informed on policy changes',
                'Develop flexible service model'
            ],
            recommendations=[
                'Develop compliance expertise',
                'Partner with regulatory bodies',
                'Create policy-aligned services'
            ],
            next_steps=[
                'Regulatory research',
                'Compliance planning',
                'Government partnership exploration'
            ]
        )


# Export main classes
__all__ = [
    'OpportunityFinder',
    'MarketOpportunity',
    'OpportunityMetrics',
    'DemographicTrend',
    'PolicyImpact'
]
