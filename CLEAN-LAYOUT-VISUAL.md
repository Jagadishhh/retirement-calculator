# 🎨 Clean Layout - Visual Guide & Specifications

## Layout Diagrams

### Full Desktop Layout (≥ 1024px)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Outer Container (Page Background: #f4f4f4, min-h-screen)                       │
│                                                                                │
│ ┌──────────────────────────────────────────────────────────────────────────┐  │
│ │ Flex Container (justify-center, px-4 lg:px-0)                           │  │
│ │                                                                          │  │
│ │  ┌─ Left  ┌──────────────────────────┬───────────────────────────┐ ┌─  │  │
│ │  │ Border │   LEFT SIDEBAR (360px)   │   MAIN CONTENT (flex-1)   │ │ │  │  │
│ │  │ 6px    │                          │                           │ │ │  │  │
│ │  │        │ bg: gray-50/80           │ bg: white                 │ │ │  │  │
│ │  │ #d9d9d9│ border-r gray-200        │ box-shadow depth          │ │ │  │  │
│ │  │        │ w-[360px] lg:static      │ max-w-[1280px]            │ │R│  │  │
│ │  │        │                          │                           │ │i│  │  │
│ │  │        │ HEADER:                  │ HEADER / STATS:           │ │g│  │  │
│ │  │        │ • Logo "RetirePlan"      │ • Median Card             │ │h│  │  │
│ │  │        │ • Close btn (mobile)     │ • Best Case Card          │ │t│  │  │
│ │  │        │                          │ • Worst Case Card         │ │B│  │  │
│ │  │        │ PROFILE & INCOME:        │                           │ │o│  │  │
│ │  │        │ • Current Age: [30]      │ NAVIGATION:               │ │r│  │  │
│ │  │        │ • Retirement Age: [65]   │ • Projections Tab         │ │d│  │  │
│ │  │        │ • Monthly Income: ₹[x]   │ • Table Tab               │ │e│  │  │
│ │  │        │ • Monthly Exp: ₹[x]      │ • Report Tab              │ │r│  │  │
│ │  │        │ • Existing Corpus: ₹[x]  │                           │ │  │  │  │
│ │  │        │                          │ DYNAMIC CONTENT:          │ │6│  │  │
│ │  │        │ ASSUMPTIONS:             │ (Based on active tab)     │ │p│  │  │
│ │  │        │ • Expected Return: [10%] │                           │ │x│  │  │
│ │  │        │ • Inflation Rate: [5%]   │ Projections:              │ │  │  │  │
│ │  │        │ • Step-up SIP: [5%]      │ ├─ Corpus Chart           │ │#│  │  │
│ │  │        │                          │ ├─ Impact Analysis        │ │d│  │  │
│ │  │        │ MAJOR EXPENSES:          │ └─ Optimization Cards     │ │9│  │  │
│ │  │        │ • [+ Add Event]          │                           │ │d│  │  │
│ │  │        │ [Expense Cards Listed]   │ Table:                    │ │9│  │  │
│ │  │        │                          │ ├─ Yearly Breakdown       │ │d│  │  │
│ │  │        │ [Reset] [PDF] [Settings] │ └─ Data Export            │ │  │  │  │
│ │  │        │                          │                           │ │s│  │  │
│ │  │        │                          │ Report:                   │ │o│  │  │
│ │  │        │                          │ ├─ Strategy Section       │ │l│  │  │
│ │  │        │ [Sticky on scroll]       │ ├─ Risk Assessment        │ │i│  │  │
│ │  │        │                          │ ├─ Model Limitations      │ │d│  │  │
│ │  │        │                          │ └─ Legal Footer           │ │  │  │  │
│ │  │        │                          │                           │ │  │  │  │
│ │  └─ ──────┴──────────────────────────┴───────────────────────────┘ └─  │  │
│ │                                                                          │  │
│ └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 1024px)

```
┌──────────────────────────────┐
│ Page Background: #f4f4f4     │
│                              │
│ ┌────────────────────────┐   │
│ │ Header Bar (sticky)    │   │
│ │ [Menu] RetirePlan      │   │
│ └────────────────────────┘   │
│                              │
│ ┌────────────────────────┐   │
│ │ STAT CARDS (stacked)   │   │
│ │ ┌────────────────────┐ │   │
│ │ │ Median Scenario    │ │   │
│ │ │ ₹[amount]  [%SWR]  │ │   │
│ │ └────────────────────┘ │   │
│ │ ┌────────────────────┐ │   │
│ │ │ Best Case Scenario │ │   │
│ │ │ ₹[amount]  [%SWR]  │ │   │
│ │ └────────────────────┘ │   │
│ │ ┌────────────────────┐ │   │
│ │ │ Worst Case Scn.    │ │   │
│ │ │ ₹[amount]  [%SWR]  │ │   │
│ │ └────────────────────┘ │   │
│ └────────────────────────┘   │
│                              │
│ ┌────────────────────────┐   │
│ │ NAVIGATION TABS:       │   │
│ │ [Projections][Table]   │   │
│ │     [Report]           │   │
│ └────────────────────────┘   │
│                              │
│ ┌────────────────────────┐   │
│ │ DYNAMIC CONTENT AREA   │   │
│ │                        │   │
│ │ [Charts, cards,        │   │
│ │  analysis, data]       │   │
│ │                        │   │
│ └────────────────────────┘   │
│                              │
│ ┌────────────────────────┐   │
│ │ Legal Footer           │   │
│ └────────────────────────┘   │
│                              │
│ Sidebar (when menu toggled): │
│ ┌────────────────────────┐   │
│ │ Profile & Input Fields │   │
│ │ Assumptions            │   │
│ │ Major Expenses         │   │
│ │ Settings               │   │
│ └────────────────────────┘   │
└──────────────────────────────┘

NO BORDERS ON MOBILE ✓
FULL-WIDTH LAYOUT ✓
SIDEBAR IS DRAWER ✓
```

### Sidebar Detail (360px)

```
┌──────────────────────────┐
│ Header                   │
│ ┌──────┐  RetirePlan  [X]│ (Close on mobile)
│ │ Logo │                │
│ └──────┘                │
├──────────────────────────┤
│ PROFILE & INCOME         │
├──────────────────────────┤
│ Current Age to           │
│ [30] ────────────► [65]  │
│        Retirement Age    │
│                          │
│ Monthly Income           │
│ ₹[___________]          │
│                          │
│ Monthly Expenses         │
│ ₹[___________]          │
│                          │
│ Existing Corpus          │
│ ₹[___________]          │
├──────────────────────────┤
│ ASSUMPTIONS              │
├──────────────────────────┤
│ Expected Return:  [10%]  │
│ ◄─ Slider ─►             │
│                          │
│ Inflation Rate:   [5%]   │
│ ◄─ Slider ─►             │
│                          │
│ Step-up SIP:      [5%]   │
│ ◄─ Slider ─►             │
├──────────────────────────┤
│ MAJOR EXPENSES           │
├──────────────────────────┤
│ [+ Add Event]            │
│                          │
│ ┌────────────────────┐   │
│ │ Expense Card       │   │
│ │ Name: [Wedding]    │   │
│ │ Cost: ₹10L @ Age 35│   │
│ │ Inflation: 3%      │   │
│ │ [Edit] [Delete]    │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ More Expenses...   │   │
│ └────────────────────┘   │
│                          │
│ [+ Add Event]            │
├──────────────────────────┤
│ [Reset to Defaults]      │
│ [Export to CSV]          │
│ [Security Settings]      │
├──────────────────────────┤
│ Scrollable (h-screen)    │
│ on desktop               │
└──────────────────────────┘
```

### Main Content Detail

```
┌──────────────────────────────────────────────┐
│ STAT CARDS ROW (grid-cols-1 md:grid-cols-3) │
│                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌───────┐│
│ │ 📊 Median    │ │ 📈 Best Case │ │ 📉 Wo││
│ │ Scenario     │ │              │ │ worst││
│ │              │ │              │ │ Case ││
│ │ ₹[amount]    │ │ ₹[amount]    │ │ ₹[am]││
│ │ SWR: [4.2%]  │ │ SWR: [5.1%]  │ │ SWR: ││
│ │              │ │              │ │ [2.8]││
│ └──────────────┘ └──────────────┘ └───────┘│
│                                              │
├──────────────────────────────────────────────┤
│ NAVIGATION TABS                              │
│ [● Projections] [Table] [Report]            │
│                                              │
├──────────────────────────────────────────────┤
│ DYNAMIC CONTENT AREA                         │
│                                              │
│ PROJECTIONS TAB CONTENT:                    │
│ ┌──────────────────────────────────────────┐│
│ │ CORPUS PROJECTION                        ││
│ │ Monte Carlo-lite simulation across 3     ││
│ │ market scenarios                         ││
│ │                                          ││
│ │ ┌────────────────────────────────────┐  ││
│ │ │                                    │  ││
│ │ │      [INTERACTIVE LINE CHART]      │  ││
│ │ │      showing 3 scenarios over time │  ││
│ │ │                                    │  ││
│ │ └────────────────────────────────────┘  ││
│ │                                          ││
│ │ — Base (Median)                         ││
│ │ — Optimistic (Best)                     ││
│ │ — Pessimistic (Worst)                   ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ EXPENSE IMPACT ANALYSIS                  ││
│ │ (if major expenses exist)                ││
│ │                                          ││
│ │ ┌────────────┐ ┌────────────┐           ││
│ │ │ Wedding    │ │ House Reno │           ││
│ │ │ Age 35     │ │ Age 50     │           ││
│ │ │ Impact: 4y │ │ Impact: 2y │           ││
│ │ │ ✓ Safe     │ │ ⚠ Caution  │           ││
│ │ └────────────┘ └────────────┘           ││
│ │                                          ││
│ │ ┌────────────┐                          ││
│ │ │ Education  │                          ││
│ │ │ Age 55     │                          ││
│ │ │ Impact: 6y │                          ││
│ │ │ ✗ Unsafe   │                          ││
│ │ └────────────┘                          ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ MODEL LIMITATIONS & COMPLIANCE            ││
│ │                                          ││
│ │ Taxation: Results are pre-tax...        ││
│ │ Volatility: Model assumes smooth...     ││
│ │ Inflation: Real-life expenses come...   ││
│ │ Advice: This is a simulation tool...    ││
│ └──────────────────────────────────────────┘│
│                                              │
│ TABLE TAB CONTENT:                          │
│ ┌──────────────────────────────────────────┐│
│ │ [Similar data in tabular format]         ││
│ │ [With export capabilities]               ││
│ └──────────────────────────────────────────┘│
│                                              │
│ REPORT TAB CONTENT:                         │
│ ┌──────────────────────────────────────────┐│
│ │ [Comprehensive analysis & strategy]      ││
│ │ [Risk assessment]                        ││
│ │ [Model limitations]                      ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ LEGAL FOOTER                             ││
│ │ Privacy • Terms • Security • Contact     ││
│ │ © 2025 RetirePlan. All rights reserved.  ││
│ └──────────────────────────────────────────┘│
│                                              │
└──────────────────────────────────────────────┘
```

## Color Specifications

### Primary Colors

| Color | Hex Code | Usage | Tailwind |
|-------|----------|-------|----------|
| Page Background | `#f4f4f4` | Outer page | bg-gray-100 |
| Content Background | `#ffffff` | Main content | bg-white |
| Sidebar Background | `#f3f4f6` | Left sidebar | bg-gray-50 |
| Border | `#d9d9d9` | Left & right frames | custom |
| Border Alternate | `#e5e7eb` | Card borders | border-gray-200 |

### Text Colors

| Color | Hex Code | Usage | Tailwind |
|-------|----------|-------|----------|
| Primary Text | `#101828` | Headings | text-gray-900 |
| Secondary Text | `#666666` | Body text | text-gray-600 |
| Tertiary Text | `#9ca3af` | Labels | text-gray-400 |
| Disabled Text | `#d1d5db` | Disabled inputs | text-gray-300 |

### Semantic Colors

| Color | Hex Code | Usage | Tailwind |
|-------|----------|-------|----------|
| Safe/Success | `#10b981` | Safe expenses | bg-emerald-50 |
| Caution/Warning | `#f59e0b` | Warning alerts | bg-amber-50 |
| Unsafe/Danger | `#ef4444` | Critical alerts | bg-rose-50 |
| Info | `#3b82f6` | Information | bg-blue-50 |

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Mobile | < 1024px | Full-width, flex column, sidebar drawer, no borders |
| Desktop | ≥ 1024px | 2-column layout, sidebar fixed, borders visible, centered |
| Large Desktop | > 1440px | Same as desktop (max-width: 1280px applied) |

### Responsive Classes

```tsx
// Mobile: Full-width, single column
// Desktop: Two-column grid
<main className="flex-1 min-w-0 bg-white flex flex-col lg:grid lg:grid-cols-2">

// Content spans both columns
<div className="lg:col-span-2 p-4 lg:p-12">

// Sidebar hidden on mobile, static on desktop
<aside className="...lg:static...">

// Borders hidden on mobile, visible on desktop
<div className="hidden lg:block w-6" style={{backgroundColor: '#d9d9d9'}}>

// Padding: 16px mobile, 48px desktop
<div className="p-4 lg:p-12">

// Max-width: full on mobile, 1280px on desktop
<div className="flex-1 lg:max-w-[1280px] w-full">
```

## Typography Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Page Title | 24px | Bold | H1 (if used) |
| Section Header | 20px | Bold | Main sections |
| Card Title | 16px | Bold | Card headers |
| Body Text | 14px | Medium | Main content |
| Label Text | 12px | Bold | Form labels |
| Caption Text | 12px | Medium | Descriptions |
| Small Text | 11px | Regular | Help text |

## Spacing System

| Value | Pixels | Usage | Tailwind |
|-------|--------|-------|----------|
| XS | 4px | Micro spacing | gap-1 |
| SM | 8px | Small gaps | gap-2 |
| MD | 16px | Default gap | gap-4 |
| LG | 24px | Section gap | gap-6 |
| XL | 32px | Major gap | gap-8 |
| 2XL | 48px | Page padding | p-12 |

### Common Spacing

```tsx
// Outer padding
p-4        // Mobile: 16px
lg:p-12    // Desktop: 48px

// Gap between cards
gap-6      // 24px
gap-8      // 32px

// Vertical spacing
space-y-12 // 48px between sections
mb-12      // 48px margin-bottom
mb-8       // 32px margin-bottom
mb-6       // 24px margin-bottom

// Sidebar spacing
p-8        // 32px padding

// Border height
h-px       // 1px (divider lines)
```

## Shadow Effects

| Name | CSS | Usage |
|------|-----|-------|
| No Shadow | `none` | Base state |
| Subtle | `shadow-sm` | Cards |
| Medium | `shadow-md` | Borders, small elements |
| Large | `shadow-lg` | Floating elements |
| XLarge | `shadow-xl` | Charts, major cards |
| Box Shadow | `0 0 30px rgba(0,0,0,0.08)` | Content container |

## Border Styles

| Element | Thickness | Color | Style |
|---------|-----------|-------|-------|
| Left/Right Frames | 6px | #d9d9d9 | solid |
| Card Borders | 1px | #e5e7eb | solid |
| Divider Lines | 1px | #e5e7eb | solid |
| Input Borders | 1px | #d1d5db | solid (focused) |

## Animation/Transitions

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| Color Change | 300ms | ease | Text hover |
| Background | 300ms | ease | Button hover |
| Tab Switch | 300ms | ease-in-out | Tab animation |
| Fade In | 300ms | ease | Content load |
| Sidebar | 300ms | ease-in-out | Mobile drawer |

## Icons Used

| Icon | Purpose | Location |
|------|---------|----------|
| TrendingUp | Logo, positive indicators | Sidebar header, stat cards |
| TrendingDown | Negative indicators | Risk section |
| Alert | Warnings, important info | Headers, alerts |
| Check | Success, safe status | Expense status |
| Plus | Add button | Add expenses |
| Trash | Delete button | Remove expenses |
| Menu | Mobile navigation | Mobile header |
| X | Close/dismiss | Modals, drawers |
| Shield | Security | Security panel |
| Info | Information | Info boxes |

## Button Styles

### Primary Buttons
```tsx
className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-gray-900 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-all"
```
- **Used for**: Active tabs, primary actions
- **States**: Default, hover, active
- **Colors**: White background, dark text

### Secondary Buttons
```tsx
className="px-6 py-2.5 rounded-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 transition-all"
```
- **Used for**: Inactive tabs, secondary actions
- **States**: Default, hover
- **Colors**: Transparent, gray text

### Danger Buttons
```tsx
className="w-full py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
```
- **Used for**: Reset, delete, dangerous actions
- **States**: Default, hover
- **Colors**: Rose/red variants

### Icon Buttons
```tsx
className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
```
- **Used for**: Menu, close, small actions
- **States**: Default, hover
- **Colors**: Gray variants

## Form Elements

### Input Fields
```tsx
className="w-full px-4 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
```

### Number Inputs
- Numeric keyboard on mobile
- Min/max validation
- Formatted display (currencies)

### Slider Inputs
- Range selection 0-100%
- Visual feedback
- Real-time value display

### Currency Inputs
- Formatted with commas: `₹1,00,00,000`
- Lakh/Crore display for large amounts
- Validation and constraints

## Card Styles

### Stat Cards
```tsx
className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
```
- **Dimensions**: Flexible (3 across on desktop)
- **Content**: Scenario name, amount, SWR %
- **Interactive**: Click to select scenario

### Content Cards
```tsx
className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/40"
```
- **Dimensions**: Full width
- **Content**: Charts, tables, analysis
- **Style**: Larger shadow for prominence

### Info Cards
```tsx
className="p-4 bg-blue-50 border border-blue-100 rounded-lg"
```
- **Dimensions**: Variable
- **Style**: Colored background, matching border
- **Content**: Icons, headings, text

## Layout Transitions

### Desktop Layout Animation
```css
transition: all 300ms ease-in-out
```
- Sidebar position
- Border visibility
- Content width
- Spacing adjustments

### Mobile Menu Animation
```tsx
className={`transform transition-transform duration-300 ease-in-out ${
  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
}`}
```
- Smooth slide in/out
- Backdrop overlay
- Click outside to close

## Print Styles

When printing or exporting to PDF:
- Borders hidden
- Page breaks adjusted
- Colors optimized
- Footer included
- Charts converted to images

## Accessibility

### Color Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- Interactive elements: Clear focus states

### Focus States
```tsx
focus:outline-none
focus:ring-2
focus:ring-blue-500
focus:border-transparent
```

### ARIA Labels
- All buttons have descriptive labels
- Form fields have associated labels
- Icons have alt text
- Headings properly nested

## Performance Metrics

### CSS
- Utility-first (Tailwind CSS)
- Zero unused CSS (PurgeCSS)
- Minimal file size: < 50KB gzipped
- No animation jank (GPU accelerated)

### Layout Rendering
- CSS Grid: 60fps
- Flexbox: 60fps
- No layout thrashing
- Minimal repaints

### Load Time
- Time to First Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

---

**Last Updated**: December 5, 2025  
**Version**: 2.0 (Clean Layout)  
**Status**: ✅ Production Ready
