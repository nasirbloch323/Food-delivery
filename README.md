# TOMATO — Modern Food Delivery Platform

A full-stack food ordering platform built with React, Vite, Node.js, Express and MongoDB. The project includes a customer storefront, an operations dashboard and a REST API.

## Task 5 — Complete UI Refresh

Branch: `feature/Task5` (created from `feature/Task4`).

Task 5 introduces a fresh, premium visual system across the customer application and admin dashboard while preserving the existing React components, routes, API calls and ordering workflows.

### Customer storefront
- Refined responsive navigation with a translucent sticky header.
- Large editorial-style hero section with layered overlays and entrance motion.
- Updated category browser with horizontal scrolling and active-state feedback.
- Elevated food cards with image zoom, depth, hover transitions and clearer pricing.
- Refreshed cart, checkout, order history, login modal and footer styling.
- Mobile-first layouts and reduced-motion accessibility support.

### Admin dashboard
- Updated workspace shell, navigation and sidebar.
- Refined food creation form, upload field, food listing and order cards.
- Clearer hierarchy, consistent form controls and responsive layouts.
- Lightweight entrance and hover animations.

### Stability approach
- Existing business logic and API integration are intentionally retained.
- No new runtime dependency is required for the visual refresh.
- Existing backend, Docker and payment configuration are not replaced.
- Motion respects the user's reduced-motion preference.

## Project structure

```text
Food-delivery/
├── frontend/          # Customer React + Vite application
├── admin/             # Admin React + Vite dashboard
├── backend/           # Express REST API
├── docker-compose.yml
└── README.md
```

## Technology

| Layer | Stack |
|---|---|
| Customer UI | React 18, Vite, React Router |
| Admin UI | React 18, Vite, React Router |
| API | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Payments | Stripe |
| Uploads | Multer |
| Containers | Docker, Docker Compose |

## Run locally

Requirements: Node.js 20+, npm and a MongoDB database.

```bash
git clone https://github.com/nasirbloch323/Food-delivery.git
cd Food-delivery
git checkout feature/Task5
```

Install and start each service in its own terminal:

**Backend**
```bash
cd backend
npm install
npm run server
```

**Customer app**
```bash
cd frontend
npm install
npm run dev
```

**Admin app**
```bash
cd admin
npm install
npm run dev
```

Configure the backend environment variables in a local `backend/.env` file. Never commit real credentials, payment keys or database passwords.

## Build checks

Run from the corresponding application directory:

```bash
npm run build
npm run lint
```

The customer and admin applications each have their own Vite build.

## Docker

The root Compose file starts the services configured in the repository. Add local environment values before running:

```bash
docker compose up --build
```

Stop containers with `docker compose down`. Avoid `docker compose down -v` unless you intentionally want to remove persisted volumes.

## Live deployments

- Customer: https://food-delivery-frontend-s2l9.onrender.com/
- Admin: https://food-delivery-admin-wrme.onrender.com/

Deployment availability depends on the hosting provider and configured environment variables.

## Maintainer

**Nasir Mehmood** · [GitHub @nasirbloch323](https://github.com/nasirbloch323)
