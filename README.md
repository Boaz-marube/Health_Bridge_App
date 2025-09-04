# Health Bridge App

A fullstack healthcare application built with Next.js (frontend) and NestJS (backend).

## Project Structure

```
health-bridge-app/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # NestJS API server
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utilities
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development servers:**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend
   npm run dev:backend
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode (parallel)
- `npm run dev:frontend` - Start only Next.js frontend
- `npm run dev:backend` - Start only NestJS backend
- `npm run build` - Build both applications (with caching)
- `npm run test` - Run tests for both applications
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all TypeScript code

## Applications

- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:3001 (NestJS API)

## Shared Packages

- **types**: Shared TypeScript interfaces and types
- **utils**: Common utilities used across frontend and backend

## Contributing

1. Create feature branch from `main`
2. Make changes in appropriate app/package
3. Test changes locally
4. Submit pull request

## Environment Variables

Copy `.env.example` files in each app and configure:
- `apps/frontend/.env.local`
- `apps/backend/.env`