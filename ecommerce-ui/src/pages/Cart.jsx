import { useEffect, useState } from "react";
import { api } from "../api/api";
import Header from "../components/Header";
import "./Cart.css";

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState([]); // available products from admin
  const [form, setForm] = useState({ productId: "", quantity: 1 });
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [discountCode, setDiscountCode] = useState("");
  const [toast, setToast] = useState(null);
  const [availableCode, setAvailableCode] = useState(null);

  const loadCart = async () => {
    const res = await api("/api/cart");
    if (res && res.cart) setCart(res.cart);

    const adminStats = await api("/api/admin/stats");
    setAvailableCode(adminStats.activeDiscountCode);
  };

  const loadProducts = async () => {
    const res = await api("/api/products");
    setProducts(res?.products ?? []);
  };

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const handleAdd = async () => {
    const { productId, quantity } = form;

    if (!productId || !quantity) {
      showToast("Please select product & quantity", "error");
      return;
    }

    await api("/api/cart/items", "POST", { productId, quantity: Number(quantity) });
    loadCart();
    showToast("Product Added to Cart", "success");
  };

  const handleCheckout = async () => {
    try {
      const result = await api("/api/checkout", "POST", { discountCode });
      setCheckoutResult(result);
      loadCart();
      showToast("Order placed successfully!", "success");
    } catch (err) {
      showToast("Invalid Discount Code", "error");
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Header />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="cart-container">
        <h1 className="page-title">🛒 My Cart</h1>

        {availableCode && (
          <p className="available-code">
            ⭐ Available Discount Code: <strong>{availableCode}</strong>
          </p>
        )}

        <div className="product-box">
          <h3 className="section-title">Add Product</h3>

          <select
            className="select-product"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name} — ₹{p.price}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Qty"
            min="1"
            className="qty-input"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <button className="btn btn-primary" onClick={handleAdd}>Add to Cart</button>
        </div>

        <h3 className="section-title">Cart Items</h3>

        {cart.items.length > 0 ? (
          <>
            <ul className="cart-list">
              {cart.items.map((item) => (
                <li key={item.productId} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <p>ID: {item.productId}</p>
                  </div>
                  <span className="price">₹{item.price} × {item.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="summary-box">
              <p>Subtotal: <strong>₹{subtotal}</strong></p>
            </div>

            <div className="discount-box">
              <input
                placeholder="Enter Discount Code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button className="btn-apply" onClick={handleCheckout}>Apply</button>
            </div>

            <button className="btn btn-checkout" onClick={handleCheckout}>
              Checkout
            </button>
          </>
        ) : (
          <p className="empty-msg">No items yet. Add something!</p>
        )}

        {checkoutResult && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>🎉 Order Placed Successfully!</h2>
              <p><strong>Order ID:</strong> {checkoutResult.order.id}</p>
              <p><strong>Before Discount:</strong> ₹{checkoutResult.order.totalBeforeDiscount}</p>
              <p><strong>Discount:</strong> ₹{checkoutResult.order.discountAmount}</p>
              <p><strong>Final Amount:</strong> ₹{checkoutResult.order.totalAfterDiscount}</p>
              <button className="btn btn-primary" onClick={() => setCheckoutResult(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
