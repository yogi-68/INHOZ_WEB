const express = require('express');
const router = express.Router();
const Vitals = require('../models/Vitals');
const MLEvent = require('../models/MLEvent');
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const { evaluateVitals, evaluateMLEvent } = require('../services/rulesEngine');
const { authenticateDevice } = require('../middleware/rbac');

/**
 * POST /api/ingest/vitals
 * Ingest vitals data from IoT devices
 * Requires X-Device-Key header
 */
router.post('/vitals', authenticateDevice, async (req, res) => {
  try {
    const { 
      patientId, 
      heartRate, 
      spo2, 
      temperature, 
      systolic, 
      diastolic,
      glucose,
      deviceId,
      timestamp 
    } = req.body;

    // Validation
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'patientId is required'
      });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ 
      _id: patientId, 
      deletedAt: null 
    }).populate('assignedDoctorId');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Create vitals record
    const vitals = new Vitals({
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      meta: {
        patientId: patient._id,
        deviceId: deviceId || 'unknown'
      },
      heartRate,
      spo2,
      temperature,
      systolic,
      diastolic,
      glucose,
      ivFluidLevel
    });

    await vitals.save();

    // Evaluate against rules engine
    const triggeredAlerts = evaluateVitals({
      heartRate,
      spo2,
      temperature,
      systolic,
      diastolic,
      glucose
    });

    // Save alerts and emit via Socket.IO
    const savedAlerts = [];
    for (const alertData of triggeredAlerts) {
      const alert = new Alert({
        patientId: patient._id,
        doctorId: patient.assignedDoctorId?._id || null,
        type: alertData.type,
        source: alertData.source,
        severity: alertData.severity,
        message: alertData.message,
        vitalSnapshot: alertData.vitalSnapshot,
        timestamp: alertData.timestamp
      });
      
      await alert.save();
      savedAlerts.push(alert);
      
      // Emit Socket.IO event
      const io = req.app.get('io');
      if (io) {
        io.to(`patient:${patient._id}`).emit('vitals:update', {
          patientId: patient._id,
          vitals: {
            heartRate,
            spo2,
            temperature,
            systolic,
            diastolic,
            glucose,
            timestamp: vitals.timestamp
          }
        });
        
        if (savedAlerts.length > 0) {
          io.to(`patient:${patient._id}`).emit('alert:new', {
            patientId: patient._id,
            alerts: savedAlerts
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Vitals recorded',
      data: {
        vitalsId: vitals._id,
        timestamp: vitals.timestamp,
        alertsTriggered: savedAlerts.length,
        alerts: savedAlerts.map(a => ({
          id: a._id,
          type: a.type,
          severity: a.severity,
          message: a.message
        }))
      }
    });
  } catch (error) {
    console.error('Vitals ingestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process vitals',
      details: error.message
    });
  }
});

/**
 * POST /api/ingest/ml
 * Ingest ML detection events from edge devices/cameras
 * Requires X-Device-Key header
 */
router.post('/ml', authenticateDevice, async (req, res) => {
  try {
    const {
      patientId,
      event,
      confidence,
      frameUrl,
      metadata,
      deviceId,
      timestamp
    } = req.body;

    // Validation
    if (!patientId || !event || confidence === undefined) {
      return res.status(400).json({
        success: false,
        error: 'patientId, event, and confidence are required'
      });
    }

    if (confidence < 0 || confidence > 1) {
      return res.status(400).json({
        success: false,
        error: 'confidence must be between 0 and 1'
      });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ 
      _id: patientId, 
      deletedAt: null 
    }).populate('assignedDoctorId');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Create ML event record
    const mlEvent = new MLEvent({
      patientId: patient._id,
      deviceId: deviceId || 'unknown',
      event,
      confidence,
      frameUrl,
      metadata: metadata || {},
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await mlEvent.save();

    // Evaluate against ML rules
    const alertData = evaluateMLEvent({
      event,
      confidence,
      timestamp: mlEvent.timestamp
    });

    let savedAlert = null;
    if (alertData) {
      const alert = new Alert({
        patientId: patient._id,
        doctorId: patient.assignedDoctorId?._id || null,
        type: alertData.type,
        source: alertData.source,
        severity: alertData.severity,
        message: alertData.message,
        mlConfidence: alertData.mlConfidence,
        timestamp: alertData.timestamp
      });
      
      await alert.save();
      savedAlert = alert;
      
      // Emit Socket.IO event
      const io = req.app.get('io');
      if (io) {
        io.to(`patient:${patient._id}`).emit('ml:event', {
          patientId: patient._id,
          event: {
            id: mlEvent._id,
            event,
            confidence,
            frameUrl,
            timestamp: mlEvent.timestamp
          }
        });
        
        io.to(`patient:${patient._id}`).emit('alert:new', {
          patientId: patient._id,
          alerts: [savedAlert]
        });
      }
    }

    res.json({
      success: true,
      message: 'ML event recorded',
      data: {
        eventId: mlEvent._id,
        event,
        confidence,
        timestamp: mlEvent.timestamp,
        alertTriggered: !!savedAlert,
        alert: savedAlert ? {
          id: savedAlert._id,
          type: savedAlert.type,
          severity: savedAlert.severity,
          message: savedAlert.message
        } : null
      }
    });
  } catch (error) {
    console.error('ML event ingestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process ML event',
      details: error.message
    });
  }
});

/**
 * GET /api/ingest/health
 * Health check for ingestion service
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'ingest',
    status: 'healthy',
    timestamp: new Date()
  });
});

module.exports = router;
