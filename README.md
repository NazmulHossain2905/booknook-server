# 📚 BookNook Server

> A RESTful API for [BookNook](https://booknook-online.vercel.app) — an online library where users can browse books, manage their own listings, and borrow books. Built with **Node.js**, **Express.js**, and **MongoDB**, secured with **JWT authentication**.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Native%20Driver-47A248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

---

## ✨ Features

- **Book management** — create, read, update, and delete books with MongoDB
- **Copy inventory invariant** — `availableCopies` is always consistent with `totalCopies` and active borrows
- **Borrowing system** — users borrow books (14-day return window), with duplicate-borrow and out-of-stock protection
- **Book returns** — returning a book automatically restores an available copy
- **User-scoped data** — endpoints to fetch only the books a user added or the books a user borrowed
- **JWT authentication** — protected routes verify Bearer tokens against a remote JWKS (via [`jose`](https://github.com/panva/jose))
- **Deployed on Vercel** — serverless-ready configuration included

## 🛠 Tech Stack

| Category       | Technology                                       |
| -------------- | ------------------------------------------------ |
| Runtime        | Node.js (ES Modules)                             |
| Framework      | Express.js 5                                     |
| Database       | MongoDB (native driver)                          |
| Authentication | JWT ([jose](https://www.npmjs.com/package/jose)) |
| Utilities      | `cors`, `morgan`, `dotenv`, `chalk`              |
| Hosting        | Vercel                                           |

## 📂 Project Structure

```
booknook-server/
├── index.js              # App entry — routes and Mongo connection
├── utils/
│   ├── logger.js         # Colored console logger (chalk)
│   └── verifyToken.js    # JWT middleware (remote JWKS verification)
├── package.json
├── vercel.json           # Vercel deployment config
└── .env                  # Environment variables (not committed)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+**
- **MongoDB** — a local instance, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- An **auth server** exposing a JWKS endpoint (see `CLIENT_URL` below)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/NazmulHossain2905/booknook-server.git
cd booknook-server

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
#    then fill in the values

# 4. Run in development (auto-reload on change)
npm run dev

# 5. Or run in production
npm start
```

### Environment Variables

| Variable      | Required | Description                                                                               |
| ------------- | -------- | ----------------------------------------------------------------------------------------- |
| `PORT`        | No       | Server port. Falls back to `5000`.                                                        |
| `MONGODB_URI` | **Yes**  | MongoDB connection string (local or Atlas).                                               |
| `CLIENT_URL`  | **Yes**  | Base URL of the auth server used for JWT verification (must expose `GET /api/auth/jwks`). |

> ⚠️ Never commit your real `.env` file — it is already listed in `.gitignore`.

---

## 🔌 API Reference

**Base URL (local):** `http://localhost:5000`

The deployed server URL should update here after the next Vercel deployment.

### Response Envelope

All standardized responses use a consistent shape:

```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": []
}
```

Errors follow the same shape with `"success": false`. Validation errors return `400`, missing resources `404`, conflicts `409`, failed authentication `401` or `500`.

### Authentication

Protected routes require a Bearer token in the `Authorization` header (verified against the remote JWKS of the auth server):

```http
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### General

| Method | Endpoint | Auth   | Description                |
| ------ | -------- | ------ | -------------------------- |
| `GET`  | `/`      | Public | Health check / server info |

#### Books

| Method   | Endpoint               | Auth        | Description                                          |
| -------- | ---------------------- | ----------- | ---------------------------------------------------- |
| `GET`    | `/books`               | Public      | Get all books. Optional `?limit=` (e.g. `?limit=6`). |
| `GET`    | `/books/:id`           | 🔒 Required | Get a single book by ID.                             |
| `POST`   | `/books`               | 🔒 Required | Add a new book.                                      |
| `PATCH`  | `/books/:id`           | 🔒 Required | Update a book (partial).                             |
| `DELETE` | `/books/:id`           | 🔒 Required | Delete a book.                                       |
| `GET`    | `/my-books/:userEmail` | 🔒 Required | Books added by a user, newest first.                 |

#### Borrows

| Method  | Endpoint              | Auth        | Description                             |
| ------- | --------------------- | ----------- | --------------------------------------- |
| `POST`  | `/borrows`            | 🔒 Required | Borrow a book.                          |
| `GET`   | `/borrows/:userEmail` | 🔒 Required | Books borrowed by a user, newest first. |
| `PATCH` | `/borrows/:id`        | 🔒 Required | Return a borrowed book.                 |

---

## 📖 Usage Examples

### Add a book

```http
POST /books
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming",
  "image": "https://example.com/clean-code.jpg",
  "description": "A Handbook of Agile Software Craftsmanship.",
  "totalCopies": 80
}
```

> **Note** — `availableCopies` is a derived field. On creation the server always sets it equal to `totalCopies` and ignores any client-sent value.

### Update a book

```http
PATCH /books/:id
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "totalCopies": 10
}
```

> **Copy inventory rule** — when `totalCopies` changes, the server recalculates `availableCopies` as
> `newTotal − (copies currently borrowed)`. If that would go negative (fewer total copies than books
> currently out), the request is rejected with `400`:
>
> ```json
> {
>   "success": false,
>   "message": "Cannot set total copies to 10: 15 copies are currently borrowed. Total copies must be at least 15."
> }
> ```

### Borrow a book

```http
POST /borrows
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "bookId": "665f1a2b3c4d5e6f7890abcd",
  "bookTitle": "The Great Gatsby",
  "bookImage": "https://example.com/avatar.jpg",
  "bookAuthor": "Nazmul Hossain",
  "userEmail": "nazmulhossain@example.com"
}
```

The server automatically sets `borrowDate`, a `returnDate` **14 days ahead**, `status: "borrowed"`, and decrements `availableCopies`. It rejects the request with `409` if the user already has this book borrowed, and `400` if no copies are available.

### Return a book

```http
PATCH /borrows/:id
Authorization: Bearer <token>
```

Sets `status: "returned"`, stamps `returnedAt`, and increments `availableCopies` back.

---

## 🗃 Data Models

### `books` collection

| Field             | Type    | Notes                    |
| ----------------- | ------- | ------------------------ |
| `title`           | String  | —                        |
| `author`          | String  | —                        |
| `category`        | String  | —                        |
| `image`           | String  | Image URL                |
| `description`     | String  | —                        |
| `totalCopies`     | Integer | `≥ 1`                    |
| `availableCopies` | Integer | Derived — server-managed |
| `addedByEmail`    | String  | Owner of the listing     |
| `addedByImage`    | String  | Image URL                |
| `addedAt`         | Date    | Server timestamps        |
| `updatedAt`       | Date    | Server timestamps        |

### `borrows` collection

| Field        | Type                         | Notes                  |
| ------------ | ---------------------------- | ---------------------- |
| `bookId`     | String                       | Book ObjectId          |
| `bookTitle`  | String                       | —                      |
| `bookImage`  | String                       | Image URL              |
| `bookAuthor` | String                       | —                      |
| `userEmail`  | String                       | —                      |
| `borrowDate` | Date                         | Server timestamps      |
| `returnDate` | Date                         | `borrowDate + 14 days` |
| `returnedAt` | Date / null                  | Set on return          |
| `status`     | `"borrowed"` \| `"returned"` | —                      |

---

## ☁️ Deployment (Vercel)

The repo includes `vercel.json`, which routes every request to `index.js` via the `@vercel/node` builder:

1. Push this repository to GitHub.
2. Import it on [Vercel](https://vercel.com) as a Node.js project.
3. Add `MONGODB_URI` and `CLIENT_URL` in **Project Settings → Environment Variables**.
4. Deploy.

## 📜 License

This project is licensed under the **ISC** License — see [package.json](package.json#L12).
