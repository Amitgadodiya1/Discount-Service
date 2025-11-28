import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    if (!userId.trim()) {
      toast.error(`${role === "admin" ? "Admin" : "User"} ID is required`);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      sessionStorage.setItem("userId", userId.trim());
      sessionStorage.setItem("role", role);

      toast.success(`Welcome ${role.toUpperCase()}!`);

      navigate(role === "admin" ? "/admin" : "/cart");
      setLoading(false);
    }, 500);
  };

  const isDisabled = !userId.trim() || loading;

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>

        <input
          placeholder={role === "admin" ? "Enter Admin ID" : "Enter User ID"}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button disabled={isDisabled} onClick={handleLogin}>
          {loading ? "Please wait..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
