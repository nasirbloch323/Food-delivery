# TOMATO — Food Delivery Platform

A full-stack food ordering application built with the **MERN stack**. Customers can browse food, add items to their cart, place orders and make payments. Administrators can manage food items and update order statuses.

> This repository contains three application parts: the customer frontend, admin dashboard and Express backend.

## Live Demo

- **Customer website:** https://food-delivery-frontend-s2l9.onrender.com/
- **Admin dashboard:** https://food-delivery-admin-wrme.onrender.com/

## Highlights

### Customer experience
- Browse food items and explore menu categories
- Add and remove items from the shopping cart
- Sign up, sign in and log out
- Place food orders and view order history
- Responsive storefront styling for desktop and mobile

### Admin dashboard
- Admin login and protected management views
- Add food items with images, descriptions, prices and categories
- View and remove food items
- View customer orders and update order status

### Backend and security
- REST API built with Node.js and Express
- MongoDB database with Mongoose
- JWT-based authentication
- Password hashing with bcrypt
- Image uploads with Multer
- Stripe payment integration
- Request validation and protected API routes

## Tech Stack

| Area | Technologies |
|---|---|
| Customer frontend | React, Vite, React Router, Axios |
| Admin dashboard | React, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Payments | Stripe |
| Uploads | Multer |
| Containerization | Docker, Docker Compose |

## Repository Structure

```text
Food-delivery/
├── admin/                 # Admin dashboard (React + Vite)
├── backend/               # REST API (Node.js + Express)
├── frontend/              # Customer website (React + Vite)
├── docker-compose.yml      # MongoDB, backend and customer frontend
└── README.md
```

## Run Locally

### 1. Requirements

Install the following before starting:

- Node.js 20 or later
- npm
- MongoDB (local installation or MongoDB Atlas)
- Git

### 2. Clone the repository

```bash
git clone https://github.com/nasirbloch323/Food-delivery.git
cd Food-delivery
```

To use the Task 4 development branch:

```bash
git checkout feature/Task4
```

### 3. Configure backend environment

Create a file named `.env` inside the `backend/` directory:

```env
JWT_SECRET=replace_with_a_long_random_secret
SALT=10
MONGO_URL=mongodb://127.0.0.1:27017/food-delivery
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Use your own database connection string and Stripe secret key. Never commit real credentials or production secrets to GitHub.

### 4. Install dependencies

Open separate terminal windows for each application.

**Backend**

```bash
cd backend
npm install
npm run server
```

**Customer frontend**

```bash
cd frontend
npm install
npm run dev
```

**Admin dashboard**

```bash
cd admin
npm install
npm run dev
```

Vite prints the local development URL for each frontend in its terminal. Open those URLs in your browser.

### 5. Configure API URLs

Make sure both React applications point to the URL where your backend is running. Update the API base URL in the frontend and admin application configuration/context files as required by the project.

For local development, the backend normally runs on:

```text
http://localhost:4000
```

Also set the frontend return URL used by the backend order/payment flow to the correct customer frontend address.

## Run with Docker Compose

The included Compose file starts MongoDB, the backend API and the customer frontend.

1. Create `backend/.env` and add the required secrets described above.
2. From the repository root, run:

```bash
docker compose up --build
```

To stop the containers:

```bash
docker compose down
```

To stop containers and also delete the MongoDB and uploaded-file volumes (this permanently deletes that persisted data):

```bash
docker compose down -v
```

The Compose setup exposes MongoDB on port `27017`, the backend on port `4000` and the customer frontend on port `3001`. The admin dashboard is not included in the current Compose services; run it separately using the local instructions above.

## Useful Development Commands

Run these commands from the relevant application directory:

| Application | Command | Purpose |
|---|---|---|
| Backend | `npm run server` | Start API with nodemon |
| Frontend | `npm run dev` | Start customer Vite server |
| Frontend | `npm run build` | Create production build |
| Admin | `npm run dev` | Start admin Vite server |
| Admin | `npm run build` | Create production build |

## UI Refresh — Task 4

The `feature/Task4` branch includes a refreshed visual style for both React interfaces:

- Customer storefront: updated typography, navigation, hero section, category browsing, food cards and footer.
- Admin dashboard: refreshed navigation, sidebar, forms, food listing and order-management layouts.
- Responsive CSS adjustments for smaller screens.

The existing application components and API workflows are retained while the interface styling is updated.

## Screenshots

Add updated screenshots of the customer website and admin dashboard here after running the applications locally.

## Deployment

The live demo links above are hosted on Render. For your own deployment:

1. Provision a MongoDB database.
2. Configure backend environment variables securely in your hosting provider.
3. Deploy the backend and set the correct frontend/backend URLs.
4. Build and deploy the customer frontend and admin dashboard.
5. Configure Stripe keys and allowed frontend URLs for the payment flow.

Do not expose private environment variables in frontend code.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Open a pull request with a clear description.

## Maintainer

**Nasir Mehmood**  
GitHub: [@nasirbloch323](https://github.com/nasirbloch323)
