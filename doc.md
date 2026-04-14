# SaaS Project Management API - Complete File Explanations

This document provides a detailed, beginner-friendly explanation of every file and module in the FastAPI-based SaaS Project Management API project. It covers **why** each file exists, **what** it does, **how** the code works, and **why** specific choices were made.

Think of this as a guided tour: the project is like a restaurant, where `main.py` is the front door, `routes/` are the menus, `models/` are the recipes, `services/` are the chefs, and so on.

## Root Directory Files

These are the entry points and configuration files at the project's top level.

### `main.py` (The "Front Door" of Your App)

**Why this file?** This is the starting point of your FastAPI application. Every web app needs a "main" file to launch the server and define the overall app structure. Without it, nothing runs.

**What it does:**
- Imports all the necessary parts (like routers for different features).
- Sets up the FastAPI app with a title.
- Adds middleware for rate limiting (to prevent too many requests from one user, like a bouncer at a club).
- Creates database tables automatically (using SQLAlchemy).
- Includes all the "routers" (like menus for different pages/endpoints).
- Defines a simple root endpoint (`/`) that returns a welcome message.

**Why this logic?**
- `from fastapi import FastAPI`: FastAPI is the framework for building the API. It's async-friendly and auto-generates docs.
- `Limiter` and middleware: Protects against abuse (e.g., someone spamming your API). `get_remote_address` identifies users by IP.
- `Base.metadata.create_all(bind=engine)`: Creates database tables if they don't exist. This is common in development but risky in production (use migrations instead).
- `app.include_router(...)`: Each router handles a group of endpoints (e.g., auth for login). It's modular, so you can add/remove features easily.
- `@app.get("/")`: A basic "hello world" endpoint. FastAPI uses decorators like `@app.get` to define routes.

**Beginner tip:** Run `uvicorn main:app --reload` to start the server. Visit `http://localhost:8000/docs` for auto-generated API docs.

### `requirements.txt` (The Shopping List)

**Why this file?** Python projects need external libraries (like ingredients for a recipe). This file lists them so anyone can install them with `pip install -r requirements.txt`. Without it, the app won't work.

**What it does:** Lists all dependencies, grouped by category (e.g., core FastAPI stuff, database, auth).

**Why these modules?**
- `fastapi`: The main framework for building APIs. It's fast, async, and beginner-friendly compared to Flask/Django.
- `uvicorn[standard]`: The server to run FastAPI. "Standard" includes extras like WebSocket support.
- `python-multipart`: Handles file uploads (needed for task attachments).
- `sqlalchemy`: ORM (Object-Relational Mapper) for database interactions. Makes SQL queries feel like Python code.
- `psycopg[binary]`: PostgreSQL driver. "Binary" means it includes pre-compiled parts for speed.
- `alembic`: For database migrations (changing table structures safely).
- `python-jose[cryptography]`: For JWT (JSON Web Tokens) auth. Secure way to handle logins.
- `passlib[bcrypt]`: Password hashing. "Bcrypt" is a secure algorithm to store passwords safely.
- `python-dotenv`: Loads environment variables from `.env` (keeps secrets out of code).
- `pydantic`: Data validation. Ensures incoming data (e.g., user input) matches expected formats.
- `httpx`: HTTP client for making requests (used in optional features).
- `aiofiles`: Async file handling (for uploads without blocking the server).
- `slowapi`: Rate limiting library.
- `fastapi-mail`: For sending emails (notifications).

**Beginner tip:** Always update this file when adding new libraries. It's like updating your grocery list.

### `Dockerfile` (Container Recipe)

**Why this file?** For containerized deployment (running the app in a portable "box" with Docker). Makes it easy to deploy anywhere without worrying about the host machine's setup.

**What it does:** Defines steps to build a Docker image.
- Uses Python 3.11 slim (lightweight base).
- Copies and installs requirements.
- Copies code.
- Creates an uploads folder.
- Runs the app on port 8000.

**Why this logic?** Docker isolates the app, ensuring it runs the same everywhere. `EXPOSE 8000` tells Docker to open that port.

### `.env` and `.env.example` (Secret Storage)

**Why these files?** Store sensitive config (like database passwords) outside the code. `.env` is real values; `.env.example` is a template.

**What they do:** `python-dotenv` loads them into the app.

**Why these fields?**
- `DATABASE_URL`: Tells SQLAlchemy where the database is.
- JWT settings: For secure tokens.
- Email settings: For SMTP (sending emails via Gmail).

**Beginner tip:** Never commit `.env` to Git—use `.env.example` as a guide.

## `core/` Directory (The App's "Brain")

Core logic and setup.

### `config.py` (Settings Manager)

**Why this file?** Centralizes all app settings. Makes it easy to change things without editing multiple files.

**What it does:** Loads env vars into a `Settings` class.

**Why this logic?**
- `os.getenv()`: Gets values from `.env` with defaults.
- Class-based: Pydantic validates types (e.g., ensures `MAIL_PORT` is a number).

### `database.py` (Database Connection)

**Why this file?** Sets up the database connection. Every app with data needs this.

**What it does:** Creates SQLAlchemy engine and session.

**Why this logic?**
- `create_engine`: Connects to PostgreSQL.
- `sessionmaker`: Creates sessions for database operations.
- `get_db`: Dependency for routes (provides a DB session that auto-closes).

**Beginner tip:** PostgreSQL is used because it's robust for production. In dev, you could use SQLite.

### `security.py` (Password & Token Handling)

**Why this file?** Handles security: hashing passwords and creating/verifying JWTs.

**What it does:**
- `hash_password`: Makes passwords unreadable.
- `verify_password`: Checks logins.
- `create_access_token`: Generates JWTs with expiration.
- `decode_token`: Verifies JWTs.

**Why this logic?**
- `bcrypt`: Secure hashing (slow on purpose to prevent brute-force attacks).
- JWT: Stateless tokens (no server-side storage needed).
- `datetime.timedelta`: For token expiration.

### `websocket_manager.py` (Real-Time Manager)

**Why this file?** Manages WebSocket connections for real-time updates.

**What it does:** Tracks connected clients and broadcasts messages.

**Why this logic?**
- `active_connections`: List of WebSocket objects.
- `broadcast`: Sends JSON to all connected users (e.g., "Task updated").

## `models/` Directory (Data Blueprints)

Define what data looks like in the database.

### `base.py` (Base Model)

**Why this file?** Provides a common base for all database models.

**What it does:** Inherits from SQLAlchemy's `DeclarativeBase`.

**Why this logic?** Allows shared behavior (e.g., timestamps) across models.

### `enums.py` (Role Definitions)

**Why this file?** Defines user roles as an enum (fixed choices).

**What it does:** `RoleEnum` with admin, manager, member.

**Why this logic?** Enums prevent typos and ensure consistency.

### `user.py` (User Data)

**Why this file?** Defines the User table.

**What it does:** Fields like email, password, role.

**Why this logic?**
- `unique=True`: Prevents duplicate emails.
- `Enum(RoleEnum)`: Restricts roles.

### `project.py` (Project Data)

**Why this file?** Defines the Project table.

**What it does:** Name and owner.

**Why this logic?** Simple: projects belong to users.

### `task.py` (Task Data)

**Why this file?** Defines the Task table with hierarchies and time tracking.

**What it does:** Title, description, status, timestamps, parent_id (for hierarchies), etc.

**Why this logic?**
- `parent_id`: Self-referencing foreign key for nested tasks.
- `DateTime`: For tracking creation/update times.
- `Float`: For estimated hours.

## `schemas/` Directory (Data Validators)

Pydantic models for API input/output.

### `auth.py`, `project.py`, `task.py`, `user.py`

**Why these files?** Validate and serialize data for APIs. Ensures safe input and consistent output.

**What they do:** Define request/response shapes (e.g., `TaskCreate` for new tasks).

**Why this logic?**
- `BaseModel`: Pydantic's validator.
- `Optional`: Fields that can be missing.
- `from_attributes`: Converts SQLAlchemy models to Pydantic.

## `routes/` Directory (API Endpoints)

Define the API "routes" (URLs).

### `auth.py` (Login/Signup)

**Why this file?** Handles authentication endpoints.

**What it does:** Register, login, get current user.

**Why this logic?**
- `oauth2`: Bearer token scheme.
- `get_current_user`: Dependency to check auth.

### `projects.py` (Project Management)

**Why this file?** CRUD for projects.

**What it does:** Create projects (with role checks).

**Why this logic?** `require_roles`: RBAC ensures only admins/managers can create.

### `tasks.py` (Task Management)

**Why this file?** CRUD for tasks, with uploads and notifications.

**What it does:** Create/update/delete tasks, upload files, broadcast changes, send emails.

**Why this logic?**
- `BackgroundTasks`: Runs email sending in the background (non-blocking).
- `aiofiles`: Async file saving.
- `broadcast`: Real-time updates via WebSocket.

### `users.py` (User Management)

**Why this file?** List users and get by ID.

**What it does:** Simple user queries.

### `websocket.py` (Real-Time Connection)

**Why this file?** WebSocket endpoint for live updates.

**What it does:** Authenticates via token, echoes messages, manages connections.

**Why this logic?**
- `Query(token)`: Gets token from URL.
- `decode_token`: Verifies user.
- `while True`: Keeps connection alive.

## `services/` Directory (Business Logic)

Reusable functions for complex operations.

### `auth_service.py`, `project_service.py`, etc.

**Why these files?** Separate logic from routes. Keeps code clean.

**What they do:** Handle DB operations (e.g., create_task).

**Why this logic?** Functions like `create_task` are reusable and testable.

### `email_service.py` (Email Sender)

**Why this file?** Sends notifications.

**What it does:** Configures SMTP and sends HTML emails.

**Why this logic?**
- `ConnectionConfig`: FastAPI-Mail setup.
- `send_notification_email`: Async email sending.

## `dependencies/` Directory (Shared Dependencies)

Reusable route dependencies.

### `auth.py` (Auth Dependency)

**Why this file?** Provides `get_current_user` for routes.

**What it does:** Extracts and verifies JWT.

### `rbac.py` (Role Checks)

**Why this file?** Checks user roles.

**What it does:** `require_roles`: Raises error if unauthorized.

**Why this logic?** Decouples auth from business rules.

## `uploads/` Directory

**Why this directory?** Stores uploaded files (e.g., task attachments).

**What it does:** Created dynamically; files saved here.

**Why?** Keeps files organized and accessible.

## Getting Started

1. Install dependencies: `pip install -r requirements.txt`
2. Set up `.env` from `.env.example`
3. Run the server: `uvicorn main:app --reload`
4. Visit `http://localhost:8000/docs` for API docs

This project is a solid foundation for a SaaS app. Start with `main.py`, then explore routes for API testing. If you have questions on any part, refer back here!