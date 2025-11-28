// Global in-memory state for this assignment

const carts = new Map();   // userId -> { userId, items: [] }
const orders = new Map();  // userId -> [order, order, ...]
const products = [];

const stats = {
  totalItemsSold: 0,
  totalPurchaseAmount: 0,  // before discount
  totalDiscountAmount: 0,
  totalOrdersPlaced: 0,
  discountCodes: []        // { code, used, orderId? }
};

// Every Nth order is eligible for code generation
const NTH_ORDER_FOR_DISCOUNT = 3 // for now i have hardcode this but we can make it dynamic and store in the env ;

function getOrCreateCart(userId) {
  let cart = carts.get(userId);
  if (!cart) {
    cart = { userId, items: [] };
    carts.set(userId, cart);
  }
  return cart;
}

function addOrder(order) {
  const userOrders = orders.get(order.userId) || [];
  userOrders.push(order);
  orders.set(order.userId, userOrders);

  stats.totalOrdersPlaced += 1;
}

module.exports = {
  carts,
  orders,
  stats,
  NTH_ORDER_FOR_DISCOUNT,
  products,
  getOrCreateCart,
  addOrder
};