# Shared Types Package

This package contains TypeScript interfaces and types shared between the frontend and backend applications.

## 📁 Structure

```
types/
├── src/
│   ├── api/           # API request/response types
│   ├── entities/      # Database entity types
│   ├── auth/          # Authentication types
│   ├── common/        # Common utility types
│   └── index.ts       # Main exports
├── package.json
└── tsconfig.json
```

## 🎯 What Goes Where

### `/src/api/` - API Types
- Request/response interfaces for all API endpoints
- Error response types
- Pagination types

### `/src/entities/` - Entity Types
- User, Patient, Appointment interfaces
- Database model types
- Relationship types

### `/src/auth/` - Authentication Types
- Login/register request types
- JWT payload interfaces
- User role enums

### `/src/common/` - Utility Types
- Generic response wrappers
- Status enums
- Common validation types

## 📋 Usage

```typescript
// In frontend
import { Patient, CreatePatientDto } from '@health-bridge/types';

// In backend
import { User, LoginDto } from '@health-bridge/types';
```

## 🔧 Adding New Types

1. Create interface in appropriate subfolder
2. Export from subfolder's `index.ts`
3. Re-export from main `src/index.ts`
4. Both apps will have access to the new types