# Health Bridge Frontend (Next.js)

The frontend application for Health Bridge - a modern React-based web application built with Next.js.

## 🚀 Getting Started

### Development Server
```bash
npm run dev
# or from root: npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── app/              # App Router (Next.js 13+)
│   │   ├── (auth)/       # Route groups for auth pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── patients/     # Patient management
│   │   ├── appointments/ # Appointment scheduling
│   │   ├── globals.css   # Global styles
│   │   └── layout.tsx    # Root layout
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (buttons, inputs)
│   │   ├── forms/       # Form components
│   │   ├── charts/      # Data visualization
│   │   └── layout/      # Layout components (header, sidebar)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and configurations
│   │   ├── api.ts       # API client setup
│   │   ├── auth.ts      # Authentication logic
│   │   ├── utils.ts     # General utilities
│   │   └── validations.ts # Form validation schemas
│   ├── store/           # State management (Zustand/Redux)
│   └── types/           # Frontend-specific types
├── public/              # Static assets
│   ├── images/
│   └── icons/
├── .env.local.example   # Environment variables template
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json
```

## 🎯 What Goes Where

### /src/app/ - Pages & Routing
- **Route Groups**: Use (auth) for login/register pages
- **Dynamic Routes**: [id] for patient details, appointment details
- **API Routes**: api/ folder for Next.js API endpoints (if needed)

### /src/components/ - UI Components
- **ui/**: Base components (Button, Input, Modal, Card)
- **forms/**: PatientForm, AppointmentForm, LoginForm
- **charts/**: HealthMetricsChart, AppointmentChart
- **layout/**: Header, Sidebar, Navigation

### /src/hooks/ - Custom Hooks
- useAuth() - Authentication state
- usePatients() - Patient data management
- useAppointments() - Appointment scheduling
- useHealthMetrics() - Health data tracking

### /src/lib/ - Utilities & Config
- **api.ts**: Axios/fetch configuration for backend calls
- **auth.ts**: Authentication helpers (login, logout, token management)
- **utils.ts**: Date formatting, validation helpers
- **validations.ts**: Zod schemas for form validation

### /src/store/ - State Management
- authStore.ts - User authentication state
- patientStore.ts - Patient data state
- appointmentStore.ts - Appointment state

## 🔧 Key Technologies

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or Redux Toolkit
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios or native fetch
- **Charts**: Chart.js or Recharts
- **Authentication**: NextAuth.js or custom JWT

## 📋 Common Tasks

### Adding a New Page
1. Create file in src/app/[route]/page.tsx
2. Export default React component
3. Add navigation link in layout components

### Creating a Component
1. Add to appropriate subfolder in src/components/
2. Export from index.ts for clean imports
3. Include TypeScript props interface

### API Integration
1. Define API functions in src/lib/api.ts
2. Create custom hooks in src/hooks/
3. Use shared types from packages/types

### Adding Forms
1. Create form component in src/components/forms/
2. Define validation schema in src/lib/validations.ts
3. Use React Hook Form for form handling

## 🌐 Environment Variables

Create .env.local file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Health Bridge
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Deployment

```bash
npm run build
npm start
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)