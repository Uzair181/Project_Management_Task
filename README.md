# Project Task Management Dashboard

A modern Project and Task Management Dashboard built with:

- React.js
- Next.js
- TypeScript
- Material UI
- Tailwind CSS
- Redux Toolkit
- Axios

## Features

### Authentication

- Login page
- Registration page
- Forgot password page
- Form validation with Zod + React Hook Form
- Error handling
- Responsive layouts
- Mock authentication with token storage

### Dashboard

- Total Projects
- Total Tasks
- Completed Tasks
- Pending Tasks
- Responsive statistic cards
- Analytics charts using Recharts

### Project Management

- Create project
- Edit project
- Delete project
- View all projects
- Project name, description, status, and created date

### Task Management

- Add task
- Edit task
- Delete task
- Change task status
- Assign task to user
- Task title, description, priority, due date, assigned user, status

### UI/UX

- Modern responsive interface
- Dark and light mode
- Shared loading states
- Branded app loaders
- Loading buttons with BeatLoader-style animation
- Error boundary for runtime failures

## Folder Structure

```txt
src/
  app/              Next.js app router pages and layouts
  components/       Reusable UI and feature components
  contexts/         Theme provider
  lib/              Mock APIs, storage helpers, utilities, and types
  store/            Redux Toolkit store, hooks, and slices
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Environment Variables

No environment variables are required for the current mock-data implementation.

If you later connect a real backend, add your values to `.env.local` and read them from `process.env` in your API layer.

Example:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

## Notes

- Authentication uses mock API logic and localStorage token handling.
- Dashboard data is loaded from mock API endpoints.
- Charts and task/project CRUD are powered by Redux Toolkit and Axios.
- A global error boundary and route-level loading screens are included.
