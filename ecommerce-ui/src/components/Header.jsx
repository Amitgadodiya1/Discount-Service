import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="header">
      <h2>Ecommerce Discount Store</h2>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
