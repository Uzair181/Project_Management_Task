# Flowboard — Project & Task Management Dashboard

A full-featured, production-ready project and task management dashboard built with Next.js 15, TypeScript, Redux Toolkit, Material UI, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| State Management | Redux Toolkit |
| UI Components | Material UI v6 |
| Styling | Tailwind CSS |
| Forms & Validation | React Hook Form + Zod |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |

---

## Features

### Authentication

- **Login** — email + password form with inline validation. Pre-filled demo credentials for quick access.
- **Register** — creates a new `member` role account in the in-memory user store. Duplicate email check included.
- **Forgot Password** — validates email exists and returns a success message (simulated).
- **Session Hydration** — on app load, `hydrateAuth` reads the stored token from `localStorage` and restores the session automatically.
- **Sign Out** — clears the auth token from `localStorage` and redirects to `/login`.
- **Route Protection** — the dashboard layout redirects unauthenticated users to `/login` before rendering any protected page.
- **Form validation** — all auth forms use Zod schemas enforced through `react-hook-form` with `zodResolver`.

**Demo credentials**
```
Email:    ayesha@example.com
Password: password123
```

---

### Auth Storage (`src/lib/storage.ts`)

A thin `localStorage` wrapper that is SSR-safe (checks `typeof window` before access).

| Export | Key | Purpose |
|---|---|---|
| `authStorage.read()` | `ptmd_auth` | Returns `{ token, user }` or `null` |
| `authStorage.write(payload)` | `ptmd_auth` | Persists token + user object |
| `authStorage.clear()` | `ptmd_auth` | Removes auth entry on sign out |
| `projectStorage.read(fallback)` | `ptmd_projects` | Generic project cache read |
| `projectStorage.write(value)` | `ptmd_projects` | Generic project cache write |
| `taskStorage.read(fallback)` | `ptmd_tasks` | Generic task cache read |
| `taskStorage.write(value)` | `ptmd_tasks` | Generic task cache write |

All reads use `JSON.parse` inside a `try/catch` so corrupt storage never crashes the app.

---

### Dashboard

- **4 KPI Cards** — Total Projects, Total Tasks, Completed Tasks, Pending Tasks. Counts are derived live from Redux state.
- **Project Status Breakdown** — bar chart showing count of Active / On Hold / Completed projects.
- **Task Progress Trend** — line chart comparing completed vs open tasks across status stages.
- Charts are built with Recharts and are fully responsive via `ResponsiveContainer`.

---

### Project Management (`/projects`)

| Action | Details |
|---|---|
| **View** | All projects listed in a sortable table (newest first by `createdAt`) |
| **Create** | Dialog form — Name, Description, Status (Active / On Hold / Completed) |
| **Edit** | Same dialog pre-filled with existing values |
| **Delete** | Confirmation dialog before deletion. Deleting a project also deletes all its associated tasks via the API |
| **Validation** | Name ≥ 2 chars, Description ≥ 5 chars, Status required |

**Project fields:** `id`, `name`, `description`, `status`, `createdAt`

---

### Task Management (`/tasks`)

| Action | Details |
|---|---|
| **View** | All tasks in a horizontally scrollable table sorted by due date (earliest first) |
| **Add** | Dialog form — Title, Description, Priority, Due Date, Assigned User, Status, Project |
| **Edit** | Same dialog pre-filled with existing values |
| **Delete** | Confirmation dialog before deletion |
| **Validation** | Title ≥ 2 chars, Description ≥ 5 chars, Priority required, Due Date required, Assigned User required |

**Task fields:** `id`, `title`, `description`, `priority` (Low / Medium / High), `dueDate`, `assignedUserId`, `status` (Todo / In Progress / Completed), `projectId` (optional)

---

### Users

- Users are loaded once at dashboard boot and stored in Redux (`usersSlice`).
- Used to populate the "Assigned User" dropdown in the Task form and to resolve user names in the task table.
- 3 seed users: **Ayesha Khan** (admin), **Bilal Ahmed** (manager), **Sara Malik** (member).

---

### Mock API (`src/lib/mock-api.ts`)

All API calls go through a single file that either hits a remote MockAPI endpoint or runs local logic.

| Function | Method | Endpoint / Logic |
|---|---|---|
| `loginRequest` | Local | Checks in-memory user list, returns `{ token, user }` |
| `registerRequest` | Local | Adds user to in-memory list, checks for duplicate email |
| `forgotPasswordRequest` | Local | Validates email exists, returns success message |
| `logoutRequest` | Local | Clears `authStorage` |
| `fetchSession` | Local | Reads `authStorage`, throws 401 if no token |
| `fetchUsers` | Local | Returns sanitized in-memory user list |
| `fetchProjects` | `GET /Projects` | Remote MockAPI, normalized to `Project` shape |
| `createProjectRequest` | `POST /Projects` | Remote MockAPI |
| `updateProjectRequest` | `PUT /Projects/:id` | Remote MockAPI |
| `deleteProjectRequest` | `DELETE /Projects/:id` | Remote MockAPI — also deletes related tasks |
| `fetchTasks` | `GET /Tasks` | Remote MockAPI, normalized to `Task` shape |
| `createTaskRequest` | `POST /Tasks` | Remote MockAPI |
| `updateTaskRequest` | `PUT /Tasks/:id` | Remote MockAPI |
| `deleteTaskRequest` | `DELETE /Tasks/:id` | Remote MockAPI |

All requests require a valid token via `requireAuth()`. Remote responses are normalized from the API's field naming convention (e.g. `Name`, `CreatedAt`, `due_date`) to the app's internal types.

---

### Redux Store (`src/store/`)

```
store/
  index.ts              configureStore — combines all reducers + listener middleware
  hooks.ts              useAppDispatch / useAppSelector typed hooks
  listeners.ts          Side-effect middleware (toast notifications for mutations)
  notificationsSlice.ts Toast queue (enqueue / dequeue)
  slices/
    authSlice.ts        Auth state — user, token, loading, error, hydrated
    projectsSlice.ts    Projects CRUD state
    tasksSlice.ts       Tasks CRUD state + removeTasksByProjectId
    usersSlice.ts       Users list state
```

**Listener middleware** fires success toast notifications only for user-triggered mutations:

| Action | Toast |
|---|---|
| `addProject.fulfilled` | "Project created successfully." |
| `editProject.fulfilled` | "Project updated successfully." |
| `removeProject.fulfilled` | "Project deleted successfully." |
| `addTask.fulfilled` | "Task created successfully." |
| `editTask.fulfilled` | "Task updated successfully." |
| `removeTask.fulfilled` | "Task deleted successfully." |
| Any mutation `.rejected` | Error message from API or fallback |

Background data loads (`loadProjects`, `loadTasks`, `loadUsers`) and auth actions are **silent** — no toasts fired.

---

### UI Shell (`src/components/AppShell.tsx`)

- **Sticky topbar** — fixed height, theme toggle, user info card (desktop), hamburger menu (mobile).
- **Sticky sidebar** — logo/brand block, nav links (Dashboard, Projects, Tasks), sign out button in red.
- **Scrollable content** — only the `<main>` area scrolls; topbar and sidebar never move.
- **Mobile drawer** — slides in from the left with the same nav links and user info card.
- **Responsive** — sidebar collapses to a drawer below `768px`.
- **Theme** — light/dark toggle in the topbar, persisted via `ThemeContext`.

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/              Login, Register, Forgot Password pages
│   ├── (dashboard)/         Dashboard, Projects, Tasks pages + layout guard
│   ├── layout.tsx           Root layout — wraps everything in AppProviders
│   └── page.tsx             Root redirect — sends to /dashboard or /login
├── components/
│   ├── AppShell.tsx         Topbar + sidebar layout shell
│   ├── auth/                AuthFrame, LoginForm, RegisterForm, ForgotPasswordForm
│   ├── dashboard/           DashboardStats, AnalyticsSection
│   ├── management/          ProjectDialog, TaskDialog
│   ├── providers/           AppProviders (Redux, MUI theme, Toast host, Auth hydration)
│   └── ui/                  ConfirmDialog, Loaders, ToastHost
├── contexts/
│   └── ThemeContext.tsx      Light/dark theme state
├── lib/
│   ├── mock-api.ts           All API functions
│   ├── mock-data.ts          Seed users, projects, tasks
│   ├── storage.ts            localStorage helpers
│   ├── types.ts              Shared TypeScript types
│   └── utils.ts              Utility helpers
├── store/
│   ├── index.ts
│   ├── hooks.ts
│   ├── listeners.ts
│   ├── notificationsSlice.ts
│   └── slices/               authSlice, projectsSlice, tasksSlice, usersSlice
└── types/
    └── global.d.ts
```

---

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

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/login` automatically.

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

No environment variables are required. The app uses a remote MockAPI instance configured directly in `src/lib/mock-api.ts`.

To point at your own backend, replace `MOCK_API_BASE_URL` and update the request/response normalization functions accordingly.

---

## Seed Data

| User | Email | Password | Role |
|---|---|---|---|
| Ayesha Khan | ayesha@example.com | password123 | admin |
| Bilal Ahmed | bilal@example.com | password123 | manager |
| Sara Malik | sara@example.com | password123 | member |
