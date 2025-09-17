from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
from app.core.config import settings

router = APIRouter()

# OpenAI import and setup - with fallback handling
try:
    import openai
    openai.api_key = settings.OPENAI_API_KEY
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI not available, using fallback responses")

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant" 
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    session_id: str
    current_page: str
    chat_history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime

# In-memory session storage (in production, use Redis or database)
chat_sessions: Dict[str, List[ChatMessage]] = {}

def get_system_prompt() -> str:
    """Get the system prompt for the Okapiq AI assistant"""
    return """You are the Okapiq AI Assistant, a helpful and knowledgeable chatbot for Okapiq.com - Bloomberg for Small Businesses. 

About Okapiq:
- Okapiq is a market intelligence platform focused on small business acquisitions and franchise opportunities
- We provide AI-powered deal sourcing from public data, owner signals, and market intelligence
- Our platform offers CRM-ready leads with TAM/SAM estimates and ad spend analysis
- We help users find and qualify SMB deals before anyone else

Key Features:
1. Market Scanner (Oppy) - Find business opportunities in any location/industry
2. Fragment Finder - Identify fragmented, underserved markets for expansion 
3. CRM/Acquisition Assistant - End-to-end campaign execution and deal pipeline management
4. Real-time market intelligence with business analytics
5. TAM/SAM analysis, HHI fragmentation scoring, succession risk indicators

Pricing Tiers:
- Explorer Pack ($79/month): 1,000+ leads/month, basic analysis, CSV export
- Professional ($897/month): 2,000 qualified scans/month, HHI scoring, succession indicators
- Elite Intelligence Suite ($5900/month): 2,500+ precision leads/month, full pipeline management, AI-generated materials

You should:
- Be helpful, professional, and knowledgeable about all Okapiq features
- Answer questions about pricing, features, how to use different tools
- Help users navigate the platform and understand market intelligence concepts
- Provide guidance on deal sourcing, market analysis, and business acquisition strategies
- Be conversational but informative
- If you don't know something specific, acknowledge it but offer related helpful information

Keep responses concise but comprehensive. Always aim to help users maximize their success with Okapiq."""

def get_fallback_response(message: str, current_page: str) -> str:
    """
    Provide fallback responses when OpenAI is not available
    """
    message_lower = message.lower()
    
    # Common questions and responses
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'start']):
        return f"Hello! I'm your Okapiq AI assistant. I'm here to help you with questions about our market intelligence platform. You're currently on the {current_page} page. How can I assist you today?"
    
    elif any(word in message_lower for word in ['pricing', 'price', 'cost', 'plan']):
        return """Here are our pricing tiers:

**Explorer Pack** - $79/month: 1,000+ leads/month, basic TAM/SAM analysis, CSV export
**Professional** - $897/month: 2,000 qualified scans/month, HHI fragmentation scoring, succession indicators  
**Elite Intelligence Suite** - $5,900/month: 2,500+ precision leads/month, full pipeline management, AI-generated materials

Would you like more details about any specific plan?"""

    elif any(word in message_lower for word in ['feature', 'tool', 'what does', 'how to']):
        return f"""Okapiq offers several powerful tools:

🎯 **Market Scanner** - Find business opportunities in any location/industry
🔍 **Fragment Finder** - Identify underserved markets for expansion
🏢 **CRM/Acquisition Assistant** - End-to-end deal pipeline management
📊 **Real-time Analytics** - TAM/SAM analysis, HHI scoring, succession risk

Since you're on the {current_page} page, would you like specific guidance about this section?"""

    elif any(word in message_lower for word in ['market scanner', 'oppy', 'leads']):
        return """The Market Scanner (Oppy) helps you find and qualify SMB deals before anyone else! It provides:

• CRM-ready leads with contact information
• TAM/SAM market estimates  
• Business analytics and succession risk indicators
• Owner age estimation and market share data
• Export functionality for your CRM

Try entering a city and industry to start scanning for opportunities!"""

    elif any(word in message_lower for word in ['fragment finder', 'fragmented', 'expansion']):
        return """Fragment Finder identifies fragmented, underserved markets perfect for franchise expansion or consolidation plays:

• HHI fragmentation scoring by ZIP/MSA
• Business density analysis
• Succession risk assessment  
• Market consolidation opportunities
• Homeownership rate data

It's ideal for finding markets where you can gain significant market share quickly!"""

    elif any(word in message_lower for word in ['crm', 'campaign', 'acquisition']):
        return """The CRM (Acquisition Assistant) manages your entire deal pipeline:

• Execute end-to-end campaigns
• Track franchise conversion opportunities  
• Generate investment memos
• Calculate ROI for deals
• Manage territory opportunities

It helps you convert leads into successful acquisitions with professional campaign execution."""

    elif any(word in message_lower for word in ['help', 'support', 'question']):
        return f"""I'm here to help! I can answer questions about:

• Platform features and how to use them
• Pricing and subscription options  
• Market analysis concepts (TAM, SAM, HHI)
• Deal sourcing strategies
• Navigation and getting started

You're currently on the {current_page} page. What specific question can I help you with?"""

    else:
        return f"""Thanks for your question! I'm your Okapiq AI assistant, and I'm here to help you navigate our market intelligence platform.

Since you're on the {current_page} page, I can provide specific guidance about this section, or help with:

• Understanding our tools (Market Scanner, Fragment Finder, CRM)
• Pricing and plans
• Market analysis concepts  
• Getting started with deal sourcing

What would you like to know more about?"""

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Handle chat requests from the AI assistant
    """
    try:
        session_id = request.session_id
        
        # Initialize session if it doesn't exist
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        
        # Add user message to session
        user_message = ChatMessage(
            role="user", 
            content=request.message,
            timestamp=datetime.utcnow()
        )
        chat_sessions[session_id].append(user_message)
        
        # Prepare messages for OpenAI
        messages = [{"role": "system", "content": get_system_prompt()}]
        
        # Add recent chat history (last 10 messages to stay within token limits)
        recent_history = chat_sessions[session_id][-10:]
        for msg in recent_history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add context about current page
        page_context = f"\n\nContext: User is currently on the '{request.current_page}' page of Okapiq."
        messages[-1]["content"] += page_context
        
        # Call OpenAI API or use fallback
        if OPENAI_AVAILABLE:
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=500,
                    temperature=0.7,
                    top_p=1,
                    frequency_penalty=0,
                    presence_penalty=0
                )
                ai_response = response.choices[0].message.content.strip()
            except Exception as openai_error:
                print(f"OpenAI API error: {openai_error}")
                ai_response = get_fallback_response(request.message, request.current_page)
        else:
            ai_response = get_fallback_response(request.message, request.current_page)
        
        # Add assistant response to session
        assistant_message = ChatMessage(
            role="assistant",
            content=ai_response,
            timestamp=datetime.utcnow()
        )
        chat_sessions[session_id].append(assistant_message)
        
        return ChatResponse(
            response=ai_response,
            session_id=session_id,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )

@router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """
    Get chat history for a session
    """
    if session_id not in chat_sessions:
        return {"messages": []}
    
    return {"messages": chat_sessions[session_id]}

@router.delete("/chat/session/{session_id}")
async def clear_chat_session(session_id: str):
    """
    Clear chat session
    """
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    
    return {"message": "Chat session cleared"}

@router.get("/chat/health")
async def chat_health_check():
    """
    Health check for chat service
    """
    return {
        "status": "healthy",
        "active_sessions": len(chat_sessions),
        "openai_configured": bool(settings.OPENAI_API_KEY)
    }
