const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/generate-tasks', taskController.generateTasks);
router.get('/today-tasks', taskController.getTodayTasks);
router.post('/update-task-status', taskController.updateTaskStatus);
router.delete('/today-tasks', taskController.resetTodayTasks);

module.exports = router;
