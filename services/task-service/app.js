const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

dotenv.config();
connectDB();

const app = express();
const taskRoutes = require('./routes/taskRoutes');

app.use(cors());
app.use(express.json());
app.use('/tasks', taskRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Task Service Running', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 8000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Task Service] Running on 0.0.0.0:${PORT}`);
  });
}

module.exports = app;
