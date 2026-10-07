const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors"); // ✅ Import CORS
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const contractRoutes = require("./routes/contractRoutes");
const claimsRoutes = require("./routes/helpDesk");
const propertyRoutes = require("./routes/propertyRoutes");
const agentRoutes = require("./routes/agentRoutes");
const utilityRoutes = require("./routes/utilityRoutes");

const app = express();

// ✅ Configure and use CORS
const allowedOrigins = [
  "https://www.rltm.rw",
  "https://rltm.rw",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during staging / flexible dev
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);


app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to db");
});

app.use("/api/auth", authRoutes);
app.use("/api/contract", contractRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/utility", utilityRoutes);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
