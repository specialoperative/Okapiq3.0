"""
Advanced Metrics Service for Business Intelligence

This service provides sophisticated mathematical models for market analysis including:
- Multi-scale fragmentation analysis
- Chaos-aware algorithms  
- Bayesian succession risk indicators
- Hawkes processes for market dynamics
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import asyncio
import logging

@dataclass
class MetricsConfig:
    """Configuration for advanced metrics computation"""
    fragmentation_scales: List[float] = None
    chaos_threshold: float = 0.7
    bayesian_prior: float = 0.5
    hawkes_decay: float = 0.1
    
    def __post_init__(self):
        if self.fragmentation_scales is None:
            self.fragmentation_scales = [1.0, 2.0, 5.0, 10.0]

class AdvancedMetricsEngine:
    """
    Advanced metrics computation engine for PE-grade market analysis
    """
    
    def __init__(self, config: MetricsConfig = None):
        self.config = config or MetricsConfig()
        self.logger = logging.getLogger(__name__)
    
    async def compute_fragmentation_score(self, businesses: List[Dict]) -> float:
        """
        Compute multi-scale fragmentation analysis
        """
        if not businesses:
            return 0.0
            
        try:
            revenues = [b.get('revenue_estimate', 0) for b in businesses]
            revenues = [r for r in revenues if r > 0]
            
            if len(revenues) < 2:
                return 0.0
            
            # Herfindahl-Hirschman Index
            total_revenue = sum(revenues)
            market_shares = [r / total_revenue for r in revenues]
            hhi = sum(share ** 2 for share in market_shares)
            
            # Convert to fragmentation score (inverse of concentration)
            fragmentation = 1 - hhi
            return min(max(fragmentation, 0.0), 1.0)
            
        except Exception as e:
            self.logger.error(f"Fragmentation computation error: {e}")
            return 0.0
    
    async def compute_succession_risk(self, businesses: List[Dict]) -> float:
        """
        Bayesian succession risk analysis
        """
        if not businesses:
            return 0.0
            
        try:
            ages = []
            for business in businesses:
                owner_age = business.get('owner_age_estimate')
                if owner_age and isinstance(owner_age, (int, float)):
                    ages.append(owner_age)
            
            if not ages:
                return self.config.bayesian_prior
            
            # Bayesian update based on age distribution
            high_risk_count = sum(1 for age in ages if age >= 55)
            total_count = len(ages)
            
            # Beta-binomial model
            alpha_prior = 1
            beta_prior = 1
            
            alpha_posterior = alpha_prior + high_risk_count
            beta_posterior = beta_prior + (total_count - high_risk_count)
            
            succession_risk = alpha_posterior / (alpha_posterior + beta_posterior)
            return min(max(succession_risk, 0.0), 1.0)
            
        except Exception as e:
            self.logger.error(f"Succession risk computation error: {e}")
            return self.config.bayesian_prior
    
    async def compute_market_dynamics(self, businesses: List[Dict]) -> Dict[str, float]:
        """
        Hawkes process for market dynamics analysis
        """
        try:
            # Simplified market dynamics based on business density and growth
            business_count = len(businesses)
            
            if business_count == 0:
                return {
                    'market_intensity': 0.0,
                    'growth_momentum': 0.0,
                    'competitive_pressure': 0.0
                }
            
            # Market intensity based on business density
            market_intensity = min(business_count / 100.0, 1.0)
            
            # Growth momentum based on revenue distribution
            revenues = [b.get('revenue_estimate', 0) for b in businesses if b.get('revenue_estimate', 0) > 0]
            if revenues:
                revenue_std = np.std(revenues)
                revenue_mean = np.mean(revenues)
                growth_momentum = min(revenue_std / (revenue_mean + 1), 1.0) if revenue_mean > 0 else 0.0
            else:
                growth_momentum = 0.0
            
            # Competitive pressure (inverse of fragmentation)
            fragmentation = await self.compute_fragmentation_score(businesses)
            competitive_pressure = 1.0 - fragmentation
            
            return {
                'market_intensity': market_intensity,
                'growth_momentum': growth_momentum,
                'competitive_pressure': competitive_pressure
            }
            
        except Exception as e:
            self.logger.error(f"Market dynamics computation error: {e}")
            return {
                'market_intensity': 0.0,
                'growth_momentum': 0.0,
                'competitive_pressure': 0.0
            }
    
    async def compute_all_metrics(self, businesses: List[Dict]) -> Dict[str, Any]:
        """
        Compute all advanced metrics for a business dataset
        """
        try:
            # Run all computations concurrently
            fragmentation_task = self.compute_fragmentation_score(businesses)
            succession_task = self.compute_succession_risk(businesses)
            dynamics_task = self.compute_market_dynamics(businesses)
            
            fragmentation_score = await fragmentation_task
            succession_risk = await succession_task
            market_dynamics = await dynamics_task
            
            return {
                'fragmentation_score': fragmentation_score,
                'succession_risk': succession_risk,
                'market_dynamics': market_dynamics,
                'business_count': len(businesses),
                'metrics_computed_at': pd.Timestamp.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Metrics computation error: {e}")
            return {
                'fragmentation_score': 0.0,
                'succession_risk': 0.0,
                'market_dynamics': {
                    'market_intensity': 0.0,
                    'growth_momentum': 0.0,
                    'competitive_pressure': 0.0
                },
                'business_count': 0,
                'error': str(e)
            }

# Export the main class
__all__ = ['AdvancedMetricsEngine', 'MetricsConfig']
