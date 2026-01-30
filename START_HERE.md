# START HERE - AntiGravity Build Instructions

## What You're Building

An internal CRM mapping tool for Modern Amenities Group that displays 20,000+ Vendingpreneur clients on an interactive US map using Mapbox and Airtable data.

**Product Owner**: Adam Wolfe (adamwolfe102@gmail.com)  
**Timeline**: 10-13 hours total  
**Tech Stack**: Next.js 14, TypeScript, Mapbox GL JS, Airtable, shadcn/ui

---

## Quick Start (5 minutes)

### Step 1: Read All Documents in Order

You have been provided with **complete specifications**. Read them in this exact order:

1. **📄 vendingpreneur-map-PRD.md** (15 min read)
   - Complete product requirements
   - All features and acceptance criteria
   - Design system and colors

2. **📄 project-brief.json** (5 min read)
   - Technical summary
   - File structure
   - Dependencies list

3. **📄 IMPLEMENTATION_GUIDE.md** (30 min read)
   - **THIS IS YOUR BUILD BIBLE**
   - Step-by-step component instructions
   - Complete code templates
   - Testing checklist

4. **📄 Supporting Files** (use as reference)
   - `lib-types.ts` - TypeScript interfaces
   - `lib-constants.ts` - Colors, config, mappings
   - `lib-airtable.ts` - Airtable client functions
   - `package.json` - All dependencies
   - `.env.example` - Environment variable template

### Step 2: Get Credentials from Adam

**REQUIRED BEFORE BUILDING**:
- Airtable Personal Access Token (read-only)
- Airtable Base ID

Email Adam Wolfe: adamwolfe102@gmail.com

Subject: "VendingPreneur Map - Need Airtable Credentials"

### Step 3: Follow the Implementation Guide

Open **IMPLEMENTATION_GUIDE.md** and follow it **exactly**:
- Phase 1: Setup (1-2 hours)
- Phase 2: Map Component (2-3 hours)
- Phase 3: Search & Filters (2 hours)
- Phase 4: Client Sidebar (2-3 hours)
- Phase 5: Stats Dashboard (1 hour)
- Phase 6: Main Page Assembly (1 hour)
- Phase 7: Testing & Deploy (1 hour)

---

## Critical Instructions

### ✅ DO THIS

1. **Follow the Implementation Guide exactly** - Don't deviate from the structure
2. **Copy the provided code templates** - They're tested and complete
3. **Use TypeScript strict mode** - No `any` types allowed
4. **Test incrementally** - Build and test each phase before moving on
5. **Use shadcn/ui defaults** - Don't over-customize components
6. **Keep components under 200 lines** - Split if larger

### ❌ DON'T DO THIS

1. **Don't skip reading the PRD** - You'll miss critical requirements
2. **Don't add features not in spec** - Stay focused on acceptance criteria
3. **Don't use different libraries** - Stick to the tech stack
4. **Don't guess at Airtable field names** - Use the exact mapping in constants.ts
5. **Don't deploy without testing** - Complete the testing checklist first

---

## File Usage Guide

### Files to Copy Directly

These are **production-ready code**. Copy them into your project:

```
lib-types.ts          → lib/types.ts
lib-constants.ts      → lib/constants.ts
lib-airtable.ts       → lib/airtable.ts
package.json          → package.json (merge dependencies)
.env.example          → .env.example
```

### Files to Reference

These contain component templates and implementation steps:

```
IMPLEMENTATION_GUIDE.md  → Your step-by-step build instructions
vendingpreneur-map-PRD.md → Product requirements and features
project-brief.json       → Quick reference for tech stack
```

---

## Build Checklist

Before you start coding:
- [ ] Read PRD completely
- [ ] Read Implementation Guide completely
- [ ] Obtained Airtable credentials from Adam
- [ ] Understand the file structure
- [ ] Know which components to build first

During development:
- [ ] Follow Implementation Guide phase by phase
- [ ] Test each component individually
- [ ] Copy provided code templates
- [ ] Use exact field names from constants.ts
- [ ] Check for TypeScript errors continuously

Before deploying:
- [ ] Complete testing checklist in Implementation Guide
- [ ] All 20,000+ clients appear on map
- [ ] Search and filters work
- [ ] Sidebar opens and shows data
- [ ] Stats bar updates correctly
- [ ] No console errors
- [ ] Environment variables configured

After deploying:
- [ ] Share Vercel preview URL with Adam
- [ ] Confirm all features working
- [ ] Get approval from Adam

---

## Component Build Order (CRITICAL)

Build in this **exact order**:

1. **Setup** (lib files, API route, env vars)
2. **MapView** (get markers on map first)
3. **SearchBar** (basic search functionality)
4. **FilterPanel** (add filtering)
5. **ClientSidebar** (marker click handler)
6. **ContactCard, MetricsGrid, LocationsList** (sidebar content)
7. **StatsBar** (aggregate dashboard)
8. **Main Page** (wire everything together)

**DO NOT** try to build everything at once. Each phase depends on the previous one.

---

## Code Quality Standards

Every component must:
- Be TypeScript strict (no `any`)
- Use provided types from `lib/types.ts`
- Follow shadcn/ui patterns
- Be under 200 lines
- Have `'use client'` only if interactive
- Use constants from `lib/constants.ts`

Example of GOOD code:
```typescript
'use client';

import { VendingpreneurClient } from '@/lib/types';
import { COLORS } from '@/lib/constants';

interface Props {
  client: VendingpreneurClient;
}

export default function MyComponent({ client }: Props) {
  return <div>{client.fullName}</div>;
}
```

Example of BAD code:
```typescript
export default function MyComponent(props: any) {  // ❌ No 'any' types
  const color = '#00B67A';  // ❌ Use COLORS constant
  return <div>{props.name}</div>;  // ❌ No proper typing
}
```

---

## Testing Instructions

### Local Testing (Required)
```bash
npm run dev
# Open http://localhost:3000
```

Test these features:
1. Map loads with markers
2. Markers are color-coded correctly
3. Search bar filters results
4. Filters apply correctly
5. Click marker opens sidebar
6. Sidebar shows all client data
7. Locations accordion works
8. Stats bar updates with filters
9. Airtable links open correctly
10. No console errors

### Deployment Testing (Required)
After deploying to Vercel:
1. Test all features again in production
2. Verify environment variables are set
3. Check for CORS or API errors
4. Test with full 20k dataset

---

## Troubleshooting

### Map not loading
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Verify mapbox-gl CSS is imported
- Check browser console for errors

### No clients showing
- Verify Airtable credentials in `.env.local`
- Test API route at `/api/clients` in browser
- Ensure clients have valid lat/lng

### Markers not clickable
- Check z-index on markers
- Verify onClick handlers attached
- Test in DevTools

### TypeScript errors
- Ensure all types imported correctly
- Check field names match constants
- Verify no `any` types used

### Deployment fails
- Check all env vars added to Vercel
- Verify build succeeds locally first
- Check Vercel logs for errors

---

## Getting Help

1. **First**: Re-read the relevant section of Implementation Guide
2. **Second**: Check provided code templates
3. **Third**: Review PRD for requirements clarification
4. **Last Resort**: Email Adam Wolfe with specific question

**Do NOT**:
- Guess at implementations
- Skip reading documentation
- Add features not in spec
- Change tech stack

---

## Success Criteria

You're done when:
- [ ] All acceptance criteria met (see PRD)
- [ ] Testing checklist complete
- [ ] Deployed to Vercel
- [ ] Preview URL shared with Adam
- [ ] Adam approves the build

---

## Final Notes

This project has **complete specifications**. Everything you need is provided:
- Exact file structure
- Complete code templates
- Step-by-step instructions
- Testing checklist
- Deployment guide

**Your job**: Execute the plan exactly as written.

**Timeline**: 10-13 hours if you follow the guide.

**Quality bar**: Professional internal tool for Modern Amenities Group team.

---

## Contact

**Product Owner**: Adam Wolfe  
**Email**: adamwolfe102@gmail.com  
**Company**: Modern Amenities Group  
**Role**: Technical Project Assistant / Head of AI & Innovation

**Questions?** Email Adam with:
- Subject line: "VendingPreneur Map - [Your Question]"
- Specific question
- What you've already tried
- Screenshots if relevant

---

## Ready to Build?

1. ✅ Read all docs
2. ✅ Got Airtable credentials
3. ✅ Understand the plan
4. ✅ Ready to follow Implementation Guide

**GO BUILD!** 🚀

Start with Phase 1 of the Implementation Guide.
