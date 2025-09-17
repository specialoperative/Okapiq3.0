# Figma Design Prompt for Okapiq - Bloomberg for Small Businesses

## 🎯 Project Overview
Design a modern, data-driven SaaS interface for Okapiq - an AI-powered market intelligence platform for SMB deal sourcing. The design should combine the sophistication of Bloomberg Terminal with the usability of modern SaaS dashboards like Stripe, Carta, and Mixpanel.

## 🏗️ Core Architecture

### Three-Product Ecosystem
1. **Oppy (Opportunity Finder)** - Market expansion and growth opportunities
2. **Fragment Finder** - Roll-up targeting and consolidation analysis  
3. **Acquisition Assistant** - Deal pipeline management and execution

## 🎨 Design System

### Color Palette
- **Primary Blue**: #3B82F6 (Primary actions, links, highlights)
- **Success Green**: #22C55E (Positive metrics, growth indicators)
- **Warning Orange**: #F59E0B (Medium risk, attention needed)
- **Danger Red**: #EF4444 (High risk, errors, alerts)
- **Neutral Grays**: #F8FAFC to #0F172A (Backgrounds, text, borders)

### Typography
- **Primary Font**: Inter (300-900 weights)
- **Monospace**: JetBrains Mono (for data, metrics)
- **Headings**: Bold weights (600-900)
- **Body**: Regular weight (400-500)

### Components
- **Cards**: Rounded corners (12px), soft shadows, white backgrounds
- **Buttons**: Primary (blue), Secondary (white), Ghost (transparent)
- **Inputs**: Rounded (8px), focus states with blue ring
- **Tables**: Clean borders, hover states, sortable headers

## 📊 Key Interface Sections

### 1. Market Intelligence Scanner (Hero Section)

**Layout**: Full-width card with prominent search interface

**Components**:
- Large search bar with location/industry input
- Industry dropdown (HVAC, Plumbing, Electrical, etc.)
- Radius selector (10-100 miles)
- "Scan Market" primary button
- Quick scan chips for major cities

**Visual Elements**:
- Magnifying glass icon in search bar
- Loading spinner during scan
- Results preview cards below

**Data Display**:
- TAM/SAM/SOM estimates in large typography
- Business count with location context
- HHI fragmentation score with color coding
- Ad spend to dominate calculation

### 2. Market Metrics Dashboard

**Layout**: 4-column grid of metric cards

**Metric Cards**:
1. **TAM Estimate** - Large dollar amount, YoY growth indicator
2. **Business Count** - Number with location context
3. **HHI Score** - Fragmentation level with emoji indicators
4. **Ad Spend to Dominate** - Monthly budget estimate

**Visual Indicators**:
- Icons for each metric type
- Color-coded badges for fragmentation levels
- Trend arrows for growth metrics
- Progress bars for market saturation

### 3. Business Intelligence Table

**Layout**: Sortable data table with business profiles

**Columns**:
- Business Name (with logo placeholder)
- Estimated Revenue (formatted currency)
- Employee Count
- Years in Business
- Yelp Rating (stars + review count)
- Succession Risk Score (0-100 with color coding)
- Lead Score (0-100 with priority indicators)
- Actions (Export, Contact, View Details)

**Interactive Elements**:
- Sortable columns
- Filterable by risk level, revenue range
- Bulk selection for CRM export
- Hover states with quick actions

### 4. Area Calculator Interface

**Layout**: Sidebar calculator with map integration

**Input Fields**:
- ZIP code input with autocomplete
- Industry selector
- Demographics toggle
- Radius adjustment slider

**Output Display**:
- TAM calculation in large typography
- Business count with growth trend
- HHI score with fragmentation gauge
- Market saturation percentage
- Demographics breakdown (if enabled)

**Visual Elements**:
- Geographic heatmap overlay
- Color-coded fragmentation zones
- Interactive map markers
- Export options (CSV, PDF, API)

### 5. Three-Product Ecosystem Cards

**Layout**: 3-column grid of product cards

**Card 1 - Oppy (Opportunity Finder)**:
- Icon: Magnifying glass with growth arrows
- Target: "Growth-focused operators"
- Features list with checkmarks
- "Best For" section with use cases

**Card 2 - Fragment Finder**:
- Icon: Puzzle pieces forming a whole
- Target: "PE funds, search funds"
- HHI calculation visualization
- Roll-up opportunity scoring

**Card 3 - Acquisition Assistant**:
- Icon: Document with pipeline flow
- Target: "M&A teams"
- Pipeline management preview
- Deal tracking interface

### 6. CRM Integration Dashboard

**Layout**: Lead management interface

**Components**:
- Lead list with filtering options
- Bulk export functionality
- Contact information enrichment
- Outreach sequence management
- Succession risk scoring display

**Visual Elements**:
- Lead score indicators (color-coded)
- Risk level badges
- Contact status indicators
- Export format selectors

## 🧠 Algorithm Visualizations

### TAM/SAM/SOM Calculation Display
- **Pie chart** showing market breakdown
- **Bar chart** comparing different regions
- **Line chart** showing growth trends
- **Tooltips** with calculation methodology

### HHI Fragmentation Analysis
- **Gauge chart** showing fragmentation level
- **Heatmap** of geographic fragmentation
- **Bar chart** of market concentration
- **Color coding**: Green (fragmented) to Red (consolidated)

### Succession Risk Scoring
- **Risk meter** (0-100 scale)
- **Factor breakdown** (age, business age, online presence)
- **Timeline visualization** for exit probability
- **Priority indicators** for high-risk businesses

### Lead Quality Scoring
- **Score distribution** histogram
- **Factor weights** visualization
- **Priority queue** for outreach
- **Conversion probability** indicators

## 📱 Responsive Design

### Desktop (1200px+)
- Full sidebar navigation
- 4-column metric grid
- Detailed data tables
- Side-by-side comparisons

### Tablet (768px-1199px)
- Collapsible sidebar
- 2-column metric grid
- Scrollable data tables
- Stacked comparisons

### Mobile (320px-767px)
- Hamburger menu navigation
- Single-column layout
- Card-based data display
- Swipeable interfaces

## 🎭 Interactive States

### Loading States
- Skeleton screens for data loading
- Progress indicators for market scans
- Spinning icons for API calls
- Shimmer effects for content loading

### Error States
- Error messages with actionable solutions
- Retry buttons for failed operations
- Fallback content for missing data
- Validation feedback for forms

### Success States
- Confirmation messages for actions
- Success animations for completed tasks
- Progress indicators for multi-step processes
- Celebration micro-interactions

## 🔧 Technical Specifications

### Data Visualization Libraries
- **Charts**: Recharts or Chart.js for metrics
- **Maps**: Mapbox or Leaflet for geographic data
- **Tables**: React Table for sortable data
- **Animations**: Framer Motion for interactions

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### Performance
- Lazy loading for large datasets
- Virtual scrolling for long lists
- Optimized images and icons
- Efficient re-rendering strategies

## 🎨 Visual Hierarchy

### Information Architecture
1. **Primary Actions** - Market scan, export, contact
2. **Key Metrics** - TAM, business count, HHI score
3. **Detailed Data** - Business profiles, market analysis
4. **Supporting Info** - Help text, tooltips, documentation

### Visual Weight
- **Heavy**: Primary buttons, key metrics, important alerts
- **Medium**: Secondary actions, data tables, navigation
- **Light**: Help text, metadata, decorative elements

## 🚀 Animation Guidelines

### Micro-interactions
- Button hover states (scale + shadow)
- Card hover effects (lift + shadow)
- Loading spinners (smooth rotation)
- Success checkmarks (bounce + fade)

### Page Transitions
- Fade in/out for content changes
- Slide animations for navigation
- Scale transitions for modal dialogs
- Stagger animations for list items

### Data Updates
- Smooth transitions for metric changes
- Animated counters for number updates
- Pulse effects for new data
- Highlight animations for important changes

## 📋 Implementation Checklist

### Design Deliverables
- [ ] High-fidelity mockups for all screens
- [ ] Component library with all states
- [ ] Responsive breakpoint specifications
- [ ] Animation specifications and timing
- [ ] Accessibility guidelines and testing
- [ ] Design system documentation
- [ ] Icon and illustration assets
- [ ] Color palette and typography specs

### Development Handoff
- [ ] Figma design tokens export
- [ ] Component specifications
- [ ] Animation code examples
- [ ] Accessibility audit results
- [ ] Performance optimization notes
- [ ] Browser compatibility matrix
- [ ] Mobile testing guidelines

## 🎯 Success Metrics

### User Experience
- Time to complete market scan
- Accuracy of data interpretation
- Ease of lead export process
- User satisfaction with interface

### Business Impact
- Increased lead generation efficiency
- Higher conversion rates from qualified leads
- Reduced time to market analysis
- Improved decision-making speed

### Technical Performance
- Page load times under 3 seconds
- API response times under 500ms
- 99.9% uptime for critical features
- Mobile performance scores above 90

---

**Design Goal**: Create an interface that makes complex market intelligence data accessible, actionable, and visually compelling while maintaining the professional credibility expected in the M&A and investment space. 