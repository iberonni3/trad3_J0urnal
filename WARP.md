# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Frontend-only trading journal application where users manually enter trade details with screenshots. All data is stored in Firebase Firestore, and calculations are performed client-side. Built using Lovable.dev with React, TypeScript, Firebase Authentication, and Firestore.

## Development Commands

```powershell
# Install dependencies
npm i

# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Frontend-Only Architecture

**Tech Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Firebase Authentication (email/password, Google OAuth)
- Firebase Firestore for data persistence
- Firebase Storage for trade screenshots
- React Query for client-side state management
- React Router v6 for routing
- Tailwind CSS + shadcn/ui for styling

### Data Flow

```
User Input → React Components → Firestore Collections → Real-time Calculations → Dashboard Display
```

All trade data, user settings, and analytics are stored in Firestore. The frontend calculates metrics (win rate, P&L, R-multiples, etc.) in real-time from the stored trade data.

### Frontend Structure

- **Pages** (src/pages/): Route components for main application views
  - AuthPage: Email/Google authentication
  - Dashboard: Overview with calculated metrics, equity curve, calendar heatmap
  - Trades: Trade entry form, list view with filtering, CSV export
  - Charts: Full-screen view of trade screenshots and charts
  - Analytics: Performance analysis with client-side calculations
  - Calendar: Trading calendar view with daily P&L
  - Journal: Trade notes and journal entries linked to trades
  - Import: CSV/JSON import for bulk trade data

- **Components** (src/components/):
  - `auth/`: Authentication components including ProtectedRoute
  - `dashboard/`: Dashboard-specific components (StatCard, EquityCurve, RecentTrades, TradingCalendarHeatmap)
  - `layout/`: AppSidebar and TopNavigation
  - `ui/`: shadcn/ui components

- **State Management**: 
  - React Query for Firestore queries and mutations
  - React Context for global app state (if needed)
  - Local component state for forms and UI interactions

- **Routing**: React Router v6 with nested routes and layout wrappers (AppLayout for dashboard, StandaloneLayout for auth)

### Firestore Data Model

**Collections:**

- `users/{userId}`: User profile and settings
  - Fields: email, displayName, createdAt, preferences

- `users/{userId}/trades`: Trade entries
  - Fields: symbol, direction (long/short), entry, exit, stopLoss, takeProfit, quantity, pnl, rMultiple, openTime, closeTime, status (open/closed), setup, tags[], broker, commission, notes, screenshotUrl

- `users/{userId}/journals`: Journal entries linked to trades
  - Fields: tradeId (optional), date, content, mood, lessons

**Storage Structure:**
- `screenshots/{userId}/{tradeId}/`: Trade screenshots and charts

### Authentication

- Firebase Authentication for users (email/password, Google OAuth)
- Protected routes use `ProtectedRoute` component with Firebase auth state listener
- Auth flow: Login → Email verification → Dashboard access
- No backend authentication needed - Firebase client SDK handles everything

### Styling

- Tailwind CSS with custom configuration
- Dark theme support via next-themes
- shadcn/ui component library
- Responsive design with mobile-first approach

## Firebase Configuration

Firebase config is in `src/lib/firebase/config.ts`. For production, move sensitive keys to environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Important Notes

### Client-Side Calculations

All trading metrics are calculated in real-time from Firestore data:
- **Win Rate**: Percentage of winning trades
- **Total P&L**: Sum of all closed trade profits/losses
- **Average R-Multiple**: Mean risk-reward ratio across trades
- **Expectancy**: (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
- **Profit Factor**: Gross Profit / Gross Loss
- **Max Drawdown**: Largest peak-to-trough decline in equity

Create utility functions in `src/lib/` for these calculations to keep logic DRY.

### Screenshot Upload Flow

1. User selects image file in trade form
2. Upload to Firebase Storage: `screenshots/{userId}/{tradeId}/{filename}`
3. Get download URL from Storage
4. Save URL to Firestore trade document in `screenshotUrl` field
5. Display images using the stored URLs

### Testing

No test framework is currently configured. To add tests:
- Consider Vitest (already using Vite) for unit and integration tests
- Test calculation utilities thoroughly
- Mock Firestore calls using firebase-mock or similar

### Offline Support

Firestore supports offline persistence. Enable it for better UX:
```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';
enableIndexedDbPersistence(db);
```

## Common Workflows

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx` within appropriate layout (AppLayout or StandaloneLayout)
3. Update sidebar navigation in `src/components/layout/AppSidebar.tsx` if needed

### Working with Firestore Data

**Reading data:**
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';

const { data: trades } = useQuery({
  queryKey: ['trades', userId],
  queryFn: async () => {
    const q = query(collection(db, `users/${userId}/trades`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
});
```

**Writing data:**
```typescript
import { addDoc, collection } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const mutation = useMutation({
  mutationFn: async (trade) => {
    return await addDoc(collection(db, `users/${userId}/trades`), trade);
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['trades', userId]);
  }
});
```

### Uploading Trade Screenshots

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

const uploadScreenshot = async (file: File, userId: string, tradeId: string) => {
  const storageRef = ref(storage, `screenshots/${userId}/${tradeId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
```

### Adding Calculation Utilities

Create calculation functions in `src/lib/calculations.ts`:
```typescript
export const calculateWinRate = (trades: Trade[]) => {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const wins = closedTrades.filter(t => t.pnl > 0).length;
  return (wins / closedTrades.length) * 100;
};
```

### Working with shadcn/ui Components

Components are installed via `components.json` configuration. Use the shadcn CLI to add new components (though the typical CLI may not work on Windows - components can be manually copied from shadcn docs).

## Migration from Backend Services

The `server/` and `python_service/` directories can be removed. They were for MetaTrader 5 integration which is no longer needed with manual trade entry.
