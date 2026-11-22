const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const SYSTEM_INSTRUCTION = `You are the Urban Air Quality Assistant, an everyday health and safety advisor helping real families and ordinary residents navigate winter smog and urban air pollution.

YOUR MISSION:
Give clear, friendly, and practical advice using everyday words that any normal person with ZERO scientific background can immediately understand and use today.

STRICT WRITING RULES:
1. USE PLAIN, SIMPLE ENGLISH (6th grade reading level). Avoid complex technical terms and academic jargon.
   - Never say: "nocturnal surface temperature inversion layer". Say: "cold morning smog trapped near the ground".
   - Never say: "particulate resuspension". Say: "dust flying back into the air when sweeping".
   - Never say: "micro-mobility modal connector". Say: "sharing rides, metro, or bicycles".
   - Never say: "Corsi-Rosenthal MERV-13 apparatus". Say: "a simple $30 home air cleaner made with a box fan and AC furnace filter".
   - Never say: "cold-start hydrocarbon spikes". Say: "short car trips with a cold engine pollute 3 times more".
2. STRUCTURE EVERY RECOMMENDATION WITH A BOLD ACTION + BRIEF 'WHY':
   - State the exact practical step first, followed by one simple sentence explaining how it protects them.
   - Example: "Wait until after 10:30 AM for outdoor walks: Morning smog is trapped near street level until the sun warms the air."
3. CATEGORIES:
   - "routines": 3 practical, simple steps for daily outdoor timing, commuting, and physical activity.
   - "indoorHacks": 3 easy, low-cost home tricks to clean indoor air (under $35) and keep smoke out.
   - "alternatives": 3 everyday lifestyle switches (cleaner cooking/heating, ride sharing, simple habits).
   - "impacts": 3-4 clear, encouraging statements explaining the direct personal health benefit (e.g. "Cuts the toxic smoke your family breathes by up to 50%").

You MUST respond strictly with a valid JSON object matching this exact schema:
{
  "routines": [
    "String: Simple everyday outdoor routine and commute advice"
  ],
  "indoorHacks": [
    "String: Low-cost, easy home trick to purify room air and block smog"
  ],
  "alternatives": [
    "String: Practical lifestyle switch for cleaner daily living"
  ],
  "impacts": [
    "String: Plain-English health benefit and exposure reduction explanation"
  ]
}
Return only pure JSON. Do not wrap in markdown or backticks.`;

const DOMAIN_BOUNDARY_DECLINE = 'I am the Urban Air Quality Assistant. I specialize exclusively in winter smog navigation, indoor air quality hacks, and low-emission routines. Please ask an air quality or smog-related question.';

const CHAT_SYSTEM_INSTRUCTION = `You are the Urban Air Quality Assistant, a warm, caring, and practical advisor helping real families and residents navigate winter smog and urban air pollution.

WRITING STYLE:
- Talk in warm, clear, plain English (6th-grade reading level) like a trusted family doctor or helpful neighbor.
- Keep answers concise, direct, and practical (2-4 friendly sentences or a short bulleted tip).
- Never output JSON or schema formatting in chat. Respond in natural, conversational paragraphs.

STRICT DOMAIN BOUNDARY ENFORCEMENT:
You are exclusively the Urban Air Quality Assistant. You MUST strictly decline to answer any question that is NOT directly related to air pollution, winter smog, thermal inversions, particulate matter (PM2.5/PM10), indoor air quality hacks, low-emission daily routines, respiratory protection, or sustainable living.
If the user asks an off-topic query, reply strictly with:
"${DOMAIN_BOUNDARY_DECLINE}"`;

const cleanAndParseJson = (rawText) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (
      Array.isArray(parsed.routines) &&
      Array.isArray(parsed.indoorHacks) &&
      Array.isArray(parsed.alternatives) &&
      Array.isArray(parsed.impacts)
    ) {
      return parsed;
    }
    throw new Error('Parsed JSON does not contain required arrays (routines, indoorHacks, alternatives, impacts)');
  } catch (err) {
    console.error('[Gemini Service] JSON parse failed on text:', rawText);
    throw new Error(`Failed to parse AI response into expected schema: ${err.message}`);
  }
};

const generateSimulatedRecommendations = (profile, atmospheric) => {
  const isFamily = profile.householdType === 'family' || profile.householdType === 'elderly';
  const aqiInfo = atmospheric?.airQuality ? ` (Current AQI: ${atmospheric.airQuality.us_aqi} - ${atmospheric.airQuality.category})` : '';

  const routines = [
    `Wait until after 10:30 AM for outdoor walks and errands in ${profile.city}${aqiInfo}: Cold morning smog stays trapped near street level until the sun warms the air.`,
    profile.commute === 'car'
      ? 'Combine quick driving errands into one single trip, or carpool 2 days a week to cut your family\'s exhaust exposure by over 40%.'
      : 'Walk along tree-lined inner streets or residential lanes instead of busy multi-lane highway sidewalks.',
    'Keep your car windows closed and turn on "recirculate" AC mode when stuck in heavy traffic to block exhaust fumes from entering your cabin.'
  ];

  const indoorHacks = [
    'Make an easy $30 home air cleaner: Tape a high-efficiency AC furnace filter (MERV-13) to the back of a standard box fan.',
    'Clean floors with a damp mop instead of sweeping with a dry broom (sweeping kicks toxic dust right back into the air you breathe).',
    'Block door gaps and drafty windows with a rolled-up damp towel during smoky evenings to seal out outdoor pollution.',
    isFamily
      ? 'Pick one bedroom as a "clean air room" with tightly closed doors and windows so children and seniors breathe clean air all night.'
      : 'Always cover pots and run the kitchen exhaust fan when cooking on gas stoves to prevent gas smoke buildup.'
  ];

  const alternatives = [
    'Switch from open-flame heaters to an electric ceramic space heater in small rooms to avoid indoor smoke.',
    profile.commute === 'car'
      ? 'Coordinate a school or neighborhood carpool to take 2 to 3 cars off neighborhood streets each morning.'
      : 'Use electric scooters, bicycles, or metro passes for short connectors rather than gas auto-rickshaws or cabs.',
    'Boil cinnamon sticks or citrus peels in a pot of water for fresh room aroma instead of spraying chemical aerosol room fresheners.'
  ];

  const impacts = [
    'Waiting until mid-morning avoids up to 50% of the heaviest street-level smog trapped by cold night air.',
    'A simple box-fan air cleaner removes 60% to 70% of smoke particles inside your room for a tiny fraction of store purifier costs.',
    'Using a damp mop stops microscopic toxic dust from being kicked up and breathed in throughout the day.',
    profile.healthConcern
      ? 'Keeping a sealed clean air bedroom dramatically reduces nighttime coughing, eye burning, and asthma flare-ups.'
      : 'Combining short car trips cuts heavy cold-engine exhaust by up to 45% per commute.'
  ];

  return {
    routines,
    indoorHacks,
    alternatives,
    impacts,
    metadata: {
      source: 'local-simulation (GEMINI_API_KEY unset)',
      model: 'deterministic-offline-fallback',
      isMock: true,
      timestamp: new Date().toISOString(),
    },
  };
};

class GeminiService {
  static isConfigured() {
    if (env.NODE_ENV === 'test' && process.env.TEST_LIVE_AI !== 'true') {
      // Protect user's Google Gemini API quota from being exhausted during automated test runs
      return false;
    }
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  }

  static async getRecommendations(profile, atmosphericData = null) {
    if (!GeminiService.isConfigured()) {
      return generateSimulatedRecommendations(profile, atmosphericData);
    }

    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          responseMimeType: 'application/json',
        },
      });

      const atmosphericContext = atmosphericData ? `
REAL-TIME ATMOSPHERIC CONDITIONS:
- Measured PM2.5: ${atmosphericData.airQuality?.pm2_5 || 'Unknown'} µg/m³
- Current US AQI: ${atmosphericData.airQuality?.us_aqi || 'Unknown'} (${atmosphericData.airQuality?.category || 'Moderate'})
- Temperature: ${atmosphericData.weather?.temperature || 'Unknown'} °C
- Current Condition: ${atmosphericData.weather?.condition || 'Winter Haze'}
- Thermal Inversion Stagnation Risk: ${atmosphericData.weather?.inversionRisk || 'High'}
` : '';

      const prompt = `Create a clean, simple, and practical Clean Air Plan for an everyday family:
- City: ${profile.city}
- Household Category: ${profile.householdType}
- Number of Residents: ${profile.householdSize}
- Primary Commute Mode: ${profile.commute}
- Vulnerable Health Concerns: ${profile.healthConcern ? 'YES (respiratory or cardiovascular sensitivity present)' : 'NO'}
- Seasonal Context: ${profile.seasonContext}
- Specific Lifestyle Notes / Constraints: ${profile.notes || 'None provided'}
${atmosphericContext}

Write in plain, simple, everyday English so someone with NO science background can immediately understand and follow it.
Provide exactly 3 items in "routines", 3 items in "indoorHacks", 3 items in "alternatives", and 3-4 items in "impacts".`;

      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (firstErr) {
        if (firstErr.message?.includes('503') || firstErr.message?.includes('high demand')) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          result = await model.generateContent(prompt);
        } else {
          throw firstErr;
        }
      }

      const response = await result.response;
      const text = response.text();
      const parsedData = cleanAndParseJson(text);

      return {
        ...parsedData,
        metadata: {
          source: 'gemini-api',
          model: env.GEMINI_MODEL,
          isMock: false,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (apiError) {
      console.error(`[Gemini API Error] ${apiError.message}. Using simulation fallback.`);
      const fallback = generateSimulatedRecommendations(profile, atmosphericData);
      fallback.metadata.fallbackReason = apiError.message;
      return fallback;
    }
  }

  static async getChatReply(chatHistory, newMessage, profileContext) {
    const isAirQualityQuery = (text) => {
      const lower = text.toLowerCase();
      const keywords = [
        'air', 'smog', 'aqi', 'pm2.5', 'pm10', 'pollution', 'breathe', 'inversion',
        'filter', 'hepa', 'merv', 'mask', 'n95', 'window', 'ventilation', 'outdoor',
        'indoor', 'asthma', 'lung', 'cough', 'commute', 'traffic', 'car', 'bike',
        'exercise', 'run', 'walk', 'fan', 'plant', 'heater', 'purifier', 'child', 'elderly'
      ];
      return keywords.some((k) => lower.includes(k));
    };

    // Off-topic guardrail enforcement
    const trimmed = (newMessage || '').trim();
    if (!isAirQualityQuery(trimmed)) {
      return {
        reply: DOMAIN_BOUNDARY_DECLINE,
        metadata: { source: 'domain-guardrail', isMock: false },
      };
    }

    if (!GeminiService.isConfigured()) {
      return {
        reply: `[Air Quality Advice for ${profileContext?.city || 'your area'}] Regarding "${newMessage}": During winter smog episodes, keep doors sealed, avoid morning exercise until the sun warms the air (after 10:30 AM), and run a simple DIY filter (box fan + AC filter).`,
        metadata: {
          source: 'local-simulation (GEMINI_API_KEY unset)',
          isMock: true,
        },
      };
    }

    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        systemInstruction: `${CHAT_SYSTEM_INSTRUCTION}

Context for current user:
- City: ${profileContext?.city || 'Urban area'}
- Household: ${profileContext?.householdType || 'General'}, Size: ${profileContext?.householdSize || 1}
- Commute: ${profileContext?.commute || 'General'}
- Health risk: ${profileContext?.healthConcern ? 'Yes' : 'No'}

Answer the user's questions in plain, friendly, conversational English with practical steps.`,
      });

      const formattedHistory = (chatHistory || []).slice(-10).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      let result;
      try {
        result = await chat.sendMessage(newMessage);
      } catch (firstErr) {
        if (firstErr.message?.includes('503') || firstErr.message?.includes('high demand')) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          result = await chat.sendMessage(newMessage);
        } else {
          throw firstErr;
        }
      }

      const response = await result.response;
      return {
        reply: response.text(),
        metadata: {
          source: 'gemini-api',
          model: env.GEMINI_MODEL,
          isMock: false,
        },
      };
    } catch (err) {
      console.error('[Gemini Chat Error]', err.message);
      return {
        reply: `For high smog conditions in ${profileContext?.city || 'your city'}, prioritize staying indoors in sealed rooms during early morning and late night. Use damp mopping instead of sweeping.`,
        metadata: {
          source: 'error-fallback',
          error: err.message,
        },
      };
    }
  }
}

module.exports = GeminiService;
