# 🎨 Frontend Component Documentation

Complete guide to all React components in the XRPL Impact Fund dashboard.

---

## 📁 Component Tree

```
frontend/src/
├── components/
│   ├── hero/
│   │   ├── LandingHero.tsx          # Main landing page hero
│   │   └── ImpactHero.tsx           # NFT evolution showcase hero
│   ├── pool/
│   │   └── PoolBalance.tsx          # Live pool statistics
│   ├── ngo/
│   │   └── NGOList.tsx              # NGO directory with Impact Oracle scores
│   ├── nft/
│   │   └── NFTGallery.tsx           # NFT evolution gallery
│   ├── governance/
│   │   └── GovernanceVoting.tsx     # DIT token governance voting
│   └── climate/
│       └── ClimateImpactMode.tsx    # Climate impact tracking
├── lib/
│   └── theme.ts                     # Design system & colors
├── store/
│   └── index.ts                     # Zustand state management
└── main.tsx                         # React entry point
```

---

## 🎯 Component Descriptions

### Hero Components

#### 1. LandingHero (`components/hero/LandingHero.tsx`)

**Purpose:** First impression hero section for the landing page

**Features:**
- ✨ Animated gradient background (blue → green)
- 🎨 Floating particle effects (20 particles)
- 📊 Live pool stats cards (Balance, Donors, CO₂)
- 🎬 Framer Motion entrance animations
- 🔘 CTA buttons (Start Donating, See Impact)
- ✅ Trust indicators (badges)
- 📜 Scroll indicator animation

**Props:** None (uses Zustand store)

**API Calls:**
```typescript
fetchPool() // On mount, fetches pool state
```

**State Management:**
```typescript
const { pool, fetchPool, setShowDonationModal, climateMode } = useStore();
```

**Design Tokens:**
- Background: `from-blue-600 via-blue-700 to-green-600`
- Cards: `bg-white/10 backdrop-blur-md`
- Text: `text-white`, `text-blue-100`

**Usage:**
```tsx
import { LandingHero } from './components/hero/LandingHero';

<LandingHero />
```

---

#### 2. ImpactHero (`components/hero/ImpactHero.tsx`)

**Purpose:** Showcase NFT evolution and impact metrics

**Features:**
- 🎴 Animated NFT card with 3D effects
- 🔄 Auto-rotating through 5 tiers (3s interval)
- 🌟 Floating icons (Globe, Heart, Leaf, Award)
- 📊 Real-time impact stats
- 🎨 Tier-specific gradients and glows
- 🔢 XP progress tracking

**Props:** None

**API Calls:**
```typescript
fetchPool()
```

**NFT Tiers:**
```typescript
const NFT_TIERS = [
  { name: 'Bronze', minXP: 0, icon: '🥉', color: '#CD7F32' },
  { name: 'Silver', minXP: 1000, icon: '🥈', color: '#C0C0C0' },
  { name: 'Gold', minXP: 5000, icon: '🥇', color: '#FFD700' },
  { name: 'Platinum', minXP: 10000, icon: '💎', color: '#E5E4E2' },
  { name: 'Diamond', minXP: 25000, icon: '✨', color: '#B9F2FF' },
];
```

**Usage:**
```tsx
import { ImpactHero } from './components/hero/ImpactHero';

<ImpactHero />
```

---

### Dashboard Components

#### 3. PoolBalance (`components/pool/PoolBalance.tsx`)

**Purpose:** Live donation pool statistics dashboard

**Features:**
- 📊 4 stat cards (Balance, Donations, Donors, Distributed)
- 🔄 Auto-refresh every 5 seconds
- 🔘 Manual refresh button
- 📈 Health indicator with progress bar
- 🎨 Gradient backgrounds per stat
- ⚡ Animated counters

**Props:** None

**API Calls:**
```typescript
fetchPool() // Initial + every 5s
```

**Stat Cards:**
1. **Pool Balance** - Current XRP in pool (blue)
2. **Total Donations** - All-time contributions (green)
3. **Total Donors** - Unique contributors (purple)
4. **Distributed to NGOs** - Impact delivered (orange)

**State:**
```typescript
const { pool, isLoading, fetchPool } = useStore();
const [isRefreshing, setIsRefreshing] = useState(false);
```

**Usage:**
```tsx
import { PoolBalance } from './components/pool/PoolBalance';

<PoolBalance />
```

---

#### 4. NGOList (`components/ngo/NGOList.tsx`)

**Purpose:** Display verified NGOs with Impact Oracle scores

**Features:**
- 🏛️ NGO cards with full details
- 🎯 Impact score visualization (0-100)
- 🔍 Category filtering (climate, health, education, water)
- 📊 Distribution weight bars
- 🏆 Certification badges
- ✅ Verification status
- 📈 Total received tracking

**Props:** None

**API Calls:**
```typescript
fetchNGOs() // On mount
```

**Category Icons:**
```typescript
const CATEGORY_ICONS = {
  climate: Leaf,
  health: Heart,
  education: GraduationCap,
  water: Droplet,
  other: Globe,
};
```

**Score Colors:**
- 90-100: Green (Excellent)
- 75-89: Blue (Good)
- 60-74: Yellow (Fair)
- <60: Red (Poor)

**State:**
```typescript
const { ngos, fetchNGOs, isLoading } = useStore();
const [filter, setFilter] = useState<string>('all');
```

**Usage:**
```tsx
import { NGOList } from './components/ngo/NGOList';

<NGOList />
```

---

#### 5. NFTGallery (`components/nft/NFTGallery.tsx`)

**Purpose:** Display donor's evolving Impact NFT

**Features:**
- 🎴 Large NFT showcase card
- 📊 XP progress to next tier
- 🏆 Level badge with animation
- 📈 Stats (donations count, total XRP)
- 🎨 Tier-specific gradients and glows
- 📜 All tiers timeline (5 cards)
- ℹ️ "How It Works" education section
- 🔒 Locked/unlocked tier states

**Props:** None

**API Calls:**
```typescript
fetchDonor(address) // On mount if no donor
```

**XP & Level Formula:**
- **XP Gain:** 1 XRP = 10 XP
- **Level:** `floor(sqrt(XP / 100)) + 1`

**State:**
```typescript
const { donor, fetchDonor } = useStore();
const xp = donor?.xp || 0;
const level = donor?.level || 1;
```

**Usage:**
```tsx
import { NFTGallery } from './components/nft/NFTGallery';

<NFTGallery />
```

---

#### 6. GovernanceVoting (`components/governance/GovernanceVoting.tsx`)

**Purpose:** DIT token governance voting interface

**Features:**
- 🗳️ Proposal cards with voting
- 📊 Vote visualization (For/Against bars)
- 📈 Quorum progress tracking
- 🔍 Status filtering (active, passed, rejected)
- 💪 Voting power display
- 🎫 DIT token requirement
- ➕ New proposal creation
- ⏰ Time remaining countdown

**Props:** None

**Proposal Categories:**
- `ngo` - NGO beneficiary changes
- `trading` - AI trading parameters
- `distribution` - Profit distribution rules
- `governance` - Governance changes

**Proposal Statuses:**
- `active` - Currently voting (blue)
- `passed` - Approved (green)
- `rejected` - Failed (red)
- `pending` - Awaiting quorum (yellow)

**State:**
```typescript
const { donor } = useStore();
const [proposals] = useState<Proposal[]>(MOCK_PROPOSALS);
const [filter, setFilter] = useState('all');
const hasDIT = donor && donor.ditTokenId;
```

**Usage:**
```tsx
import { GovernanceVoting } from './components/governance/GovernanceVoting';

<GovernanceVoting />
```

---

#### 7. ClimateImpactMode (`components/climate/ClimateImpactMode.tsx`)

**Purpose:** Toggle and visualize climate impact

**Features:**
- 🌿 Animated toggle switch
- 📊 CO₂ offset main display
- 🌳 Impact equivalents (trees, cars, homes)
- 🎨 Floating leaf animations
- 📖 Educational "How It Works"
- ✨ Gradient background effects
- 🔄 Show/hide with animation

**Props:** None

**API Calls:**
```typescript
// Uses pool.co2Offset from existing pool state
```

**Impact Calculations:**
```typescript
const treesEquivalent = Math.floor(co2Offset / 0.02); // 1 tree = 20kg CO2/year
const carsOffRoad = Math.floor(co2Offset / 4.6);      // 1 car = 4.6 tons/year
const homesPowered = Math.floor(co2Offset / 7.5);     // 1 home = 7.5 tons/year
```

**State:**
```typescript
const { climateMode, setClimateMode, pool } = useStore();
```

**Usage:**
```tsx
import { ClimateImpactMode } from './components/climate/ClimateImpactMode';

<ClimateImpactMode />
```

---

## 🎨 Design System

### Color Palette (from `lib/theme.ts`)

```typescript
export const theme = {
  colors: {
    // Primary Colors
    primary: {
      50: '#E6F2FF',
      100: '#CCE5FF',
      200: '#99CCFF',
      300: '#66B2FF',
      400: '#3399FF',
      500: '#0066CC',  // XRPL Blue (main)
      600: '#0052A3',
      700: '#003D7A',
      800: '#002952',
      900: '#001429',
    },

    // Secondary (Impact Green)
    secondary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',  // Impact Green (main)
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },

    // NFT Tier Colors
    nft: {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
    },

    // Status Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Gradients
    gradients: {
      hero: 'linear-gradient(135deg, #0066CC 0%, #10B981 100%)',
      nft: 'linear-gradient(135deg, #9333EA 0%, #3B82F6 100%)',
      impact: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
  },
};
```

---

## 🔄 State Management (Zustand)

### Store Structure (`store/index.ts`)

```typescript
interface AppState {
  // Pool State
  pool: PoolState | null;

  // Donor State
  donor: DonorInfo | null;

  // NGOs
  ngos: NGO[];

  // Donation Stories
  stories: DonationStory[];

  // UI State
  isLoading: boolean;
  showDonationModal: boolean;
  climateMode: boolean;

  // Actions
  fetchPool: () => Promise<void>;
  fetchDonor: (address: string) => Promise<void>;
  fetchNGOs: () => Promise<void>;
  donate: (amount: number, address: string) => Promise<boolean>;
  simulateProfit: () => Promise<void>;
  setShowDonationModal: (show: boolean) => void;
  setClimateMode: (enabled: boolean) => void;
}
```

### Usage in Components

```typescript
// Basic usage
const { pool, fetchPool } = useStore();

// Multiple selectors
const { donor, ngos, climateMode, setClimateMode } = useStore();

// Actions
const donate = useStore(state => state.donate);
await donate(100, 'rAddress123');
```

---

## 📡 API Integration

### Base URL

```typescript
const API_BASE_URL = 'http://localhost:3000/api/xrpl';
```

### API Endpoints Used by Components

| Component | Endpoint | Method | Purpose |
|-----------|----------|--------|---------|
| PoolBalance | `/pool` | GET | Fetch pool state |
| NGOList | `/ngos` | GET | Get NGO list |
| NFTGallery | `/donor/:address` | GET | Get donor info |
| GovernanceVoting | N/A | - | Mock data (future API) |
| All | `/deposit` | POST | Make donation |

### Example API Calls

```typescript
// Fetch Pool
const fetchPool = async () => {
  const response = await fetch(`${API_BASE_URL}/pool`);
  const data = await response.json();
  return data.pool;
};

// Make Donation
const donate = async (amount: number, address: string) => {
  const response = await fetch(`${API_BASE_URL}/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      donorAddress: address,
      amount,
    }),
  });
  return response.json();
};
```

---

## 🎬 Animations

All components use **Framer Motion** for animations.

### Common Animation Patterns

#### 1. Entrance Animations

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  Content
</motion.div>
```

#### 2. Hover Effects

```typescript
<motion.div
  whileHover={{ y: -5, scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Card
</motion.div>
```

#### 3. Progress Bars

```typescript
<motion.div
  className="h-full bg-gradient-to-r from-green-500 to-green-600"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 1 }}
/>
```

#### 4. Pulse Effects

```typescript
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  Badge
</motion.div>
```

---

## 🔧 Component Customization

### Adding a New Component

1. **Create Component File**
   ```bash
   frontend/src/components/category/ComponentName.tsx
   ```

2. **Import Dependencies**
   ```typescript
   import React, { useEffect, useState } from 'react';
   import { motion } from 'framer-motion';
   import { Icon } from 'lucide-react';
   import { useStore } from '../../store';
   ```

3. **Define Component**
   ```typescript
   export const ComponentName: React.FC = () => {
     const { state, action } = useStore();

     return (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
       >
         {/* Content */}
       </motion.div>
     );
   };
   ```

4. **Export in index**
   ```typescript
   export { ComponentName } from './components/category/ComponentName';
   ```

---

## 📱 Responsive Design

All components use **Tailwind CSS** responsive utilities:

```typescript
// Mobile-first approach
className="
  grid
  grid-cols-1           // Mobile: 1 column
  md:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-4        // Desktop: 4 columns
  gap-6
"
```

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## ✅ Component Checklist

- [x] LandingHero - Main landing page
- [x] ImpactHero - NFT evolution showcase
- [x] PoolBalance - Live pool statistics
- [x] NGOList - NGO directory with scores
- [x] NFTGallery - NFT evolution display
- [x] GovernanceVoting - DIT token voting
- [x] ClimateImpactMode - Climate tracking
- [ ] DonationModal - Donation form (TODO)
- [ ] DonationStories - QR code stories (TODO)
- [ ] TransactionHistory - Donor history (TODO)

---

## 🚀 Quick Start

### Run Development Server

```bash
cd frontend
npm run dev
```

Frontend available at: `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📞 Support

For component questions:
- Check component source code comments
- Review Framer Motion docs: https://www.framer.com/motion/
- Check Tailwind CSS docs: https://tailwindcss.com/docs
- Review Zustand docs: https://github.com/pmndrs/zustand

---

**Built with ❤️ for XRPL Hackathon 2025**
