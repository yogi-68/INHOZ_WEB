import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThermometer, FaHeartbeat, FaFilePdf, FaSync, FaArrowLeft, FaVideo, FaVideoSlash, FaExclamationTriangle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { GiHeartBeats } from 'react-icons/gi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLanguage } from '../context/LanguageContext';
import CustomYoloDetector from '../utils/customYoloDetector';

const generateRandomVitals = () => ({
  temperature: (Math.random() * (40 - 35) + 35).toFixed(1),
  pulse: Math.floor(Math.random() * (120 - 60) + 60),
  heartRate: Math.floor(Math.random() * (120 - 60) + 60),
});

const getStatus = (vital, value) => {
  switch (vital) {
    case 'temperature':
      return value > 37.5 ? 'Fever' : 'Normal';
    case 'pulse':
    case 'heartRate':
      return value > 100 ? 'Elevated' : value < 60 ? 'Low' : 'Normal';
    default:
      return 'Normal';
  }
};

const VitalCard = ({ icon: Icon, title, value, unit, status }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <Icon className="text-blue-500 text-3xl mr-3" />
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-4xl font-bold mb-2">{value} <span className="text-2xl">{unit}</span></p>
    <p className={`text-sm font-medium ${status === 'Normal' ? 'text-green-500' : status === 'High' || status === 'Elevated' ? 'text-red-500' : 'text-yellow-500'}`}>
      Status: {status}
    </p>
  </div>
);

// Sample patient data for demo
const demoPatients = [
  { id: 1, name: 'John Doe', age: 45, gender: 'Male', room: '101' },
  { id: 2, name: 'Jane Smith', age: 32, gender: 'Female', room: '203' },
  { id: 3, name: 'Bob Johnson', age: 55, gender: 'Male', room: '305' }
];

const Vitals = ({ isDarkMode }) => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [vitals, setVitals] = useState(generateRandomVitals());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(location.state?.patient || null);
  
  // Video ML states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [detections, setDetections] = useState([]);
  const [detectionError, setDetectionError] = useState(null);
  const [simulationMode, setSimulationMode] = useState(true);
  const [fallDetected, setFallDetected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const alertSoundRef = useRef(null);

  // Start monitoring when component mounts
  useEffect(() => {
    if (selectedPatient) {
      setIsMonitoring(true);
    }
  }, [selectedPatient]);

  // Initialize detector
  useEffect(() => {
    if (!isMonitoring) return;

    const initDetector = async () => {
      try {
        setModelLoading(true);
        setDetectionError(null);
        
        // Create new detector instance
        detectorRef.current = new CustomYoloDetector();
        
        // Try to load the model
        const success = await detectorRef.current.loadModel();
        
        if (!success) {
          console.warn('Failed to load model, falling back to simulation mode');
          setSimulationMode(true);
        }
        
        setModelLoaded(success);
        setModelLoading(false);
      } catch (error) {
        console.error('Error initializing detector:', error);
        setModelLoading(false);
        setDetectionError('Failed to load detection model. Using simulation mode.');
        setSimulationMode(true);
      }
    };

    initDetector();
  }, [isMonitoring]);

  // Setup camera
  useEffect(() => {
    if (!isMonitoring) return;

    const setupCamera = async () => {
      try {
        setDetectionError(null);
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Browser doesn't support camera access");
        }
        
        // Request camera permission with specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
            aspectRatio: 1.777777778 // 16:9 aspect ratio
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
          
          // Set canvas dimensions to match video
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          
          setHasCameraPermission(true);
          setSimulationMode(false);
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
        setDetectionError(`${translate('cameraAccessError')}: ${err.message}`);
        setHasCameraPermission(false);
        setSimulationMode(true);
      }
    };
    
    if (!simulationMode) {
      setupCamera();
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isMonitoring, simulationMode, translate]);

  // Initialize alert sound
  useEffect(() => {
    alertSoundRef.current = new Audio('/alert-sound.mp3');
    alertSoundRef.current.load();
    
    return () => {
      if (alertSoundRef.current) {
        alertSoundRef.current.pause();
        alertSoundRef.current = null;
      }
    };
  }, []);

  // Process video frames
  useEffect(() => {
    if (!isMonitoring || !canvasRef.current || !detectorRef.current) return;
    
    let animationFrameId;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    
    const detectFrame = async () => {
      try {
        let detected;
        
        if (simulationMode) {
          detected = detector.simulateDetections(video || canvas);
        } else if (video && video.readyState === 4) {
          detected = await detector.detect(video);
        } else {
          animationFrameId = requestAnimationFrame(detectFrame);
          return;
        }
        
        // Check for falls
        const hasFall = detected.some(d => d.class === 'fall');
        if (hasFall !== fallDetected) {
          setFallDetected(hasFall);
          if (hasFall && isSoundEnabled && alertSoundRef.current) {
            try {
              // Reset the sound to start
              alertSoundRef.current.currentTime = 0;
              // Play the sound
              const playPromise = alertSoundRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.warn('Failed to play alert sound:', error);
                });
              }
            } catch (error) {
              console.warn('Failed to play alert sound:', error);
            }
          }
        }
        
        setDetections(detected);
        detector.drawBoxes(canvas, detected);
      } catch (error) {
        console.error("Error during detection:", error);
      }
      
      animationFrameId = requestAnimationFrame(detectFrame);
    };
    
    detectFrame();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMonitoring, simulationMode, fallDetected, isSoundEnabled]);

  // Function to refresh vitals
  const refreshVitals = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVitals(generateRandomVitals());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(generateRandomVitals());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const generatePDF = () => {
    if (!selectedPatient) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`${translate('vitals')} ${translate('report')}`, 105, 15, null, null, 'center');
    
    doc.setFontSize(12);
    doc.text(`${translate('patientName')}: ${selectedPatient.name}`, 20, 30);
    doc.text(`${translate('date')}: ${new Date().toLocaleString()}`, 20, 40);
    
    const tableData = [
      [translate('vital'), translate('value'), translate('status')],
      [translate('temperature'), `${vitals.temperature}°C`, getStatus('temperature', vitals.temperature)],
      [translate('pulse'), `${vitals.pulse} bpm`, getStatus('pulse', vitals.pulse)],
      [translate('heartRate'), `${vitals.heartRate} bpm`, getStatus('heartRate', vitals.heartRate)],
    ];
    
    doc.autoTable({
      startY: 50,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [66, 135, 245], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    doc.setFontSize(10);
    doc.text(translate('pdfDisclaimer'), 20, doc.internal.pageSize.height - 20);
    
    doc.save('patient_vitals_report.pdf');
  };

  // Handle missing patient data
  useEffect(() => {
    if (!selectedPatient) {
      navigate('/patients');
    }
  }, [selectedPatient, navigate]);

  // Remove the immediate redirect
  if (!selectedPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to patients page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold relative">
          {translate('vitals')} {translate('for')} {selectedPatient.name}
          <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-blue-500"></span>
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`${
              isSoundEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
            } text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300 mr-2`}
          >
            {isSoundEnabled ? (
              <>
                <FaVolumeUp className="mr-2" />
                {translate('soundOn')}
              </>
            ) : (
              <>
                <FaVolumeMute className="mr-2" />
                {translate('soundOff')}
              </>
            )}
          </button>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`${
              isMonitoring ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300 mr-2`}
          >
            {isMonitoring ? (
              <>
                <FaVideoSlash className="mr-2" />
                {translate('stopMonitoring')}
              </>
            ) : (
              <>
                <FaVideo className="mr-2" />
                {translate('startMonitoring')}
              </>
            )}
          </button>
          <button
            onClick={refreshVitals}
            disabled={isRefreshing}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300 mr-2"
          >
            <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? translate('refreshing') : translate('refresh')}
          </button>
          <button
            onClick={generatePDF}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300"
          >
            <FaFilePdf className="mr-2" />
            {translate('downloadReport')}
          </button>
        </div>
      </div>

      {isMonitoring && (
        <div className="relative mb-6 max-w-4xl mx-auto">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-contain" 
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full" 
            />
            
            {modelLoading && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                  <p>{translate('loadingModel')}</p>
                </div>
              </div>
            )}
            
            {fallDetected && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse text-center">
                  <FaExclamationTriangle className="text-2xl mx-auto mb-1" />
                  <p className="text-sm font-bold">{translate('fallDetected')}</p>
                  {!isSoundEnabled && (
                    <p className="text-xs mt-1 text-yellow-200">
                      {translate('soundDisabled')}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {detectionError && (
              <div className="absolute top-0 left-0 w-full bg-red-100 text-red-700 p-2 text-sm">
                {detectionError}
              </div>
            )}

            {simulationMode && !detectionError && (
              <div className="absolute top-0 left-0 w-full bg-yellow-100 text-yellow-700 p-2 text-sm">
                {translate('simulationMode')}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <VitalCard 
          icon={FaThermometer} 
          title={translate('temperature')} 
          value={vitals.temperature} 
          unit="°C" 
          status={getStatus('temperature', vitals.temperature)} 
        />
        <VitalCard 
          icon={GiHeartBeats} 
          title={translate('pulse')} 
          value={vitals.pulse} 
          unit="bpm" 
          status={getStatus('pulse', vitals.pulse)} 
        />
        <VitalCard 
          icon={FaHeartbeat} 
          title={translate('heartRate')} 
          value={vitals.heartRate} 
          unit="bpm" 
          status={getStatus('heartRate', vitals.heartRate)} 
        />
      </div>
      
      <button 
        onClick={() => navigate('/patients')} 
        className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors duration-200"
      >
        <FaArrowLeft className="mr-2" />
        {translate('backToPatients')}
      </button>
    </div>
  );
};

export default Vitals;
