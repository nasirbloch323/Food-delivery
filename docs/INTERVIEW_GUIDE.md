# Task 10 — Complete Project Interview Guide (Easy Roman Urdu)

**Project:** MESA Food Delivery on Kubernetes  
**Branch:** `Task10_Kubernetes`  
**Main task:** Kubernetes ConfigMap, Secrets, PersistentVolume and PersistentVolumeClaim.

> Is guide ko interview se pehle read karo. Code ki har line ka basic matlab, har folder ka role aur complete request flow simple Roman Urdu mein diya gaya hai. CSS, images aur package-lock jaisi generated files ko concept ke hisaab se explain kiya gaya hai; unki har repeated line interview mein explain karna zaroori nahi.

---

# 1. Interview mein project ka 30-second introduction

**English answer (easy):**

"I built a full-stack food delivery application called MESA. It has a React customer website, a separate React admin dashboard, a Node.js and Express backend, and MongoDB as the database. I containerized the frontend, admin and backend using Docker. Then I prepared Kubernetes manifests to deploy the application using Deployments, Services, a MongoDB StatefulSet, ConfigMap, Secrets, PersistentVolumes, PersistentVolumeClaims and Ingress. The main goal of this task is to keep configuration outside the image, protect sensitive values, and persist database and uploaded-image data."

**Roman Urdu meaning:**

Maine MESA naam ki food delivery website banayi. Customer website se user food dekhta aur order karta hai. Admin dashboard se admin food add/remove aur orders ka status update karta hai. Backend API request handle karta hai aur MongoDB data save karta hai. Docker application ko container mein pack karta hai. Kubernetes containers ko run aur manage karta hai. ConfigMap normal settings rakhta hai, Secret passwords/API keys rakhta hai aur PV/PVC data ko pod restart hone ke baad bhi save rakhte hain.

---

# 2. Project ka complete flow

```text
Customer Browser
      |
      v
NGINX Ingress
      |
      v
Customer Frontend Service ---> React website
      |
      | /api and /images
      v
Backend Service ---> Backend Pods (2 replicas)
      |
      v
MongoDB Service ---> MongoDB StatefulSet
                           |
                           v
                     MongoDB PVC
                           |
                           v
                     MongoDB PV

Admin Browser ---> Ingress ---> Admin Frontend Service ---> Admin React UI
```

**Is flow ko yaad karo:**

1. Customer browser mein `food.local` open karta hai.
2. Ingress request ko customer frontend Service tak bhejta hai.
3. Nginx React website serve karta hai.
4. Website API call karti hai, jaise `/api/food/list`.
5. Nginx request ko backend Service par proxy karta hai.
6. Backend MongoDB se food list read karta hai.
7. Response wapas browser mein show hota hai.
8. Food images `/images` route se backend uploads folder se serve hoti hain.

Admin ke liye `admin.food.local` alag host hai.

---

# 3. Repository folders

| Folder/file | Easy explanation |
|---|---|
| `frontend/` | Customer ki React website |
| `admin/` | Admin ki React dashboard |
| `backend/` | Node.js + Express API |
| `backend/config/` | Database connection settings |
| `backend/models/` | MongoDB documents ka structure |
| `backend/controllers/` | Actual business logic |
| `backend/routes/` | API endpoints / URLs |
| `backend/middleware/` | Request ke beech authentication check |
| `backend/uploads/` | Uploaded food images |
| `k8s/` | Kubernetes YAML deployment files |
| `README.md` | Project setup aur deployment instructions |
| `docs/INTERVIEW_GUIDE.md` | Ye interview learning guide |

---

# 4. Backend — Node.js and Express

## 4.1 `backend/server.js`

| Code | Iska matlab |
|---|---|
| `import "dotenv/config";` | Environment variables ko `.env` file se load karta hai. Kubernetes mein values ConfigMap/Secret se aati hain. |
| `import express from "express";` | Express framework import karta hai jo API server banata hai. |
| `import cors from "cors";` | Browser ko allowed cross-origin API requests karne deta hai. Production mein origins restrict karne chahiye. |
| `import mongoose from "mongoose";` | MongoDB se Node.js application ko connect karne ka library. |
| `import { connectDB } from "./config/db.js";` | Database connection function import karta hai. |
| `import foodRouter ...` | Food API ke routes load karta hai. |
| `import userRouter ...` | Login aur registration routes load karta hai. |
| `import cartRouter ...` | Cart routes load karta hai. |
| `import orderRouter ...` | Order aur payment routes load karta hai. |
| `const app = express();` | Express application object banata hai. |
| `const port = process.env.PORT || 4000;` | Environment se port leta hai; agar na mile to 4000 use karta hai. |
| `app.use(express.json({ limit: "2mb" }));` | JSON request body read karta hai; 2 MB limit rakhta hai. |
| `app.use(cors());` | CORS middleware enable karta hai. |
| `app.use("/api/food", foodRouter);` | Food router ko `/api/food` prefix deta hai. |
| `app.use("/images", express.static(...));` | Uploaded images ko URL se access karwata hai. |
| `app.use("/api/user", userRouter);` | Login/register endpoints mount karta hai. |
| `app.use("/api/cart", cartRouter);` | Cart endpoints mount karta hai. |
| `app.use("/api/order", orderRouter);` | Order endpoints mount karta hai. |
| `app.get("/", ...)` | Root URL par simple service-running message deta hai. |
| `app.get("/health", ...)` | Health endpoint banata hai. |
| `mongoose.connection.readyState === 1` | Check karta hai MongoDB connected hai ya nahi. |
| `res.status(databaseReady ? 200 : 503)` | DB connected ho to HTTP 200, warna 503 deta hai. |
| `const start = async () =>` | Server start karne ke liye async function. |
| `await connectDB();` | Pehle database connect karta hai. |
| `app.listen(port, "0.0.0.0", ...)` | Server ko container ke sab network interfaces par listen karwata hai. |
| `catch (error)` | Startup par error aaye to handle karta hai. |
| `process.exit(1)` | Database connection fail ho to process failure code ke sath band hota hai. |
| `start();` | Start function execute karta hai. |

**Interview question: Why listen on 0.0.0.0?**

Answer: "Because the application runs inside a container. Listening on 0.0.0.0 makes the server reachable through the container network, not only from its own loopback interface."

## 4.2 `backend/config/db.js`

- `import mongoose`: MongoDB library import.
- `connectDB`: reusable database connection function.
- `mongoose.connect(process.env.MONGO_URL)`: Secret/environment variable se MongoDB connection string leta hai.
- `.then(...)`: connection successful ho to message print karta hai.

**Interview:** "I keep the MongoDB connection string in an environment variable instead of hardcoding it in application code."

## 4.3 Models — `backend/models/`

**Model ka matlab:** Database mein kis type ka data save hoga, uska structure.

### `foodModel.js`

- `mongoose.Schema`: food document ka structure define karta hai.
- `name`: food ka naam, String aur required.
- `description`: food ki detail.
- `price`: numeric price.
- `image`: image filename.
- `category`: category, jaise Salad ya Pasta.
- `mongoose.model("food", foodSchema)`: schema ko MongoDB model banata hai.
- `export default`: model ko doosri files mein use karne deta hai.

### `userModel.js`

- `name`: user name.
- `email`: unique email; duplicate email allowed nahi.
- `password`: hashed password store karne ke liye field.
- `role`: default role `user`; admin role admin account ko identify karta hai.
- `cartData`: cart item IDs aur quantities store karta hai.
- `minimize: false`: empty object fields ko bhi preserve karta hai.
- Model ko export kiya jata hai taake controllers user data read/update kar saken.

### `orderModel.js`

- `userId`: kis user ne order diya.
- `items`: order ke food items aur quantity.
- `amount`: total amount.
- `address`: delivery address object.
- `status`: default `Food Processing`.
- `date`: order create hone ki date.
- `payment`: payment status; default false.

**Interview:** "Mongoose schemas define the structure of our MongoDB documents and help the backend work with collections."

## 4.4 Routes — `backend/routes/`

**Route ka matlab:** HTTP URL ko controller function ke sath connect karna.

| File | Endpoint | Purpose |
|---|---|---|
| `userRoute.js` | POST `/api/user/register` | New account |
| `userRoute.js` | POST `/api/user/login` | Login |
| `foodRoute.js` | POST `/api/food/add` | Admin food add |
| `foodRoute.js` | GET `/api/food/list` | Food list |
| `foodRoute.js` | POST `/api/food/remove` | Admin food delete |
| `cartRoute.js` | POST `/api/cart/add` | Add cart item |
| `cartRoute.js` | POST `/api/cart/remove` | Remove cart item |
| `cartRoute.js` | POST `/api/cart/get` | Read cart |
| `orderRoute.js` | POST `/api/order/place` | Create order/payment session |
| `orderRoute.js` | POST `/api/order/verify` | Verify checkout result |
| `orderRoute.js` | POST `/api/order/status` | Admin update status |
| `orderRoute.js` | POST `/api/order/userorders` | Current user's orders |
| `orderRoute.js` | GET `/api/order/list` | Admin all orders |

- `express.Router()`: routes ko separate file mein organize karta hai.
- `router.get()`: GET request register karta hai.
- `router.post()`: POST request register karta hai.
- `authMiddleware`: protected route par controller se pehle token check karta hai.
- `upload.single("image")`: multipart form se ek image receive karta hai.
- `export default router`: router ko server.js mein use karne deta hai.

## 4.5 Controllers — `backend/controllers/`

**Controller ka matlab:** Request aane ke baad actual kaam karna.

### `userController.js`

1. Request se email aur password leta hai.
2. MongoDB mein email search karta hai.
3. `bcrypt.compare()` submitted password ko saved hash se compare karta hai.
4. Correct password par JWT token create karta hai.
5. Register ke waqt email validate karta hai.
6. Password ko `bcrypt.hash()` se hash karke save karta hai.
7. Response mein token aur role return karta hai.

**JWT:** JSON Web Token. Login ke baad client ko milta hai; agle protected requests mein token bheja jata hai.

**bcrypt:** Password ko hash karta hai; plain-text password database mein save nahi hona chahiye.

### `foodController.js`

- `addFood`: request data aur uploaded image filename se food document banata hai.
- Admin role check karta hai.
- Authorized admin ka food MongoDB mein save hota hai.
- `listFood`: all food documents read karta hai.
- `removeFood`: admin check ke baad food record delete karta hai aur image file remove karne ki koshish karta hai.

### `cartController.js`

- `addToCart`: user ka cart read karta hai; item nahi ho to quantity 1, warna quantity +1.
- `removeFromCart`: quantity 1 se zyada ho to minus 1; warna item delete.
- `getCart`: current user's cart data return karta hai.

### `orderController.js`

- `new Stripe(...)`: Stripe payment SDK initialize karta hai.
- `placeOrder`: request se address, items aur amount lekar order save karta hai.
- Cart clear karta hai.
- Stripe Checkout ke liye line items banata hai.
- `stripe.checkout.sessions.create()`: payment checkout session banata hai.
- `success_url` aur `cancel_url`: payment ke baad browser ko redirect karte hain.
- `verifyOrder`: successful checkout par payment true karta hai; unsuccessful checkout par order delete karta hai.
- `userOrders`: current user ke orders find karta hai.
- `listOrders`: admin role check karke all orders return karta hai.
- `updateStatus`: admin ko order status update karne deta hai.

**Important interview honesty:** Current implementation Stripe redirect/session flow ka sample hai. Production mein payment ko sirf browser query parameter se trust nahi karna chahiye; Stripe webhook se server-side payment verify karna chahiye. Also order amount backend par database prices se calculate karna chahiye, client-supplied amount trust nahi karna chahiye.

## 4.6 `backend/middleware/auth.js`

- `req.headers`: incoming HTTP request headers.
- `token`: client ke request header se JWT read karta hai.
- Token missing ho to request reject.
- `jwt.verify(token, process.env.JWT_SECRET)`: token signature verify karta hai.
- `req.body.userId = token_decode.id`: verified user ID request mein attach karta hai.
- `next()`: token valid ho to next middleware/controller run karta hai.
- Invalid token par error response deta hai.

**Interview:** "Middleware is a function that runs between receiving a request and executing the route controller. Here it verifies the JWT."

---

# 5. Frontend — Customer website (React)

## 5.1 `frontend/src/main.jsx`

- `ReactDOM.createRoot(...)`: HTML ke root div mein React app mount karta hai.
- `BrowserRouter`: URL-based page navigation enable karta hai.
- `StoreContextProvider`: shared cart, food list aur token state provide karta hai.
- `App`: main application component.

**React:** UI components banane ki JavaScript library.

## 5.2 `frontend/src/App.jsx`

- `useState(false)`: login popup initially hidden.
- `Navbar`: top navigation.
- `Routes` and `Route`: URL ke hisaab se page render.
- `/`: Home.
- `/cart`: Cart.
- `/order`: Checkout form.
- `/verify`: Payment result.
- `/myorders`: User orders.
- `ToastContainer`: success/error notifications.
- `Footer`: bottom section.

## 5.3 `frontend/src/context/StoreContext.jsx`

**Context kyun?** Har component ko cart functions manually props mein pass karne ki zaroorat nahi hoti.

- `createContext(null)`: shared context create.
- `useState({})`: cart item IDs aur quantities.
- `url`: API base URL environment variable se.
- `token`: logged-in user token.
- `food_list`: backend se aayi food list.
- `addToCart`: item quantity increase; logged-in user ho to backend API call.
- `removeFromCart`: quantity decrease; backend API call.
- `getTotalCartAmount`: food price × quantity ka total.
- `fetchFoodList`: `GET /api/food/list` call.
- `loadCardData`: login token ke sath saved cart fetch.
- `useEffect`: app load par food list aur localStorage token read.
- `StoreContext.Provider`: shared values children components ko provide karta hai.

## 5.4 Customer pages

| File | Kaam |
|---|---|
| `pages/Home/Home.jsx` | Homepage; Header, categories, food list aur app download section |
| `pages/Cart/Cart.jsx` | Selected food, quantity, subtotal, delivery fee, checkout |
| `pages/PlaceOrder/PlaceOrder.jsx` | Customer delivery information collect aur order API call |
| `pages/Verify/Verify.jsx` | Payment result API ko bhejta hai |
| `pages/MyOrders/MyOrders.jsx` | Logged-in user ke orders show karta hai |

**Home.jsx important lines:**
- `useState("All")`: default category All.
- `setCategory`: user ki selected category change.
- `Header`: hero/banner section.
- `ExploreMenu`: categories show.
- `FoodDisplay`: selected category ke food cards.
- `AppDownload`: mobile app promotional section.

**Cart.jsx important lines:**
- `useContext(StoreContext)`: cart state/functions access.
- `food_list.map()`: food items loop.
- `cartItems[item._id] > 0`: sirf cart mein selected item show.
- `item.price * quantity`: line item total.
- `getTotalCartAmount()`: subtotal.
- `navigate("/order")`: checkout page open.

**PlaceOrder.jsx important lines:**
- `useState({...})`: address form fields ki state.
- `onChangeHandler`: input value update.
- `event.preventDefault()`: browser ka default form reload stop.
- `Form data/orderData`: address, cart items aur amount prepare.
- `axios.post(.../api/order/place)`: backend ko order bhejta hai.
- `window.location.replace(session_url)`: Stripe checkout page open.
- `useEffect`: token/cart empty ho to checkout se wapas cart par bhejta hai.

**MyOrders.jsx:** API se current user ke orders leta hai aur status show karta hai.

**Verify.jsx:** URL se `success` aur `orderId` read karke backend verify endpoint call karta hai.

## 5.5 Frontend components

| Component | Role |
|---|---|
| `Navbar` | Logo, links, cart, login controls |
| `Header` | Main hero banner |
| `ExploreMenu` | Food category filter |
| `FoodDisplay` | Food grid |
| `FoodItem` | One food card and add/remove controls |
| `LoginPopup` | Login/register form |
| `Footer` | Contact and footer links |
| `AppDownload` | App download promotional block |

**CSS files:** CSS controls color, spacing, fonts, responsive layout, hover effects and component appearance. CSS does not normally contain business logic.

---

# 6. Admin dashboard

## 6.1 `admin/src/main.jsx`

Customer frontend jaisa React entry point hai:
- Root HTML element mein React mount.
- `BrowserRouter` admin page navigation handle karta hai.
- `StoreContextProvider` admin token aur role state share karta hai.
- `App` admin dashboard render karta hai.

## 6.2 `admin/src/App.jsx`

- `Navbar`: top admin bar.
- `Sidebar`: left navigation.
- `Routes`: Add, List aur Orders pages.
- `Login`: admin authentication.
- `ToastContainer`: notifications.
- `VITE_API_URL`: API address environment se.

## 6.3 `admin/src/context/StoreContext.jsx`

- `token`: admin JWT.
- `admin`: admin role flag.
- `useEffect`: localStorage se saved token/role read.
- Provider in values ko dashboard components ke sath share karta hai.

## 6.4 Admin pages

### `components/Login/Login.jsx`
1. Email/password form state mein rakhta hai.
2. `POST /api/user/login` request bhejta hai.
3. Response role admin ho to token save karta hai.
4. localStorage mein token/admin flag save hota hai.
5. Admin ko Add page par navigate karta hai.
6. Normal user ko admin dashboard access nahi deta.

### `pages/Add/Add.jsx`
1. Food name, description, price aur category collect karta hai.
2. Image select karta hai.
3. `FormData` banata hai because image file multipart form-data mein send hoti hai.
4. Token ke sath `POST /api/food/add` call karta hai.
5. Success par form clear aur toast show.

### `pages/List/List.jsx`
1. `GET /api/food/list` se menu read.
2. `setList` React state update.
3. Food image, name, category aur price display.
4. Delete click par `POST /api/food/remove`.
5. List dobara fetch karta hai.

### `pages/Orders/Orders.jsx`
1. `GET /api/order/list` se admin orders read.
2. Customer name/address, items aur amount show.
3. Dropdown se new order status select.
4. `POST /api/order/status` backend ko bhejta hai.
5. Update ke baad orders refresh.

---

# 7. Docker — Application ko container banana

## 7.1 Backend Dockerfile

```dockerfile
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p /app/uploads && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["node", "server.js"]
```

| Line | Explanation |
|---|---|
| `FROM node:20-alpine` | Lightweight Alpine Linux ke sath Node 20 base image. |
| `ENV NODE_ENV=production` | Application ko production mode batata hai. |
| `WORKDIR /app` | Container ke andar working folder. |
| `COPY package*.json ./` | package.json aur lock file copy. |
| `RUN npm install --omit=dev` | Production dependencies install. |
| `COPY . .` | Backend source code copy. |
| `RUN mkdir ... chown ...` | Upload folder create aur node user ko ownership. |
| `USER node` | App root ke bajaye non-root user se run. |
| `EXPOSE 4000` | Document karta hai app port 4000 use karta hai. |
| `CMD [...]` | Container start par Node server run. |

**Docker image:** application ka packaged template.  
**Container:** image ka running instance.  
**Dockerfile:** image build karne ki instructions.

## 7.2 Frontend/Admin Dockerfile

Dono Dockerfiles multi-stage build use karte hain:

1. `FROM node:20-alpine AS build`: pehla stage build environment.
2. `WORKDIR /app`: working directory.
3. `COPY package*.json ./`: dependency files.
4. `RUN npm ci`: lockfile ke mutabiq repeatable dependencies install.
5. `COPY . .`: source code copy.
6. `ARG VITE_API_URL` and `ENV`: build-time API config.
7. `RUN npm run build`: React/Vite static production files banata hai.
8. `FROM nginx:1.27-alpine`: second, lightweight runtime stage.
9. `COPY --from=build ...`: built website Nginx folder mein copy.
10. `COPY nginx.conf ...`: custom Nginx configuration copy.
11. `EXPOSE 80`: web server port.
12. `HEALTHCHECK ...`: container ke andar /health check.

**Multi-stage build kyun?** Build tools aur Node dependencies final web image mein nahi aate; final image smaller hoti hai.

## 7.3 .dockerignore

- `node_modules`: local dependencies image build context mein copy nahi.
- `dist`: purana build output ignore.
- `.env`: secrets accidentally image mein copy na hon.
- `.git`: Git history image mein na jaye.

## 7.4 Nginx config

| Directive | Meaning |
|---|---|
| `listen 80` | Nginx HTTP port 80 par listen. |
| `server_name _` | Any host header accept. |
| `root` | Website files ka folder. |
| `index index.html` | Default homepage. |
| `location /api/` | API requests backend Service ko proxy. |
| `location /images/` | Image requests backend Service ko proxy. |
| `location = /health` | Health check ke liye simple OK response. |
| `try_files ... /index.html` | React Router routes ko index.html par fallback. |

**Reverse proxy:** Nginx browser ki request receive karta hai aur internal backend service ko forward karta hai.

---

# 8. Kubernetes — Task 10 ka main topic

## 8.1 Kubernetes basic concepts

| Term | Easy meaning |
|---|---|
| Cluster | Kubernetes ka complete environment |
| Node | Machine/VM jahan workloads run hote hain |
| Pod | Smallest deployable unit; container(s) run karta hai |
| Deployment | Stateless app pods ko create/scale/replace karta hai |
| StatefulSet | Stateful workload jaise MongoDB manage karta hai |
| Service | Pods ko stable network address deta hai |
| Ingress | External HTTP/HTTPS traffic ko route karta hai |
| ConfigMap | Non-secret configuration store |
| Secret | Passwords/tokens/keys store |
| PV | Cluster storage resource |
| PVC | Application ki storage request |
| Probe | App healthy/ready hai ya nahi check |
| Namespace | Cluster resources ko logical group mein separate karta hai |

## 8.2 `k8s/namespace.yaml`

- `apiVersion: v1`: Kubernetes core API.
- `kind: Namespace`: resource type Namespace.
- `metadata.name: mesa-food`: namespace ka naam.
- `labels`: resource ko identify/group karne ke labels.

**Why namespace?** Application ke resources ko cluster mein alag group mein organize karne ke liye.

## 8.3 `k8s/configmap.yaml`

- `kind: ConfigMap`: normal configuration resource.
- `metadata.name: mesa-config`: ConfigMap name.
- `namespace: mesa-food`: namespace.
- `data`: key-value settings.
- `NODE_ENV`: production mode.
- `PORT`: backend port 4000.
- `MONGO_DB`: database name label/config value.
- `UPLOAD_DIR`: image upload directory.
- `FRONTEND_URL`: frontend base URL.

**ConfigMap vs Secret:** ConfigMap non-sensitive settings ke liye; Secret passwords/API keys ke liye. Kubernetes Secret by default automatically encrypted-at-rest nahi hota in every cluster; production mein encryption at rest aur RBAC enable karna chahiye.

## 8.4 `k8s/secret.example.yaml`

- `kind: Secret`: sensitive settings ka Kubernetes object.
- `type: Opaque`: generic key-value secret.
- `stringData`: plain text input; Kubernetes isay internally base64 data form mein convert karta hai.
- `MONGO_ROOT_USERNAME`: MongoDB admin username.
- `MONGO_ROOT_PASSWORD`: MongoDB password.
- `MONGO_URL`: backend ka MongoDB connection URI.
- `JWT_SECRET`: JWT token signing key.
- `STRIPE_SECRET_KEY`: Stripe private API key.

**Important:** Is file mein placeholders hain. Real password/key GitHub par push nahi karna. Secret ko terminal se create karo as README says.

## 8.5 `k8s/storage.yaml` — PV and PVC

File mein do storage pairs hain.

**MongoDB PV:**
- `kind: PersistentVolume`: cluster storage resource create.
- `capacity.storage: 5Gi`: 5 GB requested capacity.
- `accessModes: ReadWriteOnce`: ek node read/write mount kar sakta hai.
- `persistentVolumeReclaimPolicy: Retain`: PVC delete hone par PV data retain policy use karta hai.
- `storageClassName: manual`: manually provisioned storage class name.
- `hostPath.path`: single-node lab machine ka directory.

**MongoDB PVC:**
- `kind: PersistentVolumeClaim`: workload ki storage request.
- `storage: 5Gi`: 5 GB claim.
- `volumeName`: specific PV bind karne ki request.

**Uploads PV/PVC:** Same idea, lekin food images ke liye 2Gi storage.

**PV vs PVC interview answer:** "PV is the actual storage resource available in the cluster. PVC is the application's request for that storage. A pod mounts the PVC, not the PV directly."

**Data persistence:** Pod delete/recreate ho sakta hai, lekin correctly configured persistent volume par data survive kar sakta hai.

**Important limitation:** `hostPath` learning/single-node cluster ke liye hai. Multi-node/production cluster mein CSI-backed storage class use karo. Multiple backend replicas same ReadWriteOnce upload volume ko different nodes se safely share nahi kar sakte; production mein shared object storage (e.g. S3) ya suitable RWX storage design karo.

## 8.6 `k8s/mongodb.yaml`

- `kind: StatefulSet`: MongoDB jaise stateful app ke liye.
- `serviceName: mongodb`: stable network identity ke liye headless/service association (is manifest mein Service ClusterIP hai).
- `replicas: 1`: one MongoDB pod.
- `selector.matchLabels`: StatefulSet kis pod ko manage karega.
- `template`: pod template.
- `containers`: pod ke andar container definition.
- `image: mongo:7`: MongoDB 7 image.
- `containerPort: 27017`: MongoDB port.
- `env.valueFrom.secretKeyRef`: username/password Secret se read.
- `volumeMounts`: storage ko container folder mein attach.
- `mountPath: /data/db`: MongoDB ka actual data folder.
- `readinessProbe.tcpSocket`: check MongoDB port accept kar raha hai.
- `livenessProbe.tcpSocket`: check container alive hai.
- `volumes.persistentVolumeClaim`: pod PVC use karta hai.
- Neeche `Service`: MongoDB ko stable internal DNS `mongodb` deta hai.
- `port/targetPort: 27017`: Service port aur container port.

## 8.7 `k8s/backend.yaml`

- `kind: Deployment`: backend pods manage.
- `replicas: 2`: two API pod copies.
- `selector`: app=backend label wale pods select.
- `template.metadata.labels`: pod label.
- `image`: Docker Hub backend image.
- `imagePullPolicy: IfNotPresent`: image local node par ho to use, warna pull.
- `containerPort: 4000`: API port.
- `envFrom.configMapRef`: ConfigMap settings environment variables mein load.
- `env.secretKeyRef`: Mongo URI, JWT secret, Stripe key Secret se.
- `volumeMounts`: uploads storage container mein mount.
- `readinessProbe`: /health endpoint ready check.
- `livenessProbe`: /health endpoint alive check.
- `resources.requests`: minimum scheduling resource request.
- `resources.limits`: maximum CPU/memory limit.
- Neeche Service backend pods ko stable DNS `backend` deta hai.

**Readiness vs Liveness:**
- Readiness: pod traffic receive karne ke liye ready hai?
- Liveness: app stuck/dead ho gayi? Kubernetes container restart kar sakta hai.

## 8.8 `k8s/frontend.yaml` and `k8s/admin.yaml`

Dono React production websites hain:
- Deployment website pods create karta hai.
- Image Docker Hub se aati hai.
- Nginx container port 80 expose karta hai.
- Readiness/liveness health URL check karte hain.
- Service frontend/admin pods ko stable internal name aur port deta hai.
- Customer frontend 2 replicas; admin frontend 1 replica.

## 8.9 `k8s/ingress.yaml`

- `kind: Ingress`: HTTP routing rules.
- `ingressClassName: nginx`: NGINX Ingress Controller use.
- `host: food.local`: customer domain.
- `service.name: customer-frontend`: customer request frontend Service ko.
- `host: admin.food.local`: admin domain.
- `service.name: admin-frontend`: admin request admin Service ko.
- `pathType: Prefix`: path prefix matching.
- `proxy-body-size: 10m`: Nginx upload request size annotation.

**Ingress vs Service:** Service cluster ke andar pods ko stable network deta hai; Ingress external HTTP host/path routing karta hai. Ingress resource ko kaam karne ke liye Ingress Controller install hona zaroori hai.

## 8.10 `k8s/kustomization.yaml`

- `kind: Kustomization`: Kustomize configuration file.
- `namespace: mesa-food`: listed resources par namespace apply.
- `resources`: saare YAML manifests ki list.
- `kubectl apply -k k8s/`: Kustomize ke through listed resources apply karta hai.

Secret example is list mein jaan boojh kar include nahi hai. Real Secret separately create hota hai.

---

# 9. Docker and Kubernetes deployment commands

Run from repository root:

```bash
# Build backend image
docker build -t nasirbloch323/mesa-food-backend:task10 -f backend/Dockerfile backend

# Build customer website image
docker build -t nasirbloch323/mesa-food-frontend:task10 -f frontend/Dockerfile frontend

# Build admin dashboard image
docker build -t nasirbloch323/mesa-food-admin:task10 -f admin/Dockerfile admin

# Login to Docker Hub
docker login

# Push images to Docker Hub
docker push nasirbloch323/mesa-food-backend:task10
docker push nasirbloch323/mesa-food-frontend:task10
docker push nasirbloch323/mesa-food-admin:task10
```

**Command explanation:**
- `docker build`: Dockerfile se image banata hai.
- `-t`: image name aur tag set karta hai.
- `-f`: Dockerfile ka path batata hai.
- Last argument: build context directory.
- `docker login`: Docker Hub authentication.
- `docker push`: local image registry par upload.

Create namespace and secret first:

```bash
kubectl create namespace mesa-food
kubectl create secret generic mesa-secret -n mesa-food \
  --from-literal=MONGO_ROOT_USERNAME='YOUR_USER' \
  --from-literal=MONGO_ROOT_PASSWORD='YOUR_PASSWORD' \
  --from-literal=MONGO_URL='YOUR_MONGO_URI' \
  --from-literal=JWT_SECRET='YOUR_LONG_RANDOM_SECRET' \
  --from-literal=STRIPE_SECRET_KEY='YOUR_STRIPE_TEST_KEY'
```

Apply all manifests:

```bash
kubectl apply -k k8s/
```

Check:

```bash
kubectl get pods -n mesa-food
kubectl get services -n mesa-food
kubectl get deployments -n mesa-food
kubectl get pvc -n mesa-food
kubectl get pv
kubectl get ingress -n mesa-food
```

Troubleshooting:

```bash
kubectl describe pod POD_NAME -n mesa-food
kubectl logs deployment/backend -n mesa-food
kubectl logs statefulset/mongodb -n mesa-food
kubectl describe pvc mongodb-pvc -n mesa-food
kubectl get events -n mesa-food --sort-by=.metadata.creationTimestamp
```

- `get`: resource list.
- `describe`: detailed status/events.
- `logs`: container output.
- `apply`: create/update resources from YAML.
- `-n`: namespace select.
- `-k`: Kustomize directory apply.

---

# 10. Most important interview questions

**Q1. What is the purpose of this project?**  
A: "To deploy a full-stack food delivery application on Kubernetes and demonstrate ConfigMap, Secrets and persistent storage."

**Q2. Why Docker?**  
A: "Docker packages the application and its runtime dependencies into portable images, so it behaves consistently across environments."

**Q3. Why Kubernetes?**  
A: "Kubernetes manages containers, scaling, service discovery, restarts and deployment rollouts."

**Q4. What is a ConfigMap?**  
A: "A Kubernetes object used to store non-sensitive configuration separately from the application image."

**Q5. What is a Secret?**  
A: "A Kubernetes object for sensitive values such as database passwords, JWT secrets and API keys. Access must be restricted."

**Q6. ConfigMap and Secret difference?**  
A: "ConfigMap is for normal configuration. Secret is for sensitive configuration."

**Q7. What is PV?**  
A: "PersistentVolume is a storage resource in the Kubernetes cluster."

**Q8. What is PVC?**  
A: "PersistentVolumeClaim is a request made by a workload for persistent storage."

**Q9. Why do we need persistent storage?**  
A: "A container's writable layer is temporary. Persistent storage keeps database and uploaded files when pods are recreated."

**Q10. Why StatefulSet for MongoDB?**  
A: "MongoDB is stateful and needs stable identity and persistent storage. StatefulSet is designed for stateful workloads."

**Q11. Why Deployment for backend?**  
A: "The API is stateless in this design, so Deployment can run multiple interchangeable replicas and replace failed pods."

**Q12. Why Service?**  
A: "Pod IPs can change. Service gives a stable internal endpoint to reach matching pods."

**Q13. Why Ingress?**  
A: "It routes external HTTP traffic to different Services based on host or path."

**Q14. Readiness and liveness probes?**  
A: "Readiness decides whether a pod should receive traffic. Liveness checks whether the container should be restarted."

**Q15. Why multi-stage Docker build?**  
A: "The Node build stage compiles React. The final Nginx stage only contains static output, making the runtime image smaller."

**Q16. Why non-root user in backend Dockerfile?**  
A: "Running as a non-root user reduces the impact if the application is compromised."

**Q17. What is JWT?**  
A: "A signed token used to identify an authenticated user on later API requests."

**Q18. What is middleware?**  
A: "A function that runs before the controller. Our auth middleware verifies the JWT and attaches the user ID."

**Q19. How does the customer place an order?**  
A: "The customer adds food to cart, enters delivery information, the frontend calls the backend, and the backend creates a Stripe Checkout session."

**Q20. How do you check if pods are running?**  
A: "`kubectl get pods -n mesa-food`."

**Q21. What if a pod crashes?**  
A: "Kubernetes controllers try to maintain the desired replica count and create a replacement pod. I check logs and events to find the root cause."

**Q22. What is a namespace?**  
A: "A logical boundary to organize and isolate resources inside a cluster."

**Q23. What is Kustomize?**  
A: "A Kubernetes configuration tool that combines and customizes multiple YAML manifests. Here I use `kubectl apply -k k8s/`."

**Q24. Is this production-ready?**  
A: "This is a learning/demo deployment foundation. Before production, I would replace hostPath storage with managed CSI storage, use shared durable storage for uploads, secure Ingress with TLS, restrict CORS/RBAC, configure Secret encryption, and verify payments with Stripe webhooks."

---

# 11. Important things you must know honestly

1. This branch contains Dockerfiles and Kubernetes manifests, but images must still be built and pushed before pods can pull them.
2. A Kubernetes cluster and NGINX Ingress Controller must already be available.
3. Create the real `mesa-secret` before applying workloads. Never commit actual credentials.
4. Sample PV uses `hostPath`, suitable only for a single-node lab. It is not production-grade shared storage.
5. Uploads PVC is ReadWriteOnce while backend has two replicas. For a multi-node cluster, use shared storage or object storage such as S3.
6. Stripe test credentials and correct redirect URLs are required to test payment.
7. Browser payment redirect alone is not secure proof of payment. Production should verify Stripe webhook signatures on the backend.
8. The README's local start commands need the correct MongoDB, JWT and Stripe environment variables configured first.
9. A GitHub push does not prove the website builds or the Kubernetes app is running. Run build and deployment tests and inspect the results.

---

# 12. One-minute explanation of Task 10 YAML

Interview mein agar interviewer `ConfigMap, Secret, PV, PVC` poochay, ye simple example do:

"First, I created a namespace called mesa-food to group the project resources. I used a ConfigMap for non-sensitive settings like the application port and upload directory. I used a Kubernetes Secret for the MongoDB connection string, JWT signing key and Stripe key. For storage, I created PersistentVolumes and PersistentVolumeClaims. MongoDB mounts its PVC at /data/db, and the backend mounts an uploads PVC at /app/uploads. I used a MongoDB StatefulSet because the database is stateful, Deployments for the API and React applications, Services for stable internal networking, and NGINX Ingress to route customer and admin domains."

---

# 13. Interview practice order

1. Pehle 30-second introduction yaad karo.
2. Phir architecture diagram paper par draw karo.
3. Backend ka request flow samjho: Route → Middleware → Controller → Model → MongoDB.
4. Dockerfiles explain karo.
5. Kubernetes resources ka difference yaad karo: Deployment, StatefulSet, Service, Ingress, ConfigMap, Secret, PV, PVC.
6. Deployment commands khud terminal mein run karo.
7. `kubectl get pods`, `kubectl logs`, `kubectl describe` practice karo.
8. Interviewer ko wahi claim karo jo tumne khud run karke verify kiya ho.

**Golden tip:** Har cheez ratta mat lagao. Ye samjho: Browser request bhejta hai → Ingress route karta hai → Service pod tak pohanchati hai → Backend database se baat karta hai → response browser ko milta hai. Storage PVC se mount hoti hai aur settings ConfigMap/Secret se aati hain.
