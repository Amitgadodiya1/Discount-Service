const express = require("express");
const cors = require("cors");

const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { adminAccess, userAccess, authMiddleware } = require("./middleware/auth");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./config/swagger.yaml");

const app = express();

app.use(cors());
app.use(express.json());

// Public Swagger documentation (no authentication)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global Authentication middleware for real API endpoints
app.use(authMiddleware);

// Protected API routes
app.use("/api", userAccess, cartRoutes);
app.use("/api/admin", adminAccess, adminRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));