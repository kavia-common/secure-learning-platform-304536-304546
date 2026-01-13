# Integration Guide

This document describes how the React frontend integrates with the Express backend.

## Backend Connection

### Base URL Configuration

The frontend connects to the backend via the `REACT_APP_API_BASE` environment variable:

```bash
# .env
REACT_APP_API_BASE=http://localhost:3001
```

Default: `http://localhost:3001`

### API Client Setup

The `src/api/client.js` module creates an Axios instance with:
- Base URL from environment
- JSON content type
- Request interceptor to add JWT token
- Response interceptor to handle 401 errors

## API Endpoints Used

### Authentication Endpoints

**POST /api/auth/register**
- Request: `{ email, password, displayName, roles: ['user'] }`
- Response: `{ token, user }`
- Used by: `src/pages/Register.js`

**POST /api/auth/login**
- Request: `{ email, password }`
- Response: `{ token, user }`
- Used by: `src/pages/Login.js`

**POST /api/auth/logout**
- Request: None (token in header)
- Response: `{ message }`
- Used by: `src/components/Topbar.js`

**GET /api/auth/me**
- Request: None (token in header)
- Response: `{ user }`
- Used by: `src/App.js` (on mount to verify token)

### Labs Endpoints

**GET /api/labs**
- Request: None
- Response: `[{ _id, title, description, category, difficulty, tags, ... }]`
- Used by: `src/pages/Dashboard.js`, `src/pages/Labs.js`, `src/pages/Admin.js`

**GET /api/labs/:labId**
- Request: None
- Response: `{ _id, title, description, category, difficulty, objective, ... }`
- Used by: `src/pages/LabDetail.js`

**GET /api/labs/:labId/hints**
- Request: None
- Response: `[{ _id, content, order }]`
- Used by: `src/pages/LabDetail.js`

**POST /api/labs/:labId/submit**
- Request: `{ answer, hintsUsed }`
- Response: `{ correct, message, remediation?, progress }`
- Used by: `src/pages/LabDetail.js`

**POST /api/labs** (Admin only)
- Request: Lab object
- Response: Created lab
- Used by: Future admin lab creation feature

**PUT /api/labs/:labId** (Admin only)
- Request: Lab updates
- Response: Updated lab
- Used by: Future admin lab editing feature

**DELETE /api/labs/:labId** (Admin only)
- Request: None
- Response: `{ message }`
- Used by: `src/pages/Admin.js`

### Progress Endpoints

**GET /api/progress/me**
- Request: None (token in header)
- Response: `[{ _id, userId, labId, status, completedAt, ... }]`
- Used by: `src/pages/Labs.js`, `src/pages/Progress.js`

**GET /api/progress/summary**
- Request: None (token in header)
- Response: `{ completed, inProgress, total, progressByLab: [...] }`
- Used by: `src/pages/Dashboard.js`, `src/pages/Progress.js`

**GET /api/progress/leaderboard**
- Request: Query param `limit` (default 10)
- Response: `[{ userId, email, displayName, completedCount }]`
- Used by: `src/pages/Progress.js`

**POST /api/progress/reset**
- Request: None (token in header)
- Response: `{ message }`
- Used by: Future feature for resetting own progress

### Admin Endpoints

**GET /api/admin/users** (Admin only)
- Request: None (token in header)
- Response: `[{ _id, email, displayName, roles, ... }]`
- Used by: `src/pages/Admin.js`

**PATCH /api/admin/users/:userId/roles** (Admin only)
- Request: `{ roles: ['user'] | ['user', 'admin'] }`
- Response: Updated user
- Used by: `src/pages/Admin.js`

**POST /api/admin/users/:userId/reset** (Admin only)
- Request: None (token in header)
- Response: `{ message }`
- Used by: `src/pages/Admin.js`

## Authentication Flow

1. User submits login/register form
2. Frontend sends credentials to `/api/auth/login` or `/api/auth/register`
3. Backend validates and returns JWT + user object
4. Frontend stores in sessionStorage:
   - `token`: JWT string
   - `user`: JSON stringified user object
5. All subsequent API calls include token via Axios interceptor
6. On 401 response, frontend clears session and redirects to login

## CORS Configuration

The backend must have CORS enabled for the frontend origin:

```javascript
// Backend CORS config (already configured)
app.use(cors({
  origin: '*',  // Permissive for learning (intentionally insecure)
  credentials: true
}));
```

## Data Flow Examples

### Loading Dashboard

```
User opens app
  ↓
App.js checks sessionStorage for token
  ↓
If token exists, call GET /api/auth/me to verify
  ↓
Dashboard.js mounts
  ↓
Parallel requests:
  - GET /api/labs (first 6 for recent labs)
  - GET /api/progress/summary (for stats)
  ↓
Render dashboard with data
```

### Submitting a Lab Solution

```
User fills out submission form
  ↓
Click "Submit Solution"
  ↓
POST /api/labs/:labId/submit
  { answer: "user input", hintsUsed: 2 }
  ↓
Backend validates solution
  ↓
Backend updates progress in database
  ↓
Response: { correct: true/false, message: "...", remediation: "..." }
  ↓
Frontend displays result and updates UI
```

## Testing Integration

### Manual Testing Checklist

1. **Backend Running**: Verify backend is on port 3001
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok",...}
   ```

2. **CORS Working**: Check browser console for CORS errors
   - If present, backend CORS config needs adjustment

3. **Authentication**: 
   - Register new user → check token in sessionStorage
   - Login existing user → verify redirect to dashboard
   - Logout → verify token cleared

4. **Data Loading**:
   - Dashboard shows stats and labs
   - Labs page loads all labs
   - Lab detail shows correct information

5. **Submissions**:
   - Submit incorrect answer → see error message
   - Submit correct answer → see success + remediation

6. **Admin Features** (login as admin):
   - View users list
   - Toggle user admin role
   - Delete a lab

### Automated Testing

Run the test suite:
```bash
npm test
```

Current tests verify:
- App renders without crashing
- Login page displays correctly
- Components render properly

## Environment Setup

### Development

```bash
# Backend
cd express_backend
npm start  # Port 3001

# Frontend (in separate terminal)
cd react_frontend
npm start  # Port 3000
```

### Production Build

```bash
# Build frontend
cd react_frontend
npm run build

# Serve static files (option 1: standalone)
npx serve -s build -p 3000

# Serve static files (option 2: from backend)
# Copy build/ to backend/public/ and configure Express static middleware
```

## Common Integration Issues

### Issue: "Network Error" or "ERR_CONNECTION_REFUSED"

**Cause**: Backend not running or wrong URL

**Fix**: 
- Start backend: `cd express_backend && npm start`
- Verify REACT_APP_API_BASE in .env
- Check backend is on expected port

### Issue: "401 Unauthorized"

**Cause**: Missing or invalid token

**Fix**:
- Clear sessionStorage and login again
- Check token expiration (default 24h)
- Verify backend JWT_SECRET matches

### Issue: CORS Errors

**Cause**: Backend CORS not configured for frontend origin

**Fix**: 
- Backend already configured with permissive CORS
- If modified, add frontend URL to allowed origins

### Issue: Data Not Loading

**Cause**: Backend database not seeded or API returning errors

**Fix**:
- Run backend seed script: `npm run seed`
- Check backend console for errors
- Inspect Network tab in browser DevTools

## Security Notes (Intentional Vulnerabilities)

This integration demonstrates several insecure patterns for learning:

1. **Token in sessionStorage**: Vulnerable to XSS (should use httpOnly cookies)
2. **No CSRF Protection**: Forms lack CSRF tokens
3. **Permissive CORS**: `origin: '*'` allows any domain
4. **Client-Side Role Checks**: Admin status checked in frontend (bypassable)
5. **Error Stack Traces**: Displayed in dev mode (information disclosure)

These are intentional for educational purposes. **Do not use in production!**

## Swagger Documentation

The backend provides interactive API documentation:

**URL**: http://localhost:3001/docs

Features:
- Try out endpoints directly
- View request/response schemas
- See authentication requirements

Link accessible from Dashboard → Quick Links → API Documentation
