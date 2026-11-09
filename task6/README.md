# FoodExpress — Task 6
### Docker • Docker Compose • Jenkins • Docker Hub • GitHub Webhook

A fresh, beginner-friendly food ordering demo built to practise a complete CI/CD workflow. The frontend loads menu items from a Node.js API, the API stores demo orders in MongoDB, Docker packages the services, Docker Hub stores the application images, and Jenkins automates build, push and deployment.

> **Project owner:** Nasir Mehmood  
> **Repository:** [Food-delivery](https://github.com/nasirbloch323/Food-delivery)  
> **Working branch:** `feature/Task6`

---

## 1. Architecture

```text
                 Browser
                    |
             http://EC2:8080
                    |
          +-------------------+
          | Frontend / Nginx  |
          | foodexpress-      |
          | frontend image    |
          +---------+---------+
                    |
             HTTP REST API
                    |
          +---------v---------+
          | Backend / Express |
          | foodexpress-      |
          | backend image     |
          +---------+---------+
                    |
          mongodb://mongo:27017
                    |
          +---------v---------+
          | MongoDB 7         |
          | named volume      |
          +-------------------+

 GitHub push -> Jenkins -> Test -> Build -> Docker Hub
                                  -> Remove local images
                                  -> Compose pull + up
                                  -> Smoke tests
```

### Services and ports

| Service | Container port | Host port | Purpose |
|---|---:|---:|---|
| Frontend | 80 | 8080 | Website |
| Backend | 5000 | 5000 | REST API |
| MongoDB | 27017 | Internal only | Persistent order storage |

The frontend is served by Nginx. The backend is a Node.js/Express API. MongoDB is reachable by the backend through the Compose service name `mongo`, not through localhost.

---

## 2. Repository layout

```text
task6/
├── frontend/
│   ├── index.html       # Website structure and content
│   ├── styles.css       # Responsive visual styling
│   ├── app.js           # Fetch menu and submit demo orders
│   └── Dockerfile       # Package static site with Nginx
├── backend/
│   ├── package.json     # Node dependencies and scripts
│   ├── server.js        # Express routes, MongoDB model and startup
│   ├── server.test.js   # Built-in Node test cases
│   └── Dockerfile       # Secure Node API image
├── docker-compose.yml   # Frontend, backend, MongoDB orchestration
├── Jenkinsfile          # Declarative CI/CD pipeline
├── .env.example         # Compose variable template
├── .dockerignore        # Exclude unnecessary Docker build files
└── README.md            # Project documentation
```

---

## 3. Prerequisites

Install these on your development machine or EC2 deployment host:

- Git
- Docker Engine
- Docker Compose plugin (`docker compose`)
- Node.js 22 or compatible version for local backend tests
- Jenkins with Pipeline, Git and Credentials plugins
- Docker Hub account
- GitHub repository access

Check versions:

```bash
git --version
docker --version
docker compose version
node --version
npm --version
```

---

## 4. Run locally with Docker Compose

### Step 1 — Clone the repository

```bash
git clone https://github.com/nasirbloch323/Food-delivery.git
cd Food-delivery
git checkout feature/Task6
```

### Step 2 — Configure Docker Hub username

```bash
cd task6
cp .env.example .env
```

Edit `.env` and set your own Docker Hub username:

```dotenv
DOCKERHUB_USER=your-dockerhub-username
IMAGE_TAG=latest
```

### Step 3 — Build and start the stack

For a first local run, build the images from source:

```bash
docker compose up -d --build
```

### Step 4 — Inspect running containers

```bash
docker compose ps
docker compose logs -f
```

### Step 5 — Open and test

- Website: `http://localhost:8080`
- Backend health: `http://localhost:5000/health`
- Menu API: `http://localhost:5000/api/foods`

Select a food item and place a demo order. A successful response confirms that the API has stored the order in MongoDB.

### Step 6 — Stop the services

```bash
docker compose down
```

This keeps the named MongoDB volume. To remove the database data too, use the destructive command below only when you really want a clean database:

```bash
docker compose down -v
```

---

## 5. Docker image build and Docker Hub push

Set your Docker Hub username before running these commands:

```bash
export DOCKERHUB_USER=your-dockerhub-username
export IMAGE_TAG=1.0
```

Build frontend:

```bash
docker build -t $DOCKERHUB_USER/foodexpress-frontend:$IMAGE_TAG task6/frontend
docker tag $DOCKERHUB_USER/foodexpress-frontend:$IMAGE_TAG $DOCKERHUB_USER/foodexpress-frontend:latest
```

Build backend:

```bash
docker build -t $DOCKERHUB_USER/foodexpress-backend:$IMAGE_TAG task6/backend
docker tag $DOCKERHUB_USER/foodexpress-backend:$IMAGE_TAG $DOCKERHUB_USER/foodexpress-backend:latest
```

Authenticate and push:

```bash
docker login
docker push $DOCKERHUB_USER/foodexpress-frontend:$IMAGE_TAG
docker push $DOCKERHUB_USER/foodexpress-frontend:latest
docker push $DOCKERHUB_USER/foodexpress-backend:$IMAGE_TAG
docker push $DOCKERHUB_USER/foodexpress-backend:latest
```

Remove local copies after successful push:

```bash
docker image rm $DOCKERHUB_USER/foodexpress-frontend:$IMAGE_TAG
docker image rm $DOCKERHUB_USER/foodexpress-frontend:latest
docker image rm $DOCKERHUB_USER/foodexpress-backend:$IMAGE_TAG
docker image rm $DOCKERHUB_USER/foodexpress-backend:latest
```

The images remain in Docker Hub. Removing a local image does not delete the registry copy.

---

## 6. Deploy by pulling images from Docker Hub

Make sure the `.env` file has the correct Docker Hub username and tag. If the repositories are public, no login is needed. For private repositories, run `docker login` first.

```bash
docker compose pull
docker compose up -d
docker compose ps
```

Compose pulls the frontend and backend images from Docker Hub and starts MongoDB with them. MongoDB uses a named volume so normal container recreation does not erase orders.

---

## 7. Jenkins installation on EC2 (Ubuntu)

> Run these commands on a supported Ubuntu EC2 instance. Allow inbound TCP 8080 only from your own IP while configuring Jenkins. Also allow application ports 8080 and 5000 only as required by your testing setup.

Install Java:

```bash
sudo apt update
sudo apt install -y fontconfig openjdk-21-jre curl
java -version
```

Add the official Jenkins package repository and install Jenkins:

```bash
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable --now jenkins
sudo systemctl status jenkins
```

Open `http://EC2-PUBLIC-IP:8080` and retrieve the initial administrator password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Complete the Jenkins setup wizard and install suggested plugins.

### Install Docker and Compose on EC2

Install Docker Engine and its Compose plugin using the official Docker Ubuntu installation guide. Verify:

```bash
docker --version
docker compose version
```

Allow Jenkins to access Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

A group membership change requires a new Jenkins process. Restart Jenkins and verify a Pipeline agent can run `docker ps`. Membership in the Docker group grants root-equivalent privileges; only trusted Jenkins jobs should run on this host.

Install Node.js 22 on the Jenkins agent if you want the `npm test` stage to run directly on the host.

---

## 8. Configure Jenkins credentials

1. Open **Manage Jenkins → Credentials**.
2. Select the appropriate global or folder credential store.
3. Add a **Username with password** credential.
4. Set ID to exactly `dockerhub-creds`.
5. Username: your Docker Hub username.
6. Password: a Docker Hub access token (recommended), not your account password.

The Jenkinsfile uses this credential ID during Docker Hub login. Never commit access tokens, passwords, private keys or real `.env` files to Git.

---

## 9. Create a Jenkins Pipeline job

1. Select **New Item** in Jenkins.
2. Enter `FoodExpress-Task6`.
3. Choose **Pipeline** and select **OK**.
4. In Pipeline Definition, choose **Pipeline script from SCM**.
5. Select **Git** and enter the repository URL: `https://github.com/nasirbloch323/Food-delivery.git`.
6. Set the branch specifier to `*/feature/Task6`.
7. Set Script Path to `task6/Jenkinsfile`.
8. Save and select **Build Now**.

The Jenkinsfile is declarative and contains checkout, Compose validation, backend tests, image build, Docker Hub push, local image cleanup, Compose deployment and smoke-test stages.

### Pipeline stages explained

| Stage | What it does |
|---|---|
| Checkout | Downloads the selected Git branch |
| Validate Compose | Checks Compose configuration syntax |
| Test Backend | Runs Node's built-in tests |
| Build Images | Builds frontend and backend Docker images |
| Push Images | Authenticates and pushes versioned and latest tags |
| Remove Local Build Images | Removes local build tags to save disk |
| Deploy with Docker Compose | Pulls registry images and starts the stack |
| Smoke Test | Checks frontend and backend HTTP responses |

---

## 10. GitHub webhook

1. In Jenkins, install/enable the GitHub integration plugin if it is not already installed.
2. Open the Pipeline job configuration and enable **GitHub hook trigger for GITScm polling**.
3. In GitHub, open **Settings → Webhooks → Add webhook**.
4. Set Payload URL to `http://YOUR-JENKINS-HOST:8080/github-webhook/`.
5. Set content type to `application/json`.
6. Choose the push event (or the events required by your workflow).
7. Save and check the webhook's Recent Deliveries.

The Jenkins host must be reachable by GitHub. Do not expose Jenkins administration publicly without TLS, access restrictions and appropriate hardening. For a private EC2 Jenkins host, use a secured reverse proxy or another controlled webhook delivery design.

---

## 11. End-to-end verification

Check the service state:

```bash
docker compose ps
```

Check the API:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/foods
```

Create a demo order from the command line:

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"foodId":"classic-burger","quantity":2}'
```

Check logs:

```bash
docker compose logs backend
docker compose logs mongo
docker compose logs frontend
```

Expected flow: browser requests menu from backend; backend reads menu data; checkout sends a food ID and quantity; backend validates the request and stores the order in MongoDB.

---

## 12. Troubleshooting

| Problem | Checks and solution |
|---|---|
| Website does not open | Check EC2 security group, port 8080 mapping and `docker compose logs frontend` |
| API is unreachable | Check port 5000, backend health and `docker compose logs backend` |
| MongoDB connection fails | Check MongoDB health and ensure backend uses `mongodb://mongo:27017/foodexpress` |
| Docker permission denied in Jenkins | Add Jenkins to Docker group, restart Jenkins and verify agent permissions |
| Docker Hub push denied | Check credential ID `dockerhub-creds`, username, token and repository names |
| Compose cannot pull image | Check Docker Hub repository visibility, username and image tag |
| Port already in use | Find the process using the port or change the host-side port mapping |
| Disk space is low | Remove unused images and build cache carefully; never delete the named database volume accidentally |

Useful diagnostics:

```bash
docker ps -a
docker images
docker system df
docker compose config
docker compose logs --tail=100
df -h
```

---

## 13. Security and operational notes

- Use a Docker Hub access token stored in Jenkins Credentials.
- Keep MongoDB private to the Compose network; do not publish port 27017 publicly.
- The backend runs as a non-root user inside its container.
- The database stores data in a named volume.
- Use immutable build-number image tags for traceable releases; `latest` is convenient but mutable.
- Restrict EC2 security-group ingress to trusted IP addresses.
- Use HTTPS and a secured reverse proxy for a public deployment.
- Back up MongoDB data before maintenance or destructive operations.
- Docker group membership is highly privileged; protect the Jenkins controller and its agents.

---

## 14. Git workflow and Pull Request

Work only on the Task 6 feature branch:

```bash
git checkout feature/Task6
git status
git add task6/
git commit -m "feat(task6): add FoodExpress Docker Compose and Jenkins CI/CD"
git push origin feature/Task6
```

Create a Pull Request on GitHub:

- **Base:** `dev`
- **Compare:** `feature/Task6`
- **Title:** `Task 6: FoodExpress Docker Compose and Jenkins CI/CD`

Review the changes and Jenkins build before merging into `dev`.

---

## 15. Learning outcomes

- Installed and configured Jenkins on EC2.
- Created a declarative Jenkins pipeline.
- Built frontend and backend Docker images.
- Published images to Docker Hub and removed local build copies.
- Pulled published images and deployed with Docker Compose.
- Connected frontend, backend and MongoDB containers.
- Added GitHub webhook trigger guidance.
- Tested API health, menu retrieval and order persistence.
- Documented troubleshooting, security and Git Pull Request workflow.

**Author:** Nasir Mehmood · [GitHub](https://github.com/nasirbloch323)
