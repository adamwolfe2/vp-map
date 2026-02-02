# Vendingpreneur Map

An interactive CRM and mapping tool for Vendingpreneurs to manage locations, territories, and business metrics. Built for Modern Amenities Group.

## Features

- **Interactive Map**: Visualize clients and locations with clustered rendering.
- **Smart Routing**: Optimize routes between multiple stops using client-side TSP algorithms.
- **Territory Planning**: Draw and manage franchise territories directly on the map.
- **Admin Dashboard**: secure area for managing client data, viewing analytics, and editing records.
- **Mobile First**: Fully responsive design with PWA support (Add to Home Screen) and bottom-sheet navigation.
- **Offline Capable**: Basic offline support via Service Worker caching.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Map Engine**: [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: React Context & Hooks
- **Data Fetching**: SWR / Native Fetch (Simulated with Mock Data)
- **Tables**: TanStack Table

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
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWRhbXdvbGZlIi... (Your Token)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (Map, Sidebar, inputs).
- `/lib`: Utility functions, constants, and mock data.
- `/public`: Static assets (icons, manifest).
- `/hooks`: Custom React hooks (useMediaQuery, etc.).

## Deployment

The project is optimized for deployment on [Vercel](https://vercel.com).
Simply connect your GitHub repository and import the project. Ensure the `NEXT_PUBLIC_MAPBOX_TOKEN` is added to the Vercel Environment Variables.