# Secure Learning Platform - React Frontend

A modern, intentionally vulnerable React-based web application designed for learning and practicing web security concepts. This frontend connects to the Express backend API and provides an interactive interface for navigating security labs, tracking progress, and learning about web vulnerabilities.

## ⚠️ Security Warning

**This application is intentionally vulnerable by design.** It should ONLY be run in isolated, controlled environments intended for educational purposes. Do NOT deploy this to production or any public-facing environment.

## Features

### Authentication
- **Login/Register**: Weak authentication system (intentional for learning)
- **JWT Token Management**: Session-based authentication with tokens stored in sessionStorage
- **Role-Based Access**: Admin and user roles with protected routes
- **Demo Accounts**: Pre-seeded accounts for quick testing

### Dashboard
- **Progress Overview**: Visual summary of completed, in-progress, and total labs
- **Progress Bar**: Graphical representation of overall completion
- **Quick Links**: Easy navigation to labs, progress, and API documentation
- **Recent Labs**: Card-based display of the latest labs

### Labs Catalog
- **Card-Based Layout**: Modern, responsive card grid displaying all labs
- **Search**: Filter labs by title or description
- **Category Filter**: Filter by security category (Authentication, XSS, CSRF, etc.)
- **Difficulty Filter**: Filter by beginner, intermediate, or advanced
- **Status Filter**: Filter by completion status (not started, in progress, completed)

### Lab Detail Pages
- **Tabbed Interface**: Overview, Hints, Submit Solution, and Discussion tabs
- **Progressive Hints**: Sequential hint disclosure to avoid spoilers
- **Solution Submission**: Form to submit answers with validation
- **Remediation Guidance**: Educational feedback on secure coding practices
- **Status Tracking**: Visual indicators for lab completion status

### Progress Tracking
- **Personal Statistics**: Completed labs, in-progress labs, and completion rate
- **Lab-by-Lab Progress**: Detailed table showing status of each lab
- **Leaderboard**: Top 10 users by completed labs
- **Progress Summary**: Category-based breakdown of progress

### Admin Panel
- **User Management**: View all users, manage roles, reset progress
- **Lab Management**: View all labs, delete labs
- **Role Assignment**: Promote/demote users to/from admin role

## Architecture

### Directory Structure
```
src/
├── api/                    # API client modules
│   ├── client.js          # Axios base client with auth interceptors
│   ├── auth.js            # Authentication endpoints
│   ├── labs.js            # Labs CRUD and submission endpoints
│   ├── progress.js        # Progress tracking endpoints
│   └── admin.js           # Admin-only endpoints
├── components/            # Reusable UI components
│   ├── Card.js           # Card container component
│   ├── Button.js         # Styled button component
│   ├── Sidebar.js        # Left navigation sidebar
│   ├── Topbar.js         # Top navigation bar with user info
│   ├── LabCard.js        # Lab summary card
│   ├── HintList.js       # Progressive hint disclosure component
│   └── ProtectedRoute.js # Route authentication wrapper
├── pages/                # Page components
│   ├── Login.js          # Login page
│   ├── Register.js       # Registration page
│   ├── Dashboard.js      # Main dashboard
│   ├── Labs.js           # Labs listing with filters
│   ├── LabDetail.js      # Individual lab detail page
│   ├── Progress.js       # Progress tracking page
│   └── Admin.js          # Admin panel
├── styles/               # CSS modules for components
│   ├── Card.css
│   ├── Button.css
│   ├── Sidebar.css
│   ├── Topbar.css
│   ├── LabCard.css
│   ├── HintList.css
│   ├── AuthPages.css
│   ├── Dashboard.css
│   ├── Labs.css
│   ├── LabDetail.css
│   ├── Progress.css
│   └── Admin.css
├── App.js                # Main app with routing
├── App.css               # Global styles and theme variables
├── index.js              # Application entry point
└── index.css             # Base styles

```

### Key Technologies
- **React 18.2**: Modern React with hooks
- **React Router 6**: Client-side routing with protected routes
- **Axios 1.6**: HTTP client with interceptors for auth token handling
- **CSS Variables**: Theme management with light mode
- **Session Storage**: Token and user data persistence

### Design System
- **Primary Color**: `#3b82f6` (Blue)
- **Secondary Color**: `#06b6d4` (Cyan)
- **Success Color**: `#10b981` (Green)
- **Error Color**: `#ef4444` (Red)
- **Background**: `#f9fafb` (Light gray)
- **Text**: `#111827` (Dark gray)

## Getting Started

### Prerequisites
- Node.js 14+ and npm
- Backend API running on port 3001 (default)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env to configure backend URL if needed
# REACT_APP_API_BASE=http://localhost:3001
```

### Running the Application

```bash
# Development mode (port 3000)
npm start

# The app will open at http://localhost:3000
```

### Building for Production

```bash
# Create optimized production build
npm run build

# The build output will be in the 'build' directory
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
CI=true npm test
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Backend API base URL
REACT_APP_API_BASE=http://localhost:3001

# Site URL for email redirects (used by Supabase if integrated)
REACT_APP_SITE_URL=http://localhost:3000
```

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/me` - Get current user info

### Labs (`/api/labs`)
- `GET /api/labs` - List all published labs
- `GET /api/labs/:id` - Get lab details
- `GET /api/labs/:id/hints` - Get lab hints
- `POST /api/labs/:id/submit` - Submit solution
- `POST /api/labs` - Create lab (admin)
- `PUT /api/labs/:id` - Update lab (admin)
- `DELETE /api/labs/:id` - Delete lab (admin)

### Progress (`/api/progress`)
- `GET /api/progress/me` - Get user's progress
- `GET /api/progress/summary` - Get progress summary
- `GET /api/progress/leaderboard` - Get leaderboard
- `POST /api/progress/reset` - Reset user's progress

### Admin (`/api/admin`)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/roles` - Update user roles
- `POST /api/admin/users/:id/reset` - Reset user progress

## Demo Accounts

The backend seed script creates the following demo accounts:

- **Admin**: 
  - Email: `admin@test.com`
  - Password: `admin123`
  - Roles: `admin`, `user`

- **Regular User**: 
  - Email: `user@test.com`
  - Password: `user123`
  - Roles: `user`

## Intentional Vulnerabilities (For Learning)

This application demonstrates various security weaknesses:

1. **Weak Authentication**: Passwords stored with basic hashing
2. **Client-Side Storage**: JWT tokens in sessionStorage (XSS vulnerable)
3. **Error Disclosure**: Stack traces displayed in development mode
4. **Missing CSRF Protection**: Forms lack CSRF tokens
5. **Role-Based Access Issues**: Client-side role checking (bypassable)

## Development Notes

### Hot Reloading
The development server supports hot module replacement. Changes to source files will automatically reload the browser.

### Port Configuration
- Frontend: `http://localhost:3000` (default)
- Backend: `http://localhost:3001` (configurable via REACT_APP_API_BASE)

### CORS
The backend is configured with permissive CORS to allow the frontend to make requests. This is intentionally insecure for educational purposes.

### Authentication Flow
1. User logs in via `/login`
2. Backend returns JWT token
3. Token stored in sessionStorage
4. Axios interceptor adds token to all API requests
5. Protected routes check for token presence
6. Token expiration redirects to login

### State Management
This application uses React's built-in state management (useState, useEffect) without external libraries like Redux. For a production app, consider using a more robust state management solution.

## Deployment Considerations

**DO NOT deploy this application to production!** It is intentionally vulnerable.

If you need to deploy for educational purposes in a controlled environment:
1. Use isolated networks or VPCs
2. Implement IP whitelisting
3. Add clear warnings on all pages
4. Use HTTPS even in learning environments
5. Monitor and log all access

## Troubleshooting

### Backend Connection Issues
- Verify backend is running on port 3001
- Check REACT_APP_API_BASE in .env
- Look for CORS errors in browser console

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf build`
- Update dependencies: `npm update`

### Authentication Issues
- Clear sessionStorage: `sessionStorage.clear()` in browser console
- Check JWT expiration (tokens expire after 24 hours by default)
- Verify backend /api/auth/me endpoint is accessible

## Contributing

This is an educational project. Contributions that add new vulnerability examples or improve the learning experience are welcome.

## License

This project is for educational purposes only. Use at your own risk.

## Resources

- [Backend API Documentation](http://localhost:3001/docs) - Swagger/OpenAPI docs
- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
