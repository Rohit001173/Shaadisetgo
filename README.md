# 💒 ShaadiSetGo

**Bihar & UP's #1 Wedding Marketplace** - Connect with trusted wedding vendors for your dream wedding!

![ShaadiSetGo](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## ✨ Features

- 🔍 **Smart Search** - Search vendors, services, categories, and locations
- 📍 **Location Filter** - Filter by Bihar & UP districts (Patna, Gaya, Muzaffarpur, etc.)
- 💐 **13 Categories** - Photography, DJ, Catering, Decoration, Pandit, Mehndi & more
- ⭐ **Reviews & Ratings** - Verified vendor ratings and reviews
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- 💬 **WhatsApp Integration** - Direct vendor contact via WhatsApp
- 📋 **Booking System** - Easy booking with automatic WhatsApp notifications
- 🔐 **Admin Dashboard** - Manage vendors, bookings, and settings

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ or Bun
- Supabase account (for database)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/shaadisetgo.git
cd shaadisetgo

# Install dependencies
npm install
# or
bun install

# Create .env.local file
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_admin_password
```

## 📂 Project Structure

```
shaadisetgo/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   └── page.tsx      # Main application
│   ├── components/
│   │   ├── shaadi/       # ShaadiSetGo components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utilities and configurations
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript types
├── public/               # Static assets
├── prisma/               # Database schema (optional)
└── supabase/             # Supabase schema
```

## 🎨 Categories

| Category | Services |
|----------|----------|
| 📸 Photography | Wedding, Candid, Pre-wedding, Drone |
| 🎵 DJ & Music | DJ Sound, Baraat DJ, Live Band |
| 🍽️ Catering | Veg, Non-veg, Live Counter |
| 🎨 Decoration | Mandap, Stage, Flower, Lighting |
| 🪔 Pandit Ji | Wedding, Havan, Puja |
| 💄 Makeup | Bridal, Party, Hair Styling |
| 🌿 Mehndi | Bridal, Arabic, Traditional |
| 🎪 Tent House | Tent, Stage, Furniture |
| 🚗 Transport | Wedding Cars, Horse, Baggi |
| 🏛️ Venue | Banquet Hall, Farmhouse |
| 👥 Guest Management | Waiters, Security, Staff |
| 🎭 Entertainment | Orchestra, Dance, Anchor |
| 🎁 Essentials | Cards, Gifts, Garlands |

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

## 📱 Screenshots

| Home Page | Vendor Detail | Booking Form |
|-----------|---------------|--------------|
| Mobile-first design | Full vendor info | WhatsApp integration |

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State**: Zustand
- **Icons**: Lucide React

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for Bihar & UP weddings 💒
