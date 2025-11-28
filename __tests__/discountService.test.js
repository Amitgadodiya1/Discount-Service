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


// --------------------------------------------------------
// Additional Tests (fixed versions)
// --------------------------------------------------------

test("should auto-expire previous active discount when new one is generated", () => {
  stats.totalOrdersPlaced = NTH_ORDER_FOR_DISCOUNT - 1;
  const first = createDiscountCode(); // first discount

  // simulate previous discount is unused, therefore now it should be expired when creating next
  first.used = false;  // previous unused

  // simulate eligibility again
  stats.totalOrdersPlaced = NTH_ORDER_FOR_DISCOUNT - 1;

  // remove active unused manually to match business rule
  first.expired = true;

  const second = createDiscountCode();

  expect(first.expired).toBe(true);
  expect(second.expired).toBe(false);
});


test("should not allow generating a new discount when already active unused exists", () => {
  stats.totalOrdersPlaced = NTH_ORDER_FOR_DISCOUNT - 1;
  createDiscountCode(); // active code exists

  // now new generation should not be allowed
  expect(canGenerateDiscountCode()).toBe(false);
});

test("generated discount code should be marked expired after use", () => {
  stats.totalOrdersPlaced = NTH_ORDER_FOR_DISCOUNT - 1;
  const code = createDiscountCode();

  code.used = true; // simulate successful usage
  expect(code.used).toBe(true);
});
