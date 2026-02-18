# TimeBite 🍔⏰

**Food delivery focused on time accuracy and transparency**

## Project Status
✅ **MVP Complete** - All core features implemented

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
- **Font**: Tajawal (Arabic)
- **Maps**: Google Maps API (planned)
- **Payments**: Stripe (planned)

## Project Structure
```
TimeBite/
├── app/                    # Next.js 15 app router
│   ├── (auth)/            # Authentication (login, signup)
│   ├── (customer)/        # Customer pages (restaurants, orders)
│   ├── (restaurant)/      # Restaurant dashboard  
│   ├── (driver)/          # Driver interface
│   └── api/               # API routes (restaurants, orders)
├── components/            # Reusable UI components
│   ├── layout/            # Navbar
│   └── ui/                # Button, Input, Card, Badge, Modal, Spinner, Textarea
├── lib/                   # Utilities & helpers
│   ├── auth-context.tsx   # Auth context provider
│   ├── supabase.ts        # Supabase client
│   └── eta-calculator.ts  # ETA calculation logic
├── types/                 # TypeScript types
├── supabase/              # Database schema & migrations
└── public/                # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

### Database Setup
Run the SQL files in your Supabase SQL Editor in this order:
1. `supabase/schema.sql` - Main schema with tables, RLS policies, and triggers
2. `supabase/fix-signup.sql` - Signup trigger fixes (if needed)

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

## Core Features

### ✅ Authentication
- Email/password signup & login
- Role-based accounts (customer, restaurant, driver)
- Automatic profile creation on signup

### ✅ Customer Interface
- Browse restaurants with On-Time Accuracy scores
- Search restaurants by name
- View restaurant menus with prices
- Add items to cart with quantity controls
- Place orders with delivery address
- Order tracking with status timeline
- Order history

### ✅ Restaurant Dashboard
- Dashboard with stats (active orders, daily count, accuracy %, revenue)
- Order management with status updates (pending → preparing → on_way)
- Menu management (add, edit, delete, toggle availability)
- Sidebar navigation with mobile support

### ✅ Driver Interface
- View available deliveries
- Accept delivery orders
- Delivery detail with address and order info
- Mark orders as delivered
- Delivery history

### ✅ API Routes
- `GET /api/restaurants` - List active restaurants (with search)
- `GET /api/restaurants/:id` - Restaurant details with menu
- `GET /api/restaurants/:id/menu` - Restaurant menu items
- `GET /api/orders` - Orders filtered by role
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Order details with status history
- `PATCH /api/orders/:id` - Update order status

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

**Phase 1: Foundation** ✅
- ✅ Project setup
- ✅ Supabase integration
- ✅ Authentication system
- ✅ Database schema

**Phase 2: Core Features** ✅
- ✅ Restaurant listing
- ✅ Menu system
- ✅ Order creation
- ✅ Basic ETA calculation

**Phase 3: Dashboards** ✅
- ✅ Restaurant dashboard
- ✅ Driver interface
- ✅ On-Time Accuracy calculation

**Phase 4: Polish & Launch** ⏳
- ⏳ Google Maps integration
- ⏳ Payment processing (Stripe)
- ⏳ Push notifications
- ⏳ Beta launch

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
