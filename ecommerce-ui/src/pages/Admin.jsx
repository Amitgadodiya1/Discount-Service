import { useEffect, useState } from "react";
import { api } from "../api/api";
import Header from "../components/Header";
import { Bar } from "react-chartjs-2";
import "./Admin.css";
import { toast } from "react-toastify";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);

  const [productForm, setProductForm] = useState({
    productId: "",
    name: "",
    price: ""
  });

  const loadStats = async () => {
    const res = await api("/api/admin/stats");
    setStats(res);
  };

  const loadProducts = async () => {
    const res = await api("/api/products");
    setProducts(res.products || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const generateCode = async () => {
    try {
      const res = await api("/api/admin/discounts/generate", "POST");
      if (res.status === 200) {
        loadStats();
        toast.success("Discount Code Generated Successfully!");
      }
    } catch (error) {
      toast.error(error?.message || "Unexpected error");
    }
  };

  const handleAddProduct = async () => {
    const { productId, name, price } = productForm;

    if (!productId || !name || !price) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await api("/api/products", "POST", {
        productId,
        name,
        price: Number(price),
      });

      if (res.status === 200) {
        toast.success("Product Added Successfully!");
        setShowProductModal(false);
        loadProducts();
        setProductForm({ productId: "", name: "", price: "" });
      }
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  const chartData = stats && {
    labels: ["Items Sold", "Orders", "Discount Amount"],
    datasets: [
      {
        label: "Sales Metrics",
        data: [
          stats.totalItemsSold,
          stats.totalOrdersPlaced,
          stats.totalDiscountAmount,
        ],
        backgroundColor: "#007bff",
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="admin-container">
        <h1 className="title">📊 Admin Dashboard</h1>

        <div className="actions">
          <button className="btn-primary" onClick={() => setShowProductModal(true)}>
            ➕ Add Product
          </button>

          <button className="btn-primary" onClick={generateCode}>
            Generate Discount Code
          </button>

          <button className="btn-secondary" onClick={loadStats}>
            Refresh Stats
          </button>
        </div>

        {stats && (
          <div className="chart-box">
            <h3 className="section-title">Sales Analytics</h3>
            <Bar data={chartData} />
          </div>
        )}

        {products.length > 0 && (
          <div className="product-list">
            <h3 className="section-title">📦 Available Products</h3>
            <div className="product-cards">
              {products.map((p) => (
                <div className="product-card" key={p.productId}>
                  <h4>{p.name}</h4>
                  <p><strong>ID:</strong> {p.productId}</p>
                  <p><strong>Price:</strong> ₹{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Product</h2>
            <input
              type="text"
              placeholder="Product ID"
              value={productForm.productId}
              onChange={(e) => setProductForm({ ...productForm, productId: e.target.value })}
            />
            <input
              type="text"
              placeholder="Product Name"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            />

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleAddProduct}>Add</button>
              <button className="btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
