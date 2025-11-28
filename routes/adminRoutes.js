const express = require("express");
const router = express.Router();
const { stats } = require("../store");
const {
  canGenerateDiscountCode,
  createDiscountCode
} = require("../services/discountService");
const { authMiddleware, adminAccess, userAccess } = require("../middleware/auth");

// Generate discount code (if Nth order, and no active code)
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin discount & analytics APIs
 */

/**
 * @swagger
 * /api/admin/discounts/generate:
 *   post:
 *     summary: Generate discount code if Nth order eligible
 *     tags: [Admin]
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
 *         description: Discount code generated
 *       400:
 *         description: Not eligible to generate discount code now
 */
router.post("/discounts/generate",  authMiddleware, adminAccess,(req, res) => {
  if (!canGenerateDiscountCode()) {
    return res.status(400).json({
      error: "Not eligible to generate discount code right now"
    });
  }

  try {
    const code = createDiscountCode();
    return res.json(code);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get analytics about orders & discounts
 *     tags: [Admin]
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
 *         description: Returns analytics including total sales and discount usage
 */
// Stats
router.get("/stats", authMiddleware,(req, res) => {
  const activeCode = stats.discountCodes.find(dc => !dc.used && !dc.expired)?.code || null;

  return res.json({
    totalItemsSold: stats.totalItemsSold,
    totalPurchaseAmount: stats.totalPurchaseAmount,
    totalDiscountAmount: stats.totalDiscountAmount,
    totalOrdersPlaced: stats.totalOrdersPlaced,
    discountCodes: stats.discountCodes,
    activeDiscountCode: activeCode
  });
});

module.exports = router;