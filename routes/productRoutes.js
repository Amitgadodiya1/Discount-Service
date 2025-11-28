const express = require("express");
const router = express.Router();
const store = require("../store");
const { authMiddleware, adminAccess, userAccess } = require("../middleware/auth");

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product (Admin only)
 *     tags: [Products]
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
 *     responses:
 *       200:
 *         description: Product added successfully
 */
router.post("/products", authMiddleware, adminAccess, (req, res) => {
  const { productId, name, price } = req.body || {};

  if (!productId || !name || price == null) {
    return res.status(400).json({ error: "productId, name and price are required" });
  }

  store.products.push({ productId, name, price });
  return res.json({ message: "Product added successfully" });
});


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get product list (User/Admin)
 *     tags: [Products]
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
 *         description: Returns product list
 */
router.get("/products", authMiddleware, userAccess, (req, res) => {
  return res.json({ products: store.products });
});

module.exports = router;
