# Bookshop — Inventory Dashboard

A modern, market-ready Next.js frontend for managing bookshop inventory.

## Features

- **Dashboard** with stat cards (total titles, inventory count, value, authors, low stock alerts, average price)
- **Book inventory table** with title, author, price, quantity, and stock status
- **Sidebar navigation** with Dashboard, Books, Orders, Customers, Analytics, and Settings
- **Warm, professional design** with a bookshop-themed color palette

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Dashboard (home)
│   ├── books/            # Books listing page
│   └── ...               # Other sidebar routes
├── components/           # Reusable UI components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── StatCard.tsx      # Individual stat card
│   ├── StatsGrid.tsx     # Dashboard stats grid
│   └── BooksTable.tsx    # Book records table
├── lib/                  # Data fetching & utilities
│   ├── books.ts          # Book data (mock — connect to your DB)
│   └── utils.ts          # Stats calculations & formatters
└── types/
    └── book.ts           # Book & BookStats types
```

## Connecting to Your Database

The app currently uses mock data in `src/lib/books.ts`. To connect your database with `title`, `author`, `price`, and `quantity` columns, update the `getBooks()` function:

```typescript
export async function getBooks(): Promise<Book[]> {
  const response = await fetch("YOUR_API_ENDPOINT/books");
  return response.json();
}
```

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)
