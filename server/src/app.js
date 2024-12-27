const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();
const distributorRoutes = require('./routes/distributor.route');
const saleRoutes = require('./routes/sale.route');
const batchRoutes = require('./routes/batch.route');

// Middleware
app.use(express.json());
app.use(cors());

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

app.use('/distributor', distributorRoutes);

app.use('/sale', saleRoutes);

app.use('/batch', batchRoutes);

module.exports = app;
