import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./styles.css";

const API_URL = "http://localhost:5000/transactions"; // Backend URL

function App() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState("");
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setTransactions(response.data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTransaction = { description, amount: parseFloat(amount), category };
    axios.post(API_URL, newTransaction).then((response) => {
      setTransactions([...transactions, response.data]);
      setDescription("");
      setAmount("");
      setCategory("");
    });
  };

  const deleteTransaction = (id) => {
    axios.delete(`${API_URL}/${id}`).then(() => {
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
    });
  };

  const totalBalance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

  const getCategoryData = () => {
    const categoryTotals = {};
    transactions.forEach((transaction) => {
      if (categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] += Math.abs(transaction.amount);
      } else {
        categoryTotals[transaction.category] = Math.abs(transaction.amount);
      }
    });
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96c93d", "#f7d794", "#778beb"];
    return Object.keys(categoryTotals).map((category, index) => ({
      name: category,
      value: categoryTotals[category],
      color: colors[index % colors.length],
    }));
  };

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: { enable: false },
          onHover: { enable: false },
        },
      },
      particles: {
        color: { value: ["#ff6b6b", "#4ecdc4", "#45b7d1"] },
        links: { enable: false },
        move: {
          direction: "none",
          enable: true,
          outModes: "out",
          random: true,
          speed: 1.5,
          straight: false,
        },
        number: { density: { enable: true, area: 1000 }, value: 120 },
        opacity: { value: 0.4, random: true },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <div className="app-wrapper">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particleOptions}
      />
      <div className="app-container">
        <header className="app-header">
          <h1>Finance Dashboard</h1>
          <div className="balance-card">
            <h2>${totalBalance.toFixed(2)}</h2>
            <p>Total Balance</p>
            <div className="balance-details">
              <span className="income">+${income.toFixed(2)}</span>
              <span className="expense">-${Math.abs(expenses).toFixed(2)}</span>
            </div>
          </div>
        </header>

        <main className="app-main">
          <section className="form-section">
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-group">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (e.g., -50 or 100)"
                  required
                />
              </div>
              <div className="form-group">
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Category</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Salary">Salary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="add-btn">Add Transaction</button>
            </form>
          </section>

          <section className="history-section">
            <h2>Recent Transactions</h2>
            <ul className="transaction-list">
              {transactions.slice(0, 5).map((transaction) => (
                <li
                  key={transaction.id}
                  className={`transaction-card ${transaction.amount < 0 ? "expense" : "income"} ${
                    isHovered === transaction.id ? "hovered" : ""
                  }`}
                  onMouseEnter={() => setIsHovered(transaction.id)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <span>{transaction.description}</span>
                  <span>${Math.abs(transaction.amount).toFixed(2)}</span>
                  <span className="category">{transaction.category}</span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTransaction(transaction.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="chart-section">
            <h2>Spending Breakdown</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={5}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;