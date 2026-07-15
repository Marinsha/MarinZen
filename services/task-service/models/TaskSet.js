const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskSet = sequelize.define('TaskSet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  date: {
    type: DataTypes.DATEONLY, // YYYY-MM-DD
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dosha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Inputs
  sleep: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  energy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bodyCondition: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Tasks Array (JSONB for flexibility)
  tasks: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  // Completion Tracking
  completionRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'task_sets',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'date']
    }
  ]
});

module.exports = TaskSet;
