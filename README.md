# MESA — Food Delivery on Kubernetes

**Task 10: Kubernetes with ConfigMap, Secrets and Persistent Volume Storage**

MESA is a refreshed full-stack food-delivery application based on the existing MERN project. This branch packages the customer storefront, admin dashboard and API into containers, then deploys them to Kubernetes with externalized configuration, secret management and persistent storage.

> This is a separate implementation on `Task10_Kubernetes`, created from `main`. It does not include the previous `feature/Task4` branch UI changes.

## Project preview

MESA uses a fresh visual direction: deep forest-green, warm ivory, sage accents and editorial food-brand typography.

- **Customer storefront:** new MESA brand header, responsive hero, category navigation, food cards, cart entry point and redesigned footer.
- **Admin console:** MESA operations branding, workspace navigation, inventory/order workflow styling and responsive layout.
- Existing customer login, cart, order, admin menu and order-management React flows are retained.

## Architecture

```text
                         Browser
                    /              \
              food.local       admin.food.local
                  |                  |
               Ingress Controller (NGINX)
                  |                  |
           customer-frontend     admin-frontend
              (Nginx)               (Nginx)
                  \                  /
                   \                /
                     backend Service
                     (2 API pods)
                           |
                    MongoDB Service
                     (StatefulSet)
                           |
                   PersistentVolume
                     /         \
              MongoDB data   Food uploads
                 PVC             PVC
```

## Technology stack

| Layer | Tools |
|---|---|
| Customer UI | React 18, Vite, React Router |
| Admin UI | React 18, Vite, React Router |
| API | Node.js 20, Express |
| Database | MongoDB 7, Mongoose |
| Auth and payments | JWT, bcrypt, Stripe |
| Containers | Docker, Nginx |
| Orchestration | Kubernetes Deployments, StatefulSet, Services, Ingress |
| Configuration | ConfigMap and Secret |
| Storage | PersistentVolume and PersistentVolumeClaim |

## Repository layout

```text
Food-delivery/
├── frontend/                 # Customer React application
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── admin/                    # Admin React application
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── backend/                  # Express REST API
│   ├── Dockerfile
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
└── k8s/
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secret.example.yaml
    ├── storage.yaml
    ├── mongodb.yaml
    ├── backend.yaml
    ├── frontend.yaml
    ├── admin.yaml
    ├── ingress.yaml
    └── kustomization.yaml
```

## Task 10 Kubernetes resources

| Resource | Purpose |
|---|---|
| Namespace | Isolates the MESA workload in `mesa-food` |
| ConfigMap | Stores non-sensitive application settings |
| Secret | Stores MongoDB credentials, JWT secret and Stripe key |
| PersistentVolume | Provides persistent disk paths for database and uploaded images |
| PersistentVolumeClaim | Requests and binds persistent storage |
| StatefulSet | Runs MongoDB with a stable identity and persistent data |
| Deployment | Runs backend, customer UI and admin UI pods |
| Service | Provides stable internal networking |
| Ingress | Routes customer and admin browser traffic |

### Persistent data

- MongoDB data is mounted at `/data/db` using `mongodb-pvc`.
- Uploaded food images are mounted at `/app/uploads` using `uploads-pvc`.
- The sample PVs use `hostPath` for a **single-node learning cluster**. For production or multi-node clusters, replace them with a supported CSI-backed StorageClass and appropriate access modes.

### Secrets

The repository contains `k8s/secret.example.yaml` with placeholders only. Never put real passwords or API keys in Git.

Create the Kubernetes Secret from your terminal instead:

```bash
kubectl create namespace mesa-food

kubectl create secret generic mesa-secret \
  --namespace mesa-food \
  --from-literal=MONGO_ROOT_USERNAME='mesa_admin' \
  --from-literal=MONGO_ROOT_PASSWORD='REPLACE_WITH_LONG_RANDOM_PASSWORD' \
  --from-literal=MONGO_URL='mongodb://mesa_admin:REPLACE_WITH_LONG_RANDOM_PASSWORD@mongodb:27017/food-delivery?authSource=admin' \
  --from-literal=JWT_SECRET='REPLACE_WITH_LONG_RANDOM_SECRET' \
  --from-literal=STRIPE_SECRET_KEY='sk_test_REPLACE_WITH_YOUR_STRIPE_KEY'
```

Use an alphanumeric MongoDB password for this example URI, or URL-encode special characters in the URI. Use your own Stripe test key for testing. Do not share or commit the real values.

## Build and publish Docker images

Run these commands from the repository root. Replace the Docker Hub namespace if you publish under a different account.

```bash
docker build -t nasirbloch323/mesa-food-backend:task10 -f backend/Dockerfile backend
docker build -t nasirbloch323/mesa-food-frontend:task10 -f frontend/Dockerfile frontend
docker build -t nasirbloch323/mesa-food-admin:task10 -f admin/Dockerfile admin

docker login
docker push nasirbloch323/mesa-food-backend:task10
docker push nasirbloch323/mesa-food-frontend:task10
docker push nasirbloch323/mesa-food-admin:task10
```

The Kubernetes manifests reference these image tags. The images must be built and pushed (or loaded into your local cluster) before the application pods can start.

For a local Kind cluster, after building the images:

```bash
kind load docker-image nasirbloch323/mesa-food-backend:task10
kind load docker-image nasirbloch323/mesa-food-frontend:task10
kind load docker-image nasirbloch323/mesa-food-admin:task10
```

## Deploy to Kubernetes

Requirements: a working Kubernetes cluster, `kubectl`, an Ingress controller (NGINX Ingress is referenced), and the three application images.

1. Create the namespace and Secret using the commands above.
2. Review the storage paths and image names in `k8s/`.
3. Apply the Kubernetes resources:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/storage.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/admin.yaml
kubectl apply -f k8s/ingress.yaml
```

Or, after the namespace, Secret and images are ready:

```bash
kubectl apply -k k8s/
```

Check deployment status:

```bash
kubectl get all -n mesa-food
kubectl get pvc -n mesa-food
kubectl get pv
kubectl get ingress -n mesa-food
kubectl get pods -n mesa-food -w
```

Inspect logs and troubleshoot:

```bash
kubectl logs -n mesa-food deploy/backend
kubectl logs -n mesa-food statefulset/mongodb
kubectl describe pod -n mesa-food <pod-name>
kubectl describe pvc -n mesa-food mongodb-pvc
```

## Open the application

The Ingress rules use these hostnames:

- Customer website: `http://food.local`
- Admin dashboard: `http://admin.food.local`

Point both hostnames to your Ingress controller IP in your machine's hosts file. For Minikube, get the IP using:

```bash
minikube ip
```

On Windows, edit `C:\Windows\System32\drivers\etc\hosts` as Administrator. On Linux/macOS, edit `/etc/hosts`. Add entries using your actual cluster/Ingress IP:

```text
<INGRESS-IP> food.local
<INGRESS-IP> admin.food.local
```

Make sure an NGINX Ingress Controller is installed and its external address is reachable. The API and image paths are reverse-proxied by the Nginx frontend containers to the internal backend Service.

## Useful commands

```bash
# Watch pods
kubectl get pods -n mesa-food -w

# Scale API replicas
kubectl scale deployment/backend --replicas=3 -n mesa-food

# Restart API deployment after an image update
kubectl rollout restart deployment/backend -n mesa-food

# Check rollout
kubectl rollout status deployment/backend -n mesa-food

# Remove application resources
kubectl delete -k k8s/
kubectl delete namespace mesa-food
```

**Storage warning:** deleting the namespace removes PVC objects. PVs use `Retain`, but do not delete or clean the underlying host directories if you need to preserve database records or uploaded images.

## Local development without Kubernetes

Install Node.js 20+ and MongoDB. Configure the backend environment variables, then run each application in a separate terminal:

```bash
# Terminal 1 — API
cd backend
npm install
npm run server

# Terminal 2 — Customer frontend
cd frontend
npm install
npm run dev

# Terminal 3 — Admin dashboard
cd admin
npm install
npm run dev
```

The Vite development servers proxy `/api` and `/images` to `http://localhost:4000` by default. Set `VITE_API_PROXY` if your local backend runs elsewhere.

## Notes and limitations

- This repository change prepares the application and manifests; it does not create a cloud cluster, publish Docker images, or configure a live DNS name.
- Set your real Secret values and push the Docker images before deploying.
- The sample hostPath PVs are for a single-node lab only, not production high availability.
- Configure Stripe allowed redirect URLs and your production frontend domain before accepting real payments.
- The admin frontend is exposed on its own host; secure it with HTTPS and suitable network access controls before production use.

## Maintainer

**Nasir Mehmood** · [GitHub @nasirbloch323](https://github.com/nasirbloch323)


## Interview preparation

A beginner-friendly, file-by-file Roman Urdu explanation of the application, Dockerfiles, Kubernetes manifests, deployment commands and technical interview questions is available here:

- [Task 10 Complete Interview Guide](docs/INTERVIEW_GUIDE.md)
