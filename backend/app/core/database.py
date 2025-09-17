from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func

# Simple in-memory SQLite database for development
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Create all tables
def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

# Initialize database if it doesn't exist
def init_db():
    """Initialize database with tables"""
    try:
        create_tables()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    company = Column(String)
    subscription_tier = Column(String, default="free")  # free, explorer, professional, elite
    trial_end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    market_scans = relationship("MarketScan", back_populates="user")
    leads = relationship("Lead", back_populates="user")

class MarketScan(Base):
    __tablename__ = "market_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    location = Column(String)  # ZIP code, city, or region
    industry = Column(String)
    tam_estimate = Column(Float)
    sam_estimate = Column(Float)
    som_estimate = Column(Float)
    business_count = Column(Integer)
    hhi_score = Column(Float)
    fragmentation_level = Column(String)  # fragmented, moderate, consolidated
    avg_revenue_per_business = Column(Float)
    market_saturation_percent = Column(Float)
    ad_spend_to_dominate = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="market_scans")
    businesses = relationship("Business", back_populates="market_scan")

class Business(Base):
    __tablename__ = "businesses"
    
    id = Column(Integer, primary_key=True, index=True)
    market_scan_id = Column(Integer, ForeignKey("market_scans.id"))
    name = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    phone = Column(String)
    website = Column(String)
    industry = Column(String)
    estimated_revenue = Column(Float)
    employee_count = Column(Integer)
    years_in_business = Column(Integer)
    yelp_rating = Column(Float)
    yelp_review_count = Column(Integer)
    succession_risk_score = Column(Float)  # 0-100
    owner_age_estimate = Column(Integer)
    market_share_percent = Column(Float)
    lead_score = Column(Float)  # 0-100
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    market_scan = relationship("MarketScan", back_populates="businesses")
    leads = relationship("Lead", back_populates="business")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    business_id = Column(Integer, ForeignKey("businesses.id"))
    status = Column(String, default="new")  # new, contacted, qualified, converted
    notes = Column(Text)
    contact_attempts = Column(Integer, default=0)
    last_contact_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="leads")
    business = relationship("Business", back_populates="leads")

class MarketIntelligence(Base):
    __tablename__ = "market_intelligence"
    
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String)
    industry = Column(String)
    data_type = Column(String)  # census, yelp, sos, etc.
    data_json = Column(Text)  # JSON string of raw data
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime)
