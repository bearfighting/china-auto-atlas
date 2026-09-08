# China Auto Atlas — UI Design System

> Version: 0.1  
> Status: Initial Design Specification

China Auto Atlas is a structured, independent reference for China's automotive industry.

This document defines the visual language, layout system, reusable components, information presentation rules, responsive behavior, and implementation principles for the China Auto Atlas website.

The goal is not to create a visually aggressive automotive marketing site. The interface should make vehicles, manufacturers, technologies, industry developments, and their relationships easy to understand.

---

# 1. Design Philosophy

## 1.1 Core Idea

China Auto Atlas should feel like:

> An automotive atlas and reference database with editorial reporting.

It should not feel like:

- a vehicle marketplace
- a dealership website
- a manufacturer marketing website
- an EV enthusiast blog
- a luxury automotive magazine
- a technology showcase

The visual system should remain useful whether the visitor is reading today's industry news or researching a discontinued vehicle ten years later.

## 1.2 Design Principles

### Information First

Content, specifications, relationships, sources, and historical context take priority over decoration.

UI should make information easier to understand rather than compete with it.

### Atlas, Not Marketplace

Vehicles are documented rather than sold.

Avoid patterns strongly associated with automotive marketplaces:

- large purchase CTAs
- promotional pricing
- financing widgets
- exaggerated vehicle photography
- artificial urgency
- ranking vehicles as "best"

Prices are reference data rather than sales offers.

### Neutral and Credible

The interface should visually reinforce editorial independence.

Prefer:

- neutral backgrounds
- restrained colors
- clear typography
- structured tables
- visible sources
- factual labels

Avoid manufacturer-style promotional visual language.

### Dense but Readable

Automotive information is naturally dense.

Do not remove useful information merely to make the interface appear minimal.

Instead, create hierarchy through:

- typography
- spacing
- grouping
- alignment
- progressive disclosure

### Consistency Across Entities

Manufacturer, Brand, Vehicle, Technology, and News pages should share recognizable patterns.

Users should quickly understand where they are and how different entities relate.

### Photography Supports Information

Photography provides identification and context.

It should not dominate the information architecture.

Prefer documentary or representative photography over heavily stylized promotional imagery when alternatives are available.

### Long-Term Design

The interface should remain useful as the database grows.

A vehicle page should still make sense after the vehicle is discontinued.

A manufacturer page should support decades of history.

A news article should remain understandable years after publication.

---

# 2. Visual Identity

## 2.1 Personality

The visual language should communicate:

- Editorial
- Technical
- Neutral
- Modern
- International
- Structured
- Calm
- Reliable

The site should feel contemporary without depending heavily on current UI trends.

## 2.2 Visual Direction

Primary visual characteristics:

- light neutral background
- dark typography
- restrained automotive red accent
- thin borders
- limited shadows
- generous page-level spacing
- compact information-level spacing
- strong grid alignment
- high-quality automotive photography

The interface should generally remain quiet so that vehicles, diagrams, specifications, and reporting provide the visual interest.

## 2.3 Things to Avoid

Avoid:

- cyberpunk aesthetics
- neon EV colors
- glowing elements
- excessive gradients
- glassmorphism
- heavy shadows
- oversized rounded cards
- excessive animation
- oversized marketing hero sections
- decorative Chinese cultural motifs
- flag-based decoration
- manufacturer-style promotional graphics
- unnecessary dashboard-style widgets

China Auto Atlas is about China's automotive industry, but the UI itself does not need to visually signal "China" through decorative stereotypes.

---

# 3. Color System

Colors should be represented through semantic design tokens rather than direct color references inside components.

Exact values may evolve during implementation.

## 3.1 Core Colors

Suggested initial palette:

| Token | Suggested Value | Purpose |
|---|---:|---|
| `--background` | `#FAFAFA` | Main page background |
| `--foreground` | `#171717` | Primary text |
| `--surface` | `#FFFFFF` | Cards and raised content |
| `--surface-muted` | `#F5F5F5` | Secondary sections |
| `--muted` | `#F1F1F1` | Muted controls/background |
| `--muted-foreground` | `#6B7280` | Secondary text |
| `--border` | `#E5E7EB` | Default border |
| `--border-strong` | `#D1D5DB` | Strong separators |
| `--primary` | `#C92A2A` | Main accent |
| `--primary-hover` | `#A61E1E` | Accent hover |
| `--primary-foreground` | `#FFFFFF` | Text on primary |

The red accent should be used sparingly.

It should primarily indicate:

- active navigation
- links requiring emphasis
- selected tabs
- important interactive states
- small editorial accents

Large areas should rarely use the primary red.

## 3.2 Semantic Colors

Additional semantic tokens:

```text
--success
--success-muted

--warning
--warning-muted

--error
--error-muted

--info
--info-muted
```

These should communicate state rather than decoration.

Never rely on color alone to communicate meaning.

---

# 4. Typography

## 4.1 Font Strategy

The typography system must work well with:

- English
- Simplified Chinese
- automotive abbreviations
- technical terminology
- large quantities of numerical data

Recommended font strategy:

```text
Latin:
Inter

Chinese:
Noto Sans SC

Fallback:
system-ui, sans-serif
```

Implementation may use a unified variable-font stack when practical.

## 4.2 Type Hierarchy

Suggested hierarchy:

| Role | Size | Weight |
|---|---:|---:|
| Display | 48–56px | 700 |
| H1 | 36–40px | 700 |
| H2 | 26–30px | 650–700 |
| H3 | 20–22px | 600 |
| Body Large | 18px | 400 |
| Body | 16px | 400 |
| Small | 14px | 400 |
| Caption | 12–13px | 400 |
| Label | 12–14px | 500–600 |

Mobile typography should scale down appropriately rather than simply reproducing desktop sizes.

## 4.3 Reading Width

Long-form editorial content should not occupy the full desktop content width.

Recommended article reading width:

```text
680–760px
```

Reference pages may use significantly wider layouts.

---

# 5. Automotive Data Typography

Automotive specifications require their own visual hierarchy.

A value should normally be more visually prominent than its unit or measurement standard.

Example:

```text
93.7 kWh
Battery capacity
```

or:

```text
650 km
CLTC range
```

Preferred conceptual hierarchy:

```text
VALUE      strong
UNIT       medium
STANDARD   secondary
LABEL      muted
```

## 5.1 Numbers

Use tabular numerals where alignment improves readability.

Particularly useful for:

- prices
- specification tables
- dimensions
- comparison tables
- timelines

## 5.2 Units

Keep a space between numerical values and units where linguistically appropriate:

```text
93.7 kWh
495 kW
770 N·m
650 km
1,980 kg
```

Avoid:

```text
93.7kWh
495KW
650KM
```

Preserve technically correct capitalization.

## 5.3 Performance Values

Performance data must include sufficient context.

Prefer:

```text
3.2 s
0–100 km/h
```

instead of:

```text
Acceleration: 3.2
```

---

# 6. Spacing System

Use a consistent spacing scale.

Suggested base system:

```text
4px
8px
12px
16px
24px
32px
48px
64px
96px
```

General guidance:

```text
Inline elements       4–8px
Component internals   8–16px
Card padding          16–24px
Section spacing       32–64px
Major page sections   64–96px
```

Dense specification areas may intentionally use tighter spacing.

---

# 7. Borders, Radius and Shadows

## 7.1 Border Radius

The site should not rely heavily on rounded containers.

Suggested scale:

```text
Small controls:  4–6px
Cards:           6–8px
Large media:     8px
Pills / badges:  fully rounded when appropriate
```

Avoid excessive 16–32px rounded cards.

## 7.2 Borders

Thin borders are preferred over shadows for separating information.

Default:

```text
1px solid var(--border)
```

## 7.3 Shadows

Use shadows sparingly.

Cards should normally rely on:

- background
- border
- spacing

rather than elevation.

Stronger shadows are appropriate mainly for:

- dropdown menus
- dialogs
- popovers
- floating controls

---

# 8. Layout System

## 8.1 Main Container

Suggested maximum content width:

```text
1280–1440px
```

Recommended default:

```text
max-width: 1360px
```

The exact implementation may evolve.

## 8.2 Page Padding

Suggested:

```text
Desktop: 32px
Tablet:  24px
Mobile:  16px
```

## 8.3 Grid

Desktop pages should generally use a 12-column grid.

Typical layouts:

```text
12 columns
8 + 4
9 + 3
```

Do not create sidebars merely to fill available space.

---

# 9. Global Page Structure

Most pages should follow:

```text
Global Header

Breadcrumb

Page Header

Primary Content

Supporting / Related Content

Sources

Footer
```

Not every page requires every section.

---

# 10. Global Header

Desktop navigation should remain compact.

Suggested structure:

```text
China Auto Atlas

Vehicles
Manufacturers
Technologies
News

Search

Language
```

Potential future sections should not be exposed until they contain useful content.

## 10.1 Header Behavior

Desktop:

- single horizontal row
- compact height
- optional sticky behavior

Mobile:

- logo
- search access
- menu trigger

Avoid oversized headers.

---

# 11. Search

Search is a core navigation mechanism rather than a secondary utility.

Users should eventually be able to search:

- manufacturers
- brands
- vehicles
- technologies
- news

Search results should clearly identify entity type.

Example:

```text
BYD Seal
Vehicle

BYD
Manufacturer

Blade Battery
Technology
```

---

# 12. Core UI Components

The implementation should prefer reusable primitives.

Core components include:

```text
Button
Input
Search Input
Select
Tabs
Badge
Card
Table
Tooltip
Dropdown
Dialog
Sheet
Breadcrumb
Pagination
Separator
Skeleton
Alert
```

Where practical, use shadcn/ui primitives rather than creating equivalent infrastructure from scratch.

---

# 13. Buttons

Primary buttons should be uncommon.

Most navigation should use:

- links
- text actions
- tabs
- compact secondary controls

Variants:

```text
Primary
Secondary
Outline
Ghost
Destructive
```

Primary red buttons should be reserved for clear primary actions.

Avoid filling pages with red CTAs.

---

# 14. Tags and Badges

Badges should communicate structured metadata.

Examples:

```text
BEV
PHEV
EREV
HEV

Sedan
SUV
MPV

Production
Discontinued
Concept

China
Europe
Global
```

Badges should remain visually quiet.

Avoid turning every metadata field into a colorful pill.

---

# 15. Automotive Domain Components

Domain components form the core of the China Auto Atlas UI system.

## 15.1 Vehicle Card

Purpose:

Represent a vehicle in lists, search results, related content, and discovery surfaces.

Structure:

```text
┌─────────────────────────┐
│                         │
│      Vehicle Image      │
│                         │
├─────────────────────────┤
│ Xiaomi SU7              │
│ Xiaomi Auto             │
│                         │
│ BEV · Sedan · 2024–     │
│                         │
│ From ¥215,900           │
└─────────────────────────┘
```

Recommended content:

- representative image
- model name
- brand
- powertrain
- vehicle class
- production period
- optional reference price

Do not overload cards with specifications.

---

# 16. Manufacturer Card

Suggested structure:

```text
Manufacturer Logo

BYD

Shenzhen, China
Founded 1995

Vehicles · Brands · Technologies
```

Manufacturer cards should emphasize identity rather than promotional messaging.

---

# 17. Brand Card

Brand cards may contain:

- logo
- brand name
- parent manufacturer
- positioning summary
- active/inactive status

Example:

```text
Denza

BYD
Premium automotive brand
```

---

# 18. Technology Card

Suggested content:

```text
Technology Name

Category

Short factual description

Related manufacturers / vehicles
```

Example:

```text
Blade Battery

Battery Technology

BYD-developed LFP battery architecture.

BYD · Denza · Fangchengbao
```

---

# 19. News Card

News cards should prioritize editorial information.

Suggested structure:

```text
Image

Headline

Short summary

Category
Related entities

Publication date
```

Avoid clickbait visual patterns.

Publication dates must always remain visible.

---

# 20. Key Facts

Key Facts provides a compact summary near the top of entity pages.

Vehicle example:

```text
Segment
Mid-size sedan

Powertrain
BEV

Battery
73.6–101 kWh

Range
700–830 km CLTC

Production
2024–

Market
China
```

Key Facts should answer:

> What is this?

before users reach detailed specifications.

---

# 21. Specification Groups

Specifications should be grouped semantically.

Suggested vehicle groups:

```text
Overview

Dimensions

Powertrain

Battery

Charging

Performance

Range

Chassis

Wheels & Tires

Interior

Driver Assistance

Production
```

Do not display hundreds of fields as one continuous table.

---

# 22. Specification Rows

Default pattern:

```text
Battery capacity                 93.7 kWh
Battery chemistry                LFP
Architecture                     800 V
```

Labels align consistently.

Values receive slightly stronger visual emphasis.

Additional context may appear below:

```text
Range                            650 km
                                 CLTC
```

---

# 23. Variant Comparison

Desktop comparison tables may use:

```text
                    Standard     Pro        Max

Battery             73.6 kWh     94.3 kWh   101 kWh
Range               700 km       830 km     800 km
Power               220 kW       220 kW     495 kW
Drive                RWD          RWD        AWD
```

Comparison tables should prioritize scanability over decoration.

---

# 24. Timeline

Timeline components are useful for:

- manufacturer history
- vehicle generations
- technology development
- major corporate events

Example:

```text
1995
BYD founded

2003
Entered automobile manufacturing

2022
Ended production of ICE-only passenger vehicles

2024
...
```

Timelines should remain chronological and factual.

---

# 25. Sources

Sources are part of the product experience rather than legal fine print.

Entity pages should provide clearly accessible source information.

Suggested presentation:

```text
Sources

1. Manufacturer specification sheet
2. Regulatory filing
3. Company announcement
4. Independent reporting
```

Source presentation should follow `editorial-guidelines.md`.

Do not visually hide sources.

---

# 26. Information Presentation Rules

UI representation must preserve distinctions defined by the underlying data model.

## 26.1 Price

Always preserve:

- currency
- market
- price type
- date/context when necessary

Preferred:

```text
¥215,900–299,900
China MSRP
```

or:

```text
From ¥215,900
China
```

Avoid presenting prices without market context when ambiguity is possible.

## 26.2 Range

Never present range without its test standard when known.

Correct:

```text
650 km
CLTC
```

```text
560 km
WLTP
```

Avoid:

```text
Range: 650 km
```

when the measurement standard is available.

## 26.3 Powertrain

Use consistent terminology.

Examples:

```text
BEV
PHEV
EREV
HEV
ICE
FCEV
```

A tooltip or glossary may explain unfamiliar abbreviations.

## 26.4 Dates

Use dates according to context.

News:

```text
September 8, 2026
```

Production:

```text
2024–
```

Discontinued:

```text
2021–2025
```

Historical timelines may use year-only dates when exact dates are unnecessary.

---

# 27. Missing and Unknown Data

Missing data must not be silently converted into misleading UI.

Distinguish:

```text
Unknown
Not disclosed
Not available
Not applicable
Not yet confirmed
```

Do not display:

```text
0
-
N/A
```

for every missing-data condition.

When a field is truly optional and unimportant, omission may be preferable.

---

# 28. Entity Relationships

One of the major advantages of China Auto Atlas is structured relationships.

The UI should expose relationships naturally.

Example:

```text
BYD
  ↓
Denza
  ↓
Denza N9
  ↓
DM-p Platform
```

Vehicle pages should link to:

- brand
- manufacturer
- technologies
- related vehicles
- relevant news

Technology pages should link back to:

- manufacturers
- brands
- vehicles
- related technologies
- news

These relationships should provide natural exploration without becoming a visual graph by default.

---

# 29. Page Pattern — Homepage

The homepage should introduce the database rather than behave like a news portal.

Suggested structure:

```text
Header

Intro / Search

Primary Entity Navigation
├── Vehicles
├── Manufacturers
├── Technologies
└── News

Featured / Recently Added Vehicles

Industry Highlights

Technology / Industry Context

Recent News

Explore Manufacturers

Footer
```

News should remain important but should not dominate the entire homepage.

---

# 30. Page Pattern — Vehicle

Suggested structure:

```text
Breadcrumb

Vehicle Header
├── Vehicle name
├── Brand
├── Generation
├── Production status
└── Representative image

Key Facts

Overview

Variants

Specifications

Technology

Production

Market Availability

Related Vehicles

Related News

Sources
```

The vehicle page should become the primary long-term reference page for a model.

---

# 31. Page Pattern — Manufacturer

Suggested structure:

```text
Breadcrumb

Manufacturer Header
├── Logo
├── Name
├── Native name
└── Short description

Key Facts

Overview

Brands

Current Vehicles

Technologies

Manufacturing

History / Timeline

Related News

Sources
```

Avoid corporate-profile promotional language.

---

# 32. Page Pattern — Brand

Suggested structure:

```text
Breadcrumb

Brand Header

Parent Manufacturer

Overview

Current Vehicles

Discontinued Vehicles

Technologies

Timeline

Related News

Sources
```

---

# 33. Page Pattern — Technology

Suggested structure:

```text
Breadcrumb

Technology Header

Overview

How It Works

Why It Matters

Technical Characteristics

Developer / Manufacturer

Applications

Related Vehicles

Related Technologies

Timeline

Related News

Sources
```

Technology articles should explain rather than market.

---

# 34. Page Pattern — News Index

Suggested structure:

```text
Page Header

Category Filters

Search

News Feed

Optional Topic / Entity Filters

Pagination
```

Possible categories:

```text
New Vehicles
Manufacturers
Technology
Production
Market
Policy & Regulation
International
```

Avoid excessive category fragmentation.

---

# 35. Page Pattern — News Article

Suggested structure:

```text
Breadcrumb

Category

Headline

Summary / Deck

Publication Date
Updated Date

Article

Related Entities

Sources

Corrections / Updates

Related Coverage
```

News articles should visually distinguish:

```text
Published
Updated
Corrected
```

when relevant.

---

# 36. Search Results

Search should group or clearly label entity types.

Example:

```text
Search: "seal"

Vehicles

BYD Seal
Vehicle · BYD

BYD Seal 06
Vehicle · BYD


News

BYD Seal launches in...
News · September 2026


Technologies

...
```

Search should prioritize exact entity matches over news results when appropriate.

---

# 37. Responsive Design

The site must be fully usable on:

```text
Mobile
Tablet
Laptop
Desktop
Wide desktop
```

Recommended conceptual breakpoints:

```text
Mobile       < 640px
Tablet       640–1024px
Desktop      > 1024px
Wide         > 1440px
```

Implementation should follow Tailwind breakpoints where practical rather than creating unnecessary custom breakpoints.

---

# 38. Mobile Principles

Mobile should preserve information rather than simply remove it.

Priorities:

1. Entity identity
2. Key facts
3. Core specifications
4. Navigation
5. Sources

Avoid hiding important specifications behind desktop-only interactions.

## 38.1 Mobile Tables

Do not automatically transform every table into cards.

For narrow comparison tables consider:

- horizontal scrolling
- sticky first column
- compact typography
- column selection

For simple two-column specifications:

```text
Battery
93.7 kWh

Range
650 km · CLTC
```

may be appropriate.

---

# 39. Images

Images should have clearly defined roles.

Supported conceptual types:

```text
Hero / Representative
Gallery
Technical Diagram
Factory / Manufacturing
Historical
News
Logo
```

## 39.1 Vehicle Images

Prefer:

- clear exterior view
- identifiable vehicle
- neutral composition
- high enough resolution
- minimal embedded marketing text

Avoid using manufacturer promotional collages when a clean vehicle image is available.

## 39.2 Image Aspect Ratios

Use a limited number of ratios.

Suggested:

```text
Vehicle cards       16:9
News cards          16:9
Hero                 flexible / wide
Logos                contained
Gallery              source-dependent
```

Do not crop technical diagrams aggressively.

---

# 40. Accessibility

Target at least WCAG 2.2 AA where practical.

Requirements include:

- sufficient color contrast
- keyboard navigation
- visible focus states
- semantic HTML
- meaningful heading hierarchy
- descriptive link text
- image alt text
- labeled form controls
- reduced-motion support
- accessible tables

Information must never depend solely on:

- color
- hover
- animation

---

# 41. Interaction States

Interactive components should define:

```text
Default
Hover
Focus
Active
Selected
Disabled
Loading
Error
```

Focus states must remain clearly visible.

Do not remove browser focus indicators without providing an accessible replacement.

---

# 42. Motion

Motion should explain state changes rather than decorate the interface.

Appropriate examples:

- menu opening
- tab transition
- disclosure expansion
- image gallery movement
- loading transitions

Avoid:

- parallax
- continuously moving backgrounds
- animated statistics
- unnecessary scroll effects
- dramatic vehicle entrance animations

Prefer approximately:

```text
150–250ms
```

for normal UI transitions.

Respect:

```css
prefers-reduced-motion
```

---

# 43. Loading States

Use skeletons for predictable structured content.

Examples:

```text
Vehicle Card Skeleton
News Card Skeleton
Specification Skeleton
```

Avoid large generic spinners when page structure is already known.

---

# 44. Empty States

Empty states should explain the actual situation.

Prefer:

```text
No vehicles currently match these filters.
```

instead of:

```text
Nothing here!
```

Neutral factual language fits the overall product tone.

---

# 45. Error States

Errors should be:

- clear
- actionable when possible
- technically neutral

Example:

```text
Vehicle data could not be loaded.

Try again.
```

Avoid playful error language that conflicts with the reference-oriented identity.

---

# 46. Language and Internationalization

The UI architecture should support multilingual content even if languages are introduced incrementally.

Do not embed layout assumptions based on English text length.

Entity names should preserve official/native names when useful.

Example:

```text
Xiaomi Auto
小米汽车
```

Do not translate:

- model names
- trademarks
- technical standards

unless an established translation exists.

---

# 47. Icons

Use one consistent icon family.

Recommended:

```text
Lucide
```

Icons should support text rather than replace important labels.

Prefer:

```text
Search icon + accessible label
```

over ambiguous icon-only interactions.

Automotive-specific icons should only be introduced when they communicate recurring structured concepts.

---

# 48. Tailwind CSS Guidelines

Prefer semantic design tokens over hard-coded utility colors.

Prefer:

```text
bg-background
text-foreground
text-muted-foreground
border-border
bg-primary
```

Avoid widespread use of:

```text
bg-gray-50
text-gray-700
border-gray-200
bg-red-600
```

inside domain components.

This allows the visual system to evolve without rewriting every component.

---

# 49. shadcn/ui Guidelines

shadcn/ui should provide primitives, not dictate the identity of the site.

Suitable primitives include:

```text
Button
Input
Select
Tabs
Dialog
Sheet
Dropdown Menu
Tooltip
Table
Skeleton
Separator
Breadcrumb
```

Domain-specific components should be built on top of those primitives.

Example:

```text
shadcn Card
      ↓
VehicleCard
ManufacturerCard
TechnologyCard
NewsCard
```

Do not expose generic component-library aesthetics unnecessarily.

---

# 50. Component Architecture

Prefer composition.

Example:

```text
VehicleCard
├── EntityImage
├── EntityTitle
├── Metadata
├── PowertrainBadge
└── ReferencePrice
```

Shared patterns should become reusable components only after meaningful repetition exists.

Avoid creating abstractions solely because two components look superficially similar.

---

# 51. Desktop Information Density

Desktop layouts should take advantage of available width.

Do not stretch paragraphs across 1400px screens.

Instead use additional width for:

- key facts
- specifications
- related entities
- galleries
- timelines
- source context

This allows pages to be information-rich without becoming difficult to read.

---

# 52. Do / Don't

## Do

Use:

- strong information hierarchy
- neutral typography
- consistent spacing
- thin borders
- structured tables
- restrained accent color
- high-quality vehicle photography
- visible sources
- clear entity relationships
- meaningful metadata

## Don't

Avoid:

- excessive gradients
- neon colors
- glass effects
- large decorative shadows
- excessive pills
- oversized typography
- giant marketing banners
- unnecessary animations
- manufacturer slogans
- sales-oriented CTAs
- hiding specifications for visual minimalism
- turning every section into a card

---

# 53. Example Visual Hierarchy

A typical Vehicle page should visually prioritize information approximately as follows:

```text
Xiaomi SU7                         ← Identity

Xiaomi Auto · BEV · Sedan          ← Classification

[Vehicle Image]

93.7 kWh     650 km     495 kW     ← Key data
Battery      CLTC       Power

Overview                           ← Context

Specifications                     ← Detailed reference

Technology                         ← Explanation

Related News                       ← Current developments

Sources                            ← Evidence
```

This hierarchy represents the overall design philosophy of China Auto Atlas:

> Identity → Facts → Context → Detail → Relationships → Sources

---

# 54. Relationship With Other Project Documents

This document defines presentation.

It should not redefine content semantics.

Responsibilities:

```text
vision.md
    Why China Auto Atlas exists

editorial-guidelines.md
    How information is researched, written, sourced, and corrected

content-model.md
    What entities exist and how they relate

data-schema.md
    How structured information is represented

ui-design.md
    How that information is presented and interacted with
```

When conflicts occur:

```text
Editorial truth
    ↓
Content semantics
    ↓
Data representation
    ↓
UI presentation
```

The UI should adapt to the data rather than forcing the data model to match a visual design.

---

# 55. Design Evolution

This document defines the initial design system.

It should evolve based on:

- real content
- actual vehicle data
- real manufacturer structures
- mobile usage
- accessibility testing
- search behavior
- user feedback

Avoid prematurely building a large design system for hypothetical requirements.

New patterns should generally emerge from real content needs.

---

# 56. Final Design Rule

When deciding between two UI approaches, prefer the one that makes the underlying automotive information easier to understand.

China Auto Atlas should not attempt to impress users through interface complexity.

Its visual identity should emerge from:

- excellent information structure
- reliable data
- clear relationships
- strong typography
- good photography
- consistent presentation
- transparent sourcing

The interface should become quieter as the information becomes richer.

# 57. Data Access Boundary

UI components should consume domain data returned by application services or repositories.
They should not read JSON files directly, depend on storage paths, or contain storage-specific logic.

The UI should be able to render the same domain objects whether they come from the MVP JSON adapter or a future database adapter.

This is especially important for:

* missing and uncertain values;
* historical price and availability records;
* related entities;
* source and correction information;
* localized names.
