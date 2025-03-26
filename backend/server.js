const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;
const DATA_FILE = "transactions.json";

app.use(cors());
app.use(express.json());

// Load transactions from file
const loadTransactions = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
};

// Save transactions to file
const saveTransactions = (transactions) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 2));
};

// Get all transactions
app.get("/transactions", (req, res) => {
  res.json(loadTransactions());
});

// Add a transaction
app.post("/transactions", (req, res) => {
  const transactions = loadTransactions();
  const newTransaction = { id: Date.now(), ...req.body };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  res.json(newTransaction);
});

// Delete a transaction
app.delete("/transactions/:id", (req, res) => {
  let transactions = loadTransactions();
  transactions = transactions.filter(t => t.id !== parseInt(req.params.id));
  saveTransactions(transactions);
  res.json({ message: "Transaction deleted" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
