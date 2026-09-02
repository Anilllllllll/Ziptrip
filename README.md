# Ziptrip Todo Application

---
<img width="1441" height="1090" alt="image" src="https://github.com/user-attachments/assets/eeed5459-e469-4e3f-b51e-da7b83b086c6" />

<img width="1107" height="948" alt="image" src="https://github.com/user-attachments/assets/af43deac-e295-4b74-9d60-8d3f2dc035cf" />



## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Data Model](#data-model)
6. [API Documentation](#api-documentation)
7. [How to Run the Application](#how-to-run-the-application)
8. [Data Storage Mechanism](#data-storage-mechanism)


---

## Project Overview

This project is a multi-page Todo application designed with clean code, minimal dependencies, and clear architecture. It allows users to manage their daily tasks, inspect individual task details via query parameter routing, filter tasks by status, and persist all changes in a local JSON storage file.

---

## Features

- **Create Todo**: Add a task with a required title and optional description.
- **View All Todos**: Display all tasks on the main `/todos` list page.
- **View Single Todo**: View dedicated details on `/todo?id=<id>` via query parameter routing.
- **Mark Complete / Undo**: Toggle completion state with immediate UI feedback and distinct strikethrough styling.
- **Delete Todo**: Remove a task with native browser confirmation dialog (`window.confirm`).
- **Filter Todos**: Instant client-side filtering by **All**, **Active**, and **Completed**.
- **Persistent JSON Storage**: All CRUD operations persist to `backend/data/todos.json` using Node's `fs` module.
- **Loading & Error Handling**: User-friendly loading indicators and error states on both pages.
- **Responsive UI**: Clean vanilla CSS layout optimized for both desktop and mobile screens.

---

## Technology Stack

### Frontend
- **React (v18)**: Component-based user interface.
- **Vite**: Ultra-fast build tool and dev server.
- **React Router (v6)**: Multi-page client-side routing.
- **Fetch API**: Native browser HTTP client (no Axios dependency).
- **CSS3**: Custom vanilla stylesheet with CSS variables.

### Backend
- **Node.js**: Server runtime environment.
- **Express.js**: Minimal web framework for REST API routing and middleware.
- **CORS**: Cross-Origin Resource Sharing middleware for frontend-backend communication.
- **Node File System (`fs`)**: Built-in module for synchronous JSON file reading and writing.

---

## Project Structure

```text
todo-application/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TodoItem.jsx       # Individual todo item card with action buttons
│   │   │   └── TodoForm.jsx       # Controlled form component to create new todos
│   │   │
│   │   ├── pages/
│   │   │   ├── Todos.jsx          # Main page: list, filter, create, toggle, delete
│   │   │   └── TodoDetails.jsx    # Details page: fetches todo using ?id=<id>
│   │   │
│   │   ├── App.jsx                # Application routing configuration
│   │   ├── main.jsx               # React entry point with BrowserRouter
│   │   └── index.css              # Vanilla CSS stylesheet
│   │
│   ├── index.html                 # Frontend HTML shell
│   ├── vite.config.js             # Vite configuration
│   ├── package.json               # Frontend dependencies & scripts
│   └── README.md                  # Frontend documentation
│
├── backend/
│   ├── controllers/
│   │   └── todoController.js     # Controller handling CRUD logic & file I/O
│   │
│   ├── routes/
│   │   └── todoRoutes.js         # Express router endpoints
│   │
│   ├── data/
│   │   └── todos.json            # Persistent JSON data storage
│   │
│   ├── server.js                 # Express server configuration & startup
│   ├── package.json              # Backend dependencies & scripts
│   └── README.md                 # Backend documentation
│
├── README.md                      # Root documentation
└── .gitignore                     # Git ignore rules
```

---

## Data Model

Each Todo item conforms to the following schema:

```json
{
  "id": 1,
  "title": "Learn React",
  "description": "Practice React components and routing",
  "completed": false,
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `Number` | Unique auto-incrementing integer identifier |
| `title` | `String` | Required title describing the task |
| `description` | `String` | Optional supplementary details |
| `completed` | `Boolean` | `true` if completed, `false` otherwise |
| `createdAt` | `String` | ISO 8601 UTC timestamp of creation |

---

## API Documentation

Base URL: `http://localhost:5000/api/todos`

### 1. Get All Todos
- **Endpoint**: `GET /api/todos`
- **Purpose**: Retrieve all stored todos.
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
- **Endpoint**: `GET /api/todos/:id`
- **Purpose**: Retrieve a single todo by its numeric ID.
- **Response**: `200 OK` (if found)
```json
{
  "id": 1,
  "title": "Learn React",
  "description": "Practice React components and routing",
  "completed": false,
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```
- **Error Response**: `404 Not Found`
```json
{
  "message": "Todo not found"
}
```

---

### 3. Create a Todo
- **Endpoint**: `POST /api/todos`
- **Purpose**: Create and persist a new todo.
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
- **Error Response**: `400 Bad Request` (when title is missing)
```json
{
  "message": "Title is required"
}
```

---

### 4. Update a Todo
- **Endpoint**: `PUT /api/todos/:id`
- **Purpose**: Update `completed`, `title`, or `description` of an existing todo.
- **Request Body** (example: toggle completion):
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
- **Error Response**: `404 Not Found` (when todo does not exist)
```json
{
  "message": "Todo not found"
}
```

---

### 5. Delete a Todo
- **Endpoint**: `DELETE /api/todos/:id`
- **Purpose**: Delete a todo by its ID.
- **Response**: `200 OK`
```json
{
  "message": "Todo deleted successfully"
}
```
- **Error Response**: `404 Not Found` (when todo does not exist)
```json
{
  "message": "Todo not found"
}
```

---

## How to Run the Application

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

---

### Step 1: Start the Backend Server

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

The backend server will run on: **`http://localhost:5000`**

---

### Step 2: Start the Frontend Application

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on: **`http://localhost:5173`**

Open your browser and navigate to `http://localhost:5173`.

---

