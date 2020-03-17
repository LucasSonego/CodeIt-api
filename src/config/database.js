require("dotenv/config");

if (process.env.NODE_ENV === "test") {
  module.exports = {
    dialect: "sqlite",
    storage: "./__tests__/database.sqlite",
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
    logging: false,
  };
} else {
  module.exports = {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
    logging: false,
  };
}
