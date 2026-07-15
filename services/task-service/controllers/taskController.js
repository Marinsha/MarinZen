const TaskSet = require('../models/TaskSet');
const { generateAyurvedaTasks } = require('../services/aiService');
const axios = require('axios');
const fs = require('fs');

const getResultServiceBaseUrl = () => {
  if (process.env.RESULT_SERVICE_URL) {
    return process.env.RESULT_SERVICE_URL;
  }
  if (fs.existsSync('/.dockerenv')) {
    return 'http://result-service:8000';
  }
  return 'http://localhost:8002';
};

exports.generateTasks = async (req, res) => {
  try {
    const { userId, dosha, sleep, stress, energy, bodyCondition } = req.body;
    
    if (!userId || !dosha) {
      return res.status(400).json({ error: 'userId and dosha are required' });
    }

    const today = new Date().toISOString().split('T')[0];

    let taskSet = await TaskSet.findOne({
      where: { userId, date: today }
    });

    if (taskSet) {
      const hasMissingTa = taskSet.tasks.some(t => !t.task_ta);
      if (hasMissingTa) {
        try {
          const resultServiceUrl = `${getResultServiceBaseUrl()}/tasks/history/daily?user_id=${userId}&target_date=${today}`;
          const response = await axios.get(resultServiceUrl);
          if (response.data && Array.isArray(response.data)) {
            let updated = false;
            const healedTasks = taskSet.tasks.map(t => {
              const match = response.data.find(h => h.text_en === t.task);
              if (match && match.text_ta) {
                updated = true;
                return { ...t, task_ta: match.text_ta };
              }
              return t;
            });
            if (updated) {
              taskSet.tasks = healedTasks;
              await TaskSet.update(
                { tasks: healedTasks },
                { where: { id: taskSet.id } }
              );
              taskSet = await TaskSet.findByPk(taskSet.id);
            }
          }
        } catch (err) {
          console.warn("[Task Controller] Self-healing cache task translations failed:", err.message);
        }
      }
      return res.status(200).json({
        message: 'Daily tasks already exist',
        data: taskSet,
        source: 'cache'
      });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    const previousTaskSet = await TaskSet.findOne({
      where: { userId, date: yesterdayDate }
    });
    
    const previousTasks = previousTaskSet ? previousTaskSet.tasks.map(t => t.task) : [];

    let generatedTasks = [];
    let generationSource = 'database';
    try {
      let state = "Balanced";
      if (stress === "High") {
        state = "Stress Relief";
      } else if (bodyCondition === "Heavy" || bodyCondition === "Uneasy") {
        state = "Digestion Focus";
      } else if (energy === "Low") {
        state = "Recovery";
      } else if (energy === "High") {
        state = "Active";
      } else if (sleep === "Poor") {
        state = "Calm Day";
      }
      
      const doshaParam = dosha.replace("+", "_");
      const resultServiceUrl = `${getResultServiceBaseUrl()}/tasks/daily-ritual/generate?dosha=${doshaParam}&state=${state}&user_id=${userId}`;
      console.log(`[Task Controller] Fetching modular tasks from: ${resultServiceUrl}`);
      
      const authHeader = req.headers.authorization;
      const response = await axios.get(resultServiceUrl, {
        headers: authHeader ? { Authorization: authHeader } : {}
      });
      
      if (response.data && Array.isArray(response.data) && response.data.length >= 5) {
        generatedTasks = response.data.map((t, index) => ({
          id: `task_${Date.now()}_${index}`,
          task: t.text_en,
          task_ta: t.text_ta,
          type: t.task_type,
          status: 'pending'
        }));
      } else {
        throw new Error("Result service returned insufficient tasks");
      }
    } catch (apiError) {
      console.warn("[Task Controller] Result service query failed. Falling back to local AI generation:", apiError.message);
      generationSource = 'ai';
      generatedTasks = await generateAyurvedaTasks({
        dosha, sleep, stress, energy, bodyCondition, previousTasks
      });
    }

    taskSet = await TaskSet.create({
      userId,
      date: today,
      dosha,
      sleep,
      stress,
      energy,
      bodyCondition,
      tasks: generatedTasks,
      completionRate: 0
    });

    return res.status(201).json({
      message: 'Daily tasks generated successfully',
      data: taskSet,
      source: generationSource
    });
  } catch (error) {
    let detailMsg = error.message;
    if (error.response && error.response.data) {
      detailMsg = JSON.stringify(error.response.data);
    }
    console.error("[Task Controller] Generate Error:", detailMsg);
    res.status(500).json({ 
      error: 'Failed to generate AI tasks via Gemini',
      details: detailMsg
    });
  }
};

exports.getTodayTasks = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const today = new Date().toISOString().split('T')[0];

    let taskSet = await TaskSet.findOne({
      where: { userId, date: today }
    });

    if (!taskSet) {
      return res.status(200).json(null);
    }

    const hasMissingTa = taskSet.tasks.some(t => !t.task_ta);
    if (hasMissingTa) {
      try {
        const resultServiceUrl = `${getResultServiceBaseUrl()}/tasks/history/daily?user_id=${userId}&target_date=${today}`;
        const response = await axios.get(resultServiceUrl);
        if (response.data && Array.isArray(response.data)) {
          let updated = false;
          const healedTasks = taskSet.tasks.map(t => {
            const match = response.data.find(h => h.text_en === t.task);
            if (match && match.text_ta) {
              updated = true;
              return { ...t, task_ta: match.text_ta };
            }
            return t;
          });
          if (updated) {
            taskSet.tasks = healedTasks;
            await TaskSet.update(
              { tasks: healedTasks },
              { where: { id: taskSet.id } }
            );
            taskSet = await TaskSet.findByPk(taskSet.id);
          }
        }
      } catch (err) {
        console.warn("[Task Controller] Self-healing task translations failed:", err.message);
      }
    }

    res.status(200).json(taskSet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { userId, date, taskId, status } = req.body;

    if (!userId || !date || !taskId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const taskSet = await TaskSet.findOne({
      where: { userId, date }
    });

    if (!taskSet) {
      return res.status(404).json({ error: 'Task set not found for the given date' });
    }

    const updatedTasks = taskSet.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status };
      }
      return t;
    });

    const doneCount = updatedTasks.filter(t => t.status === 'done').length;
    const completionRate = (doneCount / updatedTasks.length) * 100;

    taskSet.tasks = updatedTasks;
    taskSet.completionRate = completionRate;
    await taskSet.save();

    res.status(200).json({
      message: 'Task status updated',
      completionRate,
      tasks: updatedTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetTodayTasks = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const today = new Date().toISOString().split('T')[0];

    await TaskSet.destroy({
      where: { userId, date: today }
    });

    res.status(200).json({ message: 'Today tasks reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
