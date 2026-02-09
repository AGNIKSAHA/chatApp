# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Application (TypeScript + Vite)                 │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Redux      │  │  TanStack    │  │  Socket.IO  │ │ │
│  │  │   Toolkit    │  │   Query      │  │   Client    │ │ │
│  │  │              │  │              │  │             │ │ │
│  │  │ Client State │  │ Server State │  │  Real-time  │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │                                                         │ │
│  │  Components: ChatWindow, Sidebar, Login, Register      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express + Socket.IO (TypeScript + Node.js)            │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              Middleware Layer                     │ │ │
│  │  │  • CORS  • Helmet  • Cookie Parser               │ │ │
│  │  │  • Auth  • Validation  • Error Handler           │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              Route Aggregator                     │ │ │
│  │  │              /api/*                               │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │ │
│  │  │    User     │  │   Message   │  │    Token     │ │ │
│  │  │   Module    │  │   Module    │  │   Module     │ │ │
│  │  │             │  │             │  │              │ │ │
│  │  │ • Routes    │  │ • Routes    │  │ • Service    │ │ │
│  │  │ • Controller│  │ • Controller│  │ • Model      │ │ │
│  │  │ • Model     │  │ • Model     │  │              │ │ │
│  │  │ • DTOs      │  │ • DTOs      │  │              │ │ │
│  │  └─────────────┘  └─────────────┘  └──────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              Common Layer                         │ │ │
│  │  │  • Config  • Utils  • Middlewares  • Validators  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MongoDB                                                │ │
│  │                                                         │ │
│  │  Collections:                                           │ │
│  │  • users         (User accounts)                        │ │
│  │  • messages      (Chat messages)                        │ │
│  │  • refreshtokens (Refresh tokens)                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User Input → Redux Action → TanStack Query Mutation
                                    │
                                    ▼
                            POST /api/auth/login
                                    │
                                    ▼
                            User Controller
                                    │
                                    ▼
                            User Model (MongoDB)
                                    │
                                    ▼
                        Generate Access + Refresh Tokens
                                    │
                                    ▼
                            Save Refresh Token
                                    │
                                    ▼
                        Return User + Tokens
                                    │
                                    ▼
                        Update Redux Store
                                    │
                                    ▼
                        Store in localStorage
                                    │
                                    ▼
                            Navigate to Chat
```

### Message Flow

```
User Types → Socket.IO Client → Server Socket Handler
                                        │
                                        ▼
                                Message Model (Save)
                                        │
                                        ▼
                        Emit to Sender & Receiver
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
            Socket Listener                         Socket Listener
            (Sender Client)                         (Receiver Client)
                    │                                       │
                    ▼                                       ▼
            Update Redux Store                      Update Redux Store
                    │                                       │
                    ▼                                       ▼
            Re-render ChatWindow                    Re-render ChatWindow
```

### State Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend State                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │   Redux Toolkit      │  │   TanStack Query         │   │
│  │   (Client State)     │  │   (Server State)         │   │
│  ├──────────────────────┤  ├──────────────────────────┤   │
│  │                      │  │                          │   │
│  │ • Auth State         │  │ • Users List             │   │
│  │   - user             │  │ • Messages               │   │
│  │   - accessToken      │  │ • Conversations          │   │
│  │   - refreshToken     │  │                          │   │
│  │   - isAuthenticated  │  │ Features:                │   │
│  │                      │  │ • Auto caching           │   │
│  │ • Chat State         │  │ • Auto refetch           │   │
│  │   - selectedUser     │  │ • Optimistic updates     │   │
│  │   - messages         │  │ • Error retry            │   │
│  │   - typingUsers      │  │ • Background sync        │   │
│  │   - onlineUsers      │  │                          │   │
│  │                      │  │                          │   │
│  │ • UI State           │  │                          │   │
│  │   - isSidebarOpen    │  │                          │   │
│  │   - theme            │  │                          │   │
│  │   - notifications    │  │                          │   │
│  │                      │  │                          │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure (Backend)

```
User Module
├── dto/
│   ├── signup.dto.ts       # Input validation for signup
│   └── login.dto.ts        # Input validation for login
├── user.controller.ts      # Business logic
├── user.routes.ts          # Route definitions
├── user.model.ts           # MongoDB schema
├── user.types.ts           # TypeScript interfaces
├── user.validation.ts      # Validation schemas
└── user.helpers.ts         # Helper functions

Message Module
├── dto/
│   └── sendMessage.dto.ts  # Input validation
├── message.controller.ts   # Business logic
├── message.routes.ts       # Route definitions
└── message.model.ts        # MongoDB schema

Token Module
├── refreshToken.model.ts   # Refresh token schema
└── token.service.ts        # Token operations
```

## Request/Response Flow

```
HTTP Request
    │
    ▼
Middleware Stack
    │
    ├─► CORS
    ├─► Helmet (Security)
    ├─► Body Parser
    ├─► Cookie Parser
    │
    ▼
Route Aggregator (/api)
    │
    ├─► /api/auth/*     → User Routes
    ├─► /api/users/*    → User Routes
    ├─► /api/messages/* → Message Routes
    │
    ▼
Validation Middleware
    │
    ▼
Authentication Middleware (if protected)
    │
    ▼
Controller (wrapped in catchAsync)
    │
    ├─► Success → JSON Response
    │
    └─► Error → Error Middleware
            │
            ▼
        Error Response
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Security Measures                │
├─────────────────────────────────────────┤
│                                          │
│  1. Helmet.js                            │
│     • XSS Protection                     │
│     • Content Security Policy            │
│     • HSTS                               │
│                                          │
│  2. CORS                                 │
│     • Whitelist client origin            │
│     • Credentials support                │
│                                          │
│  3. JWT Authentication                   │
│     • Access tokens (15min)              │
│     • Refresh tokens (7 days)            │
│     • Token rotation                     │
│                                          │
│  4. Password Hashing                     │
│     • bcrypt with salt rounds            │
│                                          │
│  5. Input Validation                     │
│     • Zod schemas                        │
│     • Type checking                      │
│                                          │
│  6. MongoDB Injection Prevention         │
│     • Mongoose sanitization              │
│                                          │
└─────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Redux Toolkit** - Client state management
- **TanStack Query** - Server state management
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Routing

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Validation
- **Helmet** - Security

---

This architecture provides:

- ✅ Scalability
- ✅ Maintainability
- ✅ Type Safety
- ✅ Real-time Features
- ✅ Security
- ✅ Developer Experience
