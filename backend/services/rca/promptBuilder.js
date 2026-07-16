// backend/services/rca/promptBuilder.js

const SYSTEM_PROMPT = `You are PulseOps RCA Assistant — an expert Site Reliability Engineer 
analyzing infrastructure incidents. Your job is to generate clear, concise Root Cause Analysis 
summaries that help engineers understand what happened and why.

Rules:
- Be factual and specific — use the actual numbers provided
- Structure your response in exactly 4 sections
- Keep each section concise (2-4 sentences max)
- Do not hallucinate causes not supported by the data
- Use plain English — avoid jargon unless necessary
- If data is insufficient, say so honestly

Always respond in this exact JSON format:
{
  "summary": "One sentence describing what happened",
  "rootCause": "Most likely technical cause based on the data",
  "impact": "What was affected and how severely",
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "confidence": "high|medium|low",
  "confidenceReason": "Why you have this confidence level"
}`;

const buildRCAPrompt = (context) => {
  const {
    incident,
    metricStats,
    alerts,
    timeline,
    rawMetricCount,
    rawAlertCount,
  } = context;

  let prompt = `Analyze this infrastructure incident and generate a Root Cause Analysis:\n\n`;

  // Incident info
  prompt += `## INCIDENT\n`;
  prompt += `Title: ${incident.title}\n`;
  prompt += `Description: ${incident.description || 'None provided'}\n`;
  prompt += `Severity: ${incident.severity.toUpperCase()}\n`;
  prompt += `Host: ${incident.host || 'Unknown'}\n`;
  prompt += `Status: ${incident.status}\n`;
  prompt += `Created: ${new Date(incident.createdAt).toISOString()}\n`;
  if (incident.resolvedAt) {
    const durationMs = new Date(incident.resolvedAt) - new Date(incident.createdAt);
    const durationMin = Math.round(durationMs / 60000);
    prompt += `Resolved: ${new Date(incident.resolvedAt).toISOString()} (${durationMin} min MTTR)\n`;
  }
  prompt += `\n`;

  // Metric statistics
  if (metricStats) {
    prompt += `## METRIC STATISTICS (±15-30 min around incident)\n`;
    prompt += `Total readings analyzed: ${rawMetricCount}\n`;
    prompt += `CPU    — avg: ${metricStats.cpu.avg}%, max: ${metricStats.cpu.max}%, min: ${metricStats.cpu.min}%\n`;
    prompt += `Memory — avg: ${metricStats.memory.avg}%, max: ${metricStats.memory.max}%, min: ${metricStats.memory.min}%\n`;
    prompt += `Disk   — avg: ${metricStats.disk.avg}%, max: ${metricStats.disk.max}%, min: ${metricStats.disk.min}%\n`;
    prompt += `AI anomalies detected: ${metricStats.anomalyCount} / ${metricStats.totalReadings} readings (${metricStats.anomalyRate}%)\n`;
    if (metricStats.peakAnomalyScore) {
      prompt += `Peak anomaly score: ${metricStats.peakAnomalyScore}\n`;
    }
    prompt += `\n`;
  } else {
    prompt += `## METRIC STATISTICS\nNo metric data available for this time window.\n\n`;
  }

  // Alerts
  if (alerts.length > 0) {
    prompt += `## ALERTS FIRED (${rawAlertCount} total)\n`;
    alerts.slice(0, 10).forEach((a, i) => {
      prompt += `${i + 1}. ${a.severity.toUpperCase()} — ${a.metricType} reached ${a.triggeredValue?.toFixed(1)}% (threshold: ${a.threshold}%) at ${new Date(a.at).toISOString()}\n`;
    });
    prompt += `\n`;
  } else {
    prompt += `## ALERTS FIRED\nNo threshold alerts fired during this window.\n\n`;
  }

  // Timeline
  if (timeline.length > 0) {
    prompt += `## INVESTIGATION TIMELINE\n`;
    timeline.forEach((t, i) => {
      prompt += `${i + 1}. [${new Date(t.at).toISOString()}] ${t.by}: ${t.note}\n`;
    });
    prompt += `\n`;
  }

  prompt += `Based on the above data, generate a Root Cause Analysis in the specified JSON format.`;

  return prompt;
};

module.exports = { buildRCAPrompt, SYSTEM_PROMPT };