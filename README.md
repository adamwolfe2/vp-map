# Vendingpreneur Map

An interactive CRM and mapping tool for Vendingpreneurs to manage locations, territories, and business metrics. Built for Modern Amenities Group with a focus on premium aesthetics and mobile-first usability.

## Key Features

### 🗺️ Advanced Mapping
- **Clustered Rendering**: Efficiently handles thousands of client locations.
- **Smart Routing**: Client-side optimization for route planning between multiple stops.
- **Territory Controls**: Draw, edit, and save franchise territories with area calculation.
- **Locate Me**: One-touch geolocation for field agents.

### 📱 Modern Glassmorphism UI
- **Glass Cards**: Premium, translucent UI elements with subtle animations.
- **Mobile Optimized**: Bottom-sheet navigation and touch-friendly controls.
- **Dark/Light Mode**: Full theme support (currently optimized for Light mode).

### 💼 CRM & Management
- **Admin Dashboard**: `/admin` portal for managing client data and viewing platform analytics.
- **Lead Generator**: Simulate finding new leads (Gyms, Offices) around a client's location.
- **Real-time Updates**: (Simulated) Immediate feedback for "Add to CRM" actions.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Map Engine**: [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/) for analytics visualization.
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Context & Hooks (with local storage persistence for settings).

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/adamwolfe2/vp-map.git
   cd vp-map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWRhbXdvbGZlIi... (Required for Map)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   - **Main App**: [http://localhost:3000](http://localhost:3000)
   - **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin) (Auth is mocked, auto-login)
   - **User Portal**: [http://localhost:3000/portal](http://localhost:3000/portal)

## Project Structure

- `/app`: Next.js App Router pages (admin, portal, main).
- `/components`:
  - `/map`: Mapbox logic, markers, and controls.
  - `/ui`: Accessible Shadcn & GlassCard components.
  - `/admin`: Dashboard widgets and data tables.
  - `/leads`: Lead generation simulation.
- `/lib`: Helper functions (`airtable.ts` for data) and mock data (`mock_data.ts`).
- `/hooks`: Custom hooks (useAuth, useLocalStorage).

## Deployment

The project is optimized for deployment on [Vercel](https://vercel.com).
1. Connect your GitHub repository.
2. Add `NEXT_PUBLIC_MAPBOX_TOKEN` to Environment Variables.
3. Deploy.

---
*Built for Modern Amenities Group - Phase 10 Complete*