"""
Data Normalizer - Second layer of the architectural diagram

This module implements the data processing layer:
[Smart Crawler Hub] → [Data Normalizer] ← Structured JSON schema

Features:
- Unified business data schema
- Multi-source data fusion and deduplication
- Data quality scoring and validation
- Standardized output format for enrichment engine
"""

import json
import re
from typing import List, Dict, Any, Optional, Union, Set
from datetime import datetime, date
from dataclasses import dataclass, asdict, field
from enum import Enum
import hashlib
import logging
from decimal import Decimal, InvalidOperation

from pydantic import BaseModel, Field, validator
import phonenumbers
from email_validator import validate_email, EmailNotValidError


class DataSource(Enum):
    GOOGLE_MAPS = "google_maps"
    GOOGLE_SERP = "google_serp"
    YELP = "yelp"
    LINKEDIN = "linkedin"
    SBA_RECORDS = "sba_records"
    DATAAXLE = "dataaxle"
    BIZBUYSELL = "bizbuysell"
    SECRETARY_OF_STATE = "sos"
    IRS_RECORDS = "irs_records"
    CENSUS = "census"
    MANUAL_INPUT = "manual_input"
    # Apify actor sources
    APIFY_GMAPS = "apify_gmaps"
    APIFY_GMAPS_EMAIL = "apify_gmaps_email"
    APIFY_GMAPS_WEBSITES = "apify_gmaps_websites"
    APIFY_WEBSITE_CRAWLER = "apify_website_crawler"
    APIFY_APOLLO = "apify_apollo"
    APIFY_LINKEDIN_JOBS = "apify_linkedin_jobs"
    # Other crawler
    FIRECRAWL = "firecrawl"


class BusinessCategory(Enum):
    HVAC = "hvac"
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    LANDSCAPING = "landscaping"
    RESTAURANT = "restaurant"
    RETAIL = "retail"
    HEALTHCARE = "healthcare"
    AUTOMOTIVE = "automotive"
    CONSTRUCTION = "construction"
    MANUFACTURING = "manufacturing"
    SERVICES = "services"
    OTHER = "other"


class DataQuality(Enum):
    HIGH = "high"      # 80-100% confidence
    MEDIUM = "medium"  # 60-79% confidence
    LOW = "low"        # 40-59% confidence
    POOR = "poor"      # <40% confidence


@dataclass
class Coordinates:
    latitude: float
    longitude: float
    source: str = "unknown"
    accuracy: float = 0.0  # 0-1 confidence score


@dataclass
class ContactInfo:
    phone: Optional[str] = None
    phone_formatted: Optional[str] = None
    phone_valid: bool = False
    email: Optional[str] = None
    email_valid: bool = False
    website: Optional[str] = None
    website_valid: bool = False


@dataclass
class AddressInfo:
    raw_address: Optional[str] = None
    street_number: Optional[str] = None
    street_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: str = "US"
    formatted_address: Optional[str] = None
    coordinates: Optional[Coordinates] = None


@dataclass
class BusinessMetrics:
    rating: Optional[float] = None
    review_count: Optional[int] = None
    estimated_revenue: Optional[int] = None
    employee_count: Optional[int] = None
    years_in_business: Optional[int] = None
    succession_risk_score: Optional[float] = None
    owner_age_estimate: Optional[int] = None
    market_share_percent: Optional[float] = None
    lead_score: Optional[float] = None
    digital_presence_score: Optional[float] = None


@dataclass
class OwnerInfo:
    name: Optional[str] = None
    age_estimate: Optional[int] = None
    detection_source: Optional[str] = None
    confidence_score: float = 0.0
    contact_info: Optional[ContactInfo] = None


@dataclass
class DataProvenance:
    source: DataSource
    extraction_date: datetime
    confidence_score: float
    data_quality: DataQuality
    raw_data: Dict[str, Any] = field(default_factory=dict)


class NormalizedBusiness(BaseModel):
    """
    Standardized business data schema that unifies all data sources
    """
    
    # Unique identifiers
    business_id: str = Field(..., description="Unique business identifier")
    external_ids: Dict[str, str] = Field(default_factory=dict, description="IDs from various sources")
    
    # Basic business information
    name: str = Field(..., description="Business name")
    category: BusinessCategory = Field(default=BusinessCategory.OTHER)
    industry: Optional[str] = None
    naics_code: Optional[str] = None
    
    # Location information
    address: AddressInfo = Field(default_factory=AddressInfo)
    
    # Contact information
    contact: ContactInfo = Field(default_factory=ContactInfo)
    
    # Business metrics
    metrics: BusinessMetrics = Field(default_factory=BusinessMetrics)
    
    # Owner information
    owner: Optional[OwnerInfo] = None
    
    # Data quality and sources
    data_sources: List[DataProvenance] = Field(default_factory=list)
    overall_quality: DataQuality = Field(default=DataQuality.POOR)
    last_updated: datetime = Field(default_factory=datetime.now)
    
    # Additional metadata
    tags: Set[str] = Field(default_factory=set)
    notes: List[str] = Field(default_factory=list)
    
    class Config:
        use_enum_values = True
        arbitrary_types_allowed = True


class DataNormalizer:
    """
    Main data normalization engine that processes raw crawl data
    into standardized business objects
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Deduplication tracking
        self.processed_businesses = {}
        self.business_hashes = {}
        
        # Data validation rules
        self.validation_rules = self._init_validation_rules()
        
    def normalize_crawl_results(
        self, 
        crawl_results: Dict[str, Any],
        merge_duplicates: bool = True
    ) -> List[NormalizedBusiness]:
        """
        Main entry point for normalizing crawl results from multiple sources
        
        Args:
            crawl_results: Dictionary of crawl results keyed by source
            merge_duplicates: Whether to merge duplicate businesses
            
        Returns:
            List of normalized business objects
        """
        
        normalized_businesses = []
        
        # Process each data source
        for source_name, crawl_result in crawl_results.items():
            try:
                source_enum = DataSource(source_name)
                
                if crawl_result.success:
                    businesses = self._normalize_source_data(
                        source_enum, 
                        crawl_result.data,
                        crawl_result.metadata
                    )
                    normalized_businesses.extend(businesses)
                    
            except ValueError as e:
                self.logger.warning(f"Unknown data source: {source_name}")
                continue
            except Exception as e:
                self.logger.error(f"Error processing {source_name}: {e}")
                continue
        
        # Merge duplicates if requested
        if merge_duplicates:
            normalized_businesses = self._merge_duplicates(normalized_businesses)
        
        # Sort by data quality and lead score
        def _qual_val(q):
            v = getattr(q, 'value', q)
            rank = {'poor': 0, 'low': 1, 'medium': 2, 'high': 3}
            return rank.get(v, 0)
        normalized_businesses.sort(
            key=lambda b: (_qual_val(b.overall_quality), b.metrics.lead_score or 0),
            reverse=True
        )
        
        return normalized_businesses
    
    def _normalize_source_data(
        self, 
        source: DataSource, 
        raw_data: List[Dict[str, Any]],
        metadata: Dict[str, Any]
    ) -> List[NormalizedBusiness]:
        """Normalize data from a specific source"""
        
        normalized = []
        
        for raw_business in raw_data:
            try:
                business = self._normalize_single_business(source, raw_business, metadata)
                if business:
                    normalized.append(business)
                    
            except Exception as e:
                self.logger.error(f"Error normalizing business from {source.value}: {e}")
                continue
                
        return normalized
    
    def _normalize_single_business(
        self, 
        source: DataSource, 
        raw_data: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> Optional[NormalizedBusiness]:
        """Normalize a single business record"""
        
        try:
            # Generate unique business ID
            business_id = self._generate_business_id(raw_data)
            
            # Extract and normalize basic info
            raw_name = raw_data.get('name', raw_data.get('business_name', '')) or ''
            name = self._normalize_business_name(raw_name)
            if not name:
                return None
                
            category_input = raw_data.get('industry', raw_data.get('category', '')) or ''
            category = self._normalize_category(category_input)
            
            # Normalize address
            address = self._normalize_address(raw_data)
            
            # Normalize contact info
            contact = self._normalize_contact(raw_data)
            
            # Normalize metrics
            metrics = self._normalize_metrics(raw_data)
            
            # Normalize owner info
            owner = self._normalize_owner(raw_data)
            
            # Create data provenance
            provenance = DataProvenance(
                source=source,
                extraction_date=datetime.now(),
                confidence_score=self._calculate_confidence_score(raw_data, source),
                data_quality=self._assess_data_quality(raw_data),
                raw_data=raw_data
            )
            
            # Create normalized business object
            business = NormalizedBusiness(
                business_id=business_id,
                external_ids={source.value: raw_data.get('id', business_id)},
                name=name,
                category=category,
                industry=raw_data.get('industry'),
                naics_code=raw_data.get('naics_code', raw_data.get('NAICS')),
                address=address,
                contact=contact,
                metrics=metrics,
                owner=owner,
                data_sources=[provenance],
                overall_quality=provenance.data_quality,
                last_updated=datetime.now()
            )
            
            return business
            
        except Exception as e:
            self.logger.error(f"Error normalizing business: {e}")
            return None
    
    def _generate_business_id(self, raw_data: Dict[str, Any]) -> str:
        """Generate a unique business identifier"""
        
        # Create hash from business name + address + phone
        name = raw_data.get('name', raw_data.get('business_name', ''))
        address = raw_data.get('address', '')
        phone = raw_data.get('phone', '')
        
        # Clean and normalize for hashing
        clean_name = re.sub(r'[^\w\s]', '', (name or '').lower().strip())
        clean_address = re.sub(r'[^\w\s]', '', (address or '').lower().strip())
        clean_phone = re.sub(r'[^\d]', '', phone)
        
        hash_input = f"{clean_name}|{clean_address}|{clean_phone}"
        business_hash = hashlib.md5(hash_input.encode()).hexdigest()[:12]
        
        return f"biz_{business_hash}"
    
    def _normalize_business_name(self, name: str) -> str:
        """Normalize business name"""
        if not name:
            return ""
            
        # Clean and standardize
        cleaned = re.sub(r'\s+', ' ', name.strip())
        cleaned = re.sub(r'[^\w\s&-.,]', '', cleaned)
        
        return cleaned
    
    def _normalize_category(self, category_input: Union[str, List[str]]) -> BusinessCategory:
        """Normalize business category"""
        
        if isinstance(category_input, list):
            category_input = ' '.join(category_input)
            
        if not category_input:
            return BusinessCategory.OTHER
            
        category_lower = (category_input or '').lower()
        
        # Category mapping
        category_mapping = {
            'hvac': BusinessCategory.HVAC,
            'heating': BusinessCategory.HVAC,
            'cooling': BusinessCategory.HVAC,
            'air conditioning': BusinessCategory.HVAC,
            'plumbing': BusinessCategory.PLUMBING,
            'plumber': BusinessCategory.PLUMBING,
            'electrical': BusinessCategory.ELECTRICAL,
            'electrician': BusinessCategory.ELECTRICAL,
            'landscape': BusinessCategory.LANDSCAPING,
            'lawn': BusinessCategory.LANDSCAPING,
            'garden': BusinessCategory.LANDSCAPING,
            'restaurant': BusinessCategory.RESTAURANT,
            'food': BusinessCategory.RESTAURANT,
            'dining': BusinessCategory.RESTAURANT,
            'retail': BusinessCategory.RETAIL,
            'store': BusinessCategory.RETAIL,
            'shop': BusinessCategory.RETAIL,
            'healthcare': BusinessCategory.HEALTHCARE,
            'medical': BusinessCategory.HEALTHCARE,
            'health': BusinessCategory.HEALTHCARE,
            'automotive': BusinessCategory.AUTOMOTIVE,
            'auto': BusinessCategory.AUTOMOTIVE,
            'car': BusinessCategory.AUTOMOTIVE,
            'construction': BusinessCategory.CONSTRUCTION,
            'contractor': BusinessCategory.CONSTRUCTION,
            'builder': BusinessCategory.CONSTRUCTION,
            'manufacturing': BusinessCategory.MANUFACTURING,
            'factory': BusinessCategory.MANUFACTURING,
            'services': BusinessCategory.SERVICES
        }
        
        for keyword, category in category_mapping.items():
            if keyword in category_lower:
                return category
                
        return BusinessCategory.OTHER
    
    def _normalize_address(self, raw_data: Dict[str, Any]) -> AddressInfo:
        """Normalize address information"""
        
        raw_address = raw_data.get('address', '')
        
        address = AddressInfo(raw_address=raw_address)
        
        if raw_address:
            # Parse address components
            address_parts = self._parse_address(raw_address)
            address.street_number = address_parts.get('street_number')
            address.street_name = address_parts.get('street_name')
            address.city = address_parts.get('city')
            address.state = address_parts.get('state')
            address.zip_code = address_parts.get('zip_code')
            address.formatted_address = raw_address
            
        # Handle coordinates
        coords = raw_data.get('coordinates')
        if coords and len(coords) >= 2:
            address.coordinates = Coordinates(
                latitude=float(coords[0]),
                longitude=float(coords[1]),
                source="crawler_data",
                accuracy=0.8
            )
            
        return address
    
    def _normalize_contact(self, raw_data: Dict[str, Any]) -> ContactInfo:
        """Normalize contact information"""
        
        contact = ContactInfo()
        
        # Phone number
        phone = raw_data.get('phone', '')
        if phone:
            contact.phone = phone
            contact.phone_formatted, contact.phone_valid = self._validate_phone(phone)
            
        # Email
        email = raw_data.get('email', '')
        if email:
            contact.email = email
            contact.email_valid = self._validate_email_address(email)
            
        # Website
        website = raw_data.get('website', '')
        if website:
            contact.website = website
            contact.website_valid = self._validate_website(website)
            
        return contact
    
    def _normalize_metrics(self, raw_data: Dict[str, Any]) -> BusinessMetrics:
        """Normalize business metrics"""
        
        metrics = BusinessMetrics()
        
        # Rating
        rating = raw_data.get('rating', raw_data.get('avg_rating'))
        if rating is not None:
            try:
                metrics.rating = max(0.0, min(5.0, float(rating)))
            except (ValueError, TypeError):
                pass
                
        # Review count
        review_count = raw_data.get('review_count', raw_data.get('reviews'))
        if review_count is not None:
            try:
                metrics.review_count = max(0, int(review_count))
            except (ValueError, TypeError):
                pass
                
        # Revenue
        revenue = raw_data.get('estimated_revenue', raw_data.get('revenue'))
        if revenue is not None:
            try:
                metrics.estimated_revenue = max(0, int(revenue))
            except (ValueError, TypeError):
                pass
                
        # Employee count
        employees = raw_data.get('employee_count', raw_data.get('employees'))
        if employees is not None:
            try:
                metrics.employee_count = max(0, int(employees))
            except (ValueError, TypeError):
                pass
                
        # Years in business
        years = raw_data.get('years_in_business')
        if years is not None:
            try:
                metrics.years_in_business = max(0, int(years))
            except (ValueError, TypeError):
                pass
                
        # Succession risk
        succession_risk = raw_data.get('succession_risk_score', raw_data.get('succession_risk'))
        if succession_risk is not None:
            try:
                metrics.succession_risk_score = max(0.0, min(100.0, float(succession_risk)))
            except (ValueError, TypeError):
                pass
                
        # Owner age
        owner_age = raw_data.get('owner_age_estimate', raw_data.get('owner_age'))
        if owner_age is not None:
            try:
                metrics.owner_age_estimate = max(18, min(100, int(owner_age)))
            except (ValueError, TypeError):
                pass
                
        # Market share
        market_share = raw_data.get('market_share_percent', raw_data.get('market_share'))
        if market_share is not None:
            try:
                metrics.market_share_percent = max(0.0, min(100.0, float(market_share)))
            except (ValueError, TypeError):
                pass
                
        # Lead score
        lead_score = raw_data.get('lead_score')
        if lead_score is not None:
            try:
                metrics.lead_score = max(0.0, min(100.0, float(lead_score)))
            except (ValueError, TypeError):
                pass
                
        # Digital presence score
        digital_score = raw_data.get('digital_presence_score')
        if digital_score is not None:
            try:
                metrics.digital_presence_score = max(0.0, min(100.0, float(digital_score)))
            except (ValueError, TypeError):
                pass
                
        return metrics
    
    def _normalize_owner(self, raw_data: Dict[str, Any]) -> Optional[OwnerInfo]:
        """Normalize owner information"""
        
        owner_name = raw_data.get('owner_name')
        if not owner_name:
            return None
            
        owner = OwnerInfo(
            name=owner_name,
            detection_source=raw_data.get('owner_detected_from', 'unknown'),
            confidence_score=raw_data.get('owner_confidence', 0.5)
        )
        
        # Owner age
        owner_age = raw_data.get('owner_age_estimate', raw_data.get('owner_age'))
        if owner_age is not None:
            try:
                owner.age_estimate = max(18, min(100, int(owner_age)))
            except (ValueError, TypeError):
                pass
                
        return owner
    
    def _parse_address(self, address: str) -> Dict[str, str]:
        """Parse address components"""
        
        parts = {}
        
        # Simple address parsing (could be enhanced with geocoding services)
        address_clean = address.strip()
        
        # Try to capture street line as the first comma-separated segment
        try:
            first_seg = address_clean.split(',')[0].strip()
            # Looks like a street if it begins with a house number or contains a common street suffix
            if re.search(r'^\d{1,6}\s+.+', first_seg) or re.search(r'\b(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Lane|Ln|Way|Place|Pl|Parkway|Pkwy|Highway|Hwy)\b', first_seg, re.I):
                num_match = re.match(r'^(\d{1,6})\s+(.*)$', first_seg)
                if num_match:
                    parts['street_number'] = num_match.group(1)
                    parts['street_name'] = num_match.group(2).strip()
                else:
                    parts['street_name'] = first_seg
        except Exception:
            pass

        # Extract ZIP code
        zip_match = re.search(r'\b(\d{5}(?:-\d{4})?)\b', address_clean)
        if zip_match:
            parts['zip_code'] = zip_match.group(1)
            
        # Extract state (2-letter code)
        state_match = re.search(r'\b([A-Z]{2})\b', address_clean)
        if state_match:
            parts['state'] = state_match.group(1)
            
        # Extract city (word before state)
        if 'state' in parts:
            city_match = re.search(rf'([^,]+),\s*{parts["state"]}', address_clean)
            if city_match:
                parts['city'] = city_match.group(1).strip()
                
        return parts
    
    def _validate_phone(self, phone: str) -> "tuple[Optional[str], bool]":
        """Validate and format phone number"""
        
        try:
            parsed = phonenumbers.parse(phone, "US")
            if phonenumbers.is_valid_number(parsed):
                formatted = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL)
                return formatted, True
        except:
            pass
            
        return None, False
    
    def _validate_email_address(self, email: str) -> bool:
        """Validate email address"""
        
        try:
            validate_email(email)
            return True
        except EmailNotValidError:
            return False
    
    def _validate_website(self, website: str) -> bool:
        """Validate website URL"""
        
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
            
        return url_pattern.match(website) is not None
    
    def _calculate_confidence_score(self, raw_data: Dict[str, Any], source: DataSource) -> float:
        """Calculate confidence score for the data"""
        
        score = 0.0
        
        # Base score by source reliability
        source_scores = {
            DataSource.GOOGLE_MAPS: 0.8,
            DataSource.GOOGLE_SERP: 0.7,
            DataSource.YELP: 0.75,
            DataSource.SBA_RECORDS: 0.9,
            DataSource.DATAAXLE: 0.85,
            DataSource.LINKEDIN: 0.6,
            DataSource.BIZBUYSELL: 0.7,
            DataSource.SECRETARY_OF_STATE: 0.9,
            DataSource.IRS_RECORDS: 0.95,
            DataSource.CENSUS: 0.9,
            DataSource.MANUAL_INPUT: 0.5,
            # Apify actors
            DataSource.APIFY_GMAPS: 0.8,
            DataSource.APIFY_GMAPS_EMAIL: 0.7,
            DataSource.APIFY_GMAPS_WEBSITES: 0.75,
            DataSource.APIFY_WEBSITE_CRAWLER: 0.6,
            DataSource.APIFY_APOLLO: 0.7,
            DataSource.APIFY_LINKEDIN_JOBS: 0.6,
            # Firecrawl
            DataSource.FIRECRAWL: 0.65
        }
        
        score = source_scores.get(source, 0.5)
        
        # Adjust based on data completeness
        fields_present = sum(1 for value in raw_data.values() if value)
        total_fields = len(raw_data)
        completeness = fields_present / total_fields if total_fields > 0 else 0
        
        score = score * (0.5 + 0.5 * completeness)
        
        return min(1.0, max(0.0, score))
    
    def _assess_data_quality(self, raw_data: Dict[str, Any]) -> DataQuality:
        """Assess overall data quality"""
        
        quality_score = 0.0
        
        # Check for required fields
        required_fields = ['name', 'address', 'phone']
        present_required = sum(1 for field in required_fields if raw_data.get(field))
        quality_score += (present_required / len(required_fields)) * 0.4
        
        # Check for business metrics
        metric_fields = ['rating', 'review_count', 'estimated_revenue']
        present_metrics = sum(1 for field in metric_fields if raw_data.get(field))
        quality_score += (present_metrics / len(metric_fields)) * 0.3
        
        # Check for additional data
        additional_fields = ['website', 'owner_name', 'years_in_business']
        present_additional = sum(1 for field in additional_fields if raw_data.get(field))
        quality_score += (present_additional / len(additional_fields)) * 0.3
        
        # Map to quality enum
        if quality_score >= 0.8:
            return DataQuality.HIGH
        elif quality_score >= 0.6:
            return DataQuality.MEDIUM
        elif quality_score >= 0.4:
            return DataQuality.LOW
        else:
            return DataQuality.POOR
    
    def _merge_duplicates(self, businesses: List[NormalizedBusiness]) -> List[NormalizedBusiness]:
        """Merge duplicate business records"""
        
        merged = {}
        
        for business in businesses:
            # Generate similarity hash
            similarity_key = self._generate_similarity_key(business)
            
            if similarity_key in merged:
                # Merge with existing business
                merged[similarity_key] = self._merge_business_records(
                    merged[similarity_key], 
                    business
                )
            else:
                merged[similarity_key] = business
                
        return list(merged.values())
    
    def _generate_similarity_key(self, business: NormalizedBusiness) -> str:
        """Generate a key for identifying similar businesses"""
        
        # Normalize name for comparison
        name_clean = re.sub(r'[^\w]', '', (business.name or '').lower())
        
        # Use name + approximate location
        location_key = ""
        if getattr(business.address, 'zip_code', None):
            location_key = business.address.zip_code[:5]
        elif getattr(business.address, 'city', None):
            location_key = re.sub(r'[^\w]', '', (business.address.city or '').lower())[:10]
            
        return f"{name_clean}_{location_key}"
    
    def _merge_business_records(
        self, 
        existing: NormalizedBusiness, 
        new: NormalizedBusiness
    ) -> NormalizedBusiness:
        """Merge two business records, keeping the best data from each"""
        
        # Combine external IDs
        existing.external_ids.update(new.external_ids)
        
        # Merge data sources
        existing.data_sources.extend(new.data_sources)
        
        # Update fields with higher quality data
        def _qual_val(q):
            v = getattr(q, 'value', q)
            rank = {'poor': 0, 'low': 1, 'medium': 2, 'high': 3}
            return rank.get(v, 0)
        if _qual_val(new.overall_quality) > _qual_val(existing.overall_quality):
            # New record has better quality, update key fields
            if new.contact.phone and not existing.contact.phone:
                existing.contact.phone = new.contact.phone
                existing.contact.phone_formatted = new.contact.phone_formatted
                existing.contact.phone_valid = new.contact.phone_valid
                
            if new.contact.email and not existing.contact.email:
                existing.contact.email = new.contact.email
                existing.contact.email_valid = new.contact.email_valid
                
            if new.contact.website and not existing.contact.website:
                existing.contact.website = new.contact.website
                existing.contact.website_valid = new.contact.website_valid
                
            # Update metrics if better
            if new.metrics.estimated_revenue and not existing.metrics.estimated_revenue:
                existing.metrics.estimated_revenue = new.metrics.estimated_revenue
                
            if new.owner and not existing.owner:
                existing.owner = new.owner
                
        # Update overall quality to the better one
        if _qual_val(new.overall_quality) > _qual_val(existing.overall_quality):
            existing.overall_quality = new.overall_quality
            
        existing.last_updated = datetime.now()
        
        return existing
    
    def _init_validation_rules(self) -> Dict[str, Any]:
        """Initialize data validation rules"""
        
        return {
            'phone_patterns': [
                r'^\(\d{3}\) \d{3}-\d{4}$',  # (555) 123-4567
                r'^\d{3}-\d{3}-\d{4}$',      # 555-123-4567
                r'^\d{10}$'                   # 5551234567
            ],
            'email_pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            'website_pattern': r'^https?://[^\s/$.?#].[^\s]*$',
            'zip_pattern': r'^\d{5}(-\d{4})?$'
        }


# Export main classes
__all__ = [
    'DataNormalizer',
    'NormalizedBusiness',
    'DataSource',
    'BusinessCategory',
    'DataQuality',
    'Coordinates',
    'ContactInfo',
    'AddressInfo',
    'BusinessMetrics',
    'OwnerInfo',
    'DataProvenance'
]
