const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY) {
  console.log(
    `[AI Service] API Key loaded (starts with: ${GEMINI_API_KEY.substring(0, 4)}...)`,
  );
} else {
  console.error("[AI Service] ERROR: GEMINI_API_KEY is not found!");
}

/**
 * Generates 5 personalized Ayurveda tasks using Google Gemini
 * @param {Object} userData - { dosha, sleep, stress, energy, bodyCondition, previousTasks }
 * @returns {Promise<Array>} - Array of 5 task objects
 */
const generateAyurvedaTasks = async (userData) => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not defined in task-service environment",
    );
  }
  const {
    dosha,
    sleep,
    stress,
    energy,
    bodyCondition,
    previousTasks = [],
  } = userData;

  const previousContext =
    previousTasks.length > 0
      ? `IMPORTANT: Avoid repeating these specific tasks from yesterday: ${previousTasks.join(", ")}.`
      : "";

  const prompt = `Generate 5 Ayurvedic tasks for ${dosha} dosha. 
    Current state: Sleep ${sleep}, Stress ${stress}, Energy ${energy}, Body ${bodyCondition}.
    Return ONLY a JSON array of objects with "task", "task_ta", and "type" (diet/yoga/routine/avoid).

    ${previousContext}

    RULES:
    1. Tasks must be highly specific, actionable, and based on authentic Ayurveda principles.
    2. No generic tasks allowed.
    3. Include at least one task for each type: diet, yoga, routine, and avoid.
    4. The "task_ta" key MUST contain a high-quality translation of "task" in natural Tamil script. It must NOT be in English.
    5. No explanations, no extra text.

    JSON FORMAT EXAMPLE:
    [
      { "task": "Eat warm rice with ghee", "task_ta": "நெய்யுடன் கூடிய சூடான சாதம் சாப்பிடவும்", "type": "diet" },
      { "task": "Do Child Pose for 5 minutes", "task_ta": "5 நிமிடங்கள் சிசு ஆசனம் செய்யவும்", "type": "yoga" },
      { "task": "Practice breathing exercise", "task_ta": "சுவாசப் பயிற்சி செய்யவும்", "type": "yoga" },
      { "task": "Avoid caffeine and cold drinks", "task_ta": "காஃபின் மற்றும் குளிர் பானங்களைத் தவிர்க்கவும்", "type": "avoid" },
      { "task": "Take slow evening walk", "task_ta": "மெதுவான மாலை உலா செல்லவும்", "type": "routine" }
    ]
  `;

  try {
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-pro",
    ];

    let response;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI Service] Trying model: ${modelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

        response = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          { timeout: 15000 },
        );

        if (response.data && response.data.candidates) {
          console.log(`[AI Service] SUCCESS with model: ${modelName}`);
          break; // Exit loop on success
        }
      } catch (err) {
        lastError = err.response
          ? JSON.stringify(err.response.data)
          : err.message;
        console.warn(`[AI Service] Model ${modelName} failed: ${lastError}`);
        continue; // Try next model
      }
    }

    if (!response || !response.data || !response.data.candidates) {
      throw new Error(`All Gemini models failed. Last error: ${lastError}`);
    }

    if (!response.data || !response.data.candidates) {
      console.error(
        "[AI Service] Invalid Gemini Response:",
        JSON.stringify(response.data),
      );
      throw new Error("Gemini API returned an empty or invalid response.");
    }

    const content = response.data.candidates[0].content.parts[0].text;
    console.log("[AI Service] Raw AI Content:", content);

    // Parse the JSON with aggressive extraction
    let parsed;
    try {
      // First try direct parse
      parsed = JSON.parse(
        content
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim(),
      );
    } catch (parseError) {
      console.warn(
        "[AI Service] Direct parse failed, attempting regex extraction...",
      );
      // Find the first [ and the last ]
      const start = content.indexOf("[");
      const end = content.lastIndexOf("]");

      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = content.substring(start, end + 1);
        try {
          parsed = JSON.parse(jsonStr);
        } catch (e) {
          console.error(
            "[AI Service] Regex extraction also failed:",
            e.message,
          );
        }
      }

      if (!parsed) {
        throw new Error(
          `AI returned unparseable content. Raw: ${content.substring(0, 100)}...`,
        );
      }
    }

    // Gemini sometimes returns an object, ensure we have the array
    if (!Array.isArray(parsed) && parsed.tasks) {
      parsed = parsed.tasks;
    } else if (!Array.isArray(parsed)) {
      // Fallback if it wrapped it in some other key
      const keys = Object.keys(parsed);
      if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
        parsed = parsed[keys[0]];
      }
    }

    // Ensure we have exactly 5 tasks and add default status/IDs
    const finalizedTasks = parsed.slice(0, 5).map((t, index) => ({
      id: `task_${Date.now()}_${index}`,
      task: t.task,
      task_ta: t.task_ta || t.task,
      type: t.type,
      status: "pending",
    }));

    return finalizedTasks;
  } catch (error) {
    console.error(
      "[AI Service] Gemini Error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to generate AI tasks via Gemini");
  }
};

module.exports = { generateAyurvedaTasks };
