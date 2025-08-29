import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaExclamationTriangle, FaBell, FaUser, FaWheelchair } from 'react-icons/fa';
import { GiFalling } from 'react-icons/gi';
import { useLanguage } from '../context/LanguageContext';
import CustomYoloDetector from '../utils/customYoloDetector';

const DangerDetection = ({ vitals }) => {
  const { translate } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const detectionsRef = useRef([]); // Reference to store latest detections
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [detections, setDetections] = useState([]);
  const [detectionError, setDetectionError] = useState(null);
  const [simulationMode, setSimulationMode] = useState(true); // Set to true for development testing
  const [fallDetected, setFallDetected] = useState(false);
  const [patientStatus, setPatientStatus] = useState({
    inBed: false,
    sitting: false,
    standing: false,
    moving: false,
    usingWalker: false,
    inWheelchair: false,
  });

  // Initialize YOLO detector
  useEffect(() => {
    // Create detector instance with a web-friendly model path
    // TensorFlow.js can only load JSON models, not TFLite models directly
    detectorRef.current = new CustomYoloDetector('/model_web/model.json', {
      scoreThreshold: 0.4,
      maxDetections: 15
    });
    
    // Load model
    const loadModel = async () => {
      try {
        setModelLoading(true);
        setDetectionError(null);
        
        const loaded = await detectorRef.current.loadModel();
        setModelLoaded(loaded);
        
        if (!loaded) {
          console.warn('Failed to load the YOLO model, falling back to simulation mode');
          setSimulationMode(true);
          setDetectionError(translate('simulationMode') + ' - Model not available');
        }
      } catch (error) {
        console.error('Error loading model:', error);
        setDetectionError('Error loading model: ' + (error.message || 'Unknown error'));
        setSimulationMode(true);
      } finally {
        setModelLoading(false);
      }
    };
    
    loadModel();
    
    // Cleanup
    return () => {
      detectorRef.current = null;
    };
  }, [translate]);

  // Setup camera
  useEffect(() => {
    const setupCamera = async () => {
      try {
        setDetectionError(null);
        console.log("Attempting to access camera...");
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Browser doesn't support camera access");
        }
        
        // First check if we have permission to access the camera
        navigator.permissions?.query({ name: 'camera' })
          .then((permissionStatus) => {
            console.log('Camera permission status:', permissionStatus.state);
            
            if (permissionStatus.state === 'denied') {
              setDetectionError(`${translate('cameraAccessError')}: Permission denied by user`);
              setSimulationMode(true);
            }
          })
          .catch(err => {
            console.log('Could not query camera permissions:', err);
            // Continue anyway as this API might not be available in all browsers
          });
          
        // Try to access the camera with explicit constraints
        const constraints = { 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "environment" // Prefer rear camera if available
          },
          audio: false
        };
        
        console.log("Requesting camera with constraints:", JSON.stringify(constraints));
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          // Ensure the video element is properly set up
          videoRef.current.srcObject = null; // Clear any existing stream
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.setAttribute('playsinline', ''); // For iOS Safari
          
          // Add event listeners to debug video element issues
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded, attempting to play");
            videoRef.current.play().catch(e => {
              console.error("Error playing video after metadata loaded:", e);
              setDetectionError(`${translate('cameraAccessError')}: ${e.message}`);
            });
          };
          
          videoRef.current.onplay = () => console.log("Video playing successfully");
          videoRef.current.onpause = () => console.log("Video paused");
          videoRef.current.onerror = (e) => console.error("Video element error:", e);
          
          console.log("Camera access successful, stream attached to video element");
        } else {
          console.warn("Video element reference not available");
          throw new Error("Video element not available");
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
        setDetectionError(`${translate('cameraAccessError')}: ${err.message}`);
        
        // Give user-friendly error message based on error type
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setDetectionError(`${translate('cameraAccessError')}: Permission denied by user`);
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setDetectionError(`${translate('cameraAccessError')}: No camera found on this device`);
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setDetectionError(`${translate('cameraAccessError')}: Camera is in use by another application`);
        } else if (err.name === 'OverconstrainedError') {
          setDetectionError(`${translate('cameraAccessError')}: Camera doesn't meet requirements`);
        }
        
        // Still enable simulation mode even if camera fails
        if (!simulationMode) {
          console.log("Enabling simulation mode due to camera access failure");
          setSimulationMode(true);
        }
      }
    };
    
    // Only try to set up the camera if simulation mode is off
    if (!simulationMode) {
      setupCamera();
    } else {
      console.log("Simulation mode is enabled, skipping camera setup");
      setDetectionError(`${translate('usingSimulatedData')}`);
    }
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        console.log("Camera tracks stopped");
      }
    };
  }, [simulationMode, translate]);

  useEffect(() => {
    // Add 'loadeddata' event listener to the video element
    const handleVideoLoaded = () => {
      console.log("Video loaded successfully");
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadeddata', handleVideoLoaded);
    }

    return () => {
      if (video) {
        video.removeEventListener('loadeddata', handleVideoLoaded);
      }
    };
  }, []);

  // Process detections to monitor patient status - wrap with useCallback to prevent infinite loops
  const processPatientStatus = useCallback((detections) => {
    // Reset status
    const status = {
      inBed: false,
      sitting: false,
      standing: false,
      moving: false,
      usingWalker: false,
      inWheelchair: false,
    };
    
    // Check for fall
    const fallDetection = detections.find(d => d.class === 'fall');
    const hasFall = !!fallDetection;
    
    if (hasFall !== fallDetected) {
      setFallDetected(hasFall);
      
      // Play alert sound if fall is detected
      if (hasFall) {
        try {
          const audio = new Audio('/alert-sound.mp3');
          audio.play().catch(e => console.warn('Failed to play alert sound:', e));
        } catch (error) {
          console.warn('Failed to create audio element:', error);
        }
      }
    }
    
    // Update status based on detections
    detections.forEach(detection => {
      switch(detection.class) {
        case 'bed':
          // If bed and person are detected close to each other
          const personDetection = detections.find(d => d.class === 'person' || d.class === 'patient');
          if (personDetection) {
            const bedBox = detection.bbox;
            const personBox = personDetection.bbox;
            
            // Simple overlap detection
            const overlap = !(
              bedBox[0] > personBox[0] + personBox[2] || 
              bedBox[0] + bedBox[2] < personBox[0] || 
              bedBox[1] > personBox[1] + personBox[3] || 
              bedBox[1] + bedBox[3] < personBox[1]
            );
            
            if (overlap) {
              status.inBed = true;
            }
          }
          break;
        case 'sit':
          status.sitting = true;
          break;
        case 'stand':
          status.standing = true;
          break;
        case 'move':
          status.moving = true;
          break;
        case 'walker':
          status.usingWalker = true;
          break;
        case 'wheelchair':
          status.inWheelchair = true;
          break;
        default:
          break;
      }
    });
    
    setPatientStatus(status);
  }, [fallDetected]); // Add fallDetected as a dependency since we reference it in the function

  // Perform object detection on video frames
  useEffect(() => {
    if (!canvasRef.current || !detectorRef.current) return;
    
    let animationFrameId;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    
    // Match canvas size to video or use default size if video isn't available
    const resizeCanvas = () => {
      if (video && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      } else if (simulationMode) {
        // Default canvas size for simulation if video isn't available
        canvas.width = 640;
        canvas.height = 480;
        
        // Draw a placeholder gray background
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a text explaining simulation mode
        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Simulation Mode - Using synthetic data', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Camera not available', canvas.width / 2, canvas.height / 2 + 24);
      }
    };
    
    // Process video frames or simulate detections
    const detectFrame = async () => {
      // Resize the canvas first
      resizeCanvas();
      
      try {
        let detected;
        
        // Check if we're in simulation mode or the video is ready
        if (simulationMode) {
          // Use simulation mode
          detected = detector.simulateDetections(video || canvas);
        } else if (video && video.readyState === 4) { // 4 = HAVE_ENOUGH_DATA
          // Real detection using the model
          detected = await detector.detect(video);
        } else {
          // Skip this frame if neither simulation is on nor video is ready
          animationFrameId = requestAnimationFrame(detectFrame);
          return;
        }
        
        // Update reference first
        detectionsRef.current = detected;
        
        // Limit state updates to reduce render frequency (e.g., every 5 frames)
        // This helps prevent the "Maximum update depth exceeded" error
        if (Math.random() < 0.2) { // ~20% chance to update state (roughly every 5 frames)
          setDetections(detected);
          processPatientStatus(detected);
        }
        
        // Always draw bounding boxes using the latest detections
        detector.drawBoxes(canvas, detected);
      } catch (error) {
        console.error("Error during detection:", error);
        // Don't update error state here to avoid React state update errors in animation frame
      }
      
      // Continue detection on the next frame
      animationFrameId = requestAnimationFrame(detectFrame);
    };
    
    // Start the detection loop
    detectFrame();
    
    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [simulationMode, processPatientStatus]); // Add back processPatientStatus since we're using it correctly now
  
  // Update UI less frequently to reduce render pressure
  useEffect(() => {
    // Update UI with latest detections every 200ms instead of every frame
    const updateInterval = setInterval(() => {
      if (detectionsRef.current.length > 0) {
        setDetections([...detectionsRef.current]);
        processPatientStatus(detectionsRef.current);
      }
    }, 200);
    
    return () => clearInterval(updateInterval);
  }, [processPatientStatus]);

  const dangerConditions = [
    { condition: vitals.temperature > 39, message: translate('highFeverDetected') },
    { condition: vitals.pulse > 120 || vitals.pulse < 50, message: translate('abnormalPulseRate') },
    { condition: vitals.heartRate > 120 || vitals.heartRate < 50, message: translate('abnormalHeartRate') },
    { condition: fallDetected, message: translate('fallDetected'), critical: true }
  ];

  const detectedDangers = dangerConditions.filter(condition => condition.condition);
  const hasCritical = detectedDangers.some(danger => danger.critical);

  const renderPatientStatusIcons = () => {
    return (
      <div className="flex space-x-3 mt-4 flex-wrap">
        {patientStatus.inBed && (
          <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            <span className="material-icons mr-1 text-lg">bed</span>
            {translate('bed')}
          </div>
        )}
        {patientStatus.sitting && (
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            <FaUser className="mr-1" />
            {translate('sit')}
          </div>
        )}
        {patientStatus.standing && (
          <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
            <FaUser className="mr-1" />
            {translate('stand')}
          </div>
        )}
        {patientStatus.moving && (
          <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            <span className="material-icons mr-1 text-lg">directions_walk</span>
            {translate('move')}
          </div>
        )}
        {patientStatus.usingWalker && (
          <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
            <span className="material-icons mr-1 text-lg">elderly</span>
            {translate('walker')}
          </div>
        )}
        {patientStatus.inWheelchair && (
          <div className="flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
            <FaWheelchair className="mr-1" />
            {translate('wheelchair')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          {translate('patientMonitoring')} 
          {detections.length > 0 && ` (${detections.length} ${translate('objectDetected')})`}
        </h3>
        <div className="relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-auto rounded-lg" 
          />
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-auto rounded-lg" 
          />
          
          {modelLoading && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                <p>{translate('loadingModel')}</p>
              </div>
            </div>
          )}
          
          {fallDetected && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg animate-pulse text-center">
                <GiFalling className="text-5xl mx-auto mb-2" />
                <h3 className="text-xl font-bold">{translate('fallDetected')}</h3>
                <p className="mt-2">{translate('alertStaff')}</p>
                <button className="mt-4 bg-white text-red-600 px-4 py-2 rounded font-bold flex items-center justify-center mx-auto">
                  <FaBell className="mr-2" />
                  {translate('alertStaff')}
                </button>
              </div>
            </div>
          )}
          
          {detectionError && (
            <div className="absolute top-2 right-2 max-w-xs bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-md">
              <p className="font-bold">Note:</p>
              <p className="text-sm">{detectionError}</p>
              {simulationMode && (
                <p className="text-xs mt-1 italic">{translate('simulationMode')}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Patient Status */}
        {renderPatientStatusIcons()}
        
        {/* Detection Information */}
        {detections.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">{translate('detectedObjects')}:</h4>
            <div className="max-h-32 overflow-y-auto">
              <ul className="list-disc list-inside">
                {detections.map((detection, index) => (
                  <li key={index} style={{ color: detection.color }}>
                    {translate(detection.class.toLowerCase()) || detection.class} ({Math.round(detection.score * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className={`p-6 rounded-lg ${hasCritical ? 'bg-red-100' : detectedDangers.length === 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className={`text-2xl mr-2 ${hasCritical ? 'text-red-500' : detectedDangers.length === 0 ? 'text-green-500' : 'text-yellow-500'}`} />
          <h3 className="text-xl font-semibold">
            {translate('patientStatus')}: {detectedDangers.length === 0 ? translate('stable') : translate('requiresAttention')}
          </h3>
        </div>
        {detectedDangers.length === 0 ? (
          <p>{translate('allVitalsNormal')}</p>
        ) : (
          <ul className="list-disc list-inside">
            {detectedDangers.map((danger, index) => (
              <li key={index} className={danger.critical ? 'text-red-600 font-bold' : ''}>
                {danger.message}
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-6">
          <h4 className="font-semibold mb-2">{translate('patientSafety')}</h4>
          <p className="text-sm">
            {fallDetected 
              ? 'Emergency assistance is needed! A fall has been detected.'
              : 'Continuous monitoring active. No falls detected.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DangerDetection;
