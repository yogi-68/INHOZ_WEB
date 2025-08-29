import React, { useRef, useEffect, useState } from 'react';

const CameraTest = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      console.log("Starting camera...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        console.log("Camera started successfully");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError(`Camera error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      console.log("Camera stopped");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Camera Test</h2>
      
      <div className="mb-4">
        <button 
          onClick={startCamera}
          disabled={cameraActive}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-300"
        >
          Start Camera
        </button>
        
        <button 
          onClick={stopCamera}
          disabled={!cameraActive}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Stop Camera
        </button>
      </div>
      
      <div className="relative border rounded-lg overflow-hidden" style={{height: '480px'}}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover" 
        />
        
        {error && (
          <div className="absolute top-0 left-0 w-full bg-red-100 text-red-700 p-4">
            {error}
          </div>
        )}
        
        {!cameraActive && !error && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100">
            <p>Click "Start Camera" to begin</p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="font-bold">Debugging Info:</h3>
        <p>Camera active: {cameraActive ? 'Yes' : 'No'}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>
    </div>
  );
};

export default CameraTest; 