# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wristband Multi-Tenant Demo Application showcasing enterprise authentication with FastAPI (Python) backend and Next.js (React) frontend. The application demonstrates the Backend for Frontend (BFF) pattern with session-based authentication, CSRF protection, and true multi-tenant data isolation.

## Essential Commands

### Development
```bash
# Initial setup (install all dependencies)
npm run setup

# Start both frontend and backend concurrently
npm start

# Run backend only (port 6001)
npm run backend

# Run frontend only (port 3001)
npm run frontend

# Generate secret key for sessions
npm run generate-secret

# Clean all build artifacts
npm run clean
```

### Testing
```bash
# Run all tests with coverage
cd backend && pytest --cov=src

# Run specific test types
cd backend && pytest -m unit
cd backend && pytest -m integration

# Run specific test file
cd backend && pytest tests/clients/test_wristband_client.py -v
```

### Infrastructure Deployment (GCP/Firebase)
```bash
# Initialize and deploy infrastructure
cd infrastructure
./terraform.sh init
./terraform.sh plan
./terraform.sh apply -auto-approve

# Export service account keys
./export_firebase_key.sh
./export_cloud_run_key.sh
```

### Utility Scripts
```bash
# From backend directory
cd backend

# Get user information
python scripts/run_get_user_info.py --user-id "USER_ID" --access-token "TOKEN" --pretty

# Query tenant users with pagination
python scripts/run_query_tenant_users.py --tenant-id "TENANT_ID" --access-token "TOKEN"

# Update user nickname
python scripts/run_update_user_nickname.py --user-id "USER_ID" --nickname "NewNickname" --access-token "TOKEN"
```

## Architecture Overview

### Backend (FastAPI) - Port 6001

**Core Structure:**
- `run.py` - Application entry point with factory pattern
- `src/auth/wristband.py` - Wristband SDK configuration
- `src/middleware/` - Auth, session, and CSRF middleware pipeline
- `src/routes/` - RESTful API endpoints organized by resource
- `src/database/` - Multi-tenant Firestore integration
- `src/models/` - Pydantic models for validation

**Middleware Pipeline (execution order):**
1. CORS Middleware (allows frontend requests)
2. Session Middleware (encrypted cookie management)
3. Auth Middleware (validates sessions, refreshes tokens)

**Key Patterns:**
- All authentication flows proxied through backend
- Automatic token refresh before expiration
- CSRF protection via synchronizer token pattern
- Multi-environment database isolation (dev-db, staging-db, prod-db)

### Frontend (Next.js) - Port 3001

**Core Structure:**
- `pages/_app.tsx` - WristbandAuthProvider setup
- `pages/index.tsx` - Auth-based conditional rendering
- `components/` - Hero (unauthenticated), Home (authenticated), Explorer sidebar
- `client/frontend-api-client.ts` - Axios client with CSRF handling
- `utils/theme.ts` - Advanced theming system with CSS variables

**Key Patterns:**
- All API calls proxied through Next.js to backend
- No direct communication with Wristband
- Automatic redirect on 401/403 responses
- Theme system with Tailwind integration

### Database Architecture

**Multi-Tenant Firestore Setup:**
- Environment-based database selection via `ENVIRONMENT` variable
- Complete data isolation between environments
- Service account credentials from env vars or files
- Rich query support with filtering and pagination

### Authentication Flow

1. **Login**: Frontend → Backend `/api/auth/login` → Wristband OAuth
2. **Callback**: Wristband → Backend `/api/auth/callback` → Set session cookie → Redirect to frontend
3. **API Calls**: Frontend → Backend (with session cookie + CSRF token) → Validate & refresh → Process request
4. **Logout**: Frontend → Backend `/api/auth/logout` → Clear session → Wristband logout

## Environment Configuration

### Backend (.env)
```bash
# Required
APPLICATION_VANITY_DOMAIN=your-domain.wristband.dev
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret

# Optional
ENVIRONMENT=DEV|STAGING|PROD  # Default: DEV
SECRET_KEY=your-32-char-key   # For session encryption
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}  # Or use file
```

### Infrastructure (config.tfvars)
```hcl
project_id         = "your-gcp-project-id"
app_name           = "your-app-name"
billing_account_id = "your-billing-account-id"
region             = "us-central1"
firestore_location = "us-central"
```

## Testing Approach

**Test Organization:**
- Mark tests with `@pytest.mark.unit` or `@pytest.mark.integration`
- Mock all external dependencies (Firestore, Wristband SDK)
- Use fixtures from `conftest.py`
- Async tests with `@pytest.mark.asyncio`

**Key Testing Patterns:**
```python
# Mock environment variables
with patch.dict(os.environ, {"ENVIRONMENT": "DEV"}):
    # Test code

# Mock async HTTP calls
mock_client.post = AsyncMock(return_value=mock_response)

# Use TestClient for API testing
from fastapi.testclient import TestClient
client = TestClient(app)
response = client.get("/api/session")
```

## Important Implementation Details

### CSRF Protection
- Look for `CSRF_TOUCHPOINT` comments in codebase
- Token stored in non-httpOnly cookie for JavaScript access
- Validated on every authenticated request
- 30-minute expiration matching session timeout

### Wristband Integration Points
- Look for `WRISTBAND_TOUCHPOINT` comments
- Backend handles all Wristband communication
- Frontend uses `@wristband/react-client-auth` hooks
- Session data includes user context and tenant info

### Theme System
- Customizable via `userTheme` object in `theme.ts`
- Automatic shade generation for primary/secondary colors
- CSS variables injected at runtime
- Tailwind classes: `bg-primary`, `btn-primary`, `alert-success`

### Security Considerations
- Never store secrets in frontend code
- Service account keys in `backend/service_accounts/` (gitignored)
- All sensitive operations performed on backend
- Encrypted session cookies with secure flag in production

## Common Development Tasks

### Adding a New API Endpoint
1. Create route file in `backend/src/routes/`
2. Define Pydantic models in `backend/src/models/`
3. Add router to `create_app()` in `run.py`
4. Update frontend API client if needed

### Modifying Theme Colors
1. Edit `userTheme` object in `frontend/src/utils/theme.ts`
2. Colors auto-generate light/dark variants
3. Use Tailwind classes or CSS variables in components

### Running Database Queries
```python
from src.database.firestore_database import firestore_db

# Query with filters
users = await firestore_db.query_documents(
    collection="users",
    where_clauses=[("tenant_id", "==", tenant_id)],
    order_by="created_at"
)
```

### Debugging Authentication
1. Check backend logs for middleware execution
2. Verify session cookie in browser DevTools
3. Check for CSRF token in request headers
4. Use utility scripts to test Wristband API directly

## Deployment Considerations

- Backend requires environment variables for production
- Frontend builds with `npm run build` in frontend directory
- Infrastructure managed via Terraform (see infrastructure/README.md)
- Service accounts needed for Firestore access
- Enable secure cookies in production (remove `dangerously_disable_secure_cookies`)