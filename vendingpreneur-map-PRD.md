# VendingPreneur Map - Product Requirements Document

## Overview
Internal CRM mapping tool for Modern Amenities Group to visualize and search Vendingpreneur clients across the United States with interactive geographic interface.

## Core Objective
Display 20,000+ Vendingpreneur clients on an interactive US map with real-time data from existing Airtable views, enabling team to quickly search, filter, and analyze client distribution, performance metrics, and location details.

---

## Technical Requirements

### Data Source
- **Platform**: Airtable (read-only access)
- **Primary Table**: Clients view (20,647 records)
- **Secondary Table**: Locations view (67+ records)
- **Access Method**: Airtable REST API with personal access token (read-only permissions)
- **Update Frequency**: Real-time on page load (no caching initially)

### Authentication
- Internal tool (team access only)
- No public access
- Consider Vercel password protection or simple auth layer

### Tech Stack
```
Framework: Next.js 14 (App Router)
Language: TypeScript (strict mode)
UI Library: shadcn/ui + Radix UI
Styling: Tailwind CSS
Mapping: Mapbox GL JS
Icons: Lucide React (minimal usage)
Deployment: Vercel
```

---

## User Experience

### Primary Use Case
Team member needs to:
1. View all Vendingpreneurs on US map
2. Search by name, location, or filters
3. Click client marker to see detailed info
4. Understand geographic distribution and performance metrics

### UX Principles
- **Minimal**: Clean white background, no gradients, no clutter
- **Fast**: Sub-2 second load time, instant search results
- **Familiar**: Google Maps-style interaction (pan, zoom, click)
- **Scannable**: Bento card layout for data display

---

## Core Features

### 1. Interactive Map View
**Map Configuration**
- Initial viewport: Continental US (centered at 39.8283, -98.5795, zoom level 4)
- Style: Mapbox Light v11 (clean, minimal)
- Controls: Zoom, navigation, fullscreen
- Interaction: Click, drag, scroll to zoom

**Markers**
- Display all clients with valid lat/lng coordinates
- Color-coded by Membership Level:
  - **Gold**: `#FFD700` (gold)
  - **Silver**: `#C0C0C0` (silver)
  - **Bronze**: `#CD7F32` (bronze)
  - **Expired**: `#999999` (gray)
- Marker clustering for dense metro areas (10+ markers within 50px)
- Hover state: Show client name tooltip
- Click state: Open sidebar with full details

### 2. Search & Filter System
**Search Bar** (top-left overlay)
- Full-text search across: Full Name, City, State, Business Name
- Debounced input (300ms delay)
- Clear button
- Show result count: "142 results"

**Filter Panel** (collapsible, top-left)
- State dropdown (multi-select, 50 states)
- Membership Level chips (Gold/Silver/Bronze/Expired)
- Machine count slider (0-20+)
- Monthly revenue range ($0-$10k+)
- Clear all filters button

**Active Filters Display**
- Show active filters as dismissible chips below search
- Example: "California × Gold × 5+ machines"

### 3. Client Details Sidebar
**Trigger**: Click any map marker

**Layout**: Slide-in from right (400px width, Google Maps style)

**Content Sections** (vertical scroll):

**Header Card**
- Full Name (H2)
- Client ID badge
- Membership Level badge (colored)
- Status indicator (Active/Expired)

**Contact Info Bento**
- Phone number (click to call)
- Email (click to email)
- Business Name
- Full Address

**Metrics Grid** (2x2 bento cards)
- Total Machines (large number + icon)
- Total Locations (large number + icon)
- Monthly Revenue (formatted currency)
- Days in Program (tenure)

**Locations List** (collapsible accordion)
- Location 1-5 addresses
- Each shows: Address, Machine Type, Monthly Revenue
- "View in Airtable" link for full record

**Footer**
- "View Full Profile in Airtable" button (opens record in new tab)
- Close sidebar button

### 4. Stats Dashboard
**Position**: Top bar overlay (full width, sticky)

**Metrics** (4 cards, horizontal):
- Total Clients (count of visible on map)
- Total Machines (sum of all visible clients)
- Total Monthly Revenue (sum, formatted as currency)
- States Represented (unique state count)

**Behavior**:
- Updates dynamically based on current filters/search
- Shows "of X total" when filtered

---

## Data Schema

### Airtable Clients Table Fields (Required)
```typescript
{
  recordId: string;
  fullName: string;
  clientId: string;
  membershipLevel: 'Gold' | 'Silver' | 'Bronze';
  status: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  personalEmail: string;
  businessName: string;
  fullAddress: string;
  totalNumberOfMachines: number;
  totalNumberOfLocations: number;
  totalMonthlyRevenue: number;
  daysInProgram: number;
  location1Address: string;
  location2Address: string;
  location3Address: string;
  location4Address: string;
  location5Address: string;
}
```

### Airtable Locations Table Fields (Optional Phase 2)
```typescript
{
  locationName: string;
  propertyType: string;
  machineType: string;
  numberOfMachines: number;
  monthlyRevenue: number;
  latitude: number;
  longitude: number;
}
```

---

## Design System

### Color Palette
```css
Primary Green: #00B67A (Modern Amenities brand)
Background: #FFFFFF
Text Primary: #0A0A0A
Text Secondary: #525252
Border: #E5E5E5
Hover: #FAFAFA

Membership Colors:
Gold: #FFD700
Silver: #C0C0C0
Bronze: #CD7F32
Expired: #999999
```

### Typography
```css
Font Family: Inter (via next/font)
H1: 32px, font-semibold
H2: 24px, font-semibold
H3: 18px, font-medium
Body: 14px, font-normal
Small: 12px, font-normal
```

### Spacing
```
Container: max-w-screen-2xl
Padding: p-4 (16px)
Gap: gap-4 (16px) for grids
Border Radius: rounded-lg (8px)
```

### Components
All components use shadcn/ui defaults with minimal customization:
- Button (default variant)
- Input (search styling)
- Card (clean borders, no shadows)
- Badge (membership levels)
- Select (for dropdowns)
- Slider (for range filters)

---

## Technical Architecture

### File Structure
```
vendingpreneur-map/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main map page
│   ├── globals.css                   # Tailwind + custom styles
│   └── api/
│       └── clients/
│           └── route.ts              # Server-side Airtable fetch
├── components/
│   ├── map/
│   │   ├── MapView.tsx               # Mapbox container
│   │   ├── ClientMarker.tsx          # Individual marker component
│   │   └── MarkerCluster.tsx         # Clustering logic
│   ├── search/
│   │   ├── SearchBar.tsx             # Full-text search input
│   │   └── FilterPanel.tsx           # All filters (state, membership, etc)
│   ├── sidebar/
│   │   ├── ClientSidebar.tsx         # Main sidebar container
│   │   ├── ContactCard.tsx           # Contact info bento
│   │   ├── MetricsGrid.tsx           # 2x2 metrics cards
│   │   └── LocationsList.tsx         # Locations accordion
│   ├── dashboard/
│   │   └── StatsBar.tsx              # Top stats bar
│   └── ui/                           # shadcn components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── select.tsx
│       └── slider.tsx
├── lib/
│   ├── airtable.ts                   # Airtable API client
│   ├── types.ts                      # TypeScript interfaces
│   ├── utils.ts                      # Helper functions
│   └── constants.ts                  # Colors, config
├── public/
│   └── (empty - no assets needed)
├── .env.local                        # Environment variables
├── .env.example                      # Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### API Architecture

**Read-Only Pattern**
```typescript
// All data fetching happens server-side via Next.js API routes
// No direct client-side Airtable calls (keeps token secure)

GET /api/clients
Returns: Array of all client records with required fields

Query params (for filtering):
?state=CA,NY
?membership=Gold,Silver
?minMachines=5
?maxMachines=20
```

### State Management
- Use React hooks (useState, useEffect)
- No external state library needed
- Map state: Selected client, active filters, search query
- Sidebar state: Open/closed, selected client data

---

## Implementation Phases

### Phase 1: Core Map (MVP)
**Deliverables**:
- Mapbox map with all clients plotted
- Color-coded markers by membership level
- Click marker to open sidebar
- Basic search by name

**Time Estimate**: 4-6 hours

### Phase 2: Search & Filters
**Deliverables**:
- Full-text search across all fields
- State, membership, machine count filters
- Dynamic result count
- Stats bar with live metrics

**Time Estimate**: 3-4 hours

### Phase 3: Sidebar Details
**Deliverables**:
- Complete client info cards
- Bento layout for metrics
- Locations list with accordion
- Airtable deep links

**Time Estimate**: 2-3 hours

### Phase 4: Polish
**Deliverables**:
- Marker clustering for dense areas
- Loading states
- Error handling
- Mobile responsive (optional)

**Time Estimate**: 2-3 hours

**Total**: 11-16 hours

---

## Environment Variables

### Required
```bash
# .env.local
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_token_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_CLIENTS_TABLE_NAME=Clients
AIRTABLE_LOCATIONS_TABLE_NAME=Locations
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWRhbXdvbGZlIiwiYSI6ImNtbDFmYTYzNTA3ZXUzZG9mY2R0eWh5OGoifQ.M6oK5RfEWBqLgUJ6-bOSbg
```

### Airtable Token Setup
1. Go to airtable.com/create/tokens
2. Create token with:
   - Name: "VendingPreneur Map (Read-Only)"
   - Scopes: `data.records:read`
   - Access: Select your base
3. Copy token to .env.local

---

## Performance Targets

- **Initial Load**: < 2 seconds (20k records)
- **Search Response**: < 100ms (debounced)
- **Filter Apply**: < 200ms
- **Marker Click**: < 50ms (sidebar open)

### Optimization Strategies
- Server-side data fetching (Next.js API routes)
- Marker clustering for > 100 markers in viewport
- Virtualized location lists (react-window if > 50 locations)
- Lazy load sidebar content

---

## Success Metrics

### User Goals
1. Team can find any client in < 5 seconds
2. Geographic patterns immediately visible
3. Client details accessible in 2 clicks

### Technical Goals
1. Zero Airtable write operations
2. 100% TypeScript coverage
3. Mobile responsive (optional)
4. Deploy to Vercel with 99.9% uptime

---

## Future Enhancements (Not in Scope)

- Heat map visualization for revenue density
- Export filtered results to CSV
- Historical data comparison (month-over-month)
- Integration with Locations table for multi-layer view
- Admin panel to manage Airtable connection
- Webhook updates for real-time data sync

---

## Acceptance Criteria

### Must Have
- [ ] All clients with valid lat/lng appear on map
- [ ] Markers color-coded by membership level
- [ ] Search bar filters by name, city, state
- [ ] Click marker opens sidebar with full client details
- [ ] Stats bar shows total counts and updates with filters
- [ ] Deployed to Vercel and accessible via URL
- [ ] Zero errors in browser console
- [ ] Mobile responsive layout

### Nice to Have
- [ ] Marker clustering for dense areas
- [ ] Loading skeleton states
- [ ] Error boundaries for API failures
- [ ] Keyboard shortcuts (ESC to close sidebar)

---

## Handoff Checklist for AntiGravity

- [ ] Clone repo template with complete file structure
- [ ] Install all dependencies (see package.json below)
- [ ] Configure .env.local with Airtable credentials
- [ ] Build all components per component specs
- [ ] Integrate Mapbox with provided token
- [ ] Connect Airtable API via Next.js route handlers
- [ ] Style all components with shadcn/ui
- [ ] Test with full 20k dataset
- [ ] Deploy to Vercel
- [ ] Share preview URL for review

---

## Notes for AntiGravity

**Coding Standards**:
- Use TypeScript strict mode (no `any` types)
- Prefer server components where possible
- Use `"use client"` only for interactive components
- Follow shadcn/ui conventions (don't override default styles)
- Keep components under 200 lines (split if larger)
- Add JSDoc comments for complex functions

**Airtable API Notes**:
- Use pagination for > 100 records (Airtable API limit)
- Handle rate limiting (5 requests/second)
- Cache results in API route for 5 minutes (optional)
- Never expose token on client side

**Mapbox Notes**:
- Token is public (safe to use in browser)
- Use `mapbox-gl` version 3.x
- Import CSS: `import 'mapbox-gl/dist/mapbox-gl.css'`

**Known Gotchas**:
- Some clients may have null lat/lng (filter these out)
- Phone numbers may need formatting (use libphonenumber-js)
- Revenue values may be stored as strings (parse to numbers)

---

## Contact
**Product Owner**: Adam Wolfe (adamwolfe102@gmail.com)
**Company**: Modern Amenities Group
**Timeline**: Complete build in 1-2 days
