const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/tickets");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tickets", ticketRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
