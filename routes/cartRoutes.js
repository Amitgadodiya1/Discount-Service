const express = require("express");
const router = express.Router();
const { addItemToCart, getCart, checkoutCart } = require("../services/cartService");
const { authMiddleware, adminAccess,userAccess } = require("../middleware/auth");
const { products } = require("../store"); // make sure products exported from store

// Add item to cart
/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add a product to the cart using productId (quantity required)
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
 *                 description: ID of the product to add
 *               quantity:
 *                 type: number
 *                 description: Number of units to add
 *     responses:
 *       200:
 *         description: Item successfully added to cart
 *       400:
 *         description: Invalid input or missing productId/quantity
 *       404:
 *         description: Product not found
 */

router.post("/cart/items",authMiddleware,userAccess,(req, res) => {
  const userId = req.userId;
  const { productId, quantity } = req.body || {};

  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }

  if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
    return res.status(400).json({ error: "quantity must be a positive number" });
  }

  // find product by id
  const product = products.find(p => p.productId === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const cart = addItemToCart(userId, {
    productId,
    name: product.name,
    price: product.price,
    quantity: Number(quantity)
  });

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