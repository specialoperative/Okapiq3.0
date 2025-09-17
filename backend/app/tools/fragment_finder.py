"""
Fragment Finder - Market fragmentation analysis and roll-up identification tool

As described in the requirements:
"A roll-up targeting tool specifically engineered to identify highly fragmented markets. 
It flags regions or sectors with multiple small players and minimal consolidation—ideal 
for M&A aggregators looking to unify them."

Features:
- Market Fragmentation Analytics using HHI (Herfindahl–Hirschman Index) across ZIP codes or MSAs
- Combines data from Census, licensing boards, transaction APIs, and relevant sources
- Pinpoints excessively segmented segments (e.g., 30+ "mom-and-pop" shops)
- Roll-Up Scoring & Sorting using RAP_Index to rank regions by synergy potential
- Surfaces top 10–15 localities with low consolidation but steady demand
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
from sklearn.cluster import DBSCAN

# Internal imports
from ..processors.data_normalizer import NormalizedBusiness, BusinessCategory
from ..analytics.scoring_vectorizer import FragmentationAnalysis


@dataclass
class FragmentationMetrics:
    """Comprehensive fragmentation metrics for a market"""
    location: str
    industry: str
    
    # Core fragmentation indicators
    hhi_index: float  # Herfindahl-Hirschman Index
    business_count: int
    market_leader_share: float
    top4_concentration_ratio: float
    top8_concentration_ratio: float
    
    # Market characteristics
    total_market_revenue: float
    average_business_size: float
    median_business_age: float
    new_entrant_rate: float
    
    # Fragmentation scoring
    fragmentation_score: float  # 0-100, higher = more fragmented
    fragmentation_level: str  # "highly_fragmented", "moderately_fragmented", "concentrated"
    
    # Roll-up indicators
    roll_up_potential: float  # 0-1 scale
    consolidation_barriers: List[str]
    synergy_opportunities: List[str]


@dataclass
class RollUpOpportunity:
    """Identified roll-up opportunity"""
    opportunity_id: str
    location: str
    industry: str
    
    # Market characteristics
    fragmentation_metrics: FragmentationMetrics
    target_businesses: List[Dict[str, Any]]
    market_dynamics: Dict[str, Any]
    
    # Roll-up analysis
    rap_index: float  # Roll-up Attractiveness and Potential Index
    estimated_synergies: float
    consolidation_timeline: int  # months
    total_investment_required: float
    
    # Financial projections
    pre_rollup_revenue: float
    post_rollup_revenue: float
    estimated_ebitda_improvement: float
    projected_exit_multiple: float
    projected_irr: float
    
    # Strategic considerations
    acquisition_strategy: str  # "aggressive", "selective", "phased"
    key_targets: List[str]  # Priority acquisition targets
    competitive_threats: List[str]
    execution_risks: List[str]
    
    # Actionable recommendations
    next_steps: List[str]
    success_factors: List[str]
    timeline_milestones: Dict[str, str]


@dataclass
class MarketCluster:
    """Geographic market cluster for analysis"""
    cluster_id: str
    center_location: Dict[str, float]  # lat, lng
    radius_miles: float
    businesses: List[NormalizedBusiness]
    
    # Cluster characteristics
    total_revenue: float
    business_density: float
    avg_business_age: float
    dominant_categories: List[str]


class FragmentFinder:
    """
    Fragment Finder - Market fragmentation analysis and roll-up identification tool
    
    Focuses on highly fragmented markets suitable for roll-up strategies:
    - HHI calculation across geographic markets
    - Business density and competition analysis
    - Synergy identification and quantification
    - Roll-up strategy recommendations
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Analysis components
        self.fragmentation_analyzer = FragmentationAnalyzer()
        self.market_clusterer = MarketClusterer()
        self.synergy_calculator = SynergyCalculator()
        self.rollup_scorer = RollUpScorer()
        
        # Data sources (would connect to real APIs in production)
        self.census_client = None
        self.licensing_boards = None
        self.transaction_apis = None
        
        # Cache for expensive calculations
        self.fragmentation_cache = {}
        self.market_cache = {}
    
    async def find_fragmented_markets(
        self,
        locations: List[str],
        industries: Optional[List[str]] = None,
        min_fragmentation_score: float = 70.0,
        min_business_count: int = 10
    ) -> List[RollUpOpportunity]:
        """
        Main entry point for fragmented market identification
        
        Args:
            locations: Geographic areas to analyze
            industries: Industries to focus on
            min_fragmentation_score: Minimum fragmentation threshold
            min_business_count: Minimum businesses required for analysis
            
        Returns:
            List of identified roll-up opportunities
        """
        
        opportunities = []
        
        for location in locations:
            try:
                self.logger.info(f"Analyzing market fragmentation in {location}")
                
                # Step 1: Market clustering and segmentation
                market_clusters = await self.market_clusterer.identify_market_clusters(
                    location, industries
                )
                
                # Step 2: Fragmentation analysis for each cluster
                for cluster in market_clusters:
                    if len(cluster.businesses) < min_business_count:
                        continue
                    
                    fragmentation_metrics = await self.fragmentation_analyzer.analyze_fragmentation(
                        cluster.businesses, location, cluster.dominant_categories[0] if cluster.dominant_categories else "general"
                    )
                    
                    # Filter by fragmentation score
                    if fragmentation_metrics.fragmentation_score < min_fragmentation_score:
                        continue
                    
                    # Step 3: Roll-up opportunity analysis
                    rollup_opportunity = await self._analyze_rollup_opportunity(
                        cluster, fragmentation_metrics
                    )
                    
                    if rollup_opportunity:
                        opportunities.append(rollup_opportunity)
                
            except Exception as e:
                self.logger.error(f"Error analyzing {location}: {e}")
                continue
        
        # Sort by RAP index (Roll-up Attractiveness and Potential)
        opportunities.sort(key=lambda x: x.rap_index, reverse=True)
        
        return opportunities
    
    async def analyze_industry_fragmentation(
        self,
        industry: str,
        geographic_scope: str = "national",
        depth_analysis: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze fragmentation across an entire industry
        
        Args:
            industry: Industry to analyze
            geographic_scope: "national", "regional", or specific locations
            depth_analysis: Whether to perform deep dive analysis
            
        Returns:
            Comprehensive industry fragmentation report
        """
        
        # Geographic analysis
        if geographic_scope == "national":
            locations = self._get_major_metros()
        elif geographic_scope == "regional":
            locations = self._get_regional_centers()
        else:
            locations = [geographic_scope]
        
        industry_analysis = {
            'industry': industry,
            'geographic_scope': geographic_scope,
            'analysis_date': datetime.now().isoformat(),
            'locations_analyzed': len(locations),
            'fragmentation_overview': {},
            'top_opportunities': [],
            'market_dynamics': {},
            'consolidation_trends': {}
        }
        
        # Analyze each location
        location_results = []
        for location in locations:
            try:
                # Get businesses in this location/industry
                market_clusters = await self.market_clusterer.identify_market_clusters(
                    location, [industry]
                )
                
                for cluster in market_clusters:
                    if cluster.dominant_categories and industry in cluster.dominant_categories:
                        fragmentation_metrics = await self.fragmentation_analyzer.analyze_fragmentation(
                            cluster.businesses, location, industry
                        )
                        
                        location_results.append({
                            'location': location,
                            'metrics': fragmentation_metrics,
                            'business_count': len(cluster.businesses),
                            'total_revenue': cluster.total_revenue
                        })
                        
            except Exception as e:
                self.logger.error(f"Error analyzing {location} for {industry}: {e}")
                continue
        
        # Aggregate results
        if location_results:
            # Calculate industry-wide metrics
            total_businesses = sum(r['business_count'] for r in location_results)
            total_revenue = sum(r['total_revenue'] for r in location_results)
            avg_hhi = np.mean([r['metrics'].hhi_index for r in location_results])
            
            industry_analysis['fragmentation_overview'] = {
                'total_businesses_analyzed': total_businesses,
                'total_market_revenue': total_revenue,
                'average_hhi_index': avg_hhi,
                'fragmentation_level': self._categorize_industry_fragmentation(avg_hhi),
                'locations_with_high_fragmentation': len([
                    r for r in location_results 
                    if r['metrics'].fragmentation_score > 75
                ])
            }
            
            # Identify top opportunities
            top_locations = sorted(
                location_results, 
                key=lambda x: x['metrics'].fragmentation_score, 
                reverse=True
            )[:10]
            
            industry_analysis['top_opportunities'] = [
                {
                    'location': loc['location'],
                    'fragmentation_score': loc['metrics'].fragmentation_score,
                    'business_count': loc['business_count'],
                    'hhi_index': loc['metrics'].hhi_index,
                    'roll_up_potential': loc['metrics'].roll_up_potential
                }
                for loc in top_locations
            ]
        
        return industry_analysis
    
    async def calculate_rollup_synergies(
        self,
        target_businesses: List[NormalizedBusiness],
        rollup_strategy: str = "selective"
    ) -> Dict[str, Any]:
        """
        Calculate potential synergies from rolling up target businesses
        
        Args:
            target_businesses: Businesses to include in roll-up
            rollup_strategy: "aggressive", "selective", or "phased"
            
        Returns:
            Detailed synergy analysis
        """
        
        synergy_analysis = await self.synergy_calculator.calculate_synergies(
            target_businesses, rollup_strategy
        )
        
        return synergy_analysis
    
    async def _analyze_rollup_opportunity(
        self,
        cluster: MarketCluster,
        fragmentation_metrics: FragmentationMetrics
    ) -> Optional[RollUpOpportunity]:
        """Analyze roll-up opportunity for a market cluster"""
        
        try:
            # Calculate RAP (Roll-up Attractiveness and Potential) Index
            rap_index = await self.rollup_scorer.calculate_rap_index(
                cluster, fragmentation_metrics
            )
            
            # Only proceed if RAP index is sufficiently high
            if rap_index < 60:
                return None
            
            # Synergy analysis
            synergy_analysis = await self.synergy_calculator.calculate_synergies(
                cluster.businesses, "selective"
            )
            
            # Financial projections
            financial_projections = self._calculate_financial_projections(
                cluster, synergy_analysis
            )
            
            # Strategic analysis
            strategic_analysis = self._analyze_strategic_considerations(
                cluster, fragmentation_metrics
            )
            
            # Create roll-up opportunity
            opportunity = RollUpOpportunity(
                opportunity_id=f"rollup_{cluster.cluster_id}_{int(datetime.now().timestamp())}",
                location=f"{cluster.center_location['lat']:.2f},{cluster.center_location['lng']:.2f}",
                industry=cluster.dominant_categories[0] if cluster.dominant_categories else "mixed",
                fragmentation_metrics=fragmentation_metrics,
                target_businesses=self._format_target_businesses(cluster.businesses),
                market_dynamics=self._analyze_market_dynamics(cluster),
                rap_index=rap_index,
                estimated_synergies=synergy_analysis['total_synergies'],
                consolidation_timeline=strategic_analysis['timeline'],
                total_investment_required=financial_projections['total_investment'],
                pre_rollup_revenue=cluster.total_revenue,
                post_rollup_revenue=financial_projections['post_rollup_revenue'],
                estimated_ebitda_improvement=synergy_analysis['ebitda_improvement'],
                projected_exit_multiple=financial_projections['exit_multiple'],
                projected_irr=financial_projections['irr'],
                acquisition_strategy=strategic_analysis['strategy'],
                key_targets=strategic_analysis['key_targets'],
                competitive_threats=strategic_analysis['threats'],
                execution_risks=strategic_analysis['risks'],
                next_steps=strategic_analysis['next_steps'],
                success_factors=strategic_analysis['success_factors'],
                timeline_milestones=strategic_analysis['milestones']
            )
            
            return opportunity
            
        except Exception as e:
            self.logger.error(f"Error analyzing roll-up opportunity: {e}")
            return None
    
    def _get_major_metros(self) -> List[str]:
        """Get list of major metropolitan areas for analysis"""
        return [
            "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
            "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
            "Austin", "Jacksonville", "San Francisco", "Columbus", "Charlotte",
            "Fort Worth", "Indianapolis", "Seattle", "Denver", "Boston"
        ]
    
    def _get_regional_centers(self) -> List[str]:
        """Get list of regional centers for analysis"""
        return [
            "Atlanta", "Miami", "Tampa", "Orlando", "Nashville",
            "Memphis", "Kansas City", "St. Louis", "Milwaukee",
            "Minneapolis", "Cleveland", "Cincinnati", "Pittsburgh",
            "Portland", "Las Vegas", "Sacramento", "Salt Lake City"
        ]
    
    def _categorize_industry_fragmentation(self, avg_hhi: float) -> str:
        """Categorize industry fragmentation level"""
        if avg_hhi < 1000:
            return "highly_fragmented"
        elif avg_hhi < 2000:
            return "moderately_fragmented"
        elif avg_hhi < 2500:
            return "moderately_concentrated"
        else:
            return "highly_concentrated"
    
    def _format_target_businesses(self, businesses: List[NormalizedBusiness]) -> List[Dict[str, Any]]:
        """Format businesses for roll-up opportunity"""
        formatted = []
        
        for business in businesses:
            formatted.append({
                'business_id': business.business_id,
                'name': business.name,
                'estimated_revenue': business.metrics.estimated_revenue or 0,
                'employee_count': business.metrics.employee_count or 0,
                'succession_risk_score': business.metrics.succession_risk_score or 0,
                'market_share': business.metrics.market_share_percent or 0,
                'rating': business.metrics.rating or 0,
                'address': business.address.formatted_address,
                'acquisition_priority': self._calculate_acquisition_priority(business)
            })
        
        # Sort by acquisition priority
        formatted.sort(key=lambda x: x['acquisition_priority'], reverse=True)
        
        return formatted
    
    def _calculate_acquisition_priority(self, business: NormalizedBusiness) -> float:
        """Calculate acquisition priority score for a business"""
        score = 0.0
        
        # Revenue factor
        revenue = business.metrics.estimated_revenue or 0
        if revenue > 2000000:
            score += 30
        elif revenue > 1000000:
            score += 20
        elif revenue > 500000:
            score += 10
        
        # Succession risk factor (higher risk = higher priority)
        succession_risk = business.metrics.succession_risk_score or 50
        score += succession_risk * 0.3
        
        # Market position factor
        if business.metrics.rating and business.metrics.rating > 4.0:
            score += 15
        
        # Strategic value
        if business.metrics.market_share_percent and business.metrics.market_share_percent > 10:
            score += 10
        
        return score
    
    def _analyze_market_dynamics(self, cluster: MarketCluster) -> Dict[str, Any]:
        """Analyze market dynamics for a cluster"""
        return {
            'business_density': cluster.business_density,
            'market_maturity': 'mature' if cluster.avg_business_age > 15 else 'developing',
            'competitive_intensity': 'high' if cluster.business_density > 5 else 'moderate',
            'growth_stage': 'consolidation' if len(cluster.businesses) > 20 else 'fragmented',
            'barrier_to_entry': 'low' if cluster.business_density > 10 else 'medium'
        }
    
    def _calculate_financial_projections(
        self,
        cluster: MarketCluster,
        synergy_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate financial projections for roll-up"""
        
        # Current financials
        current_revenue = cluster.total_revenue
        current_ebitda = current_revenue * 0.15  # Assume 15% EBITDA margin
        
        # Post-rollup projections
        synergy_value = synergy_analysis['total_synergies']
        post_rollup_revenue = current_revenue * 1.1  # 10% revenue synergies
        post_rollup_ebitda = current_ebitda + synergy_value
        
        # Investment requirements
        avg_multiple = 3.5  # Average acquisition multiple
        total_investment = current_revenue * 0.7 * avg_multiple  # 70% of businesses
        
        # Exit projections
        exit_multiple = 5.0  # Exit multiple
        exit_value = post_rollup_ebitda * exit_multiple
        
        # IRR calculation (simplified)
        years_to_exit = 5
        irr = ((exit_value / total_investment) ** (1/years_to_exit)) - 1
        
        return {
            'current_revenue': current_revenue,
            'current_ebitda': current_ebitda,
            'post_rollup_revenue': post_rollup_revenue,
            'post_rollup_ebitda': post_rollup_ebitda,
            'total_investment': total_investment,
            'exit_value': exit_value,
            'exit_multiple': exit_multiple,
            'irr': irr
        }
    
    def _analyze_strategic_considerations(
        self,
        cluster: MarketCluster,
        fragmentation_metrics: FragmentationMetrics
    ) -> Dict[str, Any]:
        """Analyze strategic considerations for roll-up"""
        
        # Determine strategy based on fragmentation level
        if fragmentation_metrics.fragmentation_score > 85:
            strategy = "aggressive"
            timeline = 18  # months
        elif fragmentation_metrics.fragmentation_score > 70:
            strategy = "selective"
            timeline = 24
        else:
            strategy = "phased"
            timeline = 36
        
        # Identify key targets (top 20% by revenue)
        sorted_businesses = sorted(
            cluster.businesses,
            key=lambda b: b.metrics.estimated_revenue or 0,
            reverse=True
        )
        key_count = max(3, len(sorted_businesses) // 5)
        key_targets = [b.name for b in sorted_businesses[:key_count]]
        
        # Identify risks and threats
        risks = []
        if fragmentation_metrics.market_leader_share > 30:
            risks.append("Dominant player may resist consolidation")
        if len(cluster.businesses) > 50:
            risks.append("Complex integration challenges")
        if cluster.avg_business_age > 20:
            risks.append("Entrenched business practices")
        
        threats = []
        if fragmentation_metrics.new_entrant_rate > 0.1:
            threats.append("High new entrant rate")
        threats.append("Potential competitor roll-up activity")
        threats.append("Economic downturn impact")
        
        return {
            'strategy': strategy,
            'timeline': timeline,
            'key_targets': key_targets,
            'risks': risks,
            'threats': threats,
            'next_steps': [
                'Detailed target business analysis',
                'Management team assessment',
                'Initial acquisition approach',
                'Integration planning'
            ],
            'success_factors': [
                'Strong management team retention',
                'Effective integration processes',
                'Market position preservation',
                'Cost synergy realization'
            ],
            'milestones': {
                '3_months': 'Complete target prioritization',
                '6_months': 'Initial acquisitions closed',
                '12_months': 'Integration milestones achieved',
                '18_months': 'Market position established'
            }
        }


class FragmentationAnalyzer:
    """Analyzes market fragmentation using HHI and other metrics"""
    
    async def analyze_fragmentation(
        self,
        businesses: List[NormalizedBusiness],
        location: str,
        industry: str
    ) -> FragmentationMetrics:
        """Analyze fragmentation for a set of businesses"""
        
        if not businesses:
            return self._create_empty_metrics(location, industry)
        
        # Calculate revenue distribution
        revenues = [b.metrics.estimated_revenue or 0 for b in businesses]
        total_revenue = sum(revenues)
        
        if total_revenue == 0:
            return self._create_empty_metrics(location, industry)
        
        # Calculate market shares
        market_shares = [rev / total_revenue for rev in revenues]
        sorted_shares = sorted(market_shares, reverse=True)
        
        # Calculate HHI
        hhi_index = sum(share ** 2 for share in market_shares) * 10000
        
        # Concentration ratios
        top4_ratio = sum(sorted_shares[:4]) * 100 if len(sorted_shares) >= 4 else sum(sorted_shares) * 100
        top8_ratio = sum(sorted_shares[:8]) * 100 if len(sorted_shares) >= 8 else sum(sorted_shares) * 100
        
        # Market characteristics
        market_leader_share = sorted_shares[0] * 100 if sorted_shares else 0
        avg_business_size = total_revenue / len(businesses)
        
        # Business ages
        ages = [b.metrics.years_in_business or 10 for b in businesses if b.metrics.years_in_business]
        median_age = np.median(ages) if ages else 10
        
        # New entrant estimation (businesses < 3 years old)
        new_businesses = [b for b in businesses if (b.metrics.years_in_business or 10) < 3]
        new_entrant_rate = len(new_businesses) / len(businesses)
        
        # Fragmentation scoring
        fragmentation_score = self._calculate_fragmentation_score(
            hhi_index, len(businesses), market_leader_share, new_entrant_rate
        )
        
        # Fragmentation level categorization
        if fragmentation_score > 80:
            fragmentation_level = "highly_fragmented"
        elif fragmentation_score > 60:
            fragmentation_level = "moderately_fragmented"
        else:
            fragmentation_level = "concentrated"
        
        # Roll-up potential
        roll_up_potential = min(1.0, fragmentation_score / 100 * 1.2)
        
        # Barriers and opportunities
        barriers = self._identify_consolidation_barriers(businesses, market_leader_share)
        synergies = self._identify_synergy_opportunities(businesses)
        
        return FragmentationMetrics(
            location=location,
            industry=industry,
            hhi_index=hhi_index,
            business_count=len(businesses),
            market_leader_share=market_leader_share,
            top4_concentration_ratio=top4_ratio,
            top8_concentration_ratio=top8_ratio,
            total_market_revenue=total_revenue,
            average_business_size=avg_business_size,
            median_business_age=median_age,
            new_entrant_rate=new_entrant_rate,
            fragmentation_score=fragmentation_score,
            fragmentation_level=fragmentation_level,
            roll_up_potential=roll_up_potential,
            consolidation_barriers=barriers,
            synergy_opportunities=synergies
        )
    
    def _create_empty_metrics(self, location: str, industry: str) -> FragmentationMetrics:
        """Create empty fragmentation metrics"""
        return FragmentationMetrics(
            location=location,
            industry=industry,
            hhi_index=0,
            business_count=0,
            market_leader_share=0,
            top4_concentration_ratio=0,
            top8_concentration_ratio=0,
            total_market_revenue=0,
            average_business_size=0,
            median_business_age=0,
            new_entrant_rate=0,
            fragmentation_score=0,
            fragmentation_level="insufficient_data",
            roll_up_potential=0,
            consolidation_barriers=[],
            synergy_opportunities=[]
        )
    
    def _calculate_fragmentation_score(
        self,
        hhi_index: float,
        business_count: int,
        market_leader_share: float,
        new_entrant_rate: float
    ) -> float:
        """Calculate overall fragmentation score"""
        
        # HHI component (lower HHI = higher fragmentation)
        hhi_score = max(0, 100 - (hhi_index / 100))
        
        # Business count component (more businesses = higher fragmentation)
        count_score = min(100, business_count * 2)
        
        # Market leader component (lower leader share = higher fragmentation)
        leader_score = max(0, 100 - market_leader_share * 2)
        
        # New entrant component (more new entrants = higher fragmentation)
        entrant_score = new_entrant_rate * 100
        
        # Weighted average
        fragmentation_score = (
            hhi_score * 0.4 +
            count_score * 0.3 +
            leader_score * 0.2 +
            entrant_score * 0.1
        )
        
        return min(100, fragmentation_score)
    
    def _identify_consolidation_barriers(
        self,
        businesses: List[NormalizedBusiness],
        market_leader_share: float
    ) -> List[str]:
        """Identify barriers to market consolidation"""
        
        barriers = []
        
        # Strong incumbent
        if market_leader_share > 40:
            barriers.append("Dominant market leader")
        
        # High customer loyalty
        high_rated_count = len([b for b in businesses if b.metrics.rating and b.metrics.rating > 4.5])
        if high_rated_count / len(businesses) > 0.4:
            barriers.append("High customer loyalty across market")
        
        # Geographic dispersion
        unique_zips = len(set(b.address.zip_code for b in businesses if b.address.zip_code))
        if unique_zips > len(businesses) * 0.8:
            barriers.append("Geographic dispersion")
        
        # Family businesses (harder to acquire)
        family_businesses = [b for b in businesses if b.owner and 'family' in str(b.owner.detection_source).lower()]
        if len(family_businesses) / len(businesses) > 0.3:
            barriers.append("High prevalence of family businesses")
        
        return barriers
    
    def _identify_synergy_opportunities(self, businesses: List[NormalizedBusiness]) -> List[str]:
        """Identify potential synergy opportunities"""
        
        synergies = []
        
        # Scale synergies
        if len(businesses) > 10:
            synergies.append("Procurement and vendor consolidation")
            synergies.append("Administrative cost reduction")
        
        # Technology synergies
        low_digital_count = len([
            b for b in businesses 
            if not b.contact.website_valid or (b.metrics.digital_presence_score or 0) < 50
        ])
        if low_digital_count / len(businesses) > 0.5:
            synergies.append("Digital transformation opportunities")
        
        # Operational synergies
        synergies.append("Best practice sharing")
        synergies.append("Cross-selling opportunities")
        
        # Market synergies
        if len(set(b.address.zip_code for b in businesses if b.address.zip_code)) < len(businesses) * 0.6:
            synergies.append("Geographic market consolidation")
        
        return synergies


class MarketClusterer:
    """Identifies and clusters markets for analysis"""
    
    async def identify_market_clusters(
        self,
        location: str,
        industries: Optional[List[str]]
    ) -> List[MarketCluster]:
        """Identify market clusters in a location"""
        
        # Mock implementation - in production, this would query actual business data
        # For now, create sample clusters
        
        clusters = []
        
        # Create a sample cluster for demonstration
        sample_businesses = self._generate_sample_businesses(location, industries)
        
        if sample_businesses:
            cluster = MarketCluster(
                cluster_id=f"cluster_{location}_{int(datetime.now().timestamp())}",
                center_location={'lat': 37.7749, 'lng': -122.4194},  # Sample SF coordinates
                radius_miles=10.0,
                businesses=sample_businesses,
                total_revenue=sum(b.metrics.estimated_revenue or 0 for b in sample_businesses),
                business_density=len(sample_businesses) / 100,  # businesses per sq mile
                avg_business_age=np.mean([b.metrics.years_in_business or 10 for b in sample_businesses]),
                dominant_categories=[industries[0] if industries else 'general']
            )
            clusters.append(cluster)
        
        return clusters
    
    def _generate_sample_businesses(
        self,
        location: str,
        industries: Optional[List[str]]
    ) -> List[NormalizedBusiness]:
        """Generate sample businesses for testing"""
        
        # This is a mock implementation for demonstration
        # In production, this would query the actual database
        
        from ..processors.data_normalizer import (
            NormalizedBusiness, BusinessCategory, ContactInfo, AddressInfo, 
            BusinessMetrics, DataQuality, DataSource, DataProvenance
        )
        
        sample_businesses = []
        
        for i in range(15):  # Generate 15 sample businesses
            business = NormalizedBusiness(
                business_id=f"sample_{i}",
                name=f"Sample Business {i}",
                category=BusinessCategory.HVAC if not industries else BusinessCategory(industries[0]),
                contact=ContactInfo(
                    phone=f"(555) {100+i:03d}-{1000+i:04d}",
                    phone_valid=True,
                    website=f"https://business{i}.com",
                    website_valid=True
                ),
                address=AddressInfo(
                    formatted_address=f"{100+i} Main St, {location}",
                    city=location,
                    zip_code=f"{94000+i}"
                ),
                metrics=BusinessMetrics(
                    rating=3.5 + (i % 3) * 0.5,
                    review_count=20 + i * 5,
                    estimated_revenue=500000 + i * 200000,
                    employee_count=5 + i * 2,
                    years_in_business=5 + i,
                    succession_risk_score=40 + i * 2,
                    market_share_percent=3 + i * 0.5
                ),
                overall_quality=DataQuality.MEDIUM,
                data_sources=[
                    DataProvenance(
                        source=DataSource.GOOGLE_MAPS,
                        extraction_date=datetime.now(),
                        confidence_score=0.8,
                        data_quality=DataQuality.MEDIUM
                    )
                ]
            )
            sample_businesses.append(business)
        
        return sample_businesses


class SynergyCalculator:
    """Calculates potential synergies from business consolidation"""
    
    async def calculate_synergies(
        self,
        businesses: List[NormalizedBusiness],
        strategy: str
    ) -> Dict[str, Any]:
        """Calculate synergies from consolidating businesses"""
        
        if not businesses:
            return {'total_synergies': 0, 'synergy_breakdown': {}}
        
        total_revenue = sum(b.metrics.estimated_revenue or 0 for b in businesses)
        
        # Revenue synergies
        revenue_synergies = self._calculate_revenue_synergies(businesses, strategy)
        
        # Cost synergies
        cost_synergies = self._calculate_cost_synergies(businesses, strategy)
        
        # Operational synergies
        operational_synergies = self._calculate_operational_synergies(businesses, strategy)
        
        total_synergies = revenue_synergies + cost_synergies + operational_synergies
        
        # EBITDA improvement
        current_ebitda = total_revenue * 0.15  # Assume 15% EBITDA margin
        ebitda_improvement = total_synergies
        
        return {
            'total_synergies': total_synergies,
            'ebitda_improvement': ebitda_improvement,
            'synergy_breakdown': {
                'revenue_synergies': revenue_synergies,
                'cost_synergies': cost_synergies,
                'operational_synergies': operational_synergies
            },
            'synergy_percentage': (total_synergies / total_revenue * 100) if total_revenue > 0 else 0
        }
    
    def _calculate_revenue_synergies(
        self,
        businesses: List[NormalizedBusiness],
        strategy: str
    ) -> float:
        """Calculate revenue synergies"""
        
        total_revenue = sum(b.metrics.estimated_revenue or 0 for b in businesses)
        
        # Cross-selling opportunities
        cross_sell_uplift = 0.05 if strategy == "aggressive" else 0.03
        
        # Market position improvement
        market_position_uplift = 0.02
        
        # Pricing power improvement
        pricing_uplift = 0.01
        
        total_uplift = cross_sell_uplift + market_position_uplift + pricing_uplift
        
        return total_revenue * total_uplift
    
    def _calculate_cost_synergies(
        self,
        businesses: List[NormalizedBusiness],
        strategy: str
    ) -> float:
        """Calculate cost synergies"""
        
        total_revenue = sum(b.metrics.estimated_revenue or 0 for b in businesses)
        
        # Administrative cost reduction
        admin_savings = total_revenue * 0.03  # 3% of revenue
        
        # Procurement savings
        procurement_savings = total_revenue * 0.02  # 2% of revenue
        
        # Technology consolidation
        tech_savings = len(businesses) * 10000  # $10k per business
        
        # Facilities consolidation
        facilities_savings = len(businesses) * 5000  # $5k per business
        
        return admin_savings + procurement_savings + tech_savings + facilities_savings
    
    def _calculate_operational_synergies(
        self,
        businesses: List[NormalizedBusiness],
        strategy: str
    ) -> float:
        """Calculate operational synergies"""
        
        # Best practice sharing
        best_practice_value = len(businesses) * 20000  # $20k per business
        
        # Operational efficiency
        efficiency_value = sum(b.metrics.estimated_revenue or 0 for b in businesses) * 0.01
        
        # Quality improvements
        quality_value = len(businesses) * 15000  # $15k per business
        
        return best_practice_value + efficiency_value + quality_value


class RollUpScorer:
    """Scores roll-up opportunities using RAP Index"""
    
    async def calculate_rap_index(
        self,
        cluster: MarketCluster,
        fragmentation_metrics: FragmentationMetrics
    ) -> float:
        """Calculate Roll-up Attractiveness and Potential (RAP) Index"""
        
        # Component scores (0-100)
        
        # Market fragmentation score (40% weight)
        fragmentation_score = fragmentation_metrics.fragmentation_score
        
        # Market size score (25% weight)
        market_size_score = min(100, cluster.total_revenue / 50000000 * 100)  # $50M = 100 points
        
        # Synergy potential score (20% weight)
        synergy_score = len(fragmentation_metrics.synergy_opportunities) * 15  # 15 points per synergy
        synergy_score = min(100, synergy_score)
        
        # Execution feasibility score (15% weight)
        execution_score = 100 - len(fragmentation_metrics.consolidation_barriers) * 20
        execution_score = max(0, execution_score)
        
        # Calculate weighted RAP index
        rap_index = (
            fragmentation_score * 0.40 +
            market_size_score * 0.25 +
            synergy_score * 0.20 +
            execution_score * 0.15
        )
        
        return min(100, rap_index)


# Export main classes
__all__ = [
    'FragmentFinder',
    'RollUpOpportunity',
    'FragmentationMetrics',
    'MarketCluster'
]
