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

const DOMAIN_BOUNDARY_DECLINE = 'I am the Urban Air Quality Assistant. I specialize exclusively in winter smog navigation, indoor air quality hacks, and low-emission routines. Please ask an air quality or smog-related question.';

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
  const isWinter = profile.seasonContext === 'winter_smog';
  const hasHealthRisk = profile.healthConcern;
  const isFamily = profile.householdType === 'family' || profile.householdType === 'elderly';
  const aqiInfo = atmospheric?.airQuality ? ` (Current Real-time AQI: ${atmospheric.airQuality.us_aqi}, PM2.5: ${atmospheric.airQuality.pm2_5} µg/m³)` : '';

  const routines = [
    `Shift morning outdoor commutes and errands in ${profile.city}${aqiInfo} past 10:30 AM once nocturnal surface temperature inversion dissipates.`,
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
  static isConfigured() {
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

      const prompt = `Generate tailored urban air quality guidance for the following household profile:
- City: ${profile.city}
- Household Category: ${profile.householdType}
- Number of Residents: ${profile.householdSize}
- Primary Commute Mode: ${profile.commute}
- Vulnerable Health Concerns Present: ${profile.healthConcern ? 'YES (respiratory/cardiovascular vulnerability)' : 'NO'}
- Seasonal Context: ${profile.seasonContext}
- Specific Lifestyle Notes / Constraints: ${profile.notes || 'None provided'}
${atmosphericContext}

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
        reply: `[Air Quality Guidance for ${profileContext?.city || 'your area'}] Regarding "${newMessage}": During winter smog episodes, maintain sealed doors, avoid morning exercise during thermal inversion troughs, and run MERV-13 / Corsi-Rosenthal DIY air cleaners. (Add your free GEMINI_API_KEY in .env for live AI responses).`,
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
STRICT DOMAIN BOUNDARY ENFORCEMENT:
You are exclusively the Urban Air Quality Assistant. You MUST strictly decline to answer any question that is NOT directly related to air pollution, winter smog, thermal inversions, particulate matter (PM2.5/PM10), indoor air quality hacks, low-emission daily routines, respiratory protection, or sustainable living.
If the user asks an off-topic query, reply strictly with:
"${DOMAIN_BOUNDARY_DECLINE}"

Context for current user:
- City: ${profileContext?.city || 'Urban area'}
- Household: ${profileContext?.householdType || 'General'}, Size: ${profileContext?.householdSize || 1}
- Commute: ${profileContext?.commute || 'General'}
- Health risk: ${profileContext?.healthConcern ? 'Yes' : 'No'}

Answer the user's air quality questions concisely, practically, and with clear direct impact explanations.`,
      });

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
