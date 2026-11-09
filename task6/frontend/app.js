// Use a relative API path so the browser calls the same host that served the website.
const API_URL = "";
// Keep the currently selected food item in browser memory.
let selectedItem = null;
// Cache the menu container so it can be updated after the API response.
const menuGrid = document.getElementById("menu-grid");
// Cache the status pill to show API health.
const statusPill = document.getElementById("status");
// Cache the order button and message elements.
const orderButton = document.getElementById("order-button");
const orderMessage = document.getElementById("order-message");

// Load menu data from the backend API through the Nginx reverse proxy.
async function loadMenu() {
  try {
    // Request the public menu endpoint on the same host.
    const response = await fetch(`${API_URL}/api/foods`);
    // Convert the JSON response into JavaScript data.
    const foods = await response.json();
    // Stop if the API returned an unsuccessful HTTP status.
    if (!response.ok) throw new Error("Menu request failed");
    // Mark the backend connection as healthy.
    statusPill.textContent = "API connected";
    statusPill.classList.add("online");
    // Show the number of menu items.
    document.getElementById("count").textContent = `${foods.length} items`;
    // Render one card for each menu item returned by the API.
    menuGrid.innerHTML = foods.map((food) => `
      <article class="food-card">
        <div class="food-emoji" aria-hidden="true">${food.emoji}</div>
        <h3>${escapeHtml(food.name)}</h3>
        <p>${escapeHtml(food.description)}</p>
        <div class="food-bottom">
          <span class="price">$${Number(food.price).toFixed(2)}</span>
          <button class="add-button" type="button" aria-label="Select ${escapeHtml(food.name)}" data-id="${food.id}">+</button>
        </div>
      </article>`).join("");
    // Attach selection handlers after the cards have been inserted.
    menuGrid.querySelectorAll(".add-button").forEach((button) => {
      button.addEventListener("click", () => selectFood(foods.find((food) => food.id === button.dataset.id)));
    });
  } catch (error) {
    // Show a useful message when the backend cannot be reached.
    statusPill.textContent = "API unavailable";
    menuGrid.innerHTML = '<p class="muted">Could not load the menu. Check that all Docker services are healthy.</p>';
    console.error("Menu loading error:", error);
  }
}

// Escape API-provided text before inserting it into HTML.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

// Store the selected item and enable the demo checkout button.
function selectFood(food) {
  selectedItem = food;
  orderMessage.textContent = `${food.name} selected — $${Number(food.price).toFixed(2)}`;
  orderButton.disabled = false;
}

// Submit a demo order to the backend API.
async function placeOrder() {
  if (!selectedItem) return;
  orderButton.disabled = true;
  orderMessage.textContent = "Sending your demo order…";
  try {
    // Send only the selected menu item ID to the backend.
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodId: selectedItem.id, quantity: 1 })
    });
    // Read the API response for confirmation or error details.
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Order failed");
    orderMessage.textContent = `Order #${result.order.id} saved successfully. Total: $${Number(result.order.total).toFixed(2)}`;
  } catch (error) {
    orderMessage.textContent = `Could not place order: ${error.message}`;
    console.error("Order error:", error);
  } finally {
    // Allow another order attempt after the request finishes.
    orderButton.disabled = !selectedItem;
  }
}

// Connect the checkout button to the order submission function.
orderButton.addEventListener("click", placeOrder);
// Start loading the menu when the page script is ready.
loadMenu();