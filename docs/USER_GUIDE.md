# Vendingpreneur Map - User Guide

## 📍 Main Map Interface

The central hub of the application is the interactive map.

- **Navigation**:
  - **Zoom**: Use the `+` / `-` buttons or scroll wheel.
  - **Pan**: Click and drag to move around.
  - **Locate Me**: Click the "Target" icon (bottom right) to zoom to your current location.

- **Client Markers**:
  - **Clusters**: Numbered circles indicate multiple clients in an area. Click to zoom in and expand.
  - **Pins**: Individual markers represent client locations.
    - 🔵 Blue: Standard / Unknown
    - 🟢 Green: Pro Level
    - 🟣 Purple: Enterprise
  - **Popups**: Click a pin to see initial details (Name, Revenue). Click "Route to Client" to start planning a visit.

## 🔎 Searching & Filtering

Access the control panel on the left (desktop) or via the bottom sheet "Menu" (mobile).

- **Global Search**: Type a client name or email to filter the list instantly.
- **Filters**:
  - **Level**: Toggle between Standard, Pro, and Enterprise clients.
  - **State**: Filter clients by specific US states.
- **Client List**: Click any client card in the sidebar to fly the map directly to their location.

## 🚀 Smart Routing

Plan efficient visits to multiple locations.

1. **Add Stops**: Click "Add to Route" on any client popup or sidebar card.
2. **View Route**: Open the "Route" tab in the sidebar.
3. **Optimize**: The app automatically calculates the fastest path between all selected stops.
4. **Navigate**: Click "Start Navigation" to open the optimized route in Google Maps or Apple Maps.

## 🗺️ Territory Management

Define franchise or sales territories visually.

1. **Draw Mode**: Click the "Polygon" icon (top right map controls).
2. **Define Area**: Click points on the map to outline a territory. Double-click to close the shape.
3. **Territory Details**: A popup will appear showing the estimated area (sq miles).
4. **Save**: Give the territory a name (e.g., "North District") and save it.
5. **Edit/Delete**: Click an existing territory to update its shape or remove it.

## ⚡ Lead Generation (Simulated)

Find potential new locations for vending machines.

1. **Select Client**: Open a client's detail view.
2. **Generate Leads**: Click the "Find Leads" tab.
3. **Configure**: Choose a radius (1-10 miles) and business type (Gym, School, Office).
4. **Scan**: Click "Generate Leads". The app will simulate finding relevant businesses nearby.
5. **Add to CRM**: Click the `+` button on a result to save it as a lead. It will turn into a `✓` checkmark.

## 🛡️ Admin Dashboard

Access via `/admin` (or the "Admin Panel" link in the sidebar).

- **Overview**: View total MRR, total clients, and platform activity.
- **Revenue Chart**: Analyze revenue distribution by membership tier.
- **Client Management**: 
  - View the full database of clients in a sortable table.
  - Click "..." on a row to **Edit Client** details or **Delete** them.
  - Changes made here are reflected in the main map app (mock data persistence in session).

---
*For technical support, contact the dev team.*
