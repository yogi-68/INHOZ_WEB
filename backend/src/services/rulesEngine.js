/**
 * Rules Engine for INHOZ System
 * Evaluates sensor vitals and ML events against configurable thresholds
 * Returns alerts with severity levels (critical, warning, info)
 */

// Sensor Rules Configuration
const SENSOR_RULES = {
  HIGH_FEVER: {
    check: (vitals) => vitals.temperature > 39,
    message: (v) => `High fever detected: ${v.temperature}°C`,
    severity: 'critical'
  },
  LOW_SPO2: {
    check: (vitals) => vitals.spo2 < 90,
    message: (v) => `Low SpO2 detected: ${v.spo2}%`,
    severity: 'critical'
  },
  TACHYCARDIA: {
    check: (vitals) => vitals.heartRate > 120,
    message: (v) => `Tachycardia detected: ${v.heartRate} bpm`,
    severity: 'warning'
  },
  BRADYCARDIA: {
    check: (vitals) => vitals.heartRate < 50,
    message: (v) => `Bradycardia detected: ${v.heartRate} bpm`,
    severity: 'warning'
  },
  HYPERTENSIVE_CRISIS: {
    check: (vitals) => vitals.systolic > 180 || vitals.diastolic > 120,
    message: (v) => `Hypertensive crisis: ${v.systolic}/${v.diastolic} mmHg`,
    severity: 'critical'
  },
  HYPOTENSION: {
    check: (vitals) => vitals.systolic < 90 || vitals.diastolic < 60,
    message: (v) => `Hypotension detected: ${v.systolic}/${v.diastolic} mmHg`,
    severity: 'warning'
  },
  GLUCOSE_HIGH: {
    check: (vitals) => vitals.glucose > 200,
    message: (v) => `High glucose: ${v.glucose} mg/dL`,
    severity: 'warning'
  },
  GLUCOSE_LOW: {
    check: (vitals) => vitals.glucose < 70,
    message: (v) => `Low glucose: ${v.glucose} mg/dL`,
    severity: 'critical'
  }
};

// ML Event Rules Configuration
const ML_RULES = {
  fall: {
    threshold: 0.85,
    severity: 'critical',
    message: 'Fall detected'
  },
  convulsion: {
    threshold: 0.80,
    severity: 'critical',
    message: 'Convulsion detected'
  },
  irregular_breathing: {
    threshold: 0.75,
    severity: 'warning',
    message: 'Irregular breathing detected'
  },
  no_movement: {
    threshold: 0.70,
    severity: 'warning',
    message: 'No movement detected for extended period',
    durationMinutes: 10 // Additional context
  },
  unresponsive: {
    threshold: 0.80,
    severity: 'critical',
    message: 'Patient unresponsive'
  }
};

/**
 * Evaluate vitals against all sensor rules
 * @param {Object} vitals - Vital signs object
 * @returns {Array} Array of triggered alerts
 */
function evaluateVitals(vitals) {
  const alerts = [];
  
  for (const [ruleType, rule] of Object.entries(SENSOR_RULES)) {
    try {
      if (rule.check(vitals)) {
        alerts.push({
          type: ruleType,
          source: 'sensor',
          severity: rule.severity,
          message: rule.message(vitals),
          vitalSnapshot: {
            heartRate: vitals.heartRate,
            spo2: vitals.spo2,
            temperature: vitals.temperature,
            systolic: vitals.systolic,
            diastolic: vitals.diastolic,
            glucose: vitals.glucose
          },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error(`Error evaluating rule ${ruleType}:`, error);
    }
  }
  
  return alerts;
}

/**
 * Evaluate ML event against thresholds
 * @param {Object} mlEvent - ML event object with event type and confidence
 * @returns {Object|null} Alert object if threshold exceeded, null otherwise
 */
function evaluateMLEvent(mlEvent) {
  const rule = ML_RULES[mlEvent.event];
  
  if (!rule) {
    console.warn(`Unknown ML event type: ${mlEvent.event}`);
    return null;
  }
  
  if (mlEvent.confidence >= rule.threshold) {
    return {
      type: mlEvent.event.toUpperCase(),
      source: 'ml',
      severity: rule.severity,
      message: rule.message,
      mlConfidence: mlEvent.confidence,
      timestamp: mlEvent.timestamp || new Date()
    };
  }
  
  return null;
}

/**
 * Get all configured sensor rules (for admin configuration UI)
 * @returns {Object} Sensor rules configuration
 */
function getSensorRules() {
  const rules = {};
  for (const [type, rule] of Object.entries(SENSOR_RULES)) {
    rules[type] = {
      severity: rule.severity,
      // Extract threshold from check function (simplified representation)
      description: rule.message({ temperature: 'X', spo2: 'X', heartRate: 'X', systolic: 'X', diastolic: 'X', glucose: 'X', ivFluidLevel: 'X' })
    };
  }
  return rules;
}

/**
 * Get all configured ML rules (for admin configuration UI)
 * @returns {Object} ML rules configuration
 */
function getMLRules() {
  return JSON.parse(JSON.stringify(ML_RULES)); // Deep copy to prevent modification
}

/**
 * Update sensor rule threshold (for future admin configuration)
 * @param {String} ruleType - Rule type to update
 * @param {Object} config - New configuration
 */
function updateSensorRule(ruleType, config) {
  if (SENSOR_RULES[ruleType]) {
    // In production, this would persist to database
    // For now, just log the change
    console.log(`Updating sensor rule ${ruleType}:`, config);
    return true;
  }
  return false;
}

/**
 * Update ML rule threshold (for future admin configuration)
 * @param {String} eventType - Event type to update
 * @param {Object} config - New configuration
 */
function updateMLRule(eventType, config) {
  if (ML_RULES[eventType]) {
    // In production, this would persist to database
    ML_RULES[eventType] = { ...ML_RULES[eventType], ...config };
    console.log(`Updated ML rule ${eventType}:`, config);
    return true;
  }
  return false;
}

module.exports = {
  evaluateVitals,
  evaluateMLEvent,
  getSensorRules,
  getMLRules,
  updateSensorRule,
  updateMLRule,
  SENSOR_RULES,
  ML_RULES
};
