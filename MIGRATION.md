# Migration Guide: Old Structure → New Modular Structure

## Overview

This guide helps you transition from the old flat structure to the new modular architecture.

## Backend Migration

### Old Import Paths → New Import Paths

```typescript
// OLD
import { connectDB } from "./config/db";
import { generateToken, verifyToken } from "./utils/jwt";
import { User } from "./models/User";
import { authMiddleware } from "./middleware/auth.middleware";
import { validate } from "./middleware/validate.middleware";

// NEW
import { connectDB } from "./app/common/config/db";
import { generateAccessToken, verifyAccessToken } from "./app/common/utils/jwt";
import { User } from "./app/modules/user/user.model";
import { authMiddleware } from "./app/common/middlewares/auth.middleware";
import { validate } from "./app/common/middlewares/validate.middleware";
```

### File Mapping

| Old Path                                | New Path                                            |
| --------------------------------------- | --------------------------------------------------- |
| `src/config/db.ts`                      | `src/app/common/config/db.ts`                       |
| `src/utils/jwt.ts`                      | `src/app/common/utils/jwt.ts`                       |
| `src/models/User.ts`                    | `src/app/modules/user/user.model.ts`                |
| `src/models/Message.ts`                 | `src/app/modules/message/message.model.ts`          |
| `src/controllers/auth.controller.ts`    | `src/app/modules/user/user.controller.ts`           |
| `src/controllers/message.controller.ts` | `src/app/modules/message/message.controller.ts`     |
| `src/routes/auth.routes.ts`             | `src/app/modules/user/user.routes.ts`               |
| `src/routes/message.routes.ts`          | `src/app/modules/message/message.routes.ts`         |
| `src/middleware/auth.middleware.ts`     | `src/app/common/middlewares/auth.middleware.ts`     |
| `src/middleware/validate.middleware.ts` | `src/app/common/middlewares/validate.middleware.ts` |
| `src/validators/validators.ts`          | `src/app/modules/user/user.validation.ts`           |

### New Features Added

1. **Environment Configuration** (`app/common/config/env.ts`)
   - Centralized env variable management
   - Type-safe access to environment variables

2. **Error Handling** (`app/common/middlewares/error.middleware.ts`)
   - Custom `AppError` class
   - Centralized error handling middleware

3. **Async Error Wrapper** (`app/common/middlewares/catch.middleware.ts`)
   - Automatically catches async errors
   - No more try-catch in every controller

4. **Refresh Tokens** (`app/modules/token/`)
   - Refresh token model and service
   - Token rotation support

5. **DTOs** (Data Transfer Objects)
   - Separate validation schemas in `dto/` folders
   - Better organization of input validation

## Frontend Migration

### Old Zustand Stores → New Redux Slices

```typescript
// OLD (Zustand)
import { useAuthStore } from "./store/authStore";
import { useChatStore } from "./store/chatStore";

const { user, setAuth, clearAuth } = useAuthStore();
const { selectedUser, setSelectedUser } = useChatStore();

// NEW (Redux)
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { setCredentials, logout } from "./store/slices/authSlice";
import { setSelectedUser } from "./store/slices/chatSlice";

const user = useAppSelector((state) => state.auth.user);
const selectedUser = useAppSelector((state) => state.chat.selectedUser);
const dispatch = useAppDispatch();

dispatch(setCredentials({ user, accessToken, refreshToken }));
dispatch(setSelectedUser(user));
```

### API Calls → TanStack Query Hooks

```typescript
// OLD (Direct axios calls)
const fetchUsers = async () => {
  try {
    const response = await api.get("/users");
    setUsers(response.data.users);
  } catch (error) {
    console.error(error);
  }
};

// NEW (TanStack Query)
import { useUsers } from "./hooks/queries/useUsers";

const { data: users, isLoading, error } = useUsers();
// Automatic caching, refetching, and error handling
```

### Authentication Flow

```typescript
// OLD
const handleLogin = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    setAuth(response.data.user, response.data.token);
  } catch (error) {
    // Handle error
  }
};

// NEW
import { useLogin } from "./hooks/queries/useAuth";

const login = useLogin();

const handleLogin = async (email, password) => {
  await login.mutateAsync({ email, password });
  // Automatically updates Redux store
  // Automatic error handling
};
```

## Step-by-Step Migration

### Backend

1. **Create new folder structure**

   ```bash
   mkdir -p src/app/{common/{config,middlewares,utils,validators,types},modules/{user/dto,message/dto,token},routes}
   ```

2. **Move files to new locations** (see File Mapping table above)

3. **Update imports** in all files

4. **Update `index.ts`** to use new route aggregator

5. **Test the application**

### Frontend

1. **Install new dependencies**

   ```bash
   npm install @tanstack/react-query @reduxjs/toolkit react-redux
   npm install --save-dev @tanstack/react-query-devtools
   ```

2. **Create Redux store structure**

   ```bash
   mkdir -p src/store/slices src/hooks/queries
   ```

3. **Create Redux slices** (authSlice, chatSlice, uiSlice)

4. **Create TanStack Query hooks** (useAuth, useUsers, useMessages)

5. **Update `main.tsx`** to include providers

6. **Migrate components** to use new hooks

7. **Test the application**

## Breaking Changes

### Backend

1. **JWT Functions Renamed**
   - `generateToken` → `generateAccessToken` / `generateRefreshToken`
   - `verifyToken` → `verifyAccessToken` / `verifyRefreshToken`

2. **Error Handling**
   - Controllers should throw `AppError` instead of sending responses directly
   - Use `catchAsync` wrapper for async route handlers

3. **Route Paths**
   - All routes now prefixed with `/api`
   - Auth routes: `/api/auth/*` instead of `/auth/*`

### Frontend

1. **State Management**
   - Zustand stores replaced with Redux slices
   - Must use `useAppSelector` and `useAppDispatch` hooks

2. **API Calls**
   - Direct axios calls should be replaced with TanStack Query hooks
   - Automatic caching and refetching

3. **Token Storage**
   - Now stores both `accessToken` and `refreshToken`
   - Automatic token refresh on 401 errors

## Testing the Migration

### Backend

```bash
# Run the server
cd server
npm run dev

# Test endpoints
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

### Frontend

```bash
# Run the client
cd client
npm run dev

# Open browser to http://localhost:5173
# Check Redux DevTools
# Check React Query DevTools
```

## Rollback Plan

If you need to rollback:

1. **Backend**: Keep old files in `src/old/` folder
2. **Frontend**: Create a git branch before migration
3. **Database**: No schema changes, so no migration needed

## Common Issues

### Issue: Module not found errors

**Solution**: Check import paths match new structure

### Issue: Redux state is undefined

**Solution**: Ensure providers are in correct order in `main.tsx`

### Issue: TanStack Query not caching

**Solution**: Check `queryKey` is consistent across components

### Issue: Token refresh not working

**Solution**: Verify `REFRESH_TOKEN_SECRET` in `.env`

## Support

If you encounter issues:

1. Check the README.md for architecture overview
2. Review this migration guide
3. Check TypeScript errors for import path issues
4. Verify environment variables are set correctly

---

Happy migrating! 🚀
