# Grocery Store Management System - Client

Frontend application for the Grocery Store Management System built with Next.js, React, TypeScript, Tailwind CSS, and Shadcn UI.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful component library
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update the `.env` file with your API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

Build for production:

```bash
npm run build
npm run start
```

## Project Structure

```
client/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   ├── components/        # React components
│   │   └── ui/           # Shadcn UI components
│   ├── lib/              # Utility functions
│   │   └── utils.ts      # cn() helper
│   ├── services/         # API services
│   │   └── api-client.ts # Axios client
│   └── types/            # TypeScript types
│       └── index.ts      # Shared types
├── public/               # Static assets
├── components.json       # Shadcn UI config
├── tailwind.config.ts    # Tailwind config
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

## Features

- 🛍️ Product Management
- 🧾 Invoice/Receipt Management
- 📦 Good Receipt Management
- 🏷️ Promotion Management
- 📊 Stocktaking
- 👥 Account Management
- 🔐 Authentication & Authorization

## Adding Shadcn UI Components

To add new Shadcn UI components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
# etc...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Integration

The API client is configured in `src/services/api-client.ts` and automatically:

- Adds authentication tokens to requests
- Handles 401 unauthorized responses
- Redirects to login on auth failures

## License

Private - For educational purposes only
