const { getOrCreateCart, addOrder, stats } = require("../store");
const { findActiveDiscountCode, markDiscountUsed } = require("./discountService");
const { logger } = require("../logger");

function addItemToCart(userId, item) {
  const cart = getOrCreateCart(userId);

  const productId = item.productId;
  const name = item.name;
  const price = Number(item.price);
  const quantity = item.quantity != null ? Number(item.quantity) : 1;

  const existing = cart.items.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, name, price, quantity });
  }

  return cart;
}

function getCart(userId) {
  return getOrCreateCart(userId);
}

function checkoutCart(userId, discountCode) {
  const cart = getOrCreateCart(userId);

  if (!cart.items.length) {
    throw new Error("Cart is empty");
  }

  const totalBeforeDiscount = cart.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  let discountAmount = 0;
  let codeObj;

  if (discountCode) {
    codeObj = findActiveDiscountCode(discountCode);
    if (!codeObj) {
      logger.info("Invalid or expired discount code attempted", {
        userId,
        discountCode
      });
      throw new Error("Invalid or expired discount code");
    }
    discountAmount = totalBeforeDiscount * 0.1;
  }

  const order = {
    id: "ORD-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    userId,
    items: [...cart.items],
    totalBeforeDiscount,
    discountAmount,
    totalAfterDiscount: totalBeforeDiscount - discountAmount,
    discountCode: discountCode || undefined,
    createdAt: new Date()
  };

  const itemsCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  stats.totalItemsSold += itemsCount;
  stats.totalPurchaseAmount += totalBeforeDiscount;
  stats.totalDiscountAmount += discountAmount;

  if (codeObj) {
    markDiscountUsed(codeObj, order);
  }

  addOrder(order);

  // Clear cart
  cart.items = [];

  logger.info("Order created", {
    orderId: order.id,
    userId,
    totalBeforeDiscount,
    discountAmount,
    totalAfterDiscount: order.totalAfterDiscount
  });

  return order;
}

module.exports = {
  addItemToCart,
  getCart,
  checkoutCart
};