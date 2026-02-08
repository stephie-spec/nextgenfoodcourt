# NextGen Foodcourt

A full-stack food court platform with a Next.js frontend and a Flask backend. Build and run locally to explore outlets, menus, orders, table bookings, and admin/owner dashboards.

**Why this project:** Provides a modern example of a server-rendered React frontend (Next.js) integrated with a Python Flask API, demonstrating authentication, CRUD for outlets/items/orders, and seeded demo data for quick testing.

**Quick Links**
- **Client:** `client/` — Next.js + Tailwind UI frontend.
- **Server:** `server/` — Flask API, SQLite database, seed script.

**Features**
- **Customer-facing pages:** Browse outlets, view menus, add to cart, place orders, book tables.
- **Owner/Admin:** Manage outlets, items, staff, view orders and notifications.
- **Authentication:** JWT-based auth for protected endpoints.
- **Seed data:** `server/seed.py` to populate demo outlets, items, and users.

**Tech stack**
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Flask, SQLAlchemy, SQLite
- **Auth:** JWT (server/auth/jwt.py)

**Prerequisites**
- Node.js (v16+) and npm
- Python 3.8+ and pip
- Optional: `pipenv` or `virtualenv` for Python dependency isolation

Getting started
--------------

1) Backend (server)

- Create and activate a Python virtual environment, then install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
```

- (Optional) If you use Pipenv:

```bash
cd server
pipenv install --dev
pipenv shell
```

- Environment variables

- The app uses a simple default configuration, but you can set:

- `SECRET_KEY` — override the default Flask secret key (optional).

- Run the server (development):

```bash
cd server
python app.py
```

- Seed demo data (optional):

```bash
python seed.py
```

2) Frontend (client)

- Install dependencies and start the Next.js dev server:

```bash
cd client
npm install
npm run dev
```

- The frontend runs by default on `http://localhost:3000` and proxies or calls the backend API at whatever address you configure. If running both locally, use `http://localhost:5000` (Flask default) for the API.

Project structure (top-level)
- `client/` — Next.js app and UI components
- `server/` — Flask API, models, routes, and seed scripts
- `photos/` and `data/images/` — media used by the project

Useful files
- `server/app.py` — Flask application entrypoint
- `server/config.py` — configuration (uses SQLite `app.db` by default)
- `server/seed.py` — populates demo data
- `client/package.json` — frontend scripts and dependencies

Notes
- The backend default uses SQLite at `server/app.db` and a default `SECRET_KEY` defined in `server/config.py`.
- To change the database, update `SQLALCHEMY_DATABASE_URI` in `server/config.py` or set a proper production DB URL and adjust dependencies.

Contributing
- Fork and open a pull request. Keep changes focused and add tests for new features where practical.

License
- This repository does not include a license file. Add an appropriate LICENSE if you plan to share publicly.

Questions or help
- If you want, I can:
	- Add run scripts or `Makefile` entries for easier startup
	- Create `.env.example` and improved startup docs
	- Add Dockerfiles for containerized development

Enjoy exploring the project!
