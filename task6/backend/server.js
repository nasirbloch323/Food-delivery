// Load Express to create the REST API server.
const express = require("express");
// Load CORS middleware so the browser frontend can call this API.
const cors = require("cors");
// Load Mongoose to connect to MongoDB and define data models.
const mongoose = require("mongoose");

// Create the Express application instance.
const app = express();
// Read the HTTP port from the environment, defaulting to 5000.
const PORT = Number(process.env.PORT || 5000);
// Read the MongoDB connection string from the environment.
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/foodexpress";

// Enable cross-origin requests from the frontend.
app.use(cors());
// Parse incoming JSON request bodies.
app.use(express.json());

// Define the schema used to store a food order.
const orderSchema = new mongoose.Schema({
  foodId: { type: String, required: true },
  foodName: { type: String, required: true },
  quantity: { type: Number, min: 1, required: true },
  total: { type: Number, min: 0, required: true },
  createdAt: { type: Date, default: Date.now }
});
// Create the MongoDB model for orders.
const Order = mongoose.model("Order", orderSchema);

// Keep a small menu in code so the project works without a separate seed step.
const foods = [
  { id: "classic-burger", name: "Classic Burger", description: "Grilled patty, crisp lettuce and house sauce.", price: 8.5, emoji: "🍔" },
  { id: "garden-pizza", name: "Garden Pizza", description: "Stone-baked pizza with fresh vegetables.", price: 11.25, emoji: "🍕" },
  { id: "crispy-fries", name: "Crispy Fries", description: "Golden potato fries with a pinch of sea salt.", price: 3.75, emoji: "🍟" },
  { id: "fresh-salad", name: "Fresh Salad", description: "A bright mix of greens and seasonal vegetables.", price: 6.5, emoji: "🥗" },
  { id: "noodle-bowl", name: "Noodle Bowl", description: "Warm noodles tossed with a savoury sauce.", price: 9.0, emoji: "🍜" },
  { id: "berry-smoothie", name: "Berry Smoothie", description: "A chilled blend of berries and yoghurt.", price: 4.5, emoji: "🥤" }
];

// Provide a lightweight health endpoint for Docker and load balancers.
app.get("/api/health", (request, response) => {
  response.json({ status: "ok", service: "foodexpress-api", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Return the available food menu.
app.get("/api/foods", (request, response) => {
  response.json(foods);
});

// Validate and persist a new order in MongoDB.
app.post("/api/orders", async (request, response) => {
  try {
    // Read the food ID and quantity sent by the frontend.
    const { foodId, quantity } = request.body;
    // Find the requested item in the trusted server-side menu.
    const food = foods.find((item) => item.id === foodId);
    // Reject unknown food IDs and invalid quantities.
    if (!food || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return response.status(400).json({ error: "Choose a valid menu item and quantity between 1 and 20." });
    }
    // Calculate the price on the server instead of trusting the browser.
    const total = Number((food.price * quantity).toFixed(2));
    // Save the order document in MongoDB.
    const savedOrder = await Order.create({ foodId, foodName: food.name, quantity, total });
    // Return a compact order confirmation to the frontend.
    return response.status(201).json({ message: "Order created", order: { id: savedOrder.id, foodName: savedOrder.foodName, quantity: savedOrder.quantity, total: savedOrder.total } });
  } catch (error) {
    // Log the internal error and return a safe message to the client.
    console.error("Order creation failed:", error);
    return response.status(500).json({ error: "Unable to save the order." });
  }
});

// Return a consistent JSON response for unknown routes.
app.use((request, response) => response.status(404).json({ error: "Route not found" }));

// Connect to MongoDB before accepting application traffic.
async function start() {
  try {
    // Wait for MongoDB to accept the configured connection.
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");
    // Start listening on all container network interfaces.
    app.listen(PORT, "0.0.0.0", () => console.log(`FoodExpress API listening on port ${PORT}`));
  } catch (error) {
    // Exit with a failure code so Docker and Jenkins detect startup failure.
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// Start the API only when this file is executed directly.
if (require.main === module) start();

// Export app and menu so automated tests can exercise the API.
module.exports = { app, foods };