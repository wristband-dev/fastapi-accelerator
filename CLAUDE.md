# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wristband Multi-Tenant App Accelerator combining:
- **Backend**: FastAPI (Python) with Wristband authentication integration
- **Frontend**: Next.js (React) with TypeScript
- **Database**: Firebase Firestore (optional)
- **Infrastructure**: GCP Cloud Run and Terraform (optional)

## Development Commands

### Initial Setup
```bash
npm run setup          # Install all dependencies (frontend & backend)
npm run generate-secret # Generate a new session secret key
```

### Running the Application
```bash
npm start              # Start both backend (port 6001) and frontend (port 3001)
npm run backend        # Start backend server only
npm run frontend       # Start frontend dev server only
```

### Backend Commands
```bash
cd backend
.venv/bin/python run.py                    # Run backend directly
.venv/bin/pytest                           # Run all tests
.venv/bin/pytest tests/unit -v             # Run unit tests
.venv/bin/pytest tests/integration -v      # Run integration tests
.venv/bin/pytest -m unit                   # Run tests marked as unit
.venv/bin/pytest --cov=src                 # Run tests with coverage
```

### Frontend Commands
```bash
cd frontend
npm run dev            # Start development server
npm run build          # Build for production
npm run lint           # Run ESLint
npm run start          # Start production server
```

### Clean Commands
```bash
npm run clean          # Clean all dependencies and build artifacts
npm run backend:clean  # Clean backend virtualenv and cache
npm run frontend:clean # Clean frontend node_modules and build
```

## Architecture Overview

### Backend Structure (FastAPI)
- **Entry Point**: `backend/run.py` - FastAPI application setup with middleware configuration
- **Authentication**: `backend/src/auth/wristband.py` - Wristband authentication configuration
- **Middleware Stack** (executed in reverse order):
  1. `AuthMiddleware` - Validates sessions and refreshes tokens
  2. `EncryptedSessionMiddleware` - Manages encrypted session cookies
  3. `CORSMiddleware` - Handles cross-origin requests
- **Routes**: Modular route structure in `backend/src/routes/`
  - Auth, User, Tenant, Role, IdP, Secret management endpoints
- **Database**: Firebase Firestore integration in `backend/src/database/firestore_database.py`
  - Multi-environment support (dev-db, staging-db, prod-db)
  - Auto-detection based on ENVIRONMENT variable

### Frontend Structure (Next.js)
- **Entry Point**: `frontend/src/pages/_app.tsx` - App initialization with providers
- **Authentication Context**: `frontend/src/contexts/UserContext.tsx` - User, tenant, and role management
- **API Client**: `frontend/src/client/frontend-api-client.ts` - Backend API communication
- **Components**: 
  - Layout components in `frontend/src/components/layouts/`
  - Wristband-specific components in `frontend/src/components/sidebar/wristband/`
- **Theme Support**: Dark/light mode via `ThemeContext`

### Authentication Flow
1. User accesses protected route → AuthMiddleware checks session
2. CSRF token validation on all non-auth API requests
3. Automatic token refresh when access token expires
4. Session data stored in encrypted cookies

### Key Environment Variables
Backend (`.env`):
- `APPLICATION_VANITY_DOMAIN` - Wristband application domain
- `CLIENT_ID` - Wristband OAuth client ID
- `CLIENT_SECRET` - Wristband OAuth client secret
- `ENVIRONMENT` - Deployment environment (DEV/STAGING/PROD)

## Testing Strategy

### Backend Testing
- **Framework**: pytest with async support
- **Test Markers**: unit, integration, slow
- **Coverage**: Run with `--cov=src` flag
- **Configuration**: `backend/pyproject.toml` contains pytest settings

### Frontend Testing
- **Type Checking**: TypeScript strict mode enabled
- **Linting**: ESLint with Next.js configuration

## Important Implementation Notes

1. **CSRF Protection**: All API requests require X-CSRF-TOKEN header matching session token
2. **Token Refresh**: Automatic refresh handled by AuthMiddleware before expiry
3. **Multi-Tenancy**: Full tenant isolation with role-based access control
4. **Session Management**: 30-minute session timeout with sliding window
5. **Database Environments**: Separate Firestore databases per environment
6. **Service Accounts**: Firebase and Cloud Run keys in `backend/service_accounts/`

## Infrastructure Deployment

### Terraform Configuration
1. Update `infrastructure/config.tfvars` with project details
2. Run deployment:
   ```bash
   cd infrastructure
   ./terraform.sh init
   ./terraform.sh plan
   ./terraform.sh apply -auto-approve
   ```
3. Export service accounts:
   ```bash
   ./export_firebase_key.sh
   ./export_cloud_run_key.sh
   ```

## API Route Structure
- `/api/auth/*` - Authentication endpoints (login, callback, logout)
- `/api/session/*` - Session management
- `/api/user/*` - Current user operations
- `/api/users/*` - User management (admin)
- `/api/tenant/*` - Tenant operations
- `/api/roles/*` - Role management
- `/api/secrets/*` - Secret management
- `/api/idp/*` - Identity provider settings