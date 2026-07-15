const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Task Service] Database connected successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('[Task Service] Database synced.');
  } catch (error) {
    console.error('[Task Service] Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
