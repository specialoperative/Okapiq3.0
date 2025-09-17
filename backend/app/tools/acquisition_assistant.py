"""
Acquisition Assistant (Double A) - Deal pipeline management tool

As described in the requirements:
"A deal-flow and transaction management tool that streamlines the day-to-day acquisition 
process once targets have been identified. While Oppy and Fragment Finder focus on where 
to expand or which markets to roll up, Acquisition Assistant helps you operationalize 
the actual deal-making, from initial outreach to closing."

Features:
- Pipeline Organizer: Central hub for all potential leads from Oppy, Fragment Finder, broker lists
- Communication & Scheduling: Integrates with email/CRM to track communications and schedule calls
- Deal Structuring & Analysis: Quick IRR/synergy snapshots and negotiation scoreboard
- Document Management: Tracks status, NDAs, LOIs, financial statements, legal records
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import logging

import pandas as pd
import numpy as np

# Internal imports
from ..processors.data_normalizer import NormalizedBusiness


class DealStage(Enum):
    RESEARCH = "research"
    INITIAL_CONTACT = "initial_contact"
    QUALIFIED = "qualified"
    NDA_SIGNED = "nda_signed"
    INITIAL_OFFER = "initial_offer"
    LOI_SUBMITTED = "loi_submitted"
    DUE_DILIGENCE = "due_diligence"
    FINAL_NEGOTIATION = "final_negotiation"
    CLOSING = "closing"
    CLOSED = "closed"
    DEAD = "dead"


class DealPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class CommunicationType(Enum):
    EMAIL = "email"
    PHONE = "phone"
    MEETING = "meeting"
    DOCUMENT = "document"
    NOTE = "note"


@dataclass
class DealContact:
    """Contact information for a deal"""
    name: str
    title: str
    email: Optional[str] = None
    phone: Optional[str] = None
    is_primary: bool = False
    notes: str = ""


@dataclass
class DealCommunication:
    """Communication record for a deal"""
    communication_id: str
    deal_id: str
    type: CommunicationType
    subject: str
    content: str
    participants: List[str]
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    created_by: str = "system"
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class DealDocument:
    """Document associated with a deal"""
    document_id: str
    deal_id: str
    document_type: str  # "nda", "loi", "financial_statement", "legal_document", "other"
    filename: str
    file_path: Optional[str] = None
    description: str = ""
    uploaded_by: str = "system"
    uploaded_at: datetime = field(default_factory=datetime.now)
    requires_review: bool = False
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None


@dataclass
class DealFinancials:
    """Financial information for a deal"""
    deal_id: str
    
    # Current business financials
    annual_revenue: Optional[float] = None
    ebitda: Optional[float] = None
    ebitda_margin: Optional[float] = None
    growth_rate: Optional[float] = None
    
    # Deal structure
    asking_price: Optional[float] = None
    proposed_price: Optional[float] = None
    deal_structure: str = "asset_purchase"  # "asset_purchase", "stock_purchase", "merger"
    
    # Financing
    cash_component: Optional[float] = None
    debt_component: Optional[float] = None
    earnout_component: Optional[float] = None
    
    # Analysis
    purchase_multiple: Optional[float] = None
    projected_irr: Optional[float] = None
    payback_period: Optional[int] = None  # months
    
    # Synergies
    estimated_synergies: Optional[float] = None
    synergy_sources: List[str] = field(default_factory=list)


@dataclass
class DealRecord:
    """Complete deal record in the pipeline"""
    deal_id: str
    business_name: str
    business_id: Optional[str] = None  # Reference to NormalizedBusiness
    
    # Deal status
    stage: DealStage = DealStage.RESEARCH
    priority: DealPriority = DealPriority.MEDIUM
    probability: float = 0.1  # 0-1 scale
    
    # Key details
    industry: str = ""
    location: str = ""
    source: str = ""  # "oppy", "fragment_finder", "broker", "inbound", "manual"
    
    # Contacts
    contacts: List[DealContact] = field(default_factory=list)
    
    # Timeline
    created_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)
    target_close_date: Optional[datetime] = None
    next_action_date: Optional[datetime] = None
    next_action_description: str = ""
    
    # Financial information
    financials: Optional[DealFinancials] = None
    
    # Communications and documents
    communications: List[DealCommunication] = field(default_factory=list)
    documents: List[DealDocument] = field(default_factory=list)
    
    # Notes and analysis
    notes: List[str] = field(default_factory=list)
    strengths: List[str] = field(default_factory=list)
    concerns: List[str] = field(default_factory=list)
    key_issues: List[str] = field(default_factory=list)
    
    # Team assignment
    assigned_to: Optional[str] = None
    team_members: List[str] = field(default_factory=list)
    
    # Competitive intelligence
    competing_buyers: List[str] = field(default_factory=list)
    time_pressure: bool = False
    
    # Integration planning
    integration_complexity: str = "medium"  # "low", "medium", "high"
    key_personnel_retention: List[str] = field(default_factory=list)


class AcquisitionAssistant:
    """
    Acquisition Assistant (Double A) - Complete deal pipeline management system
    
    Manages the entire acquisition process from initial target identification
    through closing, providing centralized deal tracking, communication management,
    and analytical capabilities.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Deal storage
        self.deals = {}  # deal_id -> DealRecord
        self.deal_index = {}  # Various indexes for quick lookup
        
        # Pipeline analytics
        self.pipeline_analyzer = PipelineAnalyzer()
        self.deal_scorer = DealScorer()
        self.communication_manager = CommunicationManager()
        self.document_manager = DocumentManager()
        
        # Integration modules
        self.crm_integration = None  # Would integrate with CRM systems
        self.email_integration = None  # Would integrate with email systems
        self.calendar_integration = None  # Would integrate with calendar systems
    
    async def create_deal(
        self,
        business: NormalizedBusiness,
        source: str = "manual",
        initial_priority: DealPriority = DealPriority.MEDIUM
    ) -> DealRecord:
        """
        Create a new deal record from a business target
        
        Args:
            business: Target business information
            source: Source of the lead (oppy, fragment_finder, etc.)
            initial_priority: Initial deal priority
            
        Returns:
            Created deal record
        """
        
        deal_id = f"deal_{int(datetime.now().timestamp())}_{business.business_id}"
        
        # Create primary contact from business owner if available
        contacts = []
        if business.owner:
            contact = DealContact(
                name=business.owner.name,
                title="Owner",
                email=business.contact.email if business.contact.email_valid else None,
                phone=business.contact.phone if business.contact.phone_valid else None,
                is_primary=True
            )
            contacts.append(contact)
        
        # Initialize financial information
        financials = DealFinancials(
            deal_id=deal_id,
            annual_revenue=business.metrics.estimated_revenue,
            ebitda_margin=0.15 if business.metrics.estimated_revenue else None,  # Assume 15%
            ebitda=business.metrics.estimated_revenue * 0.15 if business.metrics.estimated_revenue else None
        )
        
        # Create deal record
        deal = DealRecord(
            deal_id=deal_id,
            business_name=business.name,
            business_id=business.business_id,
            stage=DealStage.RESEARCH,
            priority=initial_priority,
            probability=self._calculate_initial_probability(business),
            industry=business.category.value,
            location=business.address.formatted_address or "",
            source=source,
            contacts=contacts,
            financials=financials,
            next_action_description="Initial research and contact strategy development",
            next_action_date=datetime.now() + timedelta(days=1)
        )
        
        # Analyze deal characteristics
        deal = await self._analyze_deal_characteristics(deal, business)
        
        # Store deal
        self.deals[deal_id] = deal
        self._update_deal_index(deal)
        
        self.logger.info(f"Created deal {deal_id} for {business.name}")
        
        return deal
    
    async def update_deal_stage(
        self,
        deal_id: str,
        new_stage: DealStage,
        notes: Optional[str] = None,
        update_probability: bool = True
    ) -> DealRecord:
        """
        Update deal stage and associated metadata
        
        Args:
            deal_id: Deal identifier
            new_stage: New deal stage
            notes: Optional notes about the stage change
            update_probability: Whether to update probability based on stage
            
        Returns:
            Updated deal record
        """
        
        if deal_id not in self.deals:
            raise ValueError(f"Deal {deal_id} not found")
        
        deal = self.deals[deal_id]
        old_stage = deal.stage
        
        # Update stage
        deal.stage = new_stage
        deal.last_activity = datetime.now()
        
        # Update probability if requested
        if update_probability:
            deal.probability = self._get_stage_probability(new_stage)
        
        # Add notes about stage change
        if notes:
            deal.notes.append(f"Stage change: {old_stage.value} -> {new_stage.value}: {notes}")
        else:
            deal.notes.append(f"Stage change: {old_stage.value} -> {new_stage.value}")
        
        # Update next actions based on new stage
        deal.next_action_description, deal.next_action_date = self._get_next_action_for_stage(new_stage)
        
        # Update indexes
        self._update_deal_index(deal)
        
        self.logger.info(f"Updated deal {deal_id} stage: {old_stage.value} -> {new_stage.value}")
        
        return deal
    
    async def log_communication(
        self,
        deal_id: str,
        comm_type: CommunicationType,
        subject: str,
        content: str,
        participants: List[str],
        scheduled_date: Optional[datetime] = None,
        follow_up_required: bool = False,
        follow_up_date: Optional[datetime] = None
    ) -> DealCommunication:
        """
        Log a communication for a deal
        
        Args:
            deal_id: Deal identifier
            comm_type: Type of communication
            subject: Communication subject
            content: Communication content
            participants: List of participants
            scheduled_date: When communication is scheduled
            follow_up_required: Whether follow-up is needed
            follow_up_date: When follow-up is due
            
        Returns:
            Created communication record
        """
        
        if deal_id not in self.deals:
            raise ValueError(f"Deal {deal_id} not found")
        
        comm_id = f"comm_{int(datetime.now().timestamp())}"
        
        communication = DealCommunication(
            communication_id=comm_id,
            deal_id=deal_id,
            type=comm_type,
            subject=subject,
            content=content,
            participants=participants,
            scheduled_date=scheduled_date,
            follow_up_required=follow_up_required,
            follow_up_date=follow_up_date
        )
        
        # Add to deal
        deal = self.deals[deal_id]
        deal.communications.append(communication)
        deal.last_activity = datetime.now()
        
        # Update next action if follow-up required
        if follow_up_required and follow_up_date:
            if not deal.next_action_date or follow_up_date < deal.next_action_date:
                deal.next_action_date = follow_up_date
                deal.next_action_description = f"Follow up on: {subject}"
        
        self.logger.info(f"Logged {comm_type.value} communication for deal {deal_id}")
        
        return communication
    
    async def add_document(
        self,
        deal_id: str,
        document_type: str,
        filename: str,
        description: str = "",
        file_path: Optional[str] = None,
        requires_review: bool = False
    ) -> DealDocument:
        """
        Add a document to a deal
        
        Args:
            deal_id: Deal identifier
            document_type: Type of document
            filename: Document filename
            description: Document description
            file_path: Path to document file
            requires_review: Whether document requires review
            
        Returns:
            Created document record
        """
        
        if deal_id not in self.deals:
            raise ValueError(f"Deal {deal_id} not found")
        
        doc_id = f"doc_{int(datetime.now().timestamp())}"
        
        document = DealDocument(
            document_id=doc_id,
            deal_id=deal_id,
            document_type=document_type,
            filename=filename,
            file_path=file_path,
            description=description,
            requires_review=requires_review
        )
        
        # Add to deal
        deal = self.deals[deal_id]
        deal.documents.append(document)
        deal.last_activity = datetime.now()
        
        self.logger.info(f"Added {document_type} document to deal {deal_id}")
        
        return document
    
    async def update_financials(
        self,
        deal_id: str,
        financial_updates: Dict[str, Any]
    ) -> DealFinancials:
        """
        Update financial information for a deal
        
        Args:
            deal_id: Deal identifier
            financial_updates: Dictionary of financial updates
            
        Returns:
            Updated financial record
        """
        
        if deal_id not in self.deals:
            raise ValueError(f"Deal {deal_id} not found")
        
        deal = self.deals[deal_id]
        
        if not deal.financials:
            deal.financials = DealFinancials(deal_id=deal_id)
        
        # Update financial fields
        for field, value in financial_updates.items():
            if hasattr(deal.financials, field):
                setattr(deal.financials, field, value)
        
        # Recalculate derived metrics
        if deal.financials.annual_revenue and deal.financials.ebitda:
            deal.financials.ebitda_margin = deal.financials.ebitda / deal.financials.annual_revenue
        
        if deal.financials.proposed_price and deal.financials.ebitda:
            deal.financials.purchase_multiple = deal.financials.proposed_price / deal.financials.ebitda
        
        deal.last_activity = datetime.now()
        
        self.logger.info(f"Updated financials for deal {deal_id}")
        
        return deal.financials
    
    async def get_pipeline_overview(self) -> Dict[str, Any]:
        """
        Get comprehensive pipeline overview
        
        Returns:
            Pipeline analytics and overview
        """
        
        return await self.pipeline_analyzer.analyze_pipeline(list(self.deals.values()))
    
    async def get_deals_by_stage(self, stage: DealStage) -> List[DealRecord]:
        """Get all deals in a specific stage"""
        
        return [deal for deal in self.deals.values() if deal.stage == stage]
    
    async def get_active_deals(self) -> List[DealRecord]:
        """Get all active (non-closed, non-dead) deals"""
        
        active_stages = [
            DealStage.RESEARCH, DealStage.INITIAL_CONTACT, DealStage.QUALIFIED,
            DealStage.NDA_SIGNED, DealStage.INITIAL_OFFER, DealStage.LOI_SUBMITTED,
            DealStage.DUE_DILIGENCE, DealStage.FINAL_NEGOTIATION, DealStage.CLOSING
        ]
        
        return [deal for deal in self.deals.values() if deal.stage in active_stages]
    
    async def get_deals_needing_action(self) -> List[DealRecord]:
        """Get deals that need immediate action"""
        
        now = datetime.now()
        
        return [
            deal for deal in self.deals.values()
            if deal.next_action_date and deal.next_action_date <= now
        ]
    
    async def get_deal_recommendations(self, deal_id: str) -> Dict[str, Any]:
        """
        Get recommendations for a specific deal
        
        Args:
            deal_id: Deal identifier
            
        Returns:
            Deal recommendations and next steps
        """
        
        if deal_id not in self.deals:
            raise ValueError(f"Deal {deal_id} not found")
        
        deal = self.deals[deal_id]
        
        return await self.deal_scorer.generate_recommendations(deal)
    
    def _calculate_initial_probability(self, business: NormalizedBusiness) -> float:
        """Calculate initial deal probability based on business characteristics"""
        
        base_probability = 0.1  # 10% base
        
        # Succession risk factor
        if business.metrics.succession_risk_score:
            succession_factor = business.metrics.succession_risk_score / 100 * 0.3
            base_probability += succession_factor
        
        # Contact availability factor
        if business.contact.email_valid or business.contact.phone_valid:
            base_probability += 0.1
        
        # Business size factor
        if business.metrics.estimated_revenue:
            if business.metrics.estimated_revenue > 2000000:
                base_probability += 0.2
            elif business.metrics.estimated_revenue > 1000000:
                base_probability += 0.1
        
        # Quality factor
        if getattr(business.overall_quality, 'value', business.overall_quality) == 'high':
            base_probability += 0.1
        
        return min(0.9, base_probability)  # Cap at 90%
    
    async def _analyze_deal_characteristics(
        self,
        deal: DealRecord,
        business: NormalizedBusiness
    ) -> DealRecord:
        """Analyze and populate deal characteristics"""
        
        # Identify strengths
        if business.metrics.rating and business.metrics.rating > 4.0:
            deal.strengths.append("High customer satisfaction")
        
        if business.metrics.years_in_business and business.metrics.years_in_business > 15:
            deal.strengths.append("Established business")
        
        if business.contact.website_valid:
            deal.strengths.append("Digital presence")
        
        # Identify concerns
        if business.metrics.succession_risk_score and business.metrics.succession_risk_score > 80:
            deal.concerns.append("Very high succession risk - urgent timeline")
            deal.time_pressure = True
        
        if not business.contact.email_valid and not business.contact.phone_valid:
            deal.concerns.append("Limited contact information")
        
        if getattr(business.overall_quality, 'value', business.overall_quality) == 'poor':
            deal.concerns.append("Insufficient business data")
        
        # Set integration complexity
        if business.metrics.employee_count and business.metrics.employee_count > 50:
            deal.integration_complexity = "high"
        elif business.metrics.employee_count and business.metrics.employee_count > 20:
            deal.integration_complexity = "medium"
        else:
            deal.integration_complexity = "low"
        
        return deal
    
    def _get_stage_probability(self, stage: DealStage) -> float:
        """Get typical probability for each deal stage"""
        
        stage_probabilities = {
            DealStage.RESEARCH: 0.1,
            DealStage.INITIAL_CONTACT: 0.15,
            DealStage.QUALIFIED: 0.25,
            DealStage.NDA_SIGNED: 0.4,
            DealStage.INITIAL_OFFER: 0.5,
            DealStage.LOI_SUBMITTED: 0.7,
            DealStage.DUE_DILIGENCE: 0.8,
            DealStage.FINAL_NEGOTIATION: 0.9,
            DealStage.CLOSING: 0.95,
            DealStage.CLOSED: 1.0,
            DealStage.DEAD: 0.0
        }
        
        return stage_probabilities.get(stage, 0.1)
    
    def _get_next_action_for_stage(self, stage: DealStage) -> Tuple[str, datetime]:
        """Get next action description and date for a stage"""
        
        now = datetime.now()
        
        stage_actions = {
            DealStage.RESEARCH: ("Complete business research and develop contact strategy", now + timedelta(days=2)),
            DealStage.INITIAL_CONTACT: ("Make initial contact with business owner", now + timedelta(days=1)),
            DealStage.QUALIFIED: ("Schedule detailed discussion meeting", now + timedelta(days=3)),
            DealStage.NDA_SIGNED: ("Prepare initial offer materials", now + timedelta(days=5)),
            DealStage.INITIAL_OFFER: ("Follow up on initial offer response", now + timedelta(days=7)),
            DealStage.LOI_SUBMITTED: ("Begin due diligence preparation", now + timedelta(days=10)),
            DealStage.DUE_DILIGENCE: ("Complete due diligence review", now + timedelta(days=30)),
            DealStage.FINAL_NEGOTIATION: ("Finalize purchase agreement", now + timedelta(days=14)),
            DealStage.CLOSING: ("Coordinate closing logistics", now + timedelta(days=7)),
            DealStage.CLOSED: ("Begin integration planning", now + timedelta(days=1)),
            DealStage.DEAD: ("Archive deal and capture lessons learned", now + timedelta(days=1))
        }
        
        return stage_actions.get(stage, ("Review deal status", now + timedelta(days=7)))
    
    def _update_deal_index(self, deal: DealRecord):
        """Update deal indexes for quick lookup"""
        
        # Index by stage
        stage_key = f"stage_{deal.stage.value}"
        if stage_key not in self.deal_index:
            self.deal_index[stage_key] = []
        
        # Remove from old stage if exists
        for key in self.deal_index:
            if key.startswith("stage_") and deal.deal_id in [d.deal_id for d in self.deal_index[key]]:
                self.deal_index[key] = [d for d in self.deal_index[key] if d.deal_id != deal.deal_id]
        
        # Add to new stage
        self.deal_index[stage_key].append(deal)
        
        # Index by priority
        priority_key = f"priority_{deal.priority.value}"
        if priority_key not in self.deal_index:
            self.deal_index[priority_key] = []
        
        # Remove from old priority if exists
        for key in self.deal_index:
            if key.startswith("priority_") and deal.deal_id in [d.deal_id for d in self.deal_index[key]]:
                self.deal_index[key] = [d for d in self.deal_index[key] if d.deal_id != deal.deal_id]
        
        # Add to new priority
        self.deal_index[priority_key].append(deal)


class PipelineAnalyzer:
    """Analyzes pipeline performance and metrics"""
    
    async def analyze_pipeline(self, deals: List[DealRecord]) -> Dict[str, Any]:
        """Analyze pipeline comprehensively"""
        
        if not deals:
            return self._empty_pipeline_analysis()
        
        # Basic metrics
        total_deals = len(deals)
        active_deals = len([d for d in deals if d.stage not in [DealStage.CLOSED, DealStage.DEAD]])
        
        # Stage distribution
        stage_distribution = {}
        for stage in DealStage:
            stage_deals = [d for d in deals if d.stage == stage]
            stage_distribution[stage.value] = {
                'count': len(stage_deals),
                'percentage': len(stage_deals) / total_deals * 100 if total_deals > 0 else 0
            }
        
        # Pipeline value
        pipeline_value = sum(
            (d.financials.proposed_price or d.financials.asking_price or 0) * d.probability
            for d in deals if d.stage not in [DealStage.DEAD]
        )
        
        # Average deal size
        deal_sizes = [
            d.financials.proposed_price or d.financials.asking_price or 0
            for d in deals if d.financials and (d.financials.proposed_price or d.financials.asking_price)
        ]
        avg_deal_size = np.mean(deal_sizes) if deal_sizes else 0
        
        # Conversion rates
        conversion_rates = self._calculate_conversion_rates(deals)
        
        # Time in stage analysis
        time_analysis = self._analyze_time_in_stages(deals)
        
        # Priority distribution
        priority_distribution = {}
        for priority in DealPriority:
            priority_deals = [d for d in deals if d.priority == priority]
            priority_distribution[priority.value] = len(priority_deals)
        
        # Source analysis
        source_analysis = {}
        for deal in deals:
            source = deal.source
            if source not in source_analysis:
                source_analysis[source] = {'count': 0, 'value': 0}
            source_analysis[source]['count'] += 1
            if deal.financials and deal.financials.proposed_price:
                source_analysis[source]['value'] += deal.financials.proposed_price
        
        # Activity analysis
        recent_activity = len([
            d for d in deals 
            if d.last_activity > datetime.now() - timedelta(days=7)
        ])
        
        # Next actions needed
        next_actions = len([
            d for d in deals 
            if d.next_action_date and d.next_action_date <= datetime.now()
        ])
        
        return {
            'summary': {
                'total_deals': total_deals,
                'active_deals': active_deals,
                'pipeline_value': pipeline_value,
                'average_deal_size': avg_deal_size,
                'recent_activity_count': recent_activity,
                'actions_needed': next_actions
            },
            'stage_distribution': stage_distribution,
            'priority_distribution': priority_distribution,
            'source_analysis': source_analysis,
            'conversion_rates': conversion_rates,
            'time_analysis': time_analysis,
            'trends': self._identify_pipeline_trends(deals),
            'recommendations': self._generate_pipeline_recommendations(deals)
        }
    
    def _empty_pipeline_analysis(self) -> Dict[str, Any]:
        """Return empty pipeline analysis"""
        return {
            'summary': {
                'total_deals': 0,
                'active_deals': 0,
                'pipeline_value': 0,
                'average_deal_size': 0,
                'recent_activity_count': 0,
                'actions_needed': 0
            },
            'stage_distribution': {},
            'priority_distribution': {},
            'source_analysis': {},
            'conversion_rates': {},
            'time_analysis': {},
            'trends': [],
            'recommendations': ['Start adding deals to build pipeline analytics']
        }
    
    def _calculate_conversion_rates(self, deals: List[DealRecord]) -> Dict[str, float]:
        """Calculate conversion rates between stages"""
        
        conversion_rates = {}
        
        stages = list(DealStage)
        for i in range(len(stages) - 1):
            current_stage = stages[i]
            next_stage = stages[i + 1]
            
            current_count = len([d for d in deals if d.stage == current_stage])
            next_count = len([d for d in deals if d.stage in stages[i+1:]])
            
            if current_count > 0:
                conversion_rate = next_count / current_count * 100
            else:
                conversion_rate = 0
            
            conversion_rates[f"{current_stage.value}_to_next"] = conversion_rate
        
        return conversion_rates
    
    def _analyze_time_in_stages(self, deals: List[DealRecord]) -> Dict[str, Any]:
        """Analyze time spent in each stage"""
        
        # This is a simplified analysis
        # In production, would track stage history
        
        avg_deal_age = {}
        for stage in DealStage:
            stage_deals = [d for d in deals if d.stage == stage]
            if stage_deals:
                ages = [(datetime.now() - d.created_at).days for d in stage_deals]
                avg_deal_age[stage.value] = np.mean(ages)
            else:
                avg_deal_age[stage.value] = 0
        
        return {
            'average_age_by_stage': avg_deal_age,
            'oldest_deal_days': max(
                [(datetime.now() - d.created_at).days for d in deals]
            ) if deals else 0
        }
    
    def _identify_pipeline_trends(self, deals: List[DealRecord]) -> List[str]:
        """Identify trends in the pipeline"""
        
        trends = []
        
        # Recent deal creation trend
        recent_deals = [
            d for d in deals 
            if d.created_at > datetime.now() - timedelta(days=30)
        ]
        if len(recent_deals) > len(deals) * 0.3:
            trends.append("High deal creation rate in last 30 days")
        
        # High-priority deal concentration
        high_priority = [d for d in deals if d.priority in [DealPriority.HIGH, DealPriority.URGENT]]
        if len(high_priority) > len(deals) * 0.4:
            trends.append("High concentration of priority deals")
        
        # Stage bottlenecks
        research_deals = [d for d in deals if d.stage == DealStage.RESEARCH]
        if len(research_deals) > len(deals) * 0.4:
            trends.append("Bottleneck in research stage")
        
        return trends
    
    def _generate_pipeline_recommendations(self, deals: List[DealRecord]) -> List[str]:
        """Generate pipeline improvement recommendations"""
        
        recommendations = []
        
        if not deals:
            return ['Start building your pipeline by adding target businesses']
        
        # Check for stalled deals
        stalled_deals = [
            d for d in deals 
            if d.last_activity < datetime.now() - timedelta(days=14)
            and d.stage not in [DealStage.CLOSED, DealStage.DEAD]
        ]
        if stalled_deals:
            recommendations.append(f"Re-engage {len(stalled_deals)} stalled deals")
        
        # Check for overdue actions
        overdue_actions = [
            d for d in deals 
            if d.next_action_date and d.next_action_date < datetime.now() - timedelta(days=1)
        ]
        if overdue_actions:
            recommendations.append(f"Complete {len(overdue_actions)} overdue actions")
        
        # Stage concentration recommendations
        research_heavy = len([d for d in deals if d.stage == DealStage.RESEARCH]) > len(deals) * 0.5
        if research_heavy:
            recommendations.append("Focus on moving deals out of research stage")
        
        return recommendations


class DealScorer:
    """Scores and analyzes individual deals"""
    
    async def generate_recommendations(self, deal: DealRecord) -> Dict[str, Any]:
        """Generate recommendations for a specific deal"""
        
        recommendations = {
            'next_steps': [],
            'priorities': [],
            'risks': [],
            'opportunities': [],
            'timeline_recommendations': []
        }
        
        # Stage-specific recommendations
        if deal.stage == DealStage.RESEARCH:
            recommendations['next_steps'].extend([
                'Complete business financial analysis',
                'Research competitive landscape',
                'Identify key decision makers'
            ])
        elif deal.stage == DealStage.INITIAL_CONTACT:
            recommendations['next_steps'].extend([
                'Prepare value proposition',
                'Schedule introductory meeting',
                'Research owner motivations'
            ])
        elif deal.stage == DealStage.QUALIFIED:
            recommendations['next_steps'].extend([
                'Prepare NDA for review',
                'Conduct management interviews',
                'Begin financial due diligence prep'
            ])
        
        # Priority recommendations
        if deal.priority == DealPriority.URGENT:
            recommendations['priorities'].append('Fast-track due diligence process')
        
        if deal.time_pressure:
            recommendations['priorities'].append('Accelerate decision timeline')
        
        # Risk analysis
        if len(deal.competing_buyers) > 0:
            recommendations['risks'].append('Multiple buyer competition')
        
        if deal.integration_complexity == 'high':
            recommendations['risks'].append('Complex integration requirements')
        
        # Financial opportunities
        if deal.financials and deal.financials.estimated_synergies:
            recommendations['opportunities'].append(
                f"${deal.financials.estimated_synergies:,.0f} in identified synergies"
            )
        
        return recommendations


class CommunicationManager:
    """Manages communications for deals"""
    
    async def schedule_follow_up(
        self,
        deal_id: str,
        follow_up_type: str,
        follow_up_date: datetime,
        notes: str = ""
    ):
        """Schedule a follow-up for a deal"""
        
        # This would integrate with calendar systems
        # For now, just log the action
        pass
    
    async def send_email_template(
        self,
        deal_id: str,
        template_type: str,
        recipient: str,
        custom_variables: Dict[str, Any]
    ):
        """Send templated email for a deal"""
        
        # This would integrate with email systems
        # For now, just log the action
        pass


class DocumentManager:
    """Manages documents for deals"""
    
    async def generate_nda(self, deal_id: str) -> str:
        """Generate NDA document for a deal"""
        
        # This would generate actual NDA documents
        # For now, return placeholder
        return f"NDA document for deal {deal_id}"
    
    async def generate_loi(self, deal_id: str, terms: Dict[str, Any]) -> str:
        """Generate LOI document for a deal"""
        
        # This would generate actual LOI documents
        # For now, return placeholder
        return f"LOI document for deal {deal_id} with terms: {terms}"


# Export main classes
__all__ = [
    'AcquisitionAssistant',
    'DealRecord',
    'DealStage',
    'DealPriority',
    'CommunicationType',
    'DealContact',
    'DealCommunication',
    'DealDocument',
    'DealFinancials'
]
