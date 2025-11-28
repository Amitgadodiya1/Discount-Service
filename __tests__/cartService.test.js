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
  stats.totalOrdersPlaced = 2; // so next order is eligible for discount
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