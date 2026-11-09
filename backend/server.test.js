// Import Node's built-in test runner and assertion helpers.
const test = require("node:test");
const assert = require("node:assert/strict");
// Import the menu data from the API module without starting a server.
const { foods } = require("./server");

// Verify that the public menu contains unique IDs and valid prices.
test("menu has unique IDs and non-negative prices", () => {
  const ids = foods.map((food) => food.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(foods.every((food) => food.price >= 0));
});

// Verify that each menu item has the fields required by the frontend.
test("each menu item has a name, description and emoji", () => {
  assert.ok(foods.every((food) => food.name && food.description && food.emoji));
});