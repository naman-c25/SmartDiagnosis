const Groq = require('groq-sdk');
const { runRuleBasedDiagnosis } = require('./symptomParser');

// Groq client ek baar banao aur reuse karo
let groqClient = null;

function getGroqClient() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// AI ko yeh instructions denge — JSON format mein hi jawab dena hai
const SYSTEM_PROMPT = `You are an expert medical diagnosis assistant. Given a list of symptoms, provide 2-3 possible medical conditions.

IMPORTANT RULES:
- Always respond with valid JSON only — no markdown, no extra text
- Probabilities must sum to 100 or less
- Be medically accurate but accessible
- Include a disclaimer that this is not professional medical advice
- Urgency levels: "low", "moderate", "high", "emergency"

Response format:
{
  "conditions": [
    {
      "name": "Condition Name",
      "probability": 75,
      "description": "Brief description of the condition.",
      "nextSteps": ["Step 1", "Step 2", "Step 3"],
      "doctorType": "Specialist type",
      "urgency": "moderate"
    }
  ],
  "disclaimer": "This is not a substitute for professional medical advice."
}`;

// Groq AI se diagnosis generate karo, fail hone par rule-based use karo
async function generateDiagnosis(symptomsStr, parsedSymptoms) {
  const client = getGroqClient();

  if (!client) {
    console.warn('[aiService] Groq API key not configured — using rule-based fallback');
    return { ...runRuleBasedDiagnosis(symptomsStr), aiGenerated: false };
  }

  try {
    const userMessage = `Patient symptoms: ${symptomsStr}\n\nParsed symptom list: ${parsedSymptoms.join(', ')}`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from Groq');

    const parsed = JSON.parse(raw);

    if (!parsed.conditions || !Array.isArray(parsed.conditions)) {
      throw new Error('Invalid response structure from Groq');
    }

    const conditions = parsed.conditions.slice(0, 3).map((c) => ({
      name: String(c.name || 'Unknown Condition'),
      probability: Math.min(100, Math.max(0, Number(c.probability) || 50)),
      description: String(c.description || ''),
      nextSteps: Array.isArray(c.nextSteps) ? c.nextSteps.map(String) : [],
      doctorType: String(c.doctorType || 'General Practitioner'),
      urgency: ['low', 'moderate', 'high', 'emergency'].includes(c.urgency)
        ? c.urgency
        : 'moderate',
    }));

    return {
      conditions,
      parsedSymptoms,
      disclaimer:
        parsed.disclaimer ||
        'This is not a substitute for professional medical advice. Always consult a qualified healthcare provider.',
      aiGenerated: true,
    };
  } catch (err) {
    console.error('[aiService] Groq error:', err.message);
    console.warn('[aiService] Falling back to rule-based diagnosis');
    const fallback = runRuleBasedDiagnosis(symptomsStr);
    return { ...fallback, aiGenerated: false };
  }
}

module.exports = { generateDiagnosis };
