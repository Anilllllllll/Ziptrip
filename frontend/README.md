# Frontend - Todo Application

A simple, fast, and responsive React frontend built with Vite and React Router.

---

## Purpose

Provides a clean multi-page user interface for managing daily tasks:
- **Todo List Page (`/todos`)**: View all todos, filter by completion status (All, Active, Completed), create new todos, toggle status (Complete/Undo), and delete todos.
- **Todo Details Page (`/todo?id=<id>`)**: View a single todo with title, description, status, and creation date, extracted using query parameters.

---

## Technologies Used

- **React (v18)**: UI library for building component-based interfaces.
- **JavaScript (ES6+)**: Language for logic and event handling.
- **Vite**: Modern, ultra-fast frontend build tool and development server.
- **React Router (v6)**: Client-side routing to manage page transitions (`/todos`, `/todo?id=1`).
- **Fetch API**: Native browser HTTP client for backend REST API communication.
- **CSS3**: Custom vanilla CSS for clean, responsive design without heavy UI frameworks.

---

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── TodoItem.jsx     # Card component for rendering single todo with action buttons
│   │   └── TodoForm.jsx     # Form component to create new todos
│   │
│   ├── pages/
│   │   ├── Todos.jsx        # Main page: list, filter, create, toggle, delete
│   │   └── TodoDetails.jsx  # Details page: fetches and displays todo via query param (?id=)
│   │
│   ├── App.jsx              # Routing configuration
│   ├── main.jsx             # React DOM root setup with BrowserRouter
│   └── index.css            # Clean, responsive CSS design system
│
├── index.html               # Single HTML shell with viewport and title
├── vite.config.js           # Vite configuration
├── package.json             # Frontend dependencies and scripts
└── README.md                # Frontend documentation
```

---

## Installation & Setup

1. Open a terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

---

## Running the Frontend

Start the Vite development server:

```bash
npm run dev
```

The application will be accessible at:
```text
http://localhost:5173
```

---

## Routes

| Route | Component | Description |
|---|---|---|
| `/` | `Navigate` | Automatically redirects to `/todos` |
| `/todos` | `Todos.jsx` | Main todo list, creation form, and status filters |
| `/todo?id=<id>` | `TodoDetails.jsx` | Single todo inspection page reading `id` query parameter |

---

## Backend API Dependency

The frontend connects directly to the Express backend running on:
```text
http://localhost:5000/api/todos
```
Make sure the backend server is running before launching the frontend.
