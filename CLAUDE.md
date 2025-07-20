# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wristband Multi-Tenant Demo Application showcasing enterprise authentication with FastAPI (Python) backend and Next.js (React) frontend. The application demonstrates the Backend for Frontend (BFF) pattern with session-based authentication.

## Essential Commands

### Development
```bash
# Initial setup (install all dependencies)
npm run setup

# Start both frontend and backend
npm start

# Run backend only (port 6001)
npm run backend

# Run frontend only (port 3001)
npm run frontend

# Generate secret key for sessions
npm run generate-secret
```

### Testing
```bash
# Run all tests (from backend directory)
cd backend && pytest

# Run tests with coverage
cd backend && pytest --cov=src

# Run specific test types
cd backend && pytest -m unit
cd backend && pytest -m integration
```

### Build & Clean
```bash
# Clean all artifacts
npm run clean

# Build frontend
cd frontend && npm run build
```

## Architecture

### Backend Structure
The FastAPI backend (`backend/`) follows this organization:
- `src/auth/` - Wristband authentication configuration and session management
- `src/routes/` - API endpoints organized by resource (auth, user, users, etc.)
- `src/middleware/` - Authentication and session validation middleware
- `src/database/` - Firestore integration with multi-environment support
- `src/models/` - Pydantic models for request/response validation
- `src/utils/` - CSRF protection and other utilities
- `run.py` - Application entry point

### Frontend Structure
The Next.js frontend (`frontend/`) includes:
- `src/client/` - Axios-based API client with CSRF token handling
- `src/components/` - React components (AuthGuard, modals, etc.)
- `src/pages/` - Next.js pages with authentication routing
- Uses `/api/*` rewrites to proxy backend requests

### Key Patterns

1. **Authentication Flow**: All auth flows go through FastAPI endpoints (`/api/auth/*`). The frontend never directly communicates with Wristband.

2. **Session Management**: Uses encrypted cookies with automatic token refresh. Session validation happens in middleware.

3. **CSRF Protection**: Synchronizer token pattern - tokens sent in headers for state-changing requests.

4. **Multi-Tenancy**: Environment-based database selection (dev-db, staging-db, prod-db) configured via ENVIRONMENT variable.

5. **API Routes**: All routes require authentication except `/api/auth/*` endpoints. User context available via `request.state.token_data`.

### Environment Configuration

Backend requires `.env` file with:
```
APPLICATION_VANITY_DOMAIN=your-domain.wristband.dev
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
ENVIRONMENT=DEV|STAGING|PROD
```

### Testing Approach

- Unit tests mock external dependencies (Firestore, Wristband SDK)
- Integration tests use test fixtures from `conftest.py`
- Mark tests with `@pytest.mark.unit` or `@pytest.mark.integration`
- Use `TestClient` from FastAPI for API testing

### Important Files

- `backend/src/auth/wristband_service.py` - Core authentication service
- `backend/src/middleware/auth_middleware.py` - Request authentication
- `backend/src/utils/csrf.py` - CSRF token management
- `frontend/src/client/apiClient.ts` - API client with auth handling
- `frontend/src/components/AuthGuard.tsx` - Route protection

### Development Notes

- Backend runs on port 6001, frontend on 3001
- API calls from frontend are proxied through Next.js rewrites
- Look for `CSRF_TOUCHPOINT` and `WRISTBAND_TOUCHPOINT` comments for integration points
- Service account keys stored in `backend/service_accounts/` (not committed)
- Firestore rules support multi-tenant isolation