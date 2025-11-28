const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./config/swagger.yaml");

function swaggerDocs(app) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger UI available at http://localhost:3000/docs");
}

module.exports = swaggerDocs;