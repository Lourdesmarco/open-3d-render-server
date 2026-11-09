# 🎬 Open 3D Render Server

A modular, cross-platform, software-agnostic render farm platform designed to automate and distribute 3D and 2D rendering tasks (`.blend`, `.c4d`, `.ma`/`.mb`, `.aep`).

Built with a **Factory / Adapter Pattern** architecture in the backend and a modern React frontend, Open 3D Render Server enables connecting multiple render nodes (workers) to process render queues asynchronously with centralized user and role management.

## 🚀 Key Features

* 🔄 **Multi-Engine Support (Software-Agnostic):** Native, extensible support for major industry suites using dedicated adapters:
  * **Blender** (`.blend`)
  * **Cinema 4D** (`.c4d`)
  * **Autodesk Maya / Arnold** (`.ma`, `.mb`)
  * **Adobe After Effects** (`.aep`)
* 🔍 **Automated Executable Discovery:** Cross-platform path resolution across system environment variables (`PATH`), standard installation paths (macOS, Windows, Linux), or explicit configuration overrides.
* ⚡ **Distributed Architecture:** Decoupled dispatcher with isolated background worker processes for non-blocking asynchronous execution.
* 🛡️ **Administration & Security:**
  * Complete user management with granular roles (`admin` / `student`).
  * Secure authentication powered by **JWT** (JSON Web Tokens).
  * Admin safeguards (prevention of self-deletion and self-role demotion).
* 🎨 **Modern React UI:** Dark-mode interface featuring instant file-extension validation, assigned engine detection badges, and smooth state transitions.

## 🛠️ System Architecture

```text
[ React Frontend ] ──(REST API + JWT)──> [ FastAPI Backend ]
                                                 │
                                         (Factory Pattern)
                                                 │
                                     [ BaseRenderEngine ]
                                ┌─────────┬──────┴──┬─────────┐
                                ▼         ▼         ▼         ▼
                             Blender     C4D      Maya     AfterFx
                                │         │         │         │
                                └─────────┴──┬──────┴─────────┘
                                             ▼
                                     [ Worker Process ] ──> Output Media
```

## 📋 Prerequisites

* **Python:** `3.10` or higher
* **Node.js:** `18.0` or higher (for frontend development and build)
* **Render Engines (At least one):**
  * Blender installed locally or on worker node hosts.
  * Cinema 4D, Autodesk Maya, or After Effects (optional based on pipeline needs).

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the `backend/` root folder based on the following template:

```env
# Security & Authentication
JWT_SECRET_KEY="your_generated_secret_key_here"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Connection
DATABASE_URL="sqlite:///./render_farm.db"

# Render Engine Executables (Optional - leave empty for automatic PATH discovery)
BLENDER_EXECUTABLE=""
C4D_EXECUTABLE=""
MAYA_EXECUTABLE=""
AFTER_EFFECTS_EXECUTABLE=""
```

> 🔑 **Security Tip:** Generate a cryptographic key for `JWT_SECRET_KEY` using Python:
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(48))"
> ```

## 🚀 Installation & Running

### 1. Clone the repository

```bash
git clone https://github.com/Lourdesmarco/open-3d-render-server.git
cd open-3d-render-server
```

### 2. Configure and start Backend API

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# (Optional) Export executable path directly
export BLENDER_EXECUTABLE="/Applications/Blender.app/Contents/MacOS/Blender"

# Start the API server
cd backend
python run.py
```

### 3. Launch the Render Worker

Open a **new terminal window** to start the background worker process:

```bash
source .venv/bin/activate
cd backend
python -m app.worker
```

### 4. Start the Frontend Application

In another terminal window, launch the React development environment:

```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure

```text
open-3d-render-server/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Endpoints (auth, users, jobs)
│   │   ├── core/            # System settings, security & JWT utilities
│   │   ├── db/              # SQLAlchemy database models & schemas
│   │   ├── services/        # Business logic & Engine Adapters
│   │   │   └── render_engines/
│   │   │       ├── base.py
│   │   │       ├── blender.py
│   │   │       ├── cinema4d.py
│   │   │       ├── maya.py
│   │   │       └── after_effects.py
│   │   └── worker.py        # Asynchronous job execution task
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared UI elements & Modal components
│   │   ├── features/        # Main modules (UploadJob, AdminUsers)
│   │   └── index.css        # Global design tokens and utilities
│   └── package.json
└── README.md
```

## 📡 API Reference Overview

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/jobs` | Retrieve list of render jobs | Authenticated |
| `POST` | `/api/jobs/upload` | Upload project file & register new job | Authenticated |
| `GET` | `/api/users` | List all system users | Admin Only |
| `POST` | `/api/users` | Register a new user account | Admin Only |
| `PATCH` | `/api/users/{id}/role` | Update user privileges (`student`/`admin`) | Admin Only |
| `DELETE` | `/api/users/{id}` | Delete a user account | Admin Only |

## 🤝 Contributing

Contributions are welcome! To add support for a new render engine or software suite:

1. Create a new module inside `backend/app/services/render_engines/` extending `BaseRenderEngine`.
2. Define the supported file extensions in `supported_extensions`.
3. Implement `find_executable()` and `render(...)` using standard CLI arguments.
4. Register the new engine class in `REGISTERED_ENGINES` inside `render_engine.py`.

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

Under this open-source license, anyone is free to use, modify, and distribute the software. However, if you modify or run a modified version of Open 3D Render Server as a network service, you must make your modifications publicly available under the AGPL-3.0. See the LICENSE file for full details.