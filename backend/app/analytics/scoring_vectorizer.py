"""
Scoring + Vectorizer - Fourth layer of the architectural diagram

This module implements the analytics and scoring layer:
[Enrichment Engine] → [Scoring + Vectorizer] ← Succession Risk, TAM, Market Clustering, 
                                               Fragmentation, Customer Spend, Potential Customers, 
                                               Growth Potential to Exit

Features:
- Advanced succession risk modeling
- TAM/SAM/SOM calculation with market clustering
- Market fragmentation analysis (HHI Index)
- Customer acquisition and spend analysis
- Growth potential and exit readiness scoring
- Vector embeddings for business similarity matching
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import logging
from enum import Enum
import json

# Machine learning imports
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
import openai

# Internal imports
from ..processors.data_normalizer import NormalizedBusiness, BusinessCategory


class ScoreType(Enum):
    SUCCESSION_RISK = "succession_risk"
    ACQUISITION_ATTRACTIVENESS = "acquisition_attractiveness" 
    MARKET_FRAGMENTATION = "market_fragmentation"
    GROWTH_POTENTIAL = "growth_potential"
    EXIT_READINESS = "exit_readiness"
    LEAD_SCORE = "lead_score"
    TAM_OPPORTUNITY = "tam_opportunity"


@dataclass
class SuccessionRiskFactors:
    """Factors contributing to succession risk analysis"""
    owner_age: float = 0.0
    business_age: float = 0.0
    family_involvement: float = 0.0
    digital_presence: float = 0.0
    financial_performance: float = 0.0
    market_position: float = 0.0
    operational_independence: float = 0.0
    succession_planning: float = 0.0


@dataclass
class TAMAnalysis:
    """Total Addressable Market analysis"""
    tam_estimate: float = 0.0
    sam_estimate: float = 0.0
    som_estimate: float = 0.0
    market_size_confidence: float = 0.0
    growth_rate: float = 0.0
    market_maturity: str = "unknown"
    competitive_density: float = 0.0
    barriers_to_entry: List[str] = field(default_factory=list)


@dataclass
class MarketCluster:
    """Market clustering analysis"""
    cluster_id: int
    cluster_name: str
    businesses_count: int
    avg_revenue: float
    avg_rating: float
    competitive_intensity: float
    growth_opportunity: float
    consolidation_potential: float


@dataclass
class FragmentationAnalysis:
    """Market fragmentation analysis"""
    hhi_index: float  # Herfindahl-Hirschman Index
    fragmentation_level: str  # "highly_fragmented", "moderately_fragmented", "concentrated"
    top4_concentration_ratio: float
    number_of_competitors: int
    market_leader_share: float
    consolidation_opportunity: str
    roll_up_potential: float


@dataclass
class GrowthPotentialAnalysis:
    """Growth potential and exit readiness analysis"""
    organic_growth_score: float = 0.0
    acquisition_growth_score: float = 0.0
    market_expansion_score: float = 0.0
    operational_efficiency_score: float = 0.0
    exit_readiness_score: float = 0.0
    time_to_exit_estimate: Optional[int] = None  # years
    exit_multiple_estimate: Optional[float] = None


@dataclass
class BusinessVector:
    """Vector representation of a business for similarity analysis"""
    business_id: str
    vector: np.ndarray
    metadata: Dict[str, Any]
    timestamp: datetime


class ScoringVectorizer:
    """
    Advanced scoring and vectorization engine for business intelligence
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # ML models for scoring
        self.succession_model = None
        self.tam_model = None
        self.growth_model = None
        
        # Scalers for normalization
        self.feature_scaler = StandardScaler()
        self.score_scaler = MinMaxScaler()
        
        # Vector storage
        self.business_vectors = {}
        self.vector_index = None
        
        # Market intelligence cache
        self.market_cache = {}
        
        # Initialize models
        self._initialize_models()
    
    def analyze_businesses(
        self, 
        businesses: List[NormalizedBusiness],
        analysis_types: List[ScoreType] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Main entry point for business analysis and scoring
        
        Args:
            businesses: List of enriched businesses to analyze
            analysis_types: Types of analysis to perform
            
        Returns:
            Dictionary of analysis results keyed by business ID
        """
        
        if analysis_types is None:
            analysis_types = list(ScoreType)
        
        results = {}
        
        # Convert businesses to feature matrix
        features_df = self._extract_features(businesses)
        
        for business in businesses:
            business_results = {}
            
            # Get business features
            business_features = features_df[features_df.index == business.business_id]
            
            if ScoreType.SUCCESSION_RISK in analysis_types:
                succession_analysis = self._analyze_succession_risk(business, business_features)
                business_results['succession_risk'] = succession_analysis
                
            if ScoreType.TAM_OPPORTUNITY in analysis_types:
                tam_analysis = self._analyze_tam_opportunity(business, businesses)
                business_results['tam_analysis'] = tam_analysis
                
            if ScoreType.MARKET_FRAGMENTATION in analysis_types:
                fragmentation_analysis = self._analyze_market_fragmentation(business, businesses)
                business_results['fragmentation'] = fragmentation_analysis
                
            if ScoreType.GROWTH_POTENTIAL in analysis_types:
                growth_analysis = self._analyze_growth_potential(business, business_features)
                business_results['growth_potential'] = growth_analysis
                
            if ScoreType.ACQUISITION_ATTRACTIVENESS in analysis_types:
                acquisition_score = self._calculate_acquisition_attractiveness(business, business_features)
                business_results['acquisition_attractiveness'] = acquisition_score
                
            if ScoreType.LEAD_SCORE in analysis_types:
                lead_score = self._calculate_comprehensive_lead_score(business, business_features)
                business_results['lead_score'] = lead_score
            
            # Generate business vector for similarity matching
            business_vector = self._generate_business_vector(business, business_features)
            business_results['vector_embedding'] = business_vector
            
            results[business.business_id] = business_results
        
        # Perform market-level clustering analysis
        if ScoreType.MARKET_FRAGMENTATION in analysis_types:
            market_clusters = self._perform_market_clustering(businesses, features_df)
            results['_market_clusters'] = market_clusters
        
        return results
    
    def _extract_features(self, businesses: List[NormalizedBusiness]) -> pd.DataFrame:
        """Extract numerical features from businesses for ML analysis"""
        
        features = []
        
        for business in businesses:
            feature_row = {
                'business_id': business.business_id,
                
                # Basic metrics
                'rating': business.metrics.rating or 0.0,
                'review_count': business.metrics.review_count or 0,
                'estimated_revenue': business.metrics.estimated_revenue or 0,
                'employee_count': business.metrics.employee_count or 0,
                'years_in_business': business.metrics.years_in_business or 0,
                'market_share_percent': business.metrics.market_share_percent or 0.0,
                
                # Owner factors
                'owner_age_estimate': business.metrics.owner_age_estimate or 50,  # Default to 50
                'owner_detected': 1 if business.owner else 0,
                
                # Digital presence
                'has_website': 1 if business.contact.website else 0,
                'website_valid': 1 if business.contact.website_valid else 0,
                'has_email': 1 if business.contact.email else 0,
                'email_valid': 1 if business.contact.email_valid else 0,
                'phone_valid': 1 if business.contact.phone_valid else 0,
                'digital_presence_score': business.metrics.digital_presence_score or 0.0,
                
                # Business category (encoded)
                'category_hvac': 1 if business.category == BusinessCategory.HVAC else 0,
                'category_plumbing': 1 if business.category == BusinessCategory.PLUMBING else 0,
                'category_electrical': 1 if business.category == BusinessCategory.ELECTRICAL else 0,
                'category_restaurant': 1 if business.category == BusinessCategory.RESTAURANT else 0,
                'category_retail': 1 if business.category == BusinessCategory.RETAIL else 0,
                'category_healthcare': 1 if business.category == BusinessCategory.HEALTHCARE else 0,
                'category_other': 1 if business.category in [BusinessCategory.OTHER, BusinessCategory.SERVICES] else 0,
                
                # Location factors
                'has_coordinates': 1 if business.address.coordinates else 0,
                'zip_code_numeric': int(business.address.zip_code[:5]) if business.address.zip_code else 0,
                
                # Data quality
                'data_quality_high': 1 if (getattr(business.overall_quality, 'value', business.overall_quality) == 'high') else 0,
                'data_quality_medium': 1 if (getattr(business.overall_quality, 'value', business.overall_quality) == 'medium') else 0,
                'num_data_sources': len(business.data_sources),
                
                # Enrichment flags
                'enriched_census': 1 if 'enriched_with_census' in business.tags else 0,
                'enriched_irs': 1 if 'enriched_with_irs' in business.tags else 0,
                'enriched_sos': 1 if 'enriched_with_sos' in business.tags else 0,
                'enriched_nlp': 1 if 'enriched_with_nlp' in business.tags else 0,
            }
            
            features.append(feature_row)
        
        df = pd.DataFrame(features)
        df.set_index('business_id', inplace=True)
        
        # Fill missing values
        df.fillna(0, inplace=True)
        
        return df
    
    def _analyze_succession_risk(
        self, 
        business: NormalizedBusiness,
        features: pd.DataFrame
    ) -> Dict[str, Any]:
        """Analyze succession risk using multiple factors"""
        
        # Extract succession risk factors
        factors = SuccessionRiskFactors()
        
        # Owner age factor (higher age = higher risk)
        owner_age = business.metrics.owner_age_estimate or 50
        factors.owner_age = min(100, max(0, (owner_age - 30) * 2))  # 0-100 scale
        
        # Business age factor (very old businesses have higher succession risk)
        business_age = business.metrics.years_in_business or 10
        if business_age > 30:
            factors.business_age = 80
        elif business_age > 20:
            factors.business_age = 60
        elif business_age > 10:
            factors.business_age = 40
        else:
            factors.business_age = 20
        
        # Digital presence factor (lower presence = higher risk)
        digital_score = business.metrics.digital_presence_score or 0
        factors.digital_presence = max(0, 100 - digital_score)
        
        # Financial performance factor
        rating = business.metrics.rating or 3.0
        factors.financial_performance = max(0, (5.0 - rating) * 20)
        
        # Market position factor
        market_share = business.metrics.market_share_percent or 5.0
        factors.market_position = max(0, 100 - (market_share * 4))
        
        # Family involvement (if owner detected through family-related sources)
        factors.family_involvement = 70 if business.owner and 'family' in str(business.owner.detection_source).lower() else 30
        
        # Operational independence (estimated from business size)
        employee_count = business.metrics.employee_count or 10
        if employee_count < 5:
            factors.operational_independence = 80  # Very dependent on owner
        elif employee_count < 15:
            factors.operational_independence = 60
        elif employee_count < 30:
            factors.operational_independence = 40
        else:
            factors.operational_independence = 20
        
        # Succession planning (estimated from NLP if available)
        succession_planning_score = 50  # Default
        if 'enriched_with_nlp' in business.tags:
            # Check for succession-related signals in enrichment data
            for source in business.data_sources:
                if 'succession_signals' in source.raw_data:
                    signals = source.raw_data['succession_signals']
                    if isinstance(signals, list) and len(signals) > 0:
                        succession_planning_score = 30  # Lower score if succession signals present
        factors.succession_planning = succession_planning_score
        
        # Calculate weighted succession risk score
        weights = {
            'owner_age': 0.25,
            'business_age': 0.15,
            'family_involvement': 0.15,
            'digital_presence': 0.10,
            'financial_performance': 0.10,
            'market_position': 0.05,
            'operational_independence': 0.15,
            'succession_planning': 0.05
        }
        
        weighted_score = sum(
            getattr(factors, factor) * weight 
            for factor, weight in weights.items()
        )
        
        # Normalize to 0-100 scale
        succession_risk_score = min(100, max(0, weighted_score))
        
        return {
            'succession_risk_score': succession_risk_score,
            'risk_level': self._categorize_risk_level(succession_risk_score),
            'factors': {
                'owner_age': factors.owner_age,
                'business_age': factors.business_age,
                'family_involvement': factors.family_involvement,
                'digital_presence': factors.digital_presence,
                'financial_performance': factors.financial_performance,
                'market_position': factors.market_position,
                'operational_independence': factors.operational_independence,
                'succession_planning': factors.succession_planning
            },
            'recommendations': self._generate_succession_recommendations(factors),
            'confidence_score': self._calculate_succession_confidence(business)
        }
    
    def _analyze_tam_opportunity(
        self, 
        business: NormalizedBusiness,
        all_businesses: List[NormalizedBusiness]
    ) -> TAMAnalysis:
        """Analyze Total Addressable Market opportunity"""
        
        # Filter businesses in same category and location
        same_category = [
            b for b in all_businesses 
            if b.category == business.category and b.address.zip_code == business.address.zip_code
        ]
        
        # Calculate market size estimates
        total_revenue = sum(b.metrics.estimated_revenue or 0 for b in same_category)
        business_count = len(same_category)
        avg_revenue = total_revenue / business_count if business_count > 0 else 0
        
        # TAM estimation (total market if all businesses were accessible)
        tam_multiplier = self._get_tam_multiplier(business.category)
        tam_estimate = total_revenue * tam_multiplier
        
        # SAM estimation (serviceable addressable market - ~60% of TAM)
        sam_estimate = tam_estimate * 0.6
        
        # SOM estimation (serviceable obtainable market - realistic capture)
        market_share = business.metrics.market_share_percent or 5.0
        som_estimate = sam_estimate * (market_share / 100.0)
        
        # Market size confidence based on data quality
        confidence = 0.8 if business_count >= 5 else 0.6
        
        # Growth rate estimation
        growth_rate = self._estimate_market_growth_rate(business.category)
        
        # Market maturity assessment
        avg_business_age = np.mean([b.metrics.years_in_business or 10 for b in same_category])
        if avg_business_age > 20:
            maturity = "mature"
        elif avg_business_age > 10:
            maturity = "developing"
        else:
            maturity = "emerging"
        
        # Competitive density
        competitive_density = business_count / (tam_estimate / 1000000) if tam_estimate > 0 else 0
        
        # Barriers to entry
        barriers = self._identify_barriers_to_entry(business.category, same_category)
        
        return TAMAnalysis(
            tam_estimate=tam_estimate,
            sam_estimate=sam_estimate,
            som_estimate=som_estimate,
            market_size_confidence=confidence,
            growth_rate=growth_rate,
            market_maturity=maturity,
            competitive_density=competitive_density,
            barriers_to_entry=barriers
        )
    
    def _analyze_market_fragmentation(
        self, 
        business: NormalizedBusiness,
        all_businesses: List[NormalizedBusiness]
    ) -> FragmentationAnalysis:
        """Analyze market fragmentation using HHI and concentration ratios"""
        
        # Filter businesses in same market
        same_market = [
            b for b in all_businesses 
            if b.category == business.category and 
               b.address.zip_code and business.address.zip_code and
               b.address.zip_code[:3] == business.address.zip_code[:3]  # Same area
        ]
        
        if len(same_market) < 2:
            return FragmentationAnalysis(
                hhi_index=0.0,
                fragmentation_level="insufficient_data",
                top4_concentration_ratio=0.0,
                number_of_competitors=len(same_market),
                market_leader_share=0.0,
                consolidation_opportunity="unknown",
                roll_up_potential=0.0
            )
        
        # Calculate market shares
        total_revenue = sum(b.metrics.estimated_revenue or 0 for b in same_market)
        market_shares = []
        
        for b in same_market:
            revenue = b.metrics.estimated_revenue or 0
            share = (revenue / total_revenue * 100) if total_revenue > 0 else 0
            market_shares.append(share)
        
        # Sort market shares in descending order
        market_shares.sort(reverse=True)
        
        # Calculate HHI (Herfindahl-Hirschman Index)
        hhi = sum(share ** 2 for share in market_shares)
        
        # Determine fragmentation level
        if hhi < 1500:
            fragmentation_level = "highly_fragmented"
            consolidation_opportunity = "excellent"
            roll_up_potential = 0.9
        elif hhi < 2500:
            fragmentation_level = "moderately_fragmented"
            consolidation_opportunity = "good"
            roll_up_potential = 0.7
        else:
            fragmentation_level = "concentrated"
            consolidation_opportunity = "limited"
            roll_up_potential = 0.3
        
        # Top 4 concentration ratio
        top4_ratio = sum(market_shares[:4]) if len(market_shares) >= 4 else sum(market_shares)
        
        # Market leader share
        market_leader_share = market_shares[0] if market_shares else 0.0
        
        return FragmentationAnalysis(
            hhi_index=hhi,
            fragmentation_level=fragmentation_level,
            top4_concentration_ratio=top4_ratio,
            number_of_competitors=len(same_market),
            market_leader_share=market_leader_share,
            consolidation_opportunity=consolidation_opportunity,
            roll_up_potential=roll_up_potential
        )
    
    def _analyze_growth_potential(
        self, 
        business: NormalizedBusiness,
        features: pd.DataFrame
    ) -> GrowthPotentialAnalysis:
        """Analyze growth potential and exit readiness"""
        
        # Organic growth score
        organic_factors = []
        
        # Market position factor
        rating = business.metrics.rating or 3.0
        organic_factors.append(rating / 5.0 * 100)
        
        # Digital presence factor
        digital_score = business.metrics.digital_presence_score or 50
        organic_factors.append(digital_score)
        
        # Market share factor
        market_share = business.metrics.market_share_percent or 5.0
        organic_factors.append(min(100, market_share * 5))
        
        organic_growth_score = np.mean(organic_factors)
        
        # Acquisition growth score (scalability for acquiring others)
        acquisition_factors = []
        
        # Financial capacity
        revenue = business.metrics.estimated_revenue or 0
        if revenue > 5000000:
            acquisition_factors.append(90)
        elif revenue > 2000000:
            acquisition_factors.append(70)
        elif revenue > 1000000:
            acquisition_factors.append(50)
        else:
            acquisition_factors.append(30)
        
        # Operational maturity
        employee_count = business.metrics.employee_count or 0
        if employee_count > 30:
            acquisition_factors.append(80)
        elif employee_count > 15:
            acquisition_factors.append(60)
        else:
            acquisition_factors.append(40)
        
        acquisition_growth_score = np.mean(acquisition_factors)
        
        # Market expansion score
        expansion_factors = []
        
        # Category attractiveness
        category_growth_potential = {
            BusinessCategory.HVAC: 75,
            BusinessCategory.HEALTHCARE: 85,
            BusinessCategory.RETAIL: 60,
            BusinessCategory.RESTAURANT: 50,
            BusinessCategory.CONSTRUCTION: 70,
            BusinessCategory.SERVICES: 65
        }
        expansion_factors.append(category_growth_potential.get(business.category, 60))
        
        # Geographic expansion potential
        if business.address.coordinates:
            expansion_factors.append(70)  # Can expand geographically
        else:
            expansion_factors.append(50)
        
        market_expansion_score = np.mean(expansion_factors)
        
        # Operational efficiency score
        efficiency_factors = []
        
        # Revenue per employee
        revenue_per_employee = (business.metrics.estimated_revenue or 0) / max(1, business.metrics.employee_count or 1)
        if revenue_per_employee > 200000:
            efficiency_factors.append(90)
        elif revenue_per_employee > 100000:
            efficiency_factors.append(70)
        else:
            efficiency_factors.append(50)
        
        # Years in business (experience factor)
        years = business.metrics.years_in_business or 0
        if years > 15:
            efficiency_factors.append(80)
        elif years > 10:
            efficiency_factors.append(70)
        else:
            efficiency_factors.append(60)
        
        operational_efficiency_score = np.mean(efficiency_factors)
        
        # Exit readiness score
        exit_factors = []
        
        # Business independence from owner
        if business.metrics.employee_count and business.metrics.employee_count > 20:
            exit_factors.append(80)
        else:
            exit_factors.append(50)
        
        # Financial performance
        exit_factors.append((business.metrics.rating or 3.0) / 5.0 * 100)
        
        # Market position
        exit_factors.append(min(100, (business.metrics.market_share_percent or 5) * 4))
        
        exit_readiness_score = np.mean(exit_factors)
        
        # Time to exit estimate (years)
        if exit_readiness_score > 80:
            time_to_exit = 1
        elif exit_readiness_score > 60:
            time_to_exit = 2
        elif exit_readiness_score > 40:
            time_to_exit = 3
        else:
            time_to_exit = 5
        
        # Exit multiple estimate
        industry_multiples = {
            BusinessCategory.HVAC: 3.5,
            BusinessCategory.HEALTHCARE: 4.5,
            BusinessCategory.RETAIL: 2.5,
            BusinessCategory.RESTAURANT: 2.0,
            BusinessCategory.CONSTRUCTION: 3.0,
            BusinessCategory.SERVICES: 3.2
        }
        
        base_multiple = industry_multiples.get(business.category, 3.0)
        
        # Adjust multiple based on business quality
        quality_multiplier = 1.0
        if business.metrics.rating and business.metrics.rating > 4.5:
            quality_multiplier = 1.3
        elif business.metrics.rating and business.metrics.rating > 4.0:
            quality_multiplier = 1.1
        
        exit_multiple = base_multiple * quality_multiplier
        
        return GrowthPotentialAnalysis(
            organic_growth_score=organic_growth_score,
            acquisition_growth_score=acquisition_growth_score,
            market_expansion_score=market_expansion_score,
            operational_efficiency_score=operational_efficiency_score,
            exit_readiness_score=exit_readiness_score,
            time_to_exit_estimate=time_to_exit,
            exit_multiple_estimate=exit_multiple
        )
    
    def _calculate_acquisition_attractiveness(
        self, 
        business: NormalizedBusiness,
        features: pd.DataFrame
    ) -> Dict[str, Any]:
        """Calculate overall acquisition attractiveness score"""
        
        scores = {}
        
        # Financial attractiveness
        revenue = business.metrics.estimated_revenue or 0
        if revenue > 0:
            if revenue > 5000000:
                scores['financial'] = 95
            elif revenue > 2000000:
                scores['financial'] = 85
            elif revenue > 1000000:
                scores['financial'] = 75
            elif revenue > 500000:
                scores['financial'] = 65
            else:
                scores['financial'] = 50
        else:
            scores['financial'] = 30
        
        # Strategic attractiveness
        rating = business.metrics.rating or 3.0
        market_share = business.metrics.market_share_percent or 5.0
        scores['strategic'] = min(100, (rating / 5.0 * 50) + (market_share * 2))
        
        # Operational attractiveness
        employee_count = business.metrics.employee_count or 0
        years_in_business = business.metrics.years_in_business or 0
        scores['operational'] = min(100, (employee_count * 2) + (years_in_business * 1.5))
        
        # Risk factors
        succession_risk = business.metrics.succession_risk_score or 50
        scores['risk_adjusted'] = max(0, 100 - (succession_risk * 0.5))
        
        # Overall score (weighted average)
        weights = {
            'financial': 0.3,
            'strategic': 0.25,
            'operational': 0.25,
            'risk_adjusted': 0.2
        }
        
        overall_score = sum(scores[factor] * weight for factor, weight in weights.items())
        
        # Categorize attractiveness
        if overall_score >= 80:
            attractiveness_level = "highly_attractive"
        elif overall_score >= 60:
            attractiveness_level = "moderately_attractive"
        elif overall_score >= 40:
            attractiveness_level = "somewhat_attractive"
        else:
            attractiveness_level = "not_attractive"
        
        return {
            'overall_score': overall_score,
            'attractiveness_level': attractiveness_level,
            'component_scores': scores,
            'investment_recommendation': self._generate_investment_recommendation(overall_score),
            'key_strengths': self._identify_key_strengths(business),
            'key_concerns': self._identify_key_concerns(business)
        }
    
    def _calculate_comprehensive_lead_score(
        self, 
        business: NormalizedBusiness,
        features: pd.DataFrame
    ) -> Dict[str, Any]:
        """Calculate comprehensive lead score combining all factors"""
        
        component_scores = {}
        
        # Contact quality score
        contact_score = 0
        if business.contact.phone_valid:
            contact_score += 25
        if business.contact.email_valid:
            contact_score += 25
        if business.contact.website_valid:
            contact_score += 20
        component_scores['contact_quality'] = contact_score
        
        # Business quality score
        quality_factors = []
        if business.metrics.rating:
            quality_factors.append(business.metrics.rating / 5.0 * 100)
        if business.metrics.review_count:
            quality_factors.append(min(100, business.metrics.review_count / 2))
        component_scores['business_quality'] = np.mean(quality_factors) if quality_factors else 50
        
        # Financial opportunity score
        revenue = business.metrics.estimated_revenue or 0
        if revenue > 2000000:
            component_scores['financial_opportunity'] = 90
        elif revenue > 1000000:
            component_scores['financial_opportunity'] = 75
        elif revenue > 500000:
            component_scores['financial_opportunity'] = 60
        else:
            component_scores['financial_opportunity'] = 40
        
        # Succession opportunity score
        succession_risk = business.metrics.succession_risk_score or 50
        component_scores['succession_opportunity'] = succession_risk
        
        # Data completeness score
        data_completeness = len([v for v in [
            business.contact.phone,
            business.contact.email,
            business.contact.website,
            business.metrics.rating,
            business.metrics.estimated_revenue,
            business.address.formatted_address
        ] if v]) / 6 * 100
        component_scores['data_completeness'] = data_completeness
        
        # Calculate weighted lead score
        weights = {
            'contact_quality': 0.25,
            'business_quality': 0.20,
            'financial_opportunity': 0.25,
            'succession_opportunity': 0.20,
            'data_completeness': 0.10
        }
        
        overall_lead_score = sum(
            component_scores[factor] * weight 
            for factor, weight in weights.items()
        )
        
        # Categorize lead quality
        if overall_lead_score >= 80:
            lead_grade = "A"
            priority = "high"
        elif overall_lead_score >= 65:
            lead_grade = "B"
            priority = "medium"
        elif overall_lead_score >= 50:
            lead_grade = "C"
            priority = "low"
        else:
            lead_grade = "D"
            priority = "very_low"
        
        return {
            'overall_score': overall_lead_score,
            'lead_grade': lead_grade,
            'priority': priority,
            'component_scores': component_scores,
            'follow_up_recommendations': self._generate_follow_up_recommendations(business),
            'estimated_close_probability': self._estimate_close_probability(overall_lead_score)
        }
    
    def _generate_business_vector(
        self, 
        business: NormalizedBusiness,
        features: pd.DataFrame
    ) -> BusinessVector:
        """Generate vector embedding for business similarity matching"""
        
        # Extract numerical features for vectorization
        feature_vector = []
        
        # Core business metrics
        feature_vector.extend([
            business.metrics.rating or 3.0,
            np.log1p(business.metrics.review_count or 0),
            np.log1p(business.metrics.estimated_revenue or 0),
            business.metrics.employee_count or 0,
            business.metrics.years_in_business or 0,
            business.metrics.market_share_percent or 0,
            business.metrics.owner_age_estimate or 50,
            business.metrics.succession_risk_score or 50,
        ])
        
        # Digital presence features
        feature_vector.extend([
            1 if business.contact.website_valid else 0,
            1 if business.contact.email_valid else 0,
            1 if business.contact.phone_valid else 0,
            business.metrics.digital_presence_score or 0,
        ])
        
        # Category encoding (one-hot)
        categories = list(BusinessCategory)
        category_vector = [1 if business.category == cat else 0 for cat in categories]
        feature_vector.extend(category_vector)
        
        # Data quality features
        quality_value = getattr(business.overall_quality, 'value', business.overall_quality)
        feature_vector.extend([
            1 if quality_value == 'high' else 0,
            len(business.data_sources),
            len(business.tags),
        ])
        
        # Convert to numpy array and normalize
        vector = np.array(feature_vector, dtype=np.float32)
        vector = vector / np.linalg.norm(vector) if np.linalg.norm(vector) > 0 else vector
        
        metadata = {
            'business_name': business.name,
            'category': getattr(business.category, 'value', business.category),
            'location': business.address.formatted_address or '',
            'revenue': business.metrics.estimated_revenue or 0,
            'rating': business.metrics.rating or 0.0
        }
        
        return BusinessVector(
            business_id=business.business_id,
            vector=vector,
            metadata=metadata,
            timestamp=datetime.now()
        )
    
    def _perform_market_clustering(
        self, 
        businesses: List[NormalizedBusiness],
        features_df: pd.DataFrame
    ) -> List[MarketCluster]:
        """Perform market clustering analysis"""
        
        if len(businesses) < 5:
            return []
        
        # Select features for clustering
        clustering_features = [
            'rating', 'estimated_revenue', 'employee_count', 
            'years_in_business', 'market_share_percent'
        ]
        
        # Prepare data for clustering
        cluster_data = features_df[clustering_features].fillna(0)
        
        # Normalize features
        scaler = StandardScaler()
        normalized_data = scaler.fit_transform(cluster_data)
        
        # Perform K-means clustering
        n_clusters = min(5, len(businesses) // 3)  # Reasonable number of clusters
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(normalized_data)
        
        # Analyze clusters
        clusters = []
        
        for cluster_id in range(n_clusters):
            cluster_mask = cluster_labels == cluster_id
            cluster_businesses = [b for i, b in enumerate(businesses) if cluster_mask[i]]
            
            if not cluster_businesses:
                continue
            
            # Calculate cluster statistics
            revenues = [b.metrics.estimated_revenue or 0 for b in cluster_businesses]
            ratings = [b.metrics.rating or 0 for b in cluster_businesses]
            
            avg_revenue = np.mean(revenues)
            avg_rating = np.mean(ratings)
            
            # Determine cluster characteristics
            if avg_revenue > 2000000:
                if avg_rating > 4.0:
                    cluster_name = "Premium Market Leaders"
                else:
                    cluster_name = "Large Revenue Players"
            elif avg_revenue > 1000000:
                cluster_name = "Mid-Market Competitors"
            else:
                cluster_name = "Small Local Businesses"
            
            # Calculate competitive intensity
            revenue_std = np.std(revenues)
            competitive_intensity = revenue_std / (avg_revenue + 1)  # Normalized variance
            
            # Growth opportunity (inverse of maturity)
            avg_age = np.mean([b.metrics.years_in_business or 10 for b in cluster_businesses])
            growth_opportunity = max(0, 1 - (avg_age / 30))
            
            # Consolidation potential
            market_shares = [b.metrics.market_share_percent or 5 for b in cluster_businesses]
            max_market_share = max(market_shares)
            consolidation_potential = 1 - (max_market_share / 100)
            
            cluster = MarketCluster(
                cluster_id=cluster_id,
                cluster_name=cluster_name,
                businesses_count=len(cluster_businesses),
                avg_revenue=avg_revenue,
                avg_rating=avg_rating,
                competitive_intensity=competitive_intensity,
                growth_opportunity=growth_opportunity,
                consolidation_potential=consolidation_potential
            )
            
            clusters.append(cluster)
        
        return clusters
    
    def _initialize_models(self):
        """Initialize ML models for scoring"""
        # This would initialize pre-trained models
        # For now, we'll use rule-based scoring
        pass
    
    def _get_tam_multiplier(self, category: BusinessCategory) -> float:
        """Get TAM multiplier for business category"""
        multipliers = {
            BusinessCategory.HVAC: 1.8,
            BusinessCategory.PLUMBING: 1.6,
            BusinessCategory.ELECTRICAL: 1.7,
            BusinessCategory.RESTAURANT: 2.0,
            BusinessCategory.RETAIL: 1.5,
            BusinessCategory.HEALTHCARE: 2.2,
            BusinessCategory.AUTOMOTIVE: 1.9,
            BusinessCategory.CONSTRUCTION: 2.1,
            BusinessCategory.SERVICES: 1.4
        }
        return multipliers.get(category, 1.5)
    
    def _estimate_market_growth_rate(self, category: BusinessCategory) -> float:
        """Estimate market growth rate for category"""
        growth_rates = {
            BusinessCategory.HVAC: 0.06,
            BusinessCategory.HEALTHCARE: 0.08,
            BusinessCategory.RETAIL: 0.03,
            BusinessCategory.RESTAURANT: 0.04,
            BusinessCategory.CONSTRUCTION: 0.05,
            BusinessCategory.SERVICES: 0.07
        }
        return growth_rates.get(category, 0.05)
    
    def _identify_barriers_to_entry(
        self, 
        category: BusinessCategory, 
        businesses: List[NormalizedBusiness]
    ) -> List[str]:
        """Identify barriers to entry for market"""
        barriers = []
        
        # Category-specific barriers
        category_barriers = {
            BusinessCategory.HVAC: ["Licensing requirements", "Equipment investment", "Technical expertise"],
            BusinessCategory.HEALTHCARE: ["Regulatory compliance", "Professional licensing", "Insurance requirements"],
            BusinessCategory.RESTAURANT: ["Health permits", "Location requirements", "Food safety regulations"],
            BusinessCategory.CONSTRUCTION: ["Licensing", "Bonding requirements", "Safety certifications"]
        }
        
        barriers.extend(category_barriers.get(category, ["General business licensing"]))
        
        # Market-specific barriers
        avg_revenue = np.mean([b.metrics.estimated_revenue or 0 for b in businesses])
        if avg_revenue > 2000000:
            barriers.append("High capital requirements")
        
        avg_rating = np.mean([b.metrics.rating or 0 for b in businesses])
        if avg_rating > 4.3:
            barriers.append("High service quality expectations")
        
        return barriers
    
    def _categorize_risk_level(self, risk_score: float) -> str:
        """Categorize succession risk level"""
        if risk_score >= 80:
            return "very_high"
        elif risk_score >= 65:
            return "high"
        elif risk_score >= 50:
            return "medium"
        elif risk_score >= 35:
            return "low"
        else:
            return "very_low"
    
    def _generate_succession_recommendations(self, factors: SuccessionRiskFactors) -> List[str]:
        """Generate succession risk mitigation recommendations"""
        recommendations = []
        
        if factors.owner_age > 70:
            recommendations.append("Immediate succession planning required")
        elif factors.owner_age > 60:
            recommendations.append("Begin succession planning process")
        
        if factors.digital_presence > 60:
            recommendations.append("Modernize digital presence and systems")
        
        if factors.operational_independence > 70:
            recommendations.append("Reduce owner dependency through process documentation")
        
        if factors.succession_planning > 60:
            recommendations.append("Develop formal succession plan")
        
        return recommendations
    
    def _calculate_succession_confidence(self, business: NormalizedBusiness) -> float:
        """Calculate confidence in succession risk assessment"""
        confidence = 0.5  # Base confidence
        
        if business.owner:
            confidence += 0.2
        if business.metrics.years_in_business:
            confidence += 0.1
        if 'enriched_with_nlp' in business.tags:
            confidence += 0.1
        if getattr(business.overall_quality, 'value', business.overall_quality) == 'high':
            confidence += 0.1
        
        return min(1.0, confidence)
    
    def _generate_investment_recommendation(self, score: float) -> str:
        """Generate investment recommendation based on score"""
        if score >= 80:
            return "Strong Buy - Highly attractive acquisition target"
        elif score >= 60:
            return "Buy - Good acquisition opportunity"
        elif score >= 40:
            return "Hold - Monitor for improvements"
        else:
            return "Pass - Not recommended for acquisition"
    
    def _identify_key_strengths(self, business: NormalizedBusiness) -> List[str]:
        """Identify key business strengths"""
        strengths = []
        
        if business.metrics.rating and business.metrics.rating >= 4.5:
            strengths.append("Excellent customer satisfaction")
        if business.metrics.years_in_business and business.metrics.years_in_business >= 20:
            strengths.append("Established market presence")
        if business.metrics.estimated_revenue and business.metrics.estimated_revenue >= 2000000:
            strengths.append("Strong revenue base")
        if business.contact.website_valid:
            strengths.append("Digital presence established")
        
        return strengths
    
    def _identify_key_concerns(self, business: NormalizedBusiness) -> List[str]:
        """Identify key business concerns"""
        concerns = []
        
        if business.metrics.rating and business.metrics.rating < 3.5:
            concerns.append("Below average customer satisfaction")
        if business.metrics.succession_risk_score and business.metrics.succession_risk_score > 75:
            concerns.append("High succession risk")
        if not business.contact.website_valid:
            concerns.append("Limited digital presence")
        if getattr(business.overall_quality, 'value', business.overall_quality) == 'poor':
            concerns.append("Insufficient business data")
        
        return concerns
    
    def _generate_follow_up_recommendations(self, business: NormalizedBusiness) -> List[str]:
        """Generate follow-up recommendations for leads"""
        recommendations = []
        
        if business.metrics.succession_risk_score and business.metrics.succession_risk_score > 70:
            recommendations.append("Prioritize outreach - high succession risk detected")
        if business.metrics.estimated_revenue and business.metrics.estimated_revenue > 2000000:
            recommendations.append("Schedule in-person meeting - high value target")
        if not business.contact.email_valid:
            recommendations.append("Focus on phone outreach - no valid email")
        
        return recommendations
    
    def _estimate_close_probability(self, lead_score: float) -> float:
        """Estimate probability of closing the lead"""
        # Simple mapping of lead score to close probability
        return min(0.95, max(0.05, lead_score / 100 * 0.6))


# Export main classes
__all__ = [
    'ScoringVectorizer',
    'ScoreType',
    'SuccessionRiskFactors',
    'TAMAnalysis',
    'MarketCluster',
    'FragmentationAnalysis',
    'GrowthPotentialAnalysis',
    'BusinessVector'
]
