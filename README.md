# Chat Application - Modular Architecture

## 🏗️ Backend Structure (Modular)

The backend now follows a clean, modular architecture:

```
server/src/
├── index.ts                          # Main entry point
├── socket/
│   └── socket.ts                     # Socket.IO configuration
└── app/
    ├── common/                       # Shared utilities
    │   ├── config/
    │   │   ├── db.ts                 # Database connection
    │   │   └── env.ts                # Environment variables
    │   ├── middlewares/
    │   │   ├── auth.middleware.ts    # Authentication middleware
    │   │   ├── catch.middleware.ts   # Async error handler
    │   │   ├── error.middleware.ts   # Error handling
    │   │   └── validate.middleware.ts # Validation middleware
    │   ├── utils/
    │   │   ├── jwt.ts                # JWT utilities
    │   │   └── mail.ts               # Email utilities
    │   ├── validators/
    │   │   └── index.ts              # Common validators
    │   └── types/
    │       └── express.d.ts          # Express type extensions
    ├── modules/                      # Feature modules
    │   ├── user/
    │   │   ├── dto/
    │   │   │   ├── signup.dto.ts     # Signup DTO
    │   │   │   └── login.dto.ts      # Login DTO
    │   │   ├── user.controller.ts    # User controllers
    │   │   ├── user.routes.ts        # User routes
    │   │   ├── user.model.ts         # User model
    │   │   ├── user.types.ts         # User types
    │   │   ├── user.validation.ts    # User validations
    │   │   └── user.helpers.ts       # User helpers
    │   ├── message/
    │   │   ├── dto/
    │   │   │   └── sendMessage.dto.ts
    │   │   ├── message.controller.ts
    │   │   ├── message.routes.ts
    │   │   └── message.model.ts
    │   └── token/
    │       ├── refreshToken.model.ts # Refresh token model
    │       └── token.service.ts      # Token service
    └── routes/
        └── index.ts                  # Main route aggregator
```

### Key Features:

- **Modular Design**: Each feature (user, message, token) is self-contained
- **DTOs**: Data Transfer Objects for validation
- **Centralized Config**: Environment variables and database config
- **Error Handling**: Centralized error middleware with custom AppError class
- **Token Refresh**: Automatic refresh token handling
- **Type Safety**: Full TypeScript support with strict types

## 🎨 Frontend Structure (Redux + TanStack Query)

The frontend now uses **Redux Toolkit** for client state and **TanStack Query** for server state:

```
client/src/
├── main.tsx                          # App entry with providers
├── App.tsx                           # Main app component
├── store/                            # Redux store
│   ├── store.ts                      # Store configuration
│   ├── hooks.ts                      # Typed Redux hooks
│   └── slices/
│       ├── authSlice.ts              # Auth state
│       ├── chatSlice.ts              # Chat state
│       └── uiSlice.ts                # UI state
├── lib/
│   ├── axios.ts                      # Axios instance with interceptors
│   ├── queryClient.ts                # TanStack Query config
│   └── socket.ts                     # Socket.IO client
├── hooks/
│   ├── queries/                      # TanStack Query hooks
│   │   ├── useAuth.ts                # Auth queries/mutations
│   │   ├── useUsers.ts               # User queries
│   │   └── useMessages.ts            # Message queries
│   └── useSocketListeners.ts         # Socket event listeners
├── components/
│   ├── ChatWindow.tsx
│   └── Sidebar.tsx
├── pages/
│   ├── Chat.tsx
│   ├── Login.tsx
│   └── Register.tsx
└── types/
    └── index.ts                      # Type definitions
```

### State Management Strategy:

#### Redux (Client State)

- **Auth State**: User info, tokens, authentication status
- **Chat State**: Selected user, messages, typing indicators, online users
- **UI State**: Sidebar, theme, notifications

#### TanStack Query (Server State)

- **Queries**: Fetching users, messages, conversations
- **Mutations**: Login, signup, logout, mark as read
- **Automatic**: Caching, refetching, background updates

### Key Features:

- **Type-Safe**: Fully typed Redux hooks and TanStack Query
- **Token Refresh**: Automatic token refresh in axios interceptors
- **Optimistic Updates**: Fast UI updates with server sync
- **DevTools**: Redux DevTools and React Query DevTools
- **Persistent State**: Auth state persists in localStorage

## 🚀 Getting Started

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Users

- `GET /api/users` - Get all users (protected)

### Messages

- `GET /api/messages/:userId` - Get messages with user (protected)
- `PUT /api/messages/:userId/read` - Mark messages as read (protected)
- `GET /api/conversations` - Get all conversations (protected)

## 🔌 Socket.IO Events

### Client → Server

- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

### Server → Client

- `message:receive` - Receive a message
- `message:sent` - Confirmation of sent message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

## 📚 Usage Examples

### Using TanStack Query Hooks

```typescript
import { useLogin, useSignup } from "./hooks/queries/useAuth";
import { useUsers } from "./hooks/queries/useUsers";
import { useMessages } from "./hooks/queries/useMessages";

function LoginPage() {
  const login = useLogin();

  const handleLogin = async (email: string, password: string) => {
    await login.mutateAsync({ email, password });
    // Automatically updates Redux store
  };
}

function ChatPage() {
  const { data: users } = useUsers();
  const { data: messages } = useMessages(selectedUserId);

  // Data is cached and automatically refetched
}
```

### Using Redux Hooks

```typescript
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setSelectedUser, addMessage } from "./store/slices/chatSlice";

function Component() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);

  dispatch(setSelectedUser(user));
}
```

## 🎯 Benefits of This Architecture

### Backend

- ✅ **Scalable**: Easy to add new modules
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Testable**: Each module can be tested independently
- ✅ **Type-Safe**: Full TypeScript coverage

### Frontend

- ✅ **Optimized**: Automatic caching and deduplication
- ✅ **Real-time**: Redux for instant UI updates
- ✅ **Resilient**: Automatic retry and error handling
- ✅ **Developer Experience**: DevTools for debugging

## 🔧 Next Steps

1. Add unit tests for modules
2. Implement refresh token rotation
3. Add rate limiting
4. Implement file upload for avatars
5. Add message read receipts
6. Implement group chats

---

Built with ❤️ using Node.js, Express, MongoDB, React, Redux Toolkit, and TanStack Query
