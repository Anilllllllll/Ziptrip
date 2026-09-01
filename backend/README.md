# Backend - Todo API

Express.js RESTful API service for the Todo application using JSON file persistence.

---

## Purpose

The backend server manages the Todo data lifecycle by providing CRUD (Create, Read, Update, Delete) HTTP APIs. It handles request validation, error handling, CORS headers for the frontend, and persists todos directly into a local JSON file without requiring a database server.

---

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, minimalist web framework for routing and middleware.
- **CORS (`cors`)**: Middleware to allow cross-origin requests from the React frontend running on `http://localhost:5173`.
- **Node `fs` (File System)**: Built-in Node.js module used to read and write persistent data to `backend/data/todos.json`.

---

## Project Structure

```text
backend/
├── controllers/
│   └── todoController.js   # API business logic and JSON file operations
├── routes/
│   └── todoRoutes.js       # Express route definitions
├── data/
│   └── todos.json          # Persistent JSON storage file
├── server.js               # Application entry point, middleware, & server bootstrap
├── package.json            # Node.js dependencies and scripts
└── README.md               # Backend documentation
```

---

## Installation & Setup

1. Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

---

## Running the Backend

### Development Mode (with auto-reload)

```bash
npm run dev
```

Uses Node's built-in `--watch` flag to restart the server on file changes.

### Production / Standard Mode

```bash
npm start
```

The server starts on:
```text
http://localhost:5000
```

---

## API Endpoints

### 1. Get All Todos
- **URL**: `GET /api/todos`
- **Description**: Returns a list of all stored todos.
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Learn React",
    "description": "Practice React components and routing",
    "completed": false,
    "createdAt": "2026-09-01T10:00:00.000Z"
  }
]
```

---

### 2. Get Single Todo by ID
- **URL**: `GET /api/todos/:id`
- **Description**: Returns details of a specific todo by its numeric ID.
- **Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Learn React",
  "description": "Practice React components and routing",
  "completed": false,
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```
- **Error Response**: `404 Not Found` if the ID does not exist:
```json
{
  "message": "Todo not found"
}
```

---

### 3. Create a Todo
- **URL**: `POST /api/todos`
- **Description**: Validates input, generates an auto-increment ID, sets `completed: false` and `createdAt`, and appends the todo to `todos.json`.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Learn Node.js",
  "description": "Practice Express CRUD APIs"
}
```
- **Response**: `201 Created`
```json
{
  "id": 2,
  "title": "Learn Node.js",
  "description": "Practice Express CRUD APIs",
  "completed": false,
  "createdAt": "2026-09-01T11:00:00.000Z"
}
```
- **Error Response**: `400 Bad Request` if `title` is missing or empty:
```json
{
  "message": "Title is required"
}
```

---

### 4. Update a Todo
- **URL**: `PUT /api/todos/:id`
- **Description**: Updates the properties (`title`, `description`, or `completed`) of an existing todo.
- **Request Headers**: `Content-Type: application/json`
- **Request Body** (partial or full updates allowed):
```json
{
  "completed": true
}
```
- **Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Learn React",
  "description": "Practice React components and routing",
  "completed": true,
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```
- **Error Response**: `404 Not Found` if todo does not exist:
```json
{
  "message": "Todo not found"
}
```

---

### 5. Delete a Todo
- **URL**: `DELETE /api/todos/:id`
- **Description**: Removes the specified todo from `todos.json`.
- **Response**: `200 OK`
```json
{
  "message": "Todo deleted successfully"
}
```
- **Error Response**: `404 Not Found` if todo does not exist:
```json
{
  "message": "Todo not found"
}
```

---

## Data Storage Explanation

- All todos are stored in `backend/data/todos.json`.
- The controller uses Node.js `fs.readFileSync` and `fs.writeFileSync` to read and write the JSON file on each operation.
- This ensures persistence across server restarts without the overhead of an external database engine.
