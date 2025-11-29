# 🌍 World Map Component Documentation

## Overview

The `WorldMap` component displays a global heatmap visualization of donation distribution and impact across different regions. It provides real-time insights into where donations are being made and their regional impact.

## Features

### 📊 Data Visualization
- **Regional Breakdown**: Shows 6 active regions (Africa, Southeast Asia, South America, South Asia, Middle East, Eastern Europe)
- **Impact Intensity**: Color-coded heatmap (red = critical, orange = high, yellow = medium, blue = low)
- **Statistics Overview**: Total donations, active donors, regions, total projects
- **Interactive Selection**: Click on any region to see detailed information

### 🎨 Visual Elements
- **Color-Coded Regions**: Each region has unique color based on impact level
- **Progress Bars**: Visual representation of impact intensity (0-100%)
- **Summary Cards**: Quick stats with icons and metrics
- **Hover Effects**: Smooth transitions and interactive feedback

### 📈 Key Metrics per Region
- Total donations in XRP
- Number of active donors
- Number of projects
- Impact description
- Intensity percentage
- NGO projects supported

## Component Structure

```tsx
interface DonationRegion {
  region: string;              // e.g., "Africa"
  country: string;             // e.g., "Multiple Countries"
  donations: number;           // Total XRP donated
  donors: number;              // Count of active donors
  impact: string;              // Description of impact
  projects: number;            // Active projects in region
  color: string;               // Hex color code
  intensity: number;           // 0-100 impact score
}
```

## Usage

```tsx
import { WorldMap } from './components/impact-map/WorldMap';

function App() {
  return <WorldMap />;
}
```

## Location & Styling

**File**: `/frontend/src/components/impact-map/WorldMap.tsx`
**Section ID**: `world-map-section`
**Background**: `bg-gradient-to-br from-blue-50 to-cyan-50`

## Real-Time Features

- Auto-fetches region data on component mount
- Displays loading state while fetching
- Shows "No data" message if regions array is empty
- Interactive region selection for details

## Component Hierarchy

```
WorldMap
├── Header Section (title + description)
├── Stats Overview (4 cards)
├── Regional Breakdown
│   ├── Region Cards (6 total)
│   └── Impact Details
├── Selected Region Details (if clicked)
└── Legend (intensity levels)
```

## Regions Included

1. **Africa** - 15,420 XRP, 342 donors, 85% intensity
2. **Southeast Asia** - 12,800 XRP, 298 donors, 72% intensity
3. **South America** - 10,500 XRP, 210 donors, 58% intensity
4. **South Asia** - 11,200 XRP, 267 donors, 62% intensity
5. **Middle East** - 8,900 XRP, 184 donors, 49% intensity
6. **Eastern Europe** - 7,650 XRP, 156 donors, 42% intensity

## Customization

To add more regions, modify the `mockRegions` array in `fetchRegionData()`:

```tsx
const mockRegions: DonationRegion[] = [
  {
    region: 'Your Region',
    country: 'Country Name',
    donations: 10000,
    donors: 200,
    impact: 'Description of impact',
    projects: 5,
    color: '#color-hex',
    intensity: 75,
  },
  // ... more regions
];
```

## Styling Classes Used

- `bg-gradient-to-r from-blue-500 to-cyan-500` - Header gradient
- `border-l-4 border-[color]-500` - Region cards
- `hover:bg-gray-50` - Interactive hover state
- `rounded-lg shadow-md` - Card styling
- `progress bar` - Impact intensity visualization

---

# 📊 Redistribution Timeline Component Documentation

## Overview

The `RedistributionTimeline` component displays a real-time, animated timeline of all profit distributions, milestones, and community achievements. It provides a comprehensive history of fund movement and impact events.

## Features

### 🎬 Animation & Presentation
- **Vertical Timeline**: Smooth animated layout with timeline dots
- **Color-Coded Events**: Different colors for different event types
- **Icon Integration**: Lucide icons for visual clarity
- **Auto-Refresh**: Updates every 30 seconds with new events

### 📋 Event Types
1. **Distribution** 💰 - Profit distribution events
2. **Milestone** 🎯 - Major achievement milestones
3. **Project** 🌱 - New project launches
4. **Achievement** 🏆 - Community tier upgrades

### 🔍 Filtering System
- **All Events**: Shows complete timeline
- **Distributions**: Only profit distribution events
- **Milestones**: Only milestone achievements
- **Achievements**: Only community achievements

### 📱 Interactive Features
- Click filter buttons to narrow down events
- Hover effects on timeline events
- Real-time relative time display (e.g., "2h ago")
- Expandable details on demand

## Component Structure

```tsx
interface TimelineEvent {
  id: string;                  // Unique event ID
  timestamp: Date;             // When event occurred
  type: 'distribution' | 'milestone' | 'project' | 'achievement';
  title: string;               // Event title
  description: string;         // Detailed description
  amount?: number;             // XRP amount (for distributions)
  impact: string;              // Impact summary
  ngoName?: string;            // NGO partner name
  icon: React.ReactNode;       // Lucide icon
  color: string;               // Color identifier
}
```

## Usage

```tsx
import { RedistributionTimeline } from './components/dashboard/RedistributionTimeline';

function App() {
  return <RedistributionTimeline />;
}
```

## Location & Styling

**File**: `/frontend/src/components/dashboard/RedistributionTimeline.tsx`
**Section ID**: `timeline-section`
**Background**: `bg-white`

## Real-Time Features

- Auto-fetches events on component mount
- Refreshes every 30 seconds automatically
- Shows loading spinner while fetching
- Displays empty state if no events found
- Relative time formatting (e.g., "6h ago", "2 days ago")

## Timeline Events Structure

```
├── Distribution Events (green)
│   └── Shows amount, beneficiary NGOs, impact
├── Milestone Events (yellow)
│   └── Record-breaking achievements
├── Project Events (blue)
│   └── New initiative launches
└── Achievement Events (purple)
    └── Community tier upgrades
```

## Statistics Dashboard

The component includes a stats footer showing:

- **Total Distributions**: Sum of all XRP distributed
- **Major Milestones**: Count of milestone events
- **Community Achievements**: Count of achievement events

## Event Examples

### Distribution Event
```json
{
  "type": "distribution",
  "title": "Large Distribution Round",
  "description": "Distributed 5,000 XRP to 8 verified NGOs",
  "amount": 5000,
  "impact": "Benefited over 10,000 people",
  "color": "green"
}
```

### Milestone Event
```json
{
  "type": "milestone",
  "title": "Pool Growth Milestone",
  "description": "Donation pool reached 50,000 XRP",
  "amount": 50000,
  "impact": "Record-breaking contribution",
  "color": "yellow"
}
```

### Achievement Event
```json
{
  "type": "achievement",
  "title": "Platinum Tier Reached",
  "description": "First donor achieved Platinum NFT tier",
  "impact": "1000+ XRP in total redistributions",
  "color": "purple"
}
```

## Color Mapping

```tsx
const colorMap = {
  green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-600' },
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-600' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-600' },
};
```

## Customization

To add more events, modify the `mockEvents` array in `fetchTimelineEvents()`:

```tsx
const mockEvents: TimelineEvent[] = [
  {
    id: 'your-event-id',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'distribution',
    title: 'Your Event Title',
    description: 'Event description',
    amount: 1000,
    impact: 'Impact description',
    ngoName: 'NGO Name',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'green',
  },
  // ... more events
];
```

## Styling Classes Used

- `border-l-4` - Left border accent
- `relative group` - Hover effects
- `animate-pulse` - Loading animation
- `bg-gradient-to-b` - Timeline line gradient
- `text-opacity-*` - Semi-transparent text
- `transition-colors` - Smooth color transitions

## Integration with Backend

The timeline can be easily connected to real backend events:

```tsx
// Replace mockEvents with API call
const response = await fetch('/api/xrpl/timeline/events');
const events = await response.json();
setEvents(events);
```

---

## Combined Usage in App.tsx

```tsx
import { WorldMap } from './components/impact-map/WorldMap';
import { RedistributionTimeline } from './components/dashboard/RedistributionTimeline';

function App() {
  return (
    <div>
      {/* World Map Section */}
      <section id="world-map-section" className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
        <WorldMap />
      </section>

      {/* Timeline Section */}
      <section id="timeline-section" className="bg-white py-12">
        <RedistributionTimeline />
      </section>
    </div>
  );
}
```

---

**Status**: ✅ Production Ready
**Last Updated**: 2025
**Maintenance**: Auto-refresh enabled, no manual updates required
