# DentalCare - Clinic Management System

A comprehensive dental clinic management application built with React, TypeScript, and Tailwind CSS. Features role-based authentication, patient management, interactive dental charts, and billing systems.

## Features

### Authentication & Authorization
- Role-based access control (DENTIST/STAFF vs PATIENT)
- Secure login/logout with JWT tokens
- Patient self-registration
- Protected routes with automatic redirection

### Dentist/Staff Panel
- Dashboard with appointment overview and patient statistics
- Patient management with comprehensive profiles
- Interactive dental chart with 32-tooth diagram
- Treatment planning and procedure tracking
- Billing and invoice generation
- Clinical notes and visit history

### Patient Portal
- Personal dashboard with upcoming appointments
- Appointment booking and management
- Health records and dental chart view
- Treatment plan overview
- Billing and payment history
- Profile management with privacy controls

### Technical Features
- TypeScript for type safety
- TanStack Query for data fetching, caching, and retries
- Responsive design (mobile-first approach)
- Accessibility features (focus states, ARIA labels)
- Loading states, error handling, and empty states
- Interactive dental chart with modal editing
- Clean medical aesthetics with blue/green color scheme

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: RESTful API following OpenAPI 3.0 specification

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running on http://localhost:8080

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update the API base URL in `.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Linting and Type Checking

```bash
npm run lint
npm run typecheck
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── layout/         # Layout components for different user roles
│   └── dental/         # Dental-specific components (ToothChart)
├── pages/              # Page components
│   ├── dentist/        # Dentist/staff pages
│   └── patient/        # Patient portal pages
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── context/            # React context providers
```

## API Integration

The application integrates with a REST API following the OpenAPI 3.0 specification:

- **Base URL**: `http://localhost:8080`
- **Authentication**: JWT Bearer tokens
- **Date Format**: ISO-8601 (2025-10-29T17:05:00Z)
- **Content Type**: `application/json; charset=utf-8`

### Key Endpoints

- **Authentication**: `/auth/login`, `/auth/register/patient`
- **Patient Management**: `/api/patients/*`
- **Treatment Planning**: `/api/patients/{id}/plans`
- **Billing**: `/api/patients/{id}/invoices`
- **Patient Portal**: `/api/my/*`

## Features in Detail

### Interactive Dental Chart

The dental chart component displays all 32 adult teeth with:
- Color-coded status indicators (healthy, caries, fillings, crowns, etc.)
- Click-to-edit functionality for dentists
- Comprehensive legend
- Support for notes and surface-level details

### Role-Based Access

- **DENTIST/STAFF**: Access to all patient data, treatment planning, and administrative features
- **PATIENT**: Access only to their own data through a dedicated patient portal

### Responsive Design

- Mobile-first approach with breakpoints at 768px and 1024px
- Collapsible navigation for mobile devices
- Touch-friendly interface elements
- Optimized layouts for different screen sizes

### Data Management

- Automatic query invalidation after mutations
- Optimistic updates for better user experience
- Error retry mechanisms with exponential backoff
- Comprehensive loading and error states

## Browser Support

- Modern browsers with ES2020 support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the existing code style and TypeScript patterns
2. Add proper error handling and loading states
3. Ensure responsive design across all screen sizes
4. Test with both dentist and patient user roles
5. Update documentation for new features

## License

This project is licensed under the MIT License.