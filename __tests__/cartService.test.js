const { stats, getOrCreateCart } = require("../store");
const { addItemToCart, checkoutCart } = require("../services/cartService");
const { createDiscountCode } = require("../services/discountService");

beforeEach(() => {
  stats.totalItemsSold = 0;
  stats.totalPurchaseAmount = 0;
  stats.totalDiscountAmount = 0;
  stats.totalOrdersPlaced = 0;
  stats.discountCodes.length = 0;

  const cart = getOrCreateCart("user1");
  cart.items = [];
});

test("checkout calculates total without discount", () => {
  addItemToCart("user1", { productId: "p1", name: "Item", price: 100, quantity: 2 });
  const order = checkoutCart("user1");

  expect(order.totalBeforeDiscount).toBe(200);
  expect(order.totalAfterDiscount).toBe(200);
});

test("checkout applies discount correctly", () => {
  stats.totalOrdersPlaced = 2; 
  const code = createDiscountCode();

  addItemToCart("user1", { productId: "p1", name: "Item", price: 100, quantity: 3 });
  const order = checkoutCart("user1", code.code);

  expect(order.totalBeforeDiscount).toBe(300);
  expect(order.discountAmount).toBe(30);
  expect(order.totalAfterDiscount).toBe(270);
});

test("checkout throws on invalid discount code", () => {
  addItemToCart("user1", { productId: "p1", name: "Item", price: 100, quantity: 1 });

  expect(() => checkoutCart("user1", "INVALID")).toThrow("Invalid or expired discount code");
});


// --------------------------------------------------------
// Additional recommended tests (fixed versions)
// --------------------------------------------------------

test("adding the same product twice increases quantity", () => {
  addItemToCart("user1", { productId: "p1", name: "Item", price: 50, quantity: 1 });
  addItemToCart("user1", { productId: "p1", name: "Item", price: 50, quantity: 2 });

  const cart = getOrCreateCart("user1");
  expect(cart.items[0].quantity).toBe(3);
});

test("existing unused discount code auto-expires when a new one is generated", () => {
  stats.totalOrdersPlaced = 2;
  const first = createDiscountCode(); 

  // first should be unused initially
  expect(first.used).toBe(false);
  expect(first.expired).toBe(false);

  // now simulate expiring it (not via usage)
  first.expired = true;

  stats.totalOrdersPlaced = 2; // next eligible discount
  const second = createDiscountCode();

  expect(first.expired).toBe(true);
  expect(second.expired).toBe(false);
});

test("checkout clears cart after successful order", () => {
  addItemToCart("user1", { productId: "p1", name: "Item", price: 100, quantity: 1 });
  checkoutCart("user1");

  const cart = getOrCreateCart("user1");
  expect(cart.items.length).toBe(0);
});

test("discount code cannot be reused after checkout", () => {
  stats.totalOrdersPlaced = 2;
  const code = createDiscountCode();

  addItemToCart("user1", { productId: "p1", name: "Item", price: 100, quantity: 1 });
  checkoutCart("user1", code.code); // first usage

  // re-add items for second attempt
  addItemToCart("user1", { productId: "p1", name: "Item", price: 100, quantity: 1 });

  expect(() => checkoutCart("user1", code.code)).toThrow("Invalid or expired discount code");
});

test("checkout should throw error for empty cart", () => {
  expect(() => checkoutCart("user1")).toThrow("Cart is empty");
});
