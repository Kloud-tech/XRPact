# QR Code Generator - Quick Guide 📱

## How to Access QR Codes

The QR code generator is now integrated into your frontend application!

---

## 🚀 Quick Start

### 1. Start the Frontend
```bash
cd frontend
npm run dev
```

Frontend is running on: **http://localhost:5175**

### 2. Navigate to QR Section

**Option A:** Scroll down on the homepage
- The QR Code Generator section appears after the Climate Impact section
- Look for the purple-blue gradient section with a QR icon

**Option B:** Use the footer navigation
- Scroll to the bottom of the page
- Click "QR Code Generator" in the Quick Links section
- Or directly visit: http://localhost:5175#qr-section

---

## 📋 Features Available

### 1. Custom Story ID Input
- Enter any story ID to generate its QR code
- Default example: `story_demo_123`
- QR codes automatically update as you type

### 2. Example Stories (Pre-configured)
Click any example to instantly generate its QR code:
- **Clean Water Project - Haiti** (`story_water_haiti_2024`)
- **School Building - Kenya** (`story_school_kenya_2024`)
- **Medical Supplies - Ukraine** (`story_medical_ukraine_2024`)
- **Forest Protection - Amazon** (`story_forest_amazon_2024`)

### 3. Custom URL Support
- Want to link to a different website? Enter a custom URL
- Leave blank to use default format: `https://xrpl-impact.fund/stories/{storyId}`

### 4. Download & Share
Each QR code includes:
- **Download** button - Save as PNG image
- **Share** button - Use native share or copy link to clipboard

### 5. Multiple Sizes
See your QR code in different sizes:
- 64px (small - for buttons/icons)
- 128px (medium - for cards)
- 192px (large - for posters)
- 256px (main display - high quality)

---

## 🎯 Use Cases

### For NGO Impact Stories
```typescript
// Generate QR for a specific story
Story ID: story_school_kenya_2024
Result: QR code linking to https://xrpl-impact.fund/stories/story_school_kenya_2024
```

**When to use:**
- Print on donation receipts
- Display at fundraising events
- Include in email campaigns
- Share on social media

### For Donor Profiles
```typescript
// Generate QR for donor profile
Story ID: donor_rABCDEF123456789
Result: QR code linking to donor's impact dashboard
```

**When to use:**
- Personal donor cards
- Donor recognition walls
- Impact certificates

### For Campaign Pages
```typescript
// Custom URL for specific campaigns
Story ID: campaign_christmas_2024
Custom URL: https://xrpl-impact.fund/campaigns/christmas-2024
```

**When to use:**
- Marketing materials
- Flyers and posters
- Event signage

---

## 💡 How QR Codes Work in Your App

### Frontend Component Structure
```
QRCodeDisplay Component (shared/components/QRCodeDisplay.tsx)
├── QRCodeSVG (from qrcode.react library)
├── Download functionality (converts SVG to PNG)
└── Share functionality (Web Share API or clipboard)
```

### Integration Example
```tsx
import { QRCodeDisplay } from '@/shared/components/QRCodeDisplay';

// Basic usage
<QRCodeDisplay storyId="story_123" />

// With all options
<QRCodeDisplay
  storyId="story_water_haiti_2024"
  size={256}
  includeDownload={true}
  includeShare={true}
  baseURL="https://xrpl-impact.fund"
/>
```

---

## 🎨 Customization Options

### Size Options
```tsx
size={64}   // Tiny
size={128}  // Small
size={256}  // Medium (default)
size={512}  // Large
size={1024} // Extra Large (print quality)
```

### Color Customization (Future)
Currently uses blue (#1E40AF) with white background. To customize colors, modify the QRCodeSVG component:

```tsx
<QRCodeSVG
  value={url}
  size={256}
  fgColor="#1E40AF"  // Dark color (your brand color)
  bgColor="#FFFFFF"  // Light background
  level="H"          // High error correction
/>
```

### Error Correction Levels
- **L** (Low): 7% damage recovery
- **M** (Medium): 15% damage recovery
- **Q** (Quartile): 25% damage recovery
- **H** (High): 30% damage recovery ⭐ (default - best for logos)

---

## 📱 Mobile Testing

### Test QR Codes with Your Phone
1. Open the QR demo page on your computer
2. Generate a QR code for any story
3. Open your phone's camera app
4. Point at the QR code on screen
5. Tap the notification to open the link

**Expected Result:**
Browser opens to `https://xrpl-impact.fund/stories/{storyId}`

(Note: This URL doesn't exist yet - you'll need to create the story pages or update the baseURL to your actual domain)

---

## 🔧 Developer Usage

### Integrate QR Codes in Your Components

#### Example 1: Add to Donation Receipt
```tsx
import { QRCodeDisplay } from '@/shared/components/QRCodeDisplay';

function DonationReceipt({ donationId, storyId }) {
  return (
    <div className="receipt">
      <h2>Thank you for your donation!</h2>
      <p>View your impact story:</p>
      <QRCodeDisplay
        storyId={storyId}
        size={192}
        includeDownload={true}
      />
    </div>
  );
}
```

#### Example 2: Add to Impact Story Cards
```tsx
function ImpactStoryCard({ story }) {
  return (
    <div className="card">
      <h3>{story.title}</h3>
      <p>{story.description}</p>
      <QRCodeDisplay
        storyId={story.id}
        size={128}
        includeDownload={false}
        includeShare={true}
      />
    </div>
  );
}
```

#### Example 3: Backend QR Generation API
```typescript
// Backend endpoint to generate QR codes
import { QRGeneratorService } from '@/infrastructure/qr/qr-generator.service';

router.get('/api/stories/:id/qr', async (req, res) => {
  const qrService = new QRGeneratorService();
  const qrDataURL = await qrService.generateStoryQR(req.params.id);

  res.json({
    success: true,
    qrCode: qrDataURL, // base64 PNG
    url: qrService.generateStoryURL(req.params.id)
  });
});
```

---

## 🎯 Next Steps

### 1. Create Story Pages
You need to create the actual story pages that QR codes link to:

```bash
# Create story page component
frontend/src/pages/StoryPage.tsx
```

```tsx
// Example story page
import { useParams } from 'react-router-dom';

export function StoryPage() {
  const { storyId } = useParams();

  // Fetch story data
  // Display impact metrics
  // Show donation breakdown

  return (
    <div>
      <h1>Impact Story: {storyId}</h1>
      {/* Story content */}
    </div>
  );
}
```

### 2. Setup Routing
Add route for story pages:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<App />} />
  <Route path="/stories/:storyId" element={<StoryPage />} />
</Routes>
```

### 3. Print-Ready QR Codes
Generate high-resolution QR codes for printing:
```tsx
<QRCodeDisplay
  storyId="story_123"
  size={1024}  // 1024px = high print quality
  includeDownload={true}
/>
```

### 4. Analytics
Track QR code scans:
```typescript
// Backend analytics endpoint
POST /api/stories/:id/scan
{
  "scannedAt": "2024-01-15T12:00:00Z",
  "userAgent": "...",
  "location": "..."
}
```

---

## 🐛 Troubleshooting

### QR Code Not Displaying
**Issue:** QR component doesn't render
**Fix:** Check that `qrcode.react` is installed
```bash
npm list qrcode.react
# Should show: qrcode.react@3.1.0
```

### Download Not Working
**Issue:** Download button doesn't save file
**Fix:**
1. Check browser console for errors
2. Ensure browser supports Canvas API
3. Try right-click > Save Image As

### Share Button Not Working
**Issue:** Share button doesn't open share dialog
**Fix:**
1. Web Share API only works on HTTPS or localhost
2. Fallback: copies URL to clipboard
3. Check for "Link copied!" alert

---

## 📊 QR Code Best Practices

### Size Recommendations
- **Business cards:** 128-192px
- **Flyers/posters:** 256-512px
- **Billboards:** 1024px+
- **Digital screens:** 256-384px

### Placement Tips
- ✅ High contrast background
- ✅ Adequate white space around QR
- ✅ Clear call-to-action text
- ✅ Test scan from 1-2 meters away
- ❌ Don't place on curved surfaces
- ❌ Don't use on dark backgrounds
- ❌ Don't make too small (<100px)

### Error Correction
- Use **Level H** when adding logo overlay
- Use **Level M** for simple QR codes
- Higher levels = larger QR code

---

## ✅ Quick Checklist

Before using QR codes in production:

- [ ] Frontend running on http://localhost:5175
- [ ] QR section accessible (scroll down or use footer link)
- [ ] Can generate QR codes with custom story IDs
- [ ] Download button works (saves PNG)
- [ ] Share button works (native share or clipboard)
- [ ] Different sizes display correctly
- [ ] QR codes scan successfully with phone camera
- [ ] Story pages exist at destination URLs
- [ ] Analytics tracking implemented (optional)
- [ ] Print-quality versions tested (1024px)

---

## 🎉 You're Ready!

Your QR code generator is now live and ready to use. Visit:

**http://localhost:5175#qr-section**

Generate QR codes for your donation stories, donor profiles, or campaigns - all with just a few clicks!

---

**Need help?** Check:
- [FRONTEND_INTEGRATION_COMPLETE.md](FRONTEND_INTEGRATION_COMPLETE.md) - Full integration docs
- [QRCodeDisplay.tsx](frontend/src/shared/components/QRCodeDisplay.tsx) - Component source code
- [QRCodeDemo.tsx](frontend/src/components/qr/QRCodeDemo.tsx) - Demo page source
