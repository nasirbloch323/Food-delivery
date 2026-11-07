# Task 5 — Docker Image Optimization & Container Hardening

This project uses multi-stage Docker builds and non-root runtime processes for the customer frontend, admin frontend and Node.js API.

## 1. Multi-stage builds

A multi-stage Dockerfile uses separate stages for building/installing dependencies and running the application.

- **Backend:** the dependencies stage installs production npm packages and native build tools. The runtime stage copies only `node_modules` and application source; compilers are not included.
- **Frontend and admin:** Node.js 24 builds the Vite assets. The final image contains only the generated static files and an unprivileged Nginx server.

This reduces the final image's contents and removes build-only tools from the runtime image. Actual image-size savings should be measured after building.

## 2. Stable Node.js base image

The Node.js build and API stages use the official `node:24-alpine` image. Node 24 is an LTS major line. Alpine provides a smaller base, while using the same Node major in build and runtime stages helps avoid native-module ABI mismatches.

For repeatable supply-chain builds, production pipelines should pin base images by digest and update those digests through a regular security-update process. Tags can receive updated patch releases.

## 3. Non-root runtime

- The backend uses the official Node image's unprivileged `node` account.
- Frontend and admin use `nginxinc/nginx-unprivileged` and run as UID 101.
- Nginx listens on container port 8080, not privileged port 80.
- Compose applies `no-new-privileges`, drops Linux capabilities, uses read-only root filesystems and provides small writable `/tmp` tmpfs mounts.
- Backend uploads remain writable through the dedicated named volume.

**Important distinction:** a non-root container process is not the same thing as Docker Engine rootless mode. The former limits the process inside the container. To run the Docker daemon itself without host root privileges, an administrator must separately configure Docker Rootless Mode on the host.

## 4. Same-origin API proxy

The Vite apps are built with an empty `VITE_API_URL`, so browser requests use relative `/api` and `/images` paths. Nginx forwards those paths to the internal backend service. This avoids exposing the backend service name to the browser and keeps the Compose setup self-contained.

## 5. Build and run

Create `backend/.env` locally with the required application secrets (for example Stripe and JWT configuration). Do not commit this file.

From the repository root:

```bash
docker compose config
docker compose build --pull
docker compose up -d
docker compose ps
docker compose logs -f backend
```

Open:
- Customer storefront: http://localhost:3001
- Admin dashboard: http://localhost:3002

Stop the stack:

```bash
docker compose down
```

Persistent MongoDB data and uploaded files are stored in named volumes. Do not add `-v` to `docker compose down` unless you intentionally want to delete those volumes.

## 6. Verify hardening

Check the runtime user and effective container settings:

```bash
docker compose exec backend id
docker inspect food-delivery-backend --format '{{.Config.User}}'
docker inspect food-delivery-frontend --format '{{.HostConfig.ReadonlyRootfs}}'
docker inspect food-delivery-backend --format '{{json .HostConfig.CapDrop}}'
```

The backend should report a non-root UID (the Node image's `node` user), frontend/admin use UID 101, read-only root filesystem should be `true`, and capabilities should be dropped.

## 7. Image size comparison

Build and inspect images:

```bash
docker compose build --pull
docker image ls
docker image inspect <image-name> --format '{{.Size}}'
```

Compare these values with the previous single-stage images to document the actual reduction. Do not claim a percentage until you have measured it.
