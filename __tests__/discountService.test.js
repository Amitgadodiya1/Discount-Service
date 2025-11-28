const { stats, NTH_ORDER_FOR_DISCOUNT } = require("../store");
const { canGenerateDiscountCode, createDiscountCode } = require("../services/discountService");

beforeEach(() => {
  stats.totalItemsSold = 0;
  stats.totalPurchaseAmount = 0;
  stats.totalDiscountAmount = 0;
  stats.totalOrdersPlaced = 0;
  stats.discountCodes.length = 0;
});

test("should not generate discount before nth order", () => {
  expect(canGenerateDiscountCode()).toBe(false);
});

test("should generate discount on nth order", () => {
  stats.totalOrdersPlaced = NTH_ORDER_FOR_DISCOUNT - 1;
  expect(canGenerateDiscountCode()).toBe(true);

  const code = createDiscountCode();
  expect(code.code).toMatch(/^DISCOUNT-/);
  expect(code.used).toBe(false);
});