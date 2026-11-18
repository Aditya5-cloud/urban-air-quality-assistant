const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const SYSTEM_INSTRUCTION = `You are the Urban Air Quality Assistant, an expert GenAI advisor helping urban families and communities navigate severe winter smog and chronic air pollution.

Your mission is to provide personalized, science-grounded, low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored specifically to the user's city, household structure, commute mode, and health considerations.

Key Principles:
1. Low-Emission Routines: Suggest specific timing adjustments (e.g. avoiding peak morning thermal inversion layers), transit mode optimizations, and physical activity scheduling.
2. Indoor Air Quality Hacks: Recommend low-cost, actionable indoor interventions (e.g. cross-ventilation windows during mid-afternoon AQI troughs, DIY Corsi-Rosenthal boxes, wet mopping instead of dry sweeping to reduce resuspended PM2.5, sealing door thresholds with damp towels during high smog).
3. Sustainable Alternatives: Suggest practical, high-impact lifestyle substitutions (e.g. induction cooking over biomass/gas, carpooling or micro-mobility, eliminating open burning).
4. Direct Impact Transparency: For every recommendation, explain the direct personal and environmental impact using realistic, qualifying language (e.g. "Can reduce indoor PM2.5 exposure by up to 30-50%", "Shifting travel time avoids peak stagnation"). Never present unverified estimates as absolute laboratory guarantees.

You MUST respond strictly with a valid JSON object matching this exact schema:
{
  "routines": [
    "String: Concrete low-emission daily routine recommendation tailored to the profile"
  ],
  "indoorHacks": [
    "String: Actionable indoor air quality intervention tailored to home and family size"
  ],
  "alternatives": [
    "String: Sustainable lifestyle alternative substitution tailored to commute and lifestyle"
  ],
  "impacts": [
    "String: Direct personal and environmental impact explanation corresponding to the recommendations"
  ]
}
Return only pure JSON. Do not wrap in markdown or backticks.`;

/**
 * Clean and parse raw JSON text returned by Gemini LLM
 */
const cleanAndParseJson = (rawText) => {
  let cleaned = rawText.trim();
  // Strip code block fences if present
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

/**
 * Local deterministic simulation when GEMINI_API_KEY is not configured.
 * Clearly identified via metadata as simulation to ensure complete transparency.
 */
const generateSimulatedRecommendations = (profile) => {
  const isWinter = profile.seasonContext === 'winter_smog';
  const hasHealthRisk = profile.healthConcern;
  const isFamily = profile.householdType === 'family' || profile.householdType === 'elderly';

  const routines = [
    `Shift morning outdoor commutes and errands in ${profile.city} past 10:30 AM once nocturnal surface temperature inversion dissipates.`,
    profile.commute === 'car'
      ? 'Consolidate multiple short vehicle trips into a single warm-engine chain, or use public transit 2 days/week to avoid cold-start particulate spikes.'
      : 'Choose sheltered transit corridors with tree canopy buffers rather than walking directly alongside multi-lane arterial roads.',
    isWinter
      ? 'Avoid high-intensity aerobic exercise between 6:00 AM and 9:00 AM when particulate concentrations (PM2.5) concentrate near street level.'
      : 'Monitor hourly PM2.5 trends and conduct outdoor chores during the mid-day wind speed peak (typically 1:00 PM – 3:30 PM).'
  ];

  const indoorHacks = [
    'Create an affordable DIY air cleaner using a box fan paired with a MERV-13 filter (Corsi-Rosenthal style) placed in central living quarters.',
    'Switch exclusively to damp microfiber mopping and wiping instead of dry brooming to prevent resuspending settled heavy particulates.',
    'Seal leaky door thresholds and drafty window frames with rolled-up moist towels or weatherstripping during evening stagnation peaks.',
    isFamily
      ? 'Designate a tightly-sealed "clean air sanctuary" bedroom with minimal soft fabrics for children/elderly members during severe smog alerts.'
      : 'Run kitchen exhaust fans and cover pans while cooking on stovetops to prevent nitrogen dioxide and ultrafine particle buildup.'
  ];

  const alternatives = [
    'Replace aerosol fresheners and chemical room sprays with simmer pots (cinnamon sticks, citrus peels) or non-chemical ventilation.',
    profile.commute === 'car'
      ? 'Coordinate neighbourhood school or workplace carpooling pools to remove 2–3 vehicles from neighborhood streets daily.'
      : 'Adopt electric micro-mobility or dedicated rapid transit passes as primary urban connector.',
    'Transition from kerosene, coil, or gas-flame space heaters to ceramic electric radiant heaters in compact living zones.'
  ];

  const impacts = [
    'Delaying morning exposure avoids the 35–60% higher particulate concentration typical of morning ground-level thermal inversions.',
    'Proper exhaust ventilation and MERV-13 DIY filtration can lower indoor PM2.5 levels by 40–70% at a fraction of commercial purifier costs.',
    'Eliminating single-occupancy short car trips reduces cold-start hydrocarbon and nitrogen oxide emissions by up to 45% per commute.',
    hasHealthRisk
      ? 'Creating a dedicated clean air sanctuary room drastically reduces nighttime respiratory irritation and nocturnal asthma episodes.'
      : 'Shifting to damp cleaning prevents microscopic toxic particulate matter from being re-inhaled repeatedly throughout the day.'
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
  /**
   * Check whether real Gemini API key is configured
   */
  static isConfigured() {
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  }

  /**
   * Generate tailored air quality recommendations
   */
  static async getRecommendations(profile) {
    if (!GeminiService.isConfigured()) {
      console.info('[Gemini Service] GEMINI_API_KEY is not set or placeholder. Utilizing transparent simulation fallback.');
      return generateSimulatedRecommendations(profile);
    }

    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.3, // Consistent, factual, and focused
          topP: 0.8,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `Generate tailored urban air quality guidance for the following household profile:
- City: ${profile.city}
- Household Category: ${profile.householdType}
- Number of Residents: ${profile.householdSize}
- Primary Commute Mode: ${profile.commute}
- Vulnerable Health Concerns Present: ${profile.healthConcern ? 'YES (respiratory/cardiovascular vulnerability)' : 'NO'}
- Seasonal Context: ${profile.seasonContext}
- Specific Lifestyle Notes / Constraints: ${profile.notes || 'None provided'}

Provide 3-4 items in each required array: "routines", "indoorHacks", "alternatives", and "impacts".`;

      const result = await model.generateContent(prompt);
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
      console.error(`[Gemini API Error] ${apiError.message}. Gracefully falling back to transparent local simulation.`);
      const fallback = generateSimulatedRecommendations(profile);
      fallback.metadata.fallbackReason = apiError.message;
      return fallback;
    }
  }

  /**
   * Multi-turn chat assistant continuation
   */
  static async getChatReply(chatHistory, newMessage, profileContext) {
    if (!GeminiService.isConfigured()) {
      return {
        reply: `[Simulated Advice for ${profileContext?.city || 'your city'}] Based on your inquiry regarding "${newMessage}", during winter smog it is critical to prioritize HEPA or MERV-13 air filtration, seal ambient window drafts, and coordinate necessary outdoor trips past mid-morning. (To activate real-time Gemini LLM responses, set GEMINI_API_KEY in .env)`,
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
        systemInstruction: `${SYSTEM_INSTRUCTION}
Context for current user:
- City: ${profileContext?.city || 'Urban area'}
- Household: ${profileContext?.householdType || 'General'}, Size: ${profileContext?.householdSize || 1}
- Commute: ${profileContext?.commute || 'General'}
- Health risk: ${profileContext?.healthConcern ? 'Yes' : 'No'}

Answer the user's follow-up questions concisely, practically, and with clear direct impact explanations.`,
      });

      // Format previous history into Gemini contents
      const formattedHistory = (chatHistory || []).slice(-10).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(newMessage);
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
        reply: `We encountered an issue connecting to the AI service: ${err.message}. For high smog conditions, prioritize staying indoors in sealed rooms during early morning and late night.`,
        metadata: {
          source: 'error-fallback',
          error: err.message,
        },
      };
    }
  }
}

module.exports = GeminiService;
