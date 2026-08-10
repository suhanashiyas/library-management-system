# LibraryHub — Library Management System

A full-stack web application for managing a library's book catalog, memberships, and borrowing workflow. It replaces manual/spreadsheet-based tracking with a single system where members can browse and borrow books online, and librarians (admins) can manage the catalog, users, and loans from a dedicated dashboard.

## 1. Project Overview

LibraryHub is a MERN-style application (MongoDB, Express, React, Node.js) built as a two-part project:

- **`backend/`** — a REST API (Node.js + Express + MongoDB/Mongoose) that handles authentication, book records, borrowing transactions, and user administration.
- **`front/`** — a React (Vite) single-page application that consumes the API and provides separate experiences for regular users and administrators.

The core problem it solves: giving a library staff/member workflow — cataloging books, tracking how many copies are available, and recording who has borrowed and returned what — a simple, self-service web interface instead of manual record-keeping.

## 2. Features

### User
- Register and log in with an email/password account
- Browse the full book catalog
- Search books by title, author, category, or ISBN, and filter by category
- Borrow an available book (one active borrow per book per user)
- Return a borrowed book
- View personal borrowing history (active and returned)
- Personal dashboard showing total titles in the library, active borrows, returned borrows, and recent activity

### Admin
- Admin authentication (same login flow, elevated by role)
- Admin dashboard with library-wide statistics (titles, copies, availability, users, active/returned borrowings) and recent activity feeds
- Full book CRUD — create, view, update, and delete books, with quantity/availability tracking
- User management — view all users with their borrowing activity, change a user's role, and delete a user (with safeguards, see below)
- Borrowing management — view every borrow record in the system, with search and status filtering
- Search/filter across the book catalog, user list, and borrow records
- Recent activity view — latest borrows, latest books added, latest registered users

Only features present in the current codebase are listed above.

## 3. User Roles & Authorization

The system supports two roles, stored on the `User` model: **`user`** (default) and **`admin`**.

- **JWT Authentication** — On login, the API issues a signed JWT (`jsonwebtoken`) containing the user's `id` and `role`, valid for 1 day. The frontend stores this token and attaches it as a `Bearer` token on every API request.
- **Role-based authorization** — The token's `role` claim determines access to admin-only features; regular users cannot reach admin functionality even if they call the API directly.
- **Protected routes (frontend)** — `ProtectedRoute` redirects unauthenticated users to `/login`. `AdminRoute` additionally redirects non-admins away from admin pages (e.g. user management, admin dashboard, borrowing management).
- **Backend authorization** — Enforced independently of the frontend via two Express middlewares:
  - `authMiddleware` — verifies the JWT and rejects missing/invalid/expired tokens.
  - `adminMiddleware` — runs after `authMiddleware` and rejects any request where `role !== "admin"`.

  Every book-write, user-management, admin-borrow, and admin-dashboard route is protected by both middlewares, so authorization is enforced server-side, not just hidden in the UI.

## 4. Tech Stack

**Frontend**
- React 19
- Vite
- React Router (`react-router-dom`)
- Tailwind CSS (via `@tailwindcss/vite`)

**Backend**
- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcrypt` for password hashing
- `helmet` for security headers
- `express-rate-limit` for login/register rate limiting
- `cors` for cross-origin restriction to the configured frontend origin

## 5. Architecture

```
React (Vite SPA)  --HTTP/JSON-->  Express REST API  --Mongoose-->  MongoDB
   front/src                        backend/src                 (Atlas / local)
```

- The React app never talks to MongoDB directly — every read/write goes through the Express API.
- Requests are authenticated with a `Bearer <JWT>` header, attached from `localStorage` on the client.
- Express applies security middleware (`helmet`, `cors` restricted to `CLIENT_URL`, rate limiting on `/api/auth`) before routing to controllers.
- Controllers use Mongoose models (`User`, `Book`, `Borrow`) to read/write MongoDB, enforcing business rules (e.g. availability counts, duplicate-borrow checks) at the controller level.

## 6. Project Structure

```
library-management-system/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup, middleware, route mounting
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authcontroller.js
│   │   │   ├── bookController.js
│   │   │   ├── borrowController.js
│   │   │   ├── dashboardController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verification
│   │   │   └── adminMiddleware.js # Role check
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   ├── book.js
│   │   │   └── borrow.js
│   │   └── routes/
│   │       ├── authroutes.js
│   │       ├── bookRoutes.js
│   │       ├── borrowRoutes.js
│   │       ├── dashboardRoutes.js
│   │       └── userRoutes.js
│   ├── server.js                  # Entry point (loads env, connects DB, starts server)
│   ├── createAdmin.js             # One-off script to seed an admin account
│   ├── package.json
│   └── .env                       # Local environment variables (not committed)
│
├── front/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state, token/user storage
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── MyBorrows.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   └── AdminBorrows.jsx
│   │   ├── utils/
│   │   │   └── formatDate.js
│   │   ├── config.js               # API base URL
│   │   ├── App.jsx                 # Route definitions
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 7. Authentication & Security

- **Password hashing** — Passwords are hashed with `bcrypt` (10 salt rounds) before being stored; the raw password is never persisted. The `password` field is excluded from queries by default (`select: false`) and only pulled in explicitly during login.
- **JWT** — Issued on login (`jwt.sign`) with a 1-day expiry, containing only `id` and `role`. Verified on every protected request via `authMiddleware`.
- **Authentication middleware** (`authMiddleware.js`) — Requires a valid `Authorization: Bearer <token>` header on protected routes; rejects missing, malformed, or expired/invalid tokens with `401`.
- **Admin middleware** (`adminMiddleware.js`) — Runs after authentication and requires `role === "admin"`; otherwise returns `403`.
- **Protected endpoints** — All book-write, all user-management, admin-borrow, and admin-dashboard endpoints require both middlewares. Book reads, borrowing, and the user's own dashboard/history require authentication only.
- **Environment variables** — Secrets (`MONGO_URI`, `JWT_SECRET`) and configuration (`PORT`, `CLIENT_URL`) are loaded from `backend/.env` via `dotenv` and are never hardcoded in source.
- **Input validation** — Controllers validate required fields, types, string trimming, email format, minimum password length, and numeric/quantity constraints before touching the database (e.g. `register`, `createBook`, `updateBook`).
- **Authorization safeguards** — Beyond role checks: users can only return their own borrow records; admins cannot change their own role or delete their own account; books/users with active borrows cannot be deleted.
- **Other hardening** — `helmet` sets security-related HTTP headers; `cors` restricts API access to the configured `CLIENT_URL`; `express-rate-limit` caps `/api/auth` (register/login) to 20 requests per 15 minutes per client to slow brute-force attempts.

## 8. Book Management

Books are stored with title, author, ISBN (unique), category, optional description/publisher/publishedYear/coverImage, `quantity` (total copies), and `availableQuantity` (copies currently available to borrow).

- **Create** — Admin-only. Requires title, author, ISBN, and category; ISBN must be unique. `availableQuantity` is initialized equal to `quantity`.
- **Read** — Any authenticated user can list all books or fetch a single book by ID.
- **Update** — Admin-only. Fields are updated only if provided. If `quantity` is reduced, it cannot drop below the number of copies currently borrowed (`quantity - availableQuantity`); `availableQuantity` is recalculated accordingly.
- **Delete** — Admin-only. Blocked if any copies of the book are currently borrowed.

## 9. Borrowing System

- **Borrowing** — An authenticated user can borrow a book if: the book exists, they don't already have an active (unreturned) borrow of that same book, and `availableQuantity > 0`. On success, a `Borrow` record is created and the book's `availableQuantity` is decremented.
- **Returning** — The user who created the borrow record (verified by comparing `borrow.user` to the requester) marks it as returned; returning an already-returned borrow is rejected. The book's `availableQuantity` is incremented, capped at its total `quantity`.
- **Borrow history** — Users can fetch their own full borrow history (`GET /api/borrows/my`), with book details populated. Admins can fetch every borrow record system-wide (`GET /api/borrows/admin`), with user and book details populated.
- **Available quantity changes** — `availableQuantity` is the single live counter used to gate borrowing and display availability; it moves down on borrow and up on return, and is also reconciled whenever an admin edits a book's total `quantity`.
- **Duplicate active borrowing prevention** — A user cannot hold two simultaneous active borrows of the same book; they must return it before borrowing it again.
- **Authorization checks** — Borrowing and returning require authentication; a user can only return borrows that belong to them; viewing all borrow records is admin-only.

## 10. API Overview

Base URL: `http://localhost:5000` (configurable via `PORT`). All routes below are prefixed with `/api`.

### Authentication (`/api/auth`) — rate-limited (20 requests / 15 min)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user account |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |

### Books (`/api/books`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/books` | Authenticated | List all books |
| GET | `/api/books/:id` | Authenticated | Get a single book by ID |
| POST | `/api/books` | Admin | Create a new book |
| PUT | `/api/books/:id` | Admin | Update a book |
| DELETE | `/api/books/:id` | Admin | Delete a book |

### Borrowings (`/api/borrows`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/borrows` | Authenticated | Borrow a book |
| PUT | `/api/borrows/return` | Authenticated | Return a borrowed book |
| GET | `/api/borrows/my` | Authenticated | Get the current user's borrow history |
| GET | `/api/borrows/admin` | Admin | Get every borrow record in the system |

### Users (`/api/users`) — all admin-only

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users with borrowing activity summary |
| GET | `/api/users/:id` | Admin | Get a single user with their borrow history |
| PATCH | `/api/users/:id/role` | Admin | Change a user's role |
| DELETE | `/api/users/:id` | Admin | Delete a user |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/admin` | Admin | System-wide stats + recent borrows/books/users |
| GET | `/api/dashboard/user` | Authenticated | Current user's own stats + recent activity |

## 11. Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside `backend/` (already excluded from Git via `.gitignore`):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

- `MONGO_URI` — your MongoDB connection string (local or Atlas)
- `JWT_SECRET` — a long, random secret used to sign JWTs
- `CLIENT_URL` — the frontend origin allowed by CORS
- `PORT` — port the API listens on (defaults to `5000` if omitted)

### Frontend (`front/.env`, optional)

The frontend defaults to `http://localhost:5000` for the API. To point it elsewhere, create a `.env` file in `front/`:

```
VITE_API_URL=your_backend_api_url
```

Never commit real credentials — only placeholder values belong in version control.

## 12. Installation & Running

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd library-management-system
   ```

2. **Install backend dependencies**
   ```
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```
   cd ../front
   npm install
   ```

4. **Configure environment variables**
   Create `backend/.env` as described in [Section 11](#11-environment-variables). Optionally create `front/.env` if the API isn't running on `http://localhost:5000`.

5. **Start the backend**
   ```
   cd backend
   npm run dev     # nodemon, auto-restarts on changes
   # or
   npm start       # node server.js
   ```
   The API runs on `http://localhost:5000` by default.

6. **Start the frontend**
   ```
   cd front
   npm run dev
   ```
   The app runs on Vite's default dev server (`http://localhost:5173`).

Optional: seed an initial admin account by running `node createAdmin.js` from inside `backend/` (requires `MONGO_URI` to be configured).

## 13. Testing

There is currently no automated test suite. Manual testing should cover:

- **Registration/login** — valid and invalid input, duplicate email, wrong password
- **Admin login** — confirm admin-only UI and routes become accessible
- **Book CRUD** — create/edit/delete as admin, ISBN uniqueness, quantity validation, deletion blocked while copies are borrowed
- **Borrow/return** — borrowing an available book, borrowing when unavailable, duplicate-borrow prevention, returning, returning someone else's borrow (should be rejected)
- **User management** — role changes, deletion blocked with active borrows, admin unable to modify/delete their own account
- **Authorization** — non-admin users blocked from admin routes/pages both in the UI and directly against the API

## 14. Screenshots

_Screenshots to be added._

- Login
- User Dashboard
- Books
- My Borrowings
- Admin Dashboard
- Admin Book Management
- User Management
- Borrowing Management

## 15. Future Improvements

The following are potential enhancements and are **not** currently implemented:

- Email notifications (e.g. borrow confirmations, overdue reminders)
- Due dates and fines for overdue books
- Server-side pagination for large book/user/borrow lists
- Advanced reporting and analytics
- Deployment configuration (Docker, CI/CD, hosting setup)
- Automated testing (unit/integration/e2e)

## 16. Author

Maintained as a personal full-stack project showcasing a complete authentication, role-based authorization, and CRUD-driven application built with the MERN stack.
