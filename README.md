# 📚 LibraryHub — Library Management System

A modern full-stack Library Management System built with the MERN stack. The application provides separate experiences for users and administrators, with secure authentication, book management, borrowing and return workflows, dashboards, and role-based access control.

## 📖 Project Overview

LibraryHub replaces manual/spreadsheet-based library tracking with a self-service web application. It consists of two parts:

- **`backend/`** — a REST API (Node.js + Express + MongoDB/Mongoose) handling authentication, book records, borrowing transactions, and user administration.
- **`front/`** — a React (Vite) single-page application that consumes the API and provides separate experiences for regular users and administrators.

Members can browse the catalog, borrow and return books, and track their own borrowing history, while admins manage the book catalog, users, and every borrowing record from a dedicated dashboard.

## 🚀 Features

### 👤 User Features

- User registration and login
- JWT-based authentication
- Secure protected routes
- Browse available books
- Search books by title, author, category, or ISBN
- Filter books by category
- Borrow available books
- Return borrowed books
- View personal borrowing history
- Personal dashboard with activity stats
- Responsive and user-friendly interface

### 🛡️ Admin Features

- Secure admin authentication
- Admin dashboard with library-wide statistics and recent activity
- Add new books
- Edit book details
- Delete books
- Manage book quantities and availability
- View registered users with borrowing activity
- Manage users (role changes, deletion)
- View all borrowing records
- Search and filter users and borrowing records
- Monitor returned and currently borrowed books

Only features present in the current codebase are listed above.

## 🧑‍🤝‍🧑 User & Admin Roles

The system supports two roles, stored on the `User` model:

- **`user`** (default) — can browse books, borrow/return, and view their own dashboard and history.
- **`admin`** — has all user capabilities plus full access to book management, user management, and system-wide borrowing/dashboard views.

Role is assigned at the database level (new registrations default to `user`); admins can promote or demote other users via the User Management screen. Admins cannot change their own role or delete their own account, preventing accidental lockout.

Access is enforced in two places:
- **Frontend** — `ProtectedRoute` requires a logged-in user; `AdminRoute` additionally requires the `admin` role, redirecting non-admins away from admin pages.
- **Backend** — every admin-only endpoint independently enforces the role check server-side (see below), so the restriction can't be bypassed by calling the API directly.

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication.

- Passwords are securely hashed using **bcrypt** before being stored, and are never persisted in plain text.
- On login, the API issues a signed JWT (containing the user's `id` and `role`) that expires after 1 day.
- The frontend stores the token and attaches it as a `Bearer` token on every API request.
- **`authMiddleware`** verifies the JWT on protected routes and rejects missing, malformed, or expired/invalid tokens.
- **`adminMiddleware`** runs after `authMiddleware` and rejects any request where the user's role isn't `admin`.
- User and admin access are separated using role-based access control, enforced independently on both frontend and backend.
- Additional hardening: `helmet` security headers, `cors` restricted to the configured frontend origin, and rate limiting on `/api/auth` (register/login) to slow brute-force attempts.

## 📗 Book Management

Books are stored with title, author, ISBN, category, optional description/publisher/publishedYear/coverImage, total `quantity`, and `availableQuantity` (copies currently available to borrow).

- **Create** (admin only) — requires title, author, ISBN, and category; ISBN must be unique across the catalog.
- **Read** — any authenticated user can list all books or view a single book's details.
- **Update** (admin only) — fields are updated only if provided; if the total quantity is reduced, it cannot drop below the number of copies currently borrowed.
- **Delete** (admin only) — blocked if any copies of the book are currently borrowed, preventing orphaned borrow records.

## 🔄 Borrowing & Return System

The borrowing workflow manages book availability automatically.

When a user borrows a book:

1. The system checks whether the book exists.
2. It checks the user doesn't already have an active (unreturned) borrow of that same book.
3. It checks whether copies are available (`availableQuantity > 0`).
4. A borrowing record is created.
5. Available quantity is decreased by 1.

When a user returns a book:

1. The borrowing record is verified, and confirmed to belong to the requesting user.
2. Returning an already-returned record is rejected.
3. The status is changed to `returned` and the return date is recorded.
4. Available quantity is increased by 1 (capped at the book's total quantity).

Users can view their own full borrowing history at any time; admins can view every borrowing record system-wide, with search and status filtering.

## 🛠️ Tech Stack

### Frontend

- React.js (v19)
- Vite
- React Router (`react-router-dom`)
- Tailwind CSS
- JavaScript
- Fetch API

### Backend

- Node.js
- Express.js (v5)
- MongoDB
- Mongoose
- JWT (`jsonwebtoken`)
- **bcrypt** (password hashing)
- `dotenv`
- `helmet` (security headers)
- `express-rate-limit` (auth rate limiting)
- `cors`

### Development Tools

- Git
- GitHub
- VS Code
- MongoDB Atlas

## 📁 Project Structure

```text
library-management-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authcontroller.js
│   │   │   ├── bookController.js
│   │   │   ├── borrowController.js
│   │   │   ├── dashboardController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verification
│   │   │   └── adminMiddleware.js     # Role check
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
│   │
│   ├── createAdmin.js                 # One-off script to seed an admin account
│   ├── server.js                      # Entry point
│   ├── package.json
│   └── .gitignore
│
├── front/
│   ├── public/
│   ├── src/
│   │   ├── components/                # Layout, ProtectedRoute, AdminRoute, Skeleton
│   │   ├── context/                   # AuthContext (auth state)
│   │   ├── pages/                     # Login, Register, Dashboard, Books, MyBorrows,
│   │   │                              #   AdminDashboard, AdminUsers, AdminBorrows
│   │   ├── utils/                     # formatDate
│   │   ├── config.js                  # API base URL
│   │   └── App.jsx                    # Route definitions
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🔌 API Overview

Base URL: `http://localhost:5000` (configurable via `PORT`). All routes are prefixed with `/api`.

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

<a id="environment-setup"></a>

## ⚙️ Environment Setup

### Backend (`backend/.env`)

Create a `.env` file inside `backend/` — **this file must remain private and must never be committed to Git** (it's already excluded via `.gitignore`):

```
PORT=5000
MONGO_URI=<YOUR_MONGODB_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
CLIENT_URL=http://localhost:5173
```

- `MONGO_URI` — your MongoDB connection string (local or Atlas)
- `JWT_SECRET` — a long, random secret used to sign JWTs
- `CLIENT_URL` — the frontend origin allowed by CORS
- `PORT` — port the API listens on (defaults to `5000` if omitted)

### Frontend (`front/.env`, optional)

The frontend defaults to `http://localhost:5000` for the API. To point it elsewhere, create a `.env` file in `front/`:

```
VITE_API_URL=<YOUR_BACKEND_API_URL>
```

> ⚠️ Never commit real credentials, connection strings, or secrets. Only placeholder values belong in version control.

## ▶️ Installation & Running

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
   Create `backend/.env` as described in [Environment Setup](#environment-setup). Optionally create `front/.env` if the API isn't running on `http://localhost:5000`.

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

## ✅ Testing

There is currently no automated test suite. Manual testing should cover:

- **Registration/login** — valid and invalid input, duplicate email, wrong password
- **Admin login** — confirm admin-only UI and routes become accessible
- **Book CRUD** — create/edit/delete as admin, ISBN uniqueness, quantity validation, deletion blocked while copies are borrowed
- **Borrow/return** — borrowing an available book, borrowing when unavailable, duplicate-borrow prevention, returning, returning someone else's borrow (should be rejected)
- **User management** — role changes, deletion blocked with active borrows, admin unable to modify/delete their own account
- **Authorization** — non-admin users blocked from admin routes/pages both in the UI and directly against the API

## 🖼️ Screenshots

_Screenshots to be added._

- Login
- User Dashboard
- Books
- My Borrowings
- Admin Dashboard
- Admin Book Management
- User Management
- Borrowing Management

## 🔭 Future Improvements

The following are potential enhancements and are **not** currently implemented:

- Email notifications (e.g. borrow confirmations, overdue reminders)
- Due dates and fines for overdue books
- Server-side pagination for large book/user/borrow lists
- Advanced reporting and analytics
- Deployment configuration (Docker, CI/CD, hosting setup)
- Automated testing (unit/integration/e2e)
