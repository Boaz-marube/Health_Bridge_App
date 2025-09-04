# Shared Utils Package

This package contains utility functions and constants shared between the frontend and backend applications.

## 📁 Structure

```
utils/
├── src/
│   ├── validation/    # Validation schemas and helpers
│   ├── formatting/    # Date, currency, text formatting
│   ├── constants/     # App-wide constants
│   ├── helpers/       # General utility functions
│   └── index.ts       # Main exports
├── package.json
└── tsconfig.json
```

## 🎯 What Goes Where

### `/src/validation/` - Validation Utils
- Zod schemas for form validation
- Custom validation functions
- Regex patterns for common validations

### `/src/formatting/` - Formatting Utils
- Date formatting functions
- Currency formatting
- Phone number formatting
- Name formatting helpers

### `/src/constants/` - App Constants
- API endpoints
- Status codes
- Error messages
- Configuration values

### `/src/helpers/` - General Utilities
- Array manipulation functions
- Object utilities
- String helpers
- Math utilities

## 📋 Usage

```typescript
// In frontend or backend
import { formatDate, validateEmail, API_ENDPOINTS } from '@health-bridge/utils';

const formattedDate = formatDate(new Date());
const isValid = validateEmail('user@example.com');
const endpoint = API_ENDPOINTS.PATIENTS;
```

## 🔧 Adding New Utils

1. Create function in appropriate subfolder
2. Export from subfolder's `index.ts`
3. Re-export from main `src/index.ts`
4. Both apps can use the utility