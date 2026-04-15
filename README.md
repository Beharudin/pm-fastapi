# SaaS Project Management API

A high-performance, async FastAPI-based API for project management workflows. Built with PostgreSQL, JWT authentication, role-based access control, WebSocket real-time updates, file attachments, and email notifications.

## Features

- **User Management**: Registration, login, and role-based permissions (Admin, Manager, Member)
- **Project Management**: Create and manage projects with ownership
- **Task Management**: Full CRUD operations with status tracking, hierarchies, time tracking, and assignments
- **File Attachments**: Upload files to tasks asynchronously
- **Real-Time Updates**: WebSocket support for live task changes
- **Email Notifications**: Background email notifications for task events
- **Rate Limiting**: Built-in protection against abuse
- **Containerized Deployment**: Docker support for easy deployment

## Tech Stack

- **Backend**: FastAPI (async Python framework)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-Time**: WebSockets
- **Email**: SMTP with FastAPI-Mail
- **Rate Limiting**: SlowAPI
- **Deployment**: Docker

## Installation

### Prerequisites

- Python 3.11+
- PostgreSQL database
- Git

### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd pm-app
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv myenv
   myenv\Scripts\activate  # On Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values:
     ```env
     DATABASE_URL=postgresql://username:password@localhost:5432/pm_db
     JWT_SECRET=your-super-secret-key
     MAIL_USERNAME=your-email@gmail.com
     MAIL_PASSWORD=your-app-password
     ```

5. **Run database migrations** (optional, tables auto-create):
   ```bash
   alembic upgrade head
   ```

## Usage

### Running the Application

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation.

### Key Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

#### Projects
- `POST /projects` - Create project (Admin/Manager only)
- `GET /projects` - List projects

#### Tasks
- `POST /tasks` - Create task
- `GET /tasks` - List tasks
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task
- `POST /tasks/{task_id}/upload` - Upload file to task

#### Users
- `GET /users` - List users
- `GET /users/{user_id}` - Get user by ID

#### WebSocket
- `ws://localhost:8000/ws/tasks?token=YOUR_JWT_TOKEN` - Real-time updates

## Docker Deployment

### Run only the backend

1. **Build the backend image**:
   ```bash
   docker build -t pm-api .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8000:8000 --env-file .env pm-api
   ```

### Run backend and frontend together with Docker Compose

1. **Make sure your `.env` file contains the required values**.
2. **Start both services**:
   ```bash
   docker compose up --build
   ```

3. **Open the apps**:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5173`

If you want to stop both services, use:
```bash
docker compose down
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | 30 |
| `MAIL_SERVER` | SMTP server | smtp.gmail.com |
| `MAIL_PORT` | SMTP port | 587 |
| `MAIL_USERNAME` | Email username | Required for email |
| `MAIL_PASSWORD` | Email password | Required for email |
| `MAIL_STARTTLS` | Use STARTTLS | True |
| `MAIL_SSL_TLS` | Use SSL/TLS | False |

## Project Structure

```
pm-app/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── .env.example          # Environment template
├── core/                 # Core functionality
│   ├── config.py         # Settings management
│   ├── database.py       # Database connection
│   ├── security.py       # Auth & security
│   └── websocket_manager.py # WebSocket handling
├── models/               # Database models
├── schemas/              # Pydantic schemas
├── routes/               # API endpoints
├── services/             # Business logic
├── dependencies/         # Shared dependencies
└── uploads/              # File storage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.