// backend/services/alertCooldown.js

// In-memory store: key = "ruleId:host" → last fired timestamp
const cooldownMap = new Map();

const isOnCooldown = (ruleId, host) => {
  const key       = `${ruleId}:${host}`;
  const lastFired = cooldownMap.get(key);
  if (!lastFired) return false;

  const rule    = require('../config/alertRules').find((r) => r.id === ruleId);
  const elapsed = Date.now() - lastFired;
  return elapsed < (rule?.cooldown || 5 * 60 * 1000);
};

const markFired = (ruleId, host) => {
  const key = `${ruleId}:${host}`;
  cooldownMap.set(key, Date.now());
};

const clearCooldown = (ruleId, host) => {
  const key = `${ruleId}:${host}`;
  cooldownMap.delete(key);
};

module.exports = { isOnCooldown, markFired, clearCooldown };