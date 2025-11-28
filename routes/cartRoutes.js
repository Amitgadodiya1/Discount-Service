const express = require("express");
const router = express.Router();
const { addItemToCart, getCart, checkoutCart } = require("../services/cartService");

// Add item to cart
/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: X-User-Role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.post("/cart/items", (req, res) => {
  const userId = req.userId;
  const { productId, name, price, quantity } = req.body || {};

  if (!productId || !name || price == null) {
    return res.status(400).json({
      error: "productId, name and price are required"
    });
  }

  if (isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ error: "price must be a non-negative number" });
  }

  if (quantity != null && (isNaN(quantity) || Number(quantity) <= 0)) {
    return res.status(400).json({ error: "quantity must be a positive number" });
  }

  const cart = addItemToCart(userId, { productId, name, price, quantity });
  return res.json({ cart });
});
/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user cart items
 *     tags: [Cart]
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: X-User-Role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *     responses:
 *       200:
 *         description: Returns current cart contents
 */
// Get cart
router.get("/cart", (req, res) => {
  const userId = req.userId;
  const cart = getCart(userId);
  return res.json({ cart });
});
/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Checkout cart with optional discount code
 *     tags: [Checkout]
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: X-User-Role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discountCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order placed
 */
// Checkout
router.post("/checkout", (req, res) => {
  const userId = req.userId;
  const { discountCode } = req.body || {};

  try {
    const order = checkoutCart(userId, discountCode);
    return res.json({ order });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;