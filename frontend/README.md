# TickX Frontend

React 19 + TypeScript frontend for the TickX ticket marketplace application.

## Prerequisites

- Node.js 20.x or later
- npm or yarn

## Local Development

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
# Start development server
npm run dev

# Or from root directory
make dev-frontend
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing and Linting

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Backend API URL
VITE_API_URL=http://localhost:8080

# For production deployment
VITE_API_URL=http://your-alb-dns-name
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm test` | Run tests |

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/        # Generic components (Button, Card, etc.)
│   ├── events/        # Event-specific components
│   ├── layout/        # Layout components (Header, Footer)
│   ├── listings/      # Listing components
│   └── venue/         # Venue components
├── pages/             # Page components
├── services/          # API client and services
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── styles/            # Global styles and theme
└── utils/             # Utility functions
```

## Deployment to AWS

The frontend can be deployed to AWS S3 + CloudFront or served from a CDN. The backend API URL is provided by the CDK deployment.

### Configure API URL

After deploying the backend infrastructure, get the API URL from CDK outputs:

```bash
# Deploy backend first
make deploy

# Note the ApiUrl output, then configure frontend
export VITE_API_URL=http://your-alb-dns-name
```

### Option 1: S3 + CloudFront

```bash
# Build the app
npm run build

# Deploy to S3 (configure AWS CLI first)
aws s3 sync dist/ s3://your-bucket-name --delete
```

### Option 2: Serve from CDN

```bash
# Build the app
npm run build

# Upload dist/ folder to your preferred CDN
```

## Configuration

### API Integration

The frontend communicates with the backend API. The API URL is automatically provided by CDK deployment:

```bash
# Local development
VITE_API_URL=http://localhost:8080

# Production (from CDK output)
VITE_API_URL=http://your-alb-dns-name
```

The API service in `src/services/api.ts` handles all backend communication and includes:
- Event search and filtering
- Venue information
- Type transformations between API and frontend models
- Error handling and response parsing

### Styling

The app uses CSS modules for component styling and a centralized theme system in `src/styles/theme.ts`.

## Troubleshooting

### "API calls failing"
1. Check `VITE_API_URL` is set correctly
2. Verify backend is running and accessible
3. Check browser console for CORS errors

### "Build fails"
1. Ensure Node.js 20+ is installed
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run type-check`