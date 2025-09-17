# 🏗️ OKAPIQ - Complete System Architecture Diagram

## 📊 Full Backend-Frontend Data Flow Architecture

```mermaid
graph TB
    %% Frontend Layer - Next.js Components
    subgraph "🎨 FRONTEND (Next.js - Port 3000)" 
        LP[🏠 Landing Page<br/>landing-page.tsx]
        MS[🎯 Market Scanner<br/>market-scanner-page.tsx]
        FF[🔍 Fragment Finder<br/>fragment-finder/page.tsx]
        CRM[🏢 CRM Pipeline<br/>CRMDealPipeline.tsx]
        DASH[📊 Dashboard<br/>dashboard.tsx]
        AUTH[🔐 Auth Pages<br/>signin/signup]
        PRICING[💰 Pricing<br/>pricing.tsx]
        
        %% Global Components
        NAV[🧭 Navigation<br/>layout.tsx]
        CHAT[🤖 AI Chat Widget<br/>AIChat.tsx]
        LOGIN[👤 LoginMenu<br/>LoginMenu.tsx]
    end

    %% API Gateway Layer
    subgraph "🔗 HTTP COMMUNICATIONS"
        HTTP[⚡ HTTP Requests<br/>fetch() calls]
        CORS[🌐 CORS Middleware<br/>Cross-Origin Headers]
        WS[🔄 WebSocket<br/>Real-time Updates]
    end

    %% Backend API Layer - FastAPI Routers
    subgraph "🚀 BACKEND API (FastAPI - Port 8001)"
        MAIN[🎯 Main App<br/>main.py]
        
        %% Core Routers
        INTEL[🧠 Intelligence Router<br/>intelligence_working.py]
        FRAG[🔍 Fragment Router<br/>fragment_finder.py]
        CRMR[🏢 CRM Router<br/>crm.py]
        AUTHR[🔐 Auth Router<br/>auth.py]
        DASHB[📊 Dashboard Router<br/>dashboard.py]
        BOT[🤖 Chatbot Router<br/>chatbot.py]
    end

    %% Backend Services Layer
    subgraph "⚙️ BACKEND SERVICES"
        %% Intelligence Services
        IIS[🧠 Intelligence Service<br/>Multi-source Data Aggregation]
        FFS[🔍 Fragment Finder Service<br/>Market Fragmentation Analysis]
        
        %% Analytics Engine
        AE[📈 Analytics Engine<br/>TAM/SAM/HHI Calculations]
        SE[🎯 Scoring Engine<br/>Lead Score Generation<br/>Market Fragmentation<br/>Succession Risk]
        
        %% Data Enrichment
        DE[📊 Data Enrichment<br/>Business Intelligence<br/>Owner Age Estimation<br/>Revenue Calculation]
    end

    %% External APIs Layer
    subgraph "🌍 EXTERNAL APIS & DATA SOURCES"
        %% Google Services
        GM[🗺️ Google Maps API<br/>Places Search<br/>Business Details<br/>Geocoding]
        
        %% Business Data
        YELP[⭐ Yelp Fusion API<br/>Business Reviews<br/>Rating & Review Count<br/>Contact Information]
        
        %% AI Services  
        OPENAI[🤖 OpenAI API<br/>GPT-3.5-turbo<br/>Chatbot Responses]
        
        %% Market Data
        CENSUS[🏛️ US Census API<br/>Demographic Data<br/>Geographic Data]
        APOLLO[🚀 Apollo API<br/>Business Intelligence<br/>Contact Data]
        SERP[🔍 SERP API<br/>Business Discovery<br/>Web Scraping]
        SMARTY[🏠 Smarty API<br/>Property Data<br/>Homeownership Rates]
    end

    %% Database Layer
    subgraph "💾 DATA STORAGE"
        %% Primary Database
        DB[(🗄️ SQLite Database<br/>test.db)]
        
        %% Database Tables
        USERS[(👥 Users Table<br/>Authentication Data<br/>Subscription Info)]
        SCANS[(📊 Market Scans<br/>Business Data<br/>Analytics Results)]
        LEADS[(📝 Leads Table<br/>CRM Pipeline Data)]
        BUSINESS[(🏢 Business Table<br/>Company Information<br/>Contact Details)]
        
        %% Session Storage
        SESSIONS[💭 Chat Sessions<br/>In-Memory Storage<br/>Conversation History]
        CACHE[⚡ Redis Cache<br/>API Response Caching<br/>Performance Optimization]
    end

    %% Data Flow Connections - Frontend to Backend
    LP --> HTTP
    MS --> HTTP  
    FF --> HTTP
    CRM --> HTTP
    DASH --> HTTP
    AUTH --> HTTP
    CHAT --> HTTP
    
    %% HTTP to Backend Routers
    HTTP --> MAIN
    MAIN --> INTEL
    MAIN --> FRAG
    MAIN --> CRMR
    MAIN --> AUTHR
    MAIN --> DASHB
    MAIN --> BOT
    
    %% Backend Routers to Services
    INTEL --> IIS
    FRAG --> FFS
    INTEL --> AE
    INTEL --> SE
    FRAG --> SE
    INTEL --> DE
    
    %% Services to External APIs
    IIS --> GM
    IIS --> YELP
    IIS --> CENSUS
    IIS --> APOLLO
    IIS --> SERP
    FFS --> GM
    FFS --> YELP
    FFS --> SMARTY
    BOT --> OPENAI
    
    %% Database Connections
    AUTHR --> USERS
    INTEL --> SCANS
    INTEL --> BUSINESS  
    CRMR --> LEADS
    DASHB --> SCANS
    BOT --> SESSIONS
    IIS --> CACHE
    
    %% Global Components Integration
    NAV --> LOGIN
    NAV --> AUTH
    MAIN --> CORS
    
    %% Styling for different layers
    classDef frontend fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef service fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    classDef external fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    classDef database fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#fff
    classDef communication fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    
    %% Apply styles
    class LP,MS,FF,CRM,DASH,AUTH,PRICING,NAV,CHAT,LOGIN frontend
    class MAIN,INTEL,FRAG,CRMR,AUTHR,DASHB,BOT backend
    class IIS,FFS,AE,SE,DE service
    class GM,YELP,OPENAI,CENSUS,APOLLO,SERP,SMARTY external
    class DB,USERS,SCANS,LEADS,BUSINESS,SESSIONS,CACHE database
    class HTTP,CORS,WS communication
```

## 🔄 Key Data Flows

### 1. 🎯 Market Scanner Flow
```
User Input (Location + Industry) 
→ market-scanner-page.tsx 
→ HTTP Request 
→ intelligence_working.py 
→ Intelligence Service 
→ [Google Maps + Yelp + Census APIs] 
→ Analytics Engine 
→ Business Database 
→ Formatted Results 
→ Frontend Display
```

### 2. 🔍 Fragment Finder Flow  
```
Market Analysis Request 
→ fragment-finder/page.tsx 
→ HTTP Request 
→ fragment_finder.py 
→ Fragment Finder Service 
→ [Google Maps + Smarty APIs] 
→ HHI Calculation 
→ Market Fragmentation Analysis 
→ Interactive Map Display
```

### 3. 🏢 CRM Pipeline Flow
```
Campaign Execution 
→ CRMDealPipeline.tsx 
→ HTTP Request 
→ crm.py 
→ Campaign Processing 
→ Email Notification (osiris@okapiq.com) 
→ Leads Database Update 
→ Pipeline Status Update
```

### 4. 🤖 AI Chatbot Flow
```
User Chat Message 
→ AIChat.tsx 
→ HTTP Request 
→ chatbot.py 
→ OpenAI API 
→ Context-Aware Response 
→ Session Storage 
→ Chat History Persistence
```

### 5. 🔐 Authentication Flow
```
User Login/Register 
→ signin/signup pages 
→ HTTP Request 
→ auth.py 
→ Password Hashing 
→ JWT Token Generation 
→ User Database 
→ Session Management 
→ Protected Route Access
```

## 📋 Component Details

### 🎨 Frontend Components (Next.js)
| Component | Purpose | Key Features |
|-----------|---------|-------------|
| **Landing Page** | Homepage with rotating text, map integration | Industry selection, business discovery |
| **Market Scanner** | Core business intelligence tool | Real-time scanning, analytics display |  
| **Fragment Finder** | Market fragmentation analysis | HHI scoring, expansion opportunities |
| **CRM Pipeline** | Deal management system | Campaign execution, ROI calculation |
| **AI Chatbot** | Intelligent assistant | Context-aware, session persistence |
| **Authentication** | User management | JWT tokens, subscription tiers |

### 🚀 Backend Routers (FastAPI)  
| Router | Endpoints | Functionality |
|--------|-----------|---------------|
| **Intelligence** | `/intelligence/scan` | Business discovery, market analysis |
| **Fragment Finder** | `/fragment-finder/analyze` | Market fragmentation scoring |
| **CRM** | `/crm/execute-campaign` | Campaign management, notifications |
| **Auth** | `/auth/login`, `/auth/register` | User authentication, JWT management |
| **Chatbot** | `/chatbot/chat` | AI-powered conversation |
| **Dashboard** | `/dashboard/stats` | Analytics aggregation |

### 🌍 External API Integrations
| Service | Purpose | Data Provided |
|---------|---------|---------------|
| **Google Maps** | Business discovery | Places, contact info, geocoding |
| **Yelp Fusion** | Business intelligence | Reviews, ratings, popularity |
| **OpenAI** | AI responses | GPT-3.5-turbo chat completions |
| **US Census** | Demographics | Population, economic data |
| **Apollo** | Business data | Company intelligence |
| **SERP** | Web scraping | Business discovery |
| **Smarty** | Property data | Homeownership rates |

### 💾 Database Schema
| Table | Purpose | Key Fields |
|-------|---------|------------|
| **Users** | Authentication | email, hashed_password, subscription_tier |
| **Market Scans** | Business data | location, industry, tam_estimate, businesses |
| **Businesses** | Company info | name, address, contact, analytics |
| **Leads** | CRM pipeline | status, notes, contact_attempts |

## 🔧 System Characteristics

### ⚡ Performance Features
- **Async Processing**: FastAPI with async/await patterns
- **Caching Layer**: Redis for API response optimization  
- **Session Management**: In-memory chat history storage
- **Database Optimization**: SQLite with proper indexing

### 🛡️ Security Features
- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Proper cross-origin handling
- **Password Hashing**: bcrypt for secure storage
- **API Key Management**: Environment-based configuration

### 🎯 Key Integrations
- **Real-time Analytics**: TAM/SAM/HHI calculations
- **AI-Powered Chat**: OpenAI GPT-3.5-turbo integration  
- **Multi-source Data**: 7+ external API integrations
- **Interactive Maps**: Google Maps with business pinpoints
- **Campaign Execution**: End-to-end CRM automation

## 🚀 Deployment Architecture

```
📱 Client Browser (localhost:3000)
    ↕️ HTTPS/WebSocket
🌐 Next.js Frontend Server  
    ↕️ REST API Calls
🔗 FastAPI Backend (localhost:8001)
    ↕️ External API Calls  
🌍 External Services (Google, Yelp, OpenAI)
    ↕️ Database Queries
💾 SQLite Database + Redis Cache
```

---

**🎯 This architecture supports Okapiq's mission as "Bloomberg for Small Businesses" with comprehensive market intelligence, real-time analytics, and AI-powered assistance across all user touchpoints.**
