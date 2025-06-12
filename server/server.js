
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const allowedOrigins = [
  'https://unicorn-cafe-management.vercel.app/',
  'http://localhost:5173/',
];

 
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you use cookies or authentication
}));
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes')); // <-- Add this line
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/branches', require('./routes/branch.routes'));

const revenueRoutes = require('./routes/revenue.routes');
app.use('/api/revenue', revenueRoutes);
app.use('/api/stats', require('./routes/user.routes'));
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
