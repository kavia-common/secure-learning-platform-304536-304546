# Development Guide - React Frontend

This guide provides detailed information for developers working on the Secure Learning Platform frontend.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

### API Layer (`src/api/`)

All API communication is centralized in the `api` directory:

- **client.js**: Base Axios instance with request/response interceptors
  - Automatically adds JWT token to requests
  - Handles 401 responses (token expiration)
  - Configures base URL from environment

- **auth.js**: Authentication endpoints (login, register, logout, getCurrentUser)
- **labs.js**: Lab CRUD operations and submissions
- **progress.js**: Progress tracking and leaderboard
- **admin.js**: Admin-only user management

### Components (`src/components/`)

Reusable UI components following a consistent design system:

- **Card**: Generic card container with optional click handler
- **Button**: Styled button with variants (primary, secondary, danger)
- **Sidebar**: Fixed left navigation with active state
- **Topbar**: Top bar with user info and logout
- **LabCard**: Specialized card for lab display
- **HintList**: Progressive hint disclosure with state management
- **ProtectedRoute**: HOC for route authentication

### Pages (`src/pages/`)

Full-page components corresponding to routes:

- **Login/Register**: Authentication forms with error handling
- **Dashboard**: Overview with stats and recent labs
- **Labs**: Filterable lab catalog with search
- **LabDetail**: Individual lab with tabs (Overview, Hints, Submit, Discussion)
- **Progress**: Personal stats and leaderboard
- **Admin**: User and lab management (admin-only)

## Styling Approach

### CSS Variables

All colors and design tokens are defined as CSS variables in `App.css`:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #06b6d4;
  --bg-primary: #f9fafb;
  --text-primary: #111827;
  /* ... more variables */
}
```

### Component Styles

Each component has its own CSS file in `src/styles/`:
- Keeps styles scoped and maintainable
- Uses CSS variables for consistency
- Follows BEM-like naming convention

### Responsive Design

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Authentication Flow

1. User submits login form
2. `auth.login()` sends credentials to backend
3. Backend returns JWT token and user object
4. Token stored in `sessionStorage`
5. User object stored in `sessionStorage` as JSON
6. App state updated with user
7. Redirect to dashboard

### Token Management

The Axios interceptor automatically:
- Adds `Authorization: Bearer <token>` header to requests
- Detects 401 responses and clears session
- Redirects to login on token expiration

### Protected Routes

Use the `ProtectedRoute` component:

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute user={user} requireAdmin={true}>
      <Admin />
    </ProtectedRoute>
  }
/>
```

## State Management

This app uses React's built-in state management:

- **App.js**: Global user state
- **Pages**: Local state for data fetching and forms
- **Components**: Local state for UI interactions

For larger apps, consider Redux or Context API.

## Data Fetching Pattern

Most pages follow this pattern:

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError('Error message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## Error Handling

### API Errors

Errors are caught and displayed to users:
- Login/Register: Show error message above form
- Dashboard/Labs: Show error state
- Submissions: Show inline error with result

### Development Mode

In development, stack traces are logged to console (intentionally insecure for learning).

## Adding New Features

### Adding a New Page

1. Create page component in `src/pages/NewPage.js`
2. Create styles in `src/styles/NewPage.css`
3. Add route in `App.js`
4. Add navigation link in `Sidebar.js` (if needed)

Example:
```jsx
// src/pages/NewPage.js
import React from 'react';
import '../styles/NewPage.css';

const NewPage = () => {
  return (
    <div className="new-page">
      <h1>New Page</h1>
    </div>
  );
};

export default NewPage;
```

### Adding a New API Endpoint

1. Add function to appropriate API module (`src/api/*.js`)
2. Use in component with try/catch

Example:
```jsx
// src/api/labs.js
export const getLabStats = async () => {
  const response = await apiClient.get('/api/labs/stats');
  return response.data;
};
```

### Adding a New Component

1. Create component in `src/components/ComponentName.js`
2. Add styles in `src/styles/ComponentName.css`
3. Export and use in pages

## Testing

### Unit Tests

Tests use React Testing Library:

```jsx
import { render, screen } from '@testing-library/react';
import ComponentName from './ComponentName';

test('renders component', () => {
  render(<ComponentName />);
  const element = screen.getByText(/text/i);
  expect(element).toBeInTheDocument();
});
```

### Integration Tests

For testing with Router:

```jsx
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <ComponentName />
  </BrowserRouter>
);
```

### Mocking sessionStorage

```jsx
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});
```

## Common Tasks

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all to latest
npm update

# Update specific package
npm install package-name@latest
```

### Debugging

1. **React DevTools**: Install browser extension
2. **Network Tab**: Monitor API calls
3. **Console**: Check for errors and logged data
4. **Breakpoints**: Use browser debugger

### Performance

- Use React DevTools Profiler
- Lazy load routes: `const Labs = React.lazy(() => import('./pages/Labs'))`
- Memoize expensive computations: `useMemo`
- Prevent unnecessary re-renders: `React.memo`

## Code Style

### Naming Conventions

- Components: PascalCase (`LabCard.js`)
- Functions: camelCase (`fetchLabs`)
- CSS classes: kebab-case (`lab-card-title`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Best Practices

1. **Document public functions** with JSDoc comments and `// PUBLIC_INTERFACE` marker
2. **Handle loading states** in all async operations
3. **Display user-friendly errors** instead of raw errors
4. **Use semantic HTML** (header, nav, main, etc.)
5. **Make components accessible** (ARIA labels, keyboard navigation)

## Environment Variables

Always prefix with `REACT_APP_`:

```bash
REACT_APP_API_BASE=http://localhost:3001
REACT_APP_SITE_URL=http://localhost:3000
```

Access in code:
```jsx
const apiBase = process.env.REACT_APP_API_BASE;
```

## Build and Deployment

### Production Build

```bash
npm run build
```

Creates optimized bundle in `build/` directory.

### Analyzing Bundle Size

```bash
npm install -g source-map-explorer
npm run build
source-map-explorer 'build/static/js/*.js'
```

### Serving Build Locally

```bash
npm install -g serve
serve -s build -p 3000
```

## Troubleshooting

### Common Issues

**"Module not found"**
- Run `npm install`
- Check import paths

**"Cannot read property of undefined"**
- Check data structure returned from API
- Add optional chaining: `data?.property`

**Blank page after deployment**
- Check browser console for errors
- Verify API_BASE environment variable
- Check CORS configuration on backend

**Authentication not working**
- Clear sessionStorage
- Check token format in Network tab
- Verify backend /api/auth/me endpoint

## Resources

- [React Docs](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Testing Library](https://testing-library.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
