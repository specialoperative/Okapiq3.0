from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.core.database import get_db, User
from app.core.config import settings

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company: Optional[str] = None
    trial_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    company: Optional[str]
    subscription_tier: str
    trial_end_date: Optional[datetime]
    is_active: bool

class TrialCodeRequest(BaseModel):
    code: str
    email: EmailStr

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with optional trial code
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Hash password
        hashed_password = pwd_context.hash(user_data.password)
        
        # Determine trial period
        trial_end_date = None
        if user_data.trial_code:
            if user_data.trial_code == settings.ETALAUNCH_CODE:
                trial_end_date = datetime.utcnow() + timedelta(days=settings.ETALAUNCH_TRIAL_DAYS)
                subscription_tier = "elite"  # Full access for EtA Launch Hub fellows
            else:
                # Validate other trial codes here
                trial_end_date = datetime.utcnow() + timedelta(days=settings.TRIAL_DAYS)
                subscription_tier = "explorer"
        else:
            trial_end_date = datetime.utcnow() + timedelta(days=settings.TRIAL_DAYS)
            subscription_tier = "explorer"
        
        # Create user
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            company=user_data.company,
            subscription_tier=subscription_tier,
            trial_end_date=trial_end_date,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return UserResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            company=new_user.company,
            subscription_tier=new_user.subscription_tier,
            trial_end_date=new_user.trial_end_date,
            is_active=new_user.is_active
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return access token
    """
    try:
        # Find user
        user = db.query(User).filter(User.email == user_data.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not pwd_context.verify(user_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Check trial status
        trial_expired = False
        if user.trial_end_date and user.trial_end_date < datetime.utcnow():
            trial_expired = True
        
        # Generate access token
        access_token = create_access_token(data={"sub": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                company=user.company,
                subscription_tier=user.subscription_tier,
                trial_end_date=user.trial_end_date,
                is_active=user.is_active
            ),
            "trial_expired": trial_expired
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/validate-trial-code")
async def validate_trial_code(request: TrialCodeRequest):
    """
    Validate trial code and return trial information
    """
    try:
        if request.code == settings.ETALAUNCH_CODE:
            return {
                "valid": True,
                "trial_days": settings.ETALAUNCH_TRIAL_DAYS,
                "subscription_tier": "elite",
                "description": "EtA Launch Hub Fellow - Full Access Trial",
                "features": [
                    "2,500+ precision-qualified leads/month",
                    "Complete deal pipeline management",
                    "AI-generated CIMs & outreach templates",
                    "Full TAM/SAM/SOM analysis suite",
                    "API access & custom integrations"
                ]
            }
        else:
            # Add validation for other trial codes here
            return {
                "valid": False,
                "message": "Invalid trial code"
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trial code validation failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current user information
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            company=user.company,
            subscription_tier=user.subscription_tier,
            trial_end_date=user.trial_end_date,
            is_active=user.is_active
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except (jwt.DecodeError, jwt.InvalidTokenError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.get("/subscription-status")
async def get_subscription_status(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get user's subscription status and limits
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Check trial status
        trial_expired = False
        days_remaining = 0
        
        if user.trial_end_date:
            if user.trial_end_date < datetime.utcnow():
                trial_expired = True
            else:
                days_remaining = (user.trial_end_date - datetime.utcnow()).days
        
        # Get subscription limits based on tier
        limits = get_subscription_limits(user.subscription_tier)
        
        return {
            "subscription_tier": user.subscription_tier,
            "trial_expired": trial_expired,
            "trial_days_remaining": days_remaining,
            "limits": limits,
            "is_active": user.is_active
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subscription status: {str(e)}"
        )

@router.post("/upgrade-subscription")
async def upgrade_subscription(
    new_tier: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Upgrade user subscription (would integrate with Stripe in production)
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Validate tier
        valid_tiers = ["explorer", "professional", "elite"]
        if new_tier not in valid_tiers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tier. Must be one of: {', '.join(valid_tiers)}"
            )
        
        # Update subscription (in production, verify payment with Stripe)
        user.subscription_tier = new_tier
        user.trial_end_date = None  # Remove trial if upgrading
        
        db.commit()
        
        return {
            "message": f"Successfully upgraded to {new_tier} tier",
            "new_tier": new_tier,
            "limits": get_subscription_limits(new_tier)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upgrade failed: {str(e)}"
        )

# Helper functions
def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_subscription_limits(tier: str) -> dict:
    """Get subscription limits based on tier"""
    limits = {
        "explorer": {
            "leads_per_month": 1000,
            "market_scans_per_month": 50,
            "export_formats": ["csv"],
            "api_calls_per_day": 100,
            "features": [
                "Basic TAM/SAM estimates",
                "City/ZIP demographic analysis",
                "CSV export functionality"
            ]
        },
        "professional": {
            "leads_per_month": 2000,
            "market_scans_per_month": 200,
            "export_formats": ["csv", "json", "xlsx"],
            "api_calls_per_day": 500,
            "features": [
                "HHI fragmentation scoring",
                "Roll-up opportunity identification",
                "CRM-ready lead exports",
                "Succession risk indicators"
            ]
        },
        "elite": {
            "leads_per_month": 2500,
            "market_scans_per_month": 1000,
            "export_formats": ["csv", "json", "xlsx", "pdf"],
            "api_calls_per_day": 2000,
            "features": [
                "Complete deal pipeline management",
                "AI-generated CIMs & outreach templates",
                "Full TAM/SAM/SOM analysis suite",
                "API access & custom integrations",
                "Dedicated analyst calls"
            ]
        }
    }
    
    return limits.get(tier, limits["explorer"])

# Dependency for protected routes
async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency to get current user for protected routes"""
    token = credentials.credentials
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    email = payload.get("sub")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user 