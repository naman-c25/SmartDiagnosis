// yeh file symptoms ko samajhne aur conditions match karne ka kaam karti hai

// agar user alag shabdon mein symptoms likhe toh standard naam mein badlo
const SYMPTOM_ALIASES = {
  'high temp': 'fever',
  'high temperature': 'fever',
  'running nose': 'runny nose',
  'stuffy nose': 'nasal congestion',
  'blocked nose': 'nasal congestion',
  headache: 'headache',
  'head pain': 'headache',
  'sore throat': 'sore throat',
  'throat pain': 'sore throat',
  'body pain': 'body aches',
  'muscle pain': 'muscle aches',
  'muscle ache': 'muscle aches',
  'short breath': 'shortness of breath',
  'breathing difficulty': 'shortness of breath',
  'difficulty breathing': 'shortness of breath',
  'chest tightness': 'chest pain',
  'stomach ache': 'abdominal pain',
  'stomach pain': 'abdominal pain',
  'belly pain': 'abdominal pain',
  vomiting: 'nausea',
  'throwing up': 'nausea',
  dizziness: 'dizziness',
  dizzy: 'dizziness',
  'skin rash': 'rash',
  'skin itching': 'itching',
};

// saari common bimariyan aur unke symptoms
const CONDITION_RULES = [
  {
    name: 'Common Cold',
    requiredSymptoms: ['runny nose', 'sore throat', 'cough'],
    relatedSymptoms: ['sneezing', 'nasal congestion', 'mild fever', 'headache'],
    baseProbability: 65,
    doctorType: 'General Practitioner',
    urgency: 'low',
    nextSteps: [
      'Rest and stay hydrated',
      'Over-the-counter cold medications',
      'See a GP if symptoms worsen after 7 days',
    ],
    description: 'A viral infection of the upper respiratory tract.',
  },
  {
    name: 'Influenza (Flu)',
    requiredSymptoms: ['fever', 'body aches', 'fatigue'],
    relatedSymptoms: ['cough', 'headache', 'chills', 'sore throat'],
    baseProbability: 70,
    doctorType: 'General Practitioner',
    urgency: 'moderate',
    nextSteps: [
      'Rest and increase fluid intake',
      'Antiviral medications (consult doctor)',
      'Flu test to confirm diagnosis',
      'Seek medical attention if breathing difficulties arise',
    ],
    description: 'A contagious respiratory illness caused by influenza viruses.',
  },
  {
    name: 'COVID-19',
    requiredSymptoms: ['fever', 'cough'],
    relatedSymptoms: ['shortness of breath', 'loss of taste', 'loss of smell', 'fatigue', 'body aches'],
    baseProbability: 55,
    doctorType: 'General Practitioner / Infectious Disease Specialist',
    urgency: 'moderate',
    nextSteps: [
      'COVID-19 PCR or rapid antigen test',
      'Self-isolate while awaiting results',
      'Monitor oxygen saturation with a pulse oximeter',
      'Emergency care if SpO2 drops below 94%',
    ],
    description: 'An infectious disease caused by the SARS-CoV-2 virus.',
  },
  {
    name: 'Pneumonia',
    requiredSymptoms: ['fever', 'cough', 'shortness of breath'],
    relatedSymptoms: ['chest pain', 'fatigue', 'chills', 'body aches'],
    baseProbability: 45,
    doctorType: 'Pulmonologist / General Practitioner',
    urgency: 'high',
    nextSteps: [
      'Chest X-ray',
      'Blood tests (CBC, CRP)',
      'Sputum culture',
      'Immediate medical consultation required',
    ],
    description: 'An infection that inflames the air sacs in one or both lungs.',
  },
  {
    name: 'Gastroenteritis',
    requiredSymptoms: ['nausea', 'diarrhea'],
    relatedSymptoms: ['abdominal pain', 'vomiting', 'fever', 'cramping'],
    baseProbability: 60,
    doctorType: 'Gastroenterologist / General Practitioner',
    urgency: 'moderate',
    nextSteps: [
      'Stay hydrated with oral rehydration solution',
      'Avoid solid foods for a few hours',
      'Stool culture if symptoms persist',
      'IV fluids if severe dehydration occurs',
    ],
    description: 'Inflammation of the stomach and intestines, often from viral or bacterial infection.',
  },
  {
    name: 'Migraine',
    requiredSymptoms: ['headache'],
    relatedSymptoms: ['nausea', 'light sensitivity', 'dizziness', 'visual disturbances'],
    baseProbability: 50,
    doctorType: 'Neurologist / General Practitioner',
    urgency: 'moderate',
    nextSteps: [
      'Rest in a dark, quiet room',
      'Over-the-counter pain relievers (ibuprofen, acetaminophen)',
      'Neurological evaluation for recurring migraines',
      'MRI/CT scan if severe or sudden onset',
    ],
    description: 'A neurological condition causing intense, debilitating headaches.',
  },
  {
    name: 'Hypertensive Crisis',
    requiredSymptoms: ['headache', 'chest pain'],
    relatedSymptoms: ['dizziness', 'shortness of breath', 'nausea', 'vision changes'],
    baseProbability: 35,
    doctorType: 'Cardiologist / Emergency Medicine',
    urgency: 'emergency',
    nextSteps: [
      'Measure blood pressure immediately',
      'Go to the emergency room if BP > 180/120 mmHg',
      'ECG and blood tests',
      'Do not delay — this is a medical emergency',
    ],
    description: 'A severe increase in blood pressure that can lead to stroke or organ damage.',
  },
  {
    name: 'Allergic Reaction',
    requiredSymptoms: ['rash', 'itching'],
    relatedSymptoms: ['hives', 'swelling', 'runny nose', 'sneezing', 'watery eyes'],
    baseProbability: 60,
    doctorType: 'Allergist / Dermatologist',
    urgency: 'low',
    nextSteps: [
      'Identify and avoid the allergen',
      'Antihistamines (cetirizine, loratadine)',
      'Allergy skin/blood tests',
      'Epinephrine if anaphylaxis symptoms appear',
    ],
    description: 'An immune system response to a foreign substance.',
  },
  {
    name: 'Urinary Tract Infection (UTI)',
    requiredSymptoms: ['frequent urination', 'burning urination'],
    relatedSymptoms: ['pelvic pain', 'cloudy urine', 'fever', 'lower back pain'],
    baseProbability: 65,
    doctorType: 'Urologist / General Practitioner',
    urgency: 'moderate',
    nextSteps: [
      'Urinalysis and urine culture',
      'Antibiotic treatment as prescribed',
      'Increase water intake',
      'Kidney function tests if fever is present',
    ],
    description: 'An infection in any part of the urinary system.',
  },
  {
    name: 'Anxiety / Panic Disorder',
    requiredSymptoms: ['chest pain', 'shortness of breath'],
    relatedSymptoms: ['palpitations', 'dizziness', 'sweating', 'trembling', 'nausea'],
    baseProbability: 40,
    doctorType: 'Psychiatrist / General Practitioner',
    urgency: 'moderate',
    nextSteps: [
      'Rule out cardiac causes first (ECG)',
      'Mental health screening',
      'Cognitive Behavioral Therapy (CBT)',
      'Consult a psychiatrist for medication options',
    ],
    description: 'A mental health disorder characterized by excessive fear or worry.',
  },
];

// symptoms string ko alag alag tokens mein todo
function parseSymptoms(symptomsStr) {
  const raw = symptomsStr
    .toLowerCase()
    .split(/[,;\/\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return raw.map((symptom) => {
    for (const [alias, canonical] of Object.entries(SYMPTOM_ALIASES)) {
      if (symptom.includes(alias)) return canonical;
    }
    return symptom;
  });
}

// ek condition ko user ke symptoms ke saath compare karo
function scoreCondition(condition, parsedSymptoms) {
  let score = 0;
  let requiredMatches = 0;
  let relatedMatches = 0;

  for (const req of condition.requiredSymptoms) {
    if (parsedSymptoms.some((s) => s.includes(req) || req.includes(s))) {
      requiredMatches++;
      score += 30;
    }
  }

  for (const rel of condition.relatedSymptoms) {
    if (parsedSymptoms.some((s) => s.includes(rel) || rel.includes(s))) {
      relatedMatches++;
      score += 10;
    }
  }

  if (requiredMatches === 0) return null;

  const matchRatio = requiredMatches / condition.requiredSymptoms.length;
  const probability = Math.min(
    95,
    Math.round(condition.baseProbability * matchRatio + relatedMatches * 5)
  );

  return {
    name: condition.name,
    probability,
    description: condition.description,
    nextSteps: condition.nextSteps,
    doctorType: condition.doctorType,
    urgency: condition.urgency,
  };
}

// saari conditions score karo aur top 2-3 wapas bhejo
function runRuleBasedDiagnosis(symptomsStr) {
  const parsedSymptoms = parseSymptoms(symptomsStr);

  const scored = CONDITION_RULES.map((c) => scoreCondition(c, parsedSymptoms))
    .filter(Boolean)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  if (scored.length === 0) {
    scored.push({
      name: 'Unspecified Condition',
      probability: 30,
      description: 'The provided symptoms do not clearly match a common condition pattern.',
      nextSteps: [
        'Consult a General Practitioner for a thorough examination',
        'Keep a symptom diary to track changes',
        'Blood panel and physical examination recommended',
      ],
      doctorType: 'General Practitioner',
      urgency: 'moderate',
    });
  }

  return { conditions: scored, parsedSymptoms };
}

module.exports = { parseSymptoms, runRuleBasedDiagnosis };
