# TimeBite 🍔⏰

**Food delivery focused on time accuracy and transparency**

## Project Status
🚧 **In Development** - MVP Phase

## Vision
TimeBite is a food delivery platform for Amman, Jordan that solves the problem of unreliable delivery time estimates by:
- Showing **On-Time Accuracy %** for each restaurant
- Providing **realistic ETA** based on actual data
- Sending **early notifications** about any delays

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Maps**: Google Maps API
- **Payments**: Stripe (planned)

## Project Structure
```
TimeBite/
├── app/                    # Next.js 15 app router
│   ├── (auth)/            # Authentication pages
│   ├── (customer)/        # Customer-facing pages
│   ├── (restaurant)/      # Restaurant dashboard
│   ├── (driver)/          # Driver interface
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities & helpers
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

## Core Features (Planned)

### Customer Interface
- Browse restaurants with On-Time Accuracy scores
- Real-time ETA calculation
- Order tracking
- Delivery notifications

### Restaurant Dashboard
- Order management
- Performance analytics
- On-Time Accuracy monitoring

### Driver Interface
- Order acceptance
- Route optimization
- Delivery completion

### Admin Features
- System-wide analytics
- Restaurant management
- Driver management

## Unique Value Proposition

**On-Time Accuracy Score**
```
Restaurant X: 94% On-Time
(Based on last 30 days of deliveries)
```

This transparency:
- Builds trust with customers
- Incentivizes restaurants to improve
- Differentiates from competitors

## Development Roadmap

**Phase 1: Foundation** (Week 1-2)
- ✅ Project setup
- ⏳ Supabase integration
- ⏳ Authentication system
- ⏳ Database schema

**Phase 2: Core Features** (Week 3-4)
- Restaurant listing
- Menu system
- Order creation
- Basic ETA calculation

**Phase 3: Dashboards** (Week 5-6)
- Restaurant dashboard
- Driver interface
- On-Time Accuracy calculation

**Phase 4: Polish & Launch** (Week 7-8)
- Google Maps integration
- Payment processing
- Testing & bug fixes
- Beta launch

## Market Validation
Before full development, conducting:
- 30 customer interviews
- 10 restaurant interviews
- 10 driver interviews

Target launch: **Jebeiha/Sweifieh area, Amman**

## License
MIT

## Contact
https://abdoocoder.github.io/
---
Built with ❤️ for 🇯🇴 Amman
