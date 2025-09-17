# Okapiq 2.0 - Market Intelligence Platform

A comprehensive market intelligence platform for small business analysis, deal sourcing, and CRM management.

## Features

- **Market Scanner**: Real-time business discovery using Google Maps, Yelp, and SERP APIs
- **Fragment Finder**: Market fragmentation analysis with HHI calculations
- **Enhanced CRM**: Contact management, campaign tools, and analytics
- **AI Chatbot**: OpenAI-powered assistant across all pages
- **Interactive Maps**: Google Maps integration with business location visualization
- **Mathematical Analytics**: Business density, revenue estimation, and market concentration analysis

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Environment Variables

Create a `.env` file in the backend directory with your API keys:

```bash
# Required API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
YELP_API_KEY=your_yelp_api_key
OPENAI_API_KEY=your_openai_api_key
SERP_API_KEY=your_serpapi_key

# Optional API Keys for enhanced features
US_CENSUS_API_KEY=your_census_api_key
APOLLO_API_KEY=your_apollo_api_key
SMARTY_AUTH_ID=your_smarty_auth_id
SMARTY_AUTH_TOKEN=your_smarty_auth_token
SMARTY_LICENSE_KEY_1=your_smarty_license_key_1
SMARTY_LICENSE_KEY_2=your_smarty_license_key_2

# Authentication
SECRET_KEY=your_secret_key_for_jwt
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- **Market Scanner**: `POST /intelligence/scan`
- **Fragment Finder**: `POST /fragment-finder/analyze`
- **CRM**: `GET/POST /enhanced-crm/*`
- **AI Chatbot**: `POST /chatbot/chat`
- **Authentication**: `POST /auth/login`, `POST /auth/register`

## Architecture

- **Backend**: FastAPI with SQLAlchemy, async processing
- **Frontend**: Next.js 14 with React, Tailwind CSS
- **Database**: SQLite (development), PostgreSQL (production ready)
- **APIs**: Google Maps, Yelp, OpenAI, SERP, US Census

## Security

All API keys are loaded from environment variables. Never commit API keys to version control.

## License

Private - All rights reserved