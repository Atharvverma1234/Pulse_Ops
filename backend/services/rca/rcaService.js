// backend/services/rca/rcaService.js
const Incident                        = require('../../models/Incident');
const { generateCompletion }          = require('../../utils/groqClient');
const { buildRCAContext }             = require('./contextBuilder');
const { buildRCAPrompt, SYSTEM_PROMPT } = require('./promptBuilder');

// ── Generate RCA for an incident ──────────────
const generateRCA = async (incidentId) => {
  // 1. Build context from DB
  console.log(`[RCA] Building context for incident ${incidentId}`);
  const context = await buildRCAContext(incidentId);

  // 2. Build prompt
  const userPrompt = buildRCAPrompt(context);

  // 3. Call Groq
  console.log('[RCA] Calling Groq LLM...');
  const raw = await generateCompletion(
    SYSTEM_PROMPT,
    userPrompt,
    Number(process.env.GROQ_RCA_MAX_TOKENS) || 1024
  );

  // 4. Parse JSON response
  let parsed;
  try {
    // Strip markdown code fences if Groq wraps in ```json
    const clean = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    parsed = JSON.parse(clean);
  } catch (err) {
    console.error('[RCA] Failed to parse Groq response as JSON:', raw);
    // Fallback — return raw text as summary
    parsed = {
      summary:          raw.slice(0, 300),
      rootCause:        'Unable to parse structured response',
      impact:           'Unknown',
      recommendations:  ['Review logs manually', 'Check metric history'],
      confidence:       'low',
      confidenceReason: 'LLM response was not valid JSON',
    };
  }

  // 5. Save RCA to incident document
  const rca = {
    summary:          parsed.summary          || '',
    rootCause:        parsed.rootCause        || '',
    impact:           parsed.impact           || '',
    recommendations:  parsed.recommendations  || [],
    confidence:       parsed.confidence       || 'low',
    confidenceReason: parsed.confidenceReason || '',
    generatedAt:      new Date(),
    context: {
      metricStats:    context.metricStats,
      alertCount:     context.rawAlertCount,
      metricCount:    context.rawMetricCount,
    },
  };

  await Incident.findByIdAndUpdate(incidentId, { $set: { rca } });

  // 6. Add timeline entry
  await Incident.findByIdAndUpdate(incidentId, {
    $push: {
      timeline: {
        note:      `AI Root Cause Analysis generated (confidence: ${rca.confidence})`,
        createdAt: new Date(),
      },
    },
  });

  console.log(`[RCA] Generated successfully for ${incidentId} — confidence: ${rca.confidence}`);
  return rca;
};

// ── Get existing RCA (no regeneration) ────────
const getRCA = async (incidentId) => {
  const incident = await Incident.findById(incidentId).select('rca title host severity');
  if (!incident) throw new Error('Incident not found');
  return incident.rca || null;
};

module.exports = { generateRCA, getRCA };