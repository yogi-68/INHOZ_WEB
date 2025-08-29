import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

class CustomYoloDetector {
  constructor(modelPath = '/model_web/model.json', options = {}) {
    this.modelPath = modelPath;
    this.model = null;
    this.isModelLoading = false;
    this.isModelLoaded = false;
    
    // Default options
    this.options = {
      scoreThreshold: 0.5,
      iouThreshold: 0.45,
      maxDetections: 20,
      inputSize: 640,
      ...options
    };
    
    // Define class names from the user's pre-trained model
    this.classNames = [
      'bed',
      'fall',
      'move',
      'patient',
      'person',
      'sit',
      'stand',
      'walker',
      'wheelchair'
    ];
    
    // Color palette for visualization
    this.colors = [
      '#FF3838', '#FF9D97', '#FF701F', '#FFB21D', '#CFD231', '#48F90A',
      '#92CC17', '#3DDB86', '#1A9334', '#00D4BB', '#2C99A8', '#00C2FF',
      '#344593', '#6473FF', '#0018EC', '#8438FF', '#520085', '#CB38FF'
    ];
    
    // Store static positions for simulation objects to keep them stable between frames
    this.simulationState = {
      initialized: false,
      personX: 0,
      personY: 0,
      personWidth: 0,
      personHeight: 0,
      bedX: 0,
      bedY: 0, 
      bedWidth: 0,
      bedHeight: 0,
      fallState: false,
      fallTimer: 0,
      fallDuration: 150, // Frames that a fall persists
      patientState: 'stand', // Current patient state: 'stand', 'sit', 'move'
      stateTimer: 0,
      stateChangeProbability: 0.005, // Probability to change state on each frame
      hasMobilityAid: false,
      mobilityAidType: null
    };
  }
  
  /**
   * Load the YOLO model
   */
  async loadModel() {
    if (this.isModelLoaded) return true;
    if (this.isModelLoading) return false;
    
    this.isModelLoading = true;
    
    try {
      // Set WebGL backend for better performance
      await tf.setBackend('webgl');
      
      console.log('Loading YOLO5n model from:', this.modelPath);
      
      // Determine model path to use
      let modelPathToUse = this.modelPath;
      
      // For model.json (TensorFlow.js format)
      if (this.modelPath.endsWith('.json')) {
        // Use as is
      } 
      // For .pt format (not directly supported - needs conversion)
      else if (this.modelPath.endsWith('.pt')) {
        console.warn('PyTorch model detected. Please convert to TensorFlow.js format first.');
        return false;
      }
      // For .tflite format (not directly supported, needs conversion first)
      else if (this.modelPath.endsWith('.tflite')) {
        console.warn('TFLite model detected. TensorFlow.js cannot directly load TFLite models.');
        console.warn('Attempting to use fallback model at /model_web/model.json');
        
        // Try to fetch the fallback model to check if it exists
        try {
          const response = await fetch('/model_web/model.json');
          if (!response.ok) {
            console.error('Fallback model not found. Simulation mode will be used instead.');
            return false;
          }
        } catch (fetchError) {
          console.error('Could not check for fallback model:', fetchError);
          return false;
        }
        
        modelPathToUse = '/model_web/model.json';
      }
      
      // Load the model with proper error handling
      try {
        this.model = await tf.loadGraphModel(modelPathToUse);
      } catch (modelError) {
        console.error('Failed to load the model:', modelError);
        return false;
      }
      
      // Warm up the model with a dummy tensor
      const dummyInput = tf.zeros([1, this.options.inputSize, this.options.inputSize, 3]);
      
      try {
        const warmupResult = await this.model.executeAsync(dummyInput);
        
        // Clean up resources
        if (Array.isArray(warmupResult)) {
          warmupResult.forEach(tensor => tensor.dispose());
        } else {
          warmupResult.dispose();
        }
      } catch (warmupError) {
        console.error('Error during model warmup:', warmupError);
        // Still consider the model loaded even if warmup fails
      } finally {
        // Always dispose the dummy input
        dummyInput.dispose();
      }
      
      this.isModelLoaded = true;
      this.isModelLoading = false;
      return true;
    } catch (error) {
      console.error('Error loading the model:', error);
      this.isModelLoading = false;
      return false;
    }
  }
  
  /**
   * Preprocess an image or video frame for TFLite model
   */
  preprocess(imageData) {
    return tf.tidy(() => {
      // Convert to tensor
      let tensor = tf.browser.fromPixels(imageData);
      
      // Resize
      tensor = tf.image.resizeBilinear(tensor, [this.options.inputSize, this.options.inputSize]);
      
      // Normalize to [0,1]
      tensor = tensor.div(255.0);
      
      // Add batch dimension [1, height, width, 3]
      tensor = tensor.expandDims(0);
      
      return tensor;
    });
  }
  
  /**
   * Run object detection on an image or video frame
   */
  async detect(imageData) {
    if (!this.isModelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }
    
    // Convert to tensor and preprocess
    const input = this.preprocess(imageData);
    
    try {
      // Run inference with TFLite model
      const outputs = await this.model.executeAsync(input);
      
      // Process results
      const boxes = await this.processOutputs(outputs);
      
      // Clean up tensors
      input.dispose();
      if (Array.isArray(outputs)) {
        outputs.forEach(tensor => tensor.dispose());
      } else {
        outputs.dispose();
      }
      
      return boxes;
    } catch (error) {
      input.dispose();
      console.error('Error during detection:', error);
      throw error;
    }
  }
  
  /**
   * Process the raw model outputs to extract bounding boxes, scores, and class IDs
   */
  async processOutputs(outputs) {
    // Example processing for YOLOv5/v8 like output
    return tf.tidy(() => {
      // For demonstration purposes - adjust based on your model's output format
      let [boxes, scores, classes] = outputs;
      
      // Get data from tensors
      const boxesData = boxes.arraySync()[0];
      const scoresData = scores.arraySync()[0];
      const classesData = classes.arraySync()[0];
      
      // Filter by score threshold
      const detections = [];
      
      for (let i = 0; i < scoresData.length; i++) {
        if (scoresData[i] > this.options.scoreThreshold) {
          const bbox = boxesData[i];
          const classId = Math.floor(classesData[i]);
          const className = this.classNames[classId] || `class_${classId}`;
          const color = this.colors[classId % this.colors.length];
          
          detections.push({
            bbox: bbox,
            score: scoresData[i],
            class: className,
            classId: classId,
            color: color
          });
        }
      }
      
      return detections.slice(0, this.options.maxDetections);
    });
  }
  
  /**
   * Draw bounding boxes on a canvas
   */
  drawBoxes(canvas, detections) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Draw box
      ctx.strokeStyle = detection.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      ctx.fillStyle = detection.color;
      const text = `${detection.class} ${Math.round(detection.score * 100)}%`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(x, y - 20, textWidth + 10, 20);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText(text, x + 5, y - 5);
    });
  }
  
  /**
   * Simulate detections for testing when the model is not available or camera access fails
   * This is useful for development/testing without the actual model or camera
   */
  simulateDetections(imageData) {
    // Set default dimensions if imageData is not available (e.g., camera access failed)
    const width = (imageData && imageData.width) ? imageData.width : 640;
    const height = (imageData && imageData.height) ? imageData.height : 480;
    
    // Initialize simulation state if not already done
    if (!this.simulationState.initialized) {
      // Person position and size - initialize once for stability
      this.simulationState.personWidth = Math.floor(width / 5) + 100;
      this.simulationState.personHeight = Math.floor(height / 3) + 140;
      this.simulationState.personX = Math.floor(width / 2 - this.simulationState.personWidth / 2);
      this.simulationState.personY = Math.floor(height / 2 - this.simulationState.personHeight / 2);
      
      // Bed position and size - alongside the person
      this.simulationState.bedWidth = this.simulationState.personWidth * 2;
      this.simulationState.bedHeight = this.simulationState.personHeight * 0.7;
      this.simulationState.bedX = Math.max(0, this.simulationState.personX - this.simulationState.bedWidth / 4);
      this.simulationState.bedY = Math.min(height - this.simulationState.bedHeight, 
                               this.simulationState.personY + this.simulationState.personHeight - this.simulationState.bedHeight / 2);
      
      // Decide on mobility aid if any
      this.simulationState.hasMobilityAid = Math.random() < 0.3;
      this.simulationState.mobilityAidType = Math.random() < 0.5 ? 'wheelchair' : 'walker';
      
      this.simulationState.initialized = true;
    }
    
    // Possibly change patient state occasionally (stand, sit, move)
    if (Math.random() < this.simulationState.stateChangeProbability && !this.simulationState.fallState) {
      const states = ['stand', 'sit', 'move'];
      // Don't select the current state
      const availableStates = states.filter(s => s !== this.simulationState.patientState);
      this.simulationState.patientState = availableStates[Math.floor(Math.random() * availableStates.length)];
      this.simulationState.stateTimer = 0;
    } else {
      this.simulationState.stateTimer++;
    }
    
    // Determine if a fall should start (if not already falling)
    if (!this.simulationState.fallState && Math.random() < 0.001) { // Much rarer fall event (0.1% chance per frame)
      this.simulationState.fallState = true;
      this.simulationState.fallTimer = 0;
    }
    
    // Update fall timer if falling
    if (this.simulationState.fallState) {
      this.simulationState.fallTimer++;
      
      // End fall state after duration
      if (this.simulationState.fallTimer > this.simulationState.fallDuration) {
        this.simulationState.fallState = false;
      }
    }
    
    const detections = [];
    
    // Always add a person
    const personClassId = this.classNames.indexOf('person');
    const personColor = this.colors[personClassId % this.colors.length];
    
    // Gently animate the person position to simulate small movements
    // Only if not falling
    if (!this.simulationState.fallState) {
      if (this.simulationState.patientState === 'move') {
        // Larger movement when in 'move' state
        this.simulationState.personX += Math.sin(Date.now() / 500) * 1.5;
        this.simulationState.personY += Math.cos(Date.now() / 700) * 1;
      } else {
        // Subtle movement for other states
        this.simulationState.personX += Math.sin(Date.now() / 1000) * 0.5;
        this.simulationState.personY += Math.cos(Date.now() / 1200) * 0.3;
      }
      
      // Keep person within bounds
      this.simulationState.personX = Math.max(0, Math.min(width - this.simulationState.personWidth, this.simulationState.personX));
      this.simulationState.personY = Math.max(0, Math.min(height - this.simulationState.personHeight, this.simulationState.personY));
    }
    
    detections.push({
      bbox: [
        this.simulationState.personX, 
        this.simulationState.personY, 
        this.simulationState.personWidth, 
        this.simulationState.personHeight
      ],
      score: 0.95,
      class: 'person',
      classId: personClassId,
      color: personColor
    });
    
    // Add bed (stable position)
    const bedClassId = this.classNames.indexOf('bed');
    const bedColor = this.colors[bedClassId % this.colors.length];
    
    detections.push({
      bbox: [
        this.simulationState.bedX, 
        this.simulationState.bedY, 
        this.simulationState.bedWidth, 
        this.simulationState.bedHeight
      ],
      score: 0.9,
      class: 'bed',
      classId: bedClassId,
      color: bedColor
    });
    
    // If in fall state
    if (this.simulationState.fallState) {
      const fallClassId = this.classNames.indexOf('fall');
      const fallColor = this.colors[fallClassId % this.colors.length];
      
      // Fall happens near the person
      const fallX = this.simulationState.personX + this.simulationState.personWidth / 4;
      const fallY = this.simulationState.personY + this.simulationState.personHeight / 2;
      const fallWidth = this.simulationState.personWidth * 0.8;
      const fallHeight = this.simulationState.personHeight * 0.5;
      
      detections.push({
        bbox: [fallX, fallY, fallWidth, fallHeight],
        score: 0.85,
        class: 'fall',
        classId: fallClassId,
        color: fallColor
      });
    } 
    // Otherwise add the current patient state
    else {
      const stateClassId = this.classNames.indexOf(this.simulationState.patientState);
      if (stateClassId !== -1) {
        const stateColor = this.colors[stateClassId % this.colors.length];
        
        // State bounding box overlaps with person
        const stateX = this.simulationState.personX + this.simulationState.personWidth / 4;
        const stateY = this.simulationState.personY + this.simulationState.personHeight / 4;
        const stateWidth = this.simulationState.personWidth * 0.6;
        const stateHeight = this.simulationState.personHeight * 0.6;
        
        detections.push({
          bbox: [stateX, stateY, stateWidth, stateHeight],
          score: 0.8,
          class: this.simulationState.patientState,
          classId: stateClassId,
          color: stateColor
        });
      }
      
      // Add mobility aid if configured
      if (this.simulationState.hasMobilityAid) {
        const mobilityAid = this.simulationState.mobilityAidType;
        const aidClassId = this.classNames.indexOf(mobilityAid);
        
        if (aidClassId !== -1) {
          const aidColor = this.colors[aidClassId % this.colors.length];
          
          // Aid bounding box near person
          const aidX = this.simulationState.personX - this.simulationState.personWidth * 0.3;
          const aidY = this.simulationState.personY + this.simulationState.personHeight * 0.5;
          const aidWidth = this.simulationState.personWidth * 0.7;
          const aidHeight = this.simulationState.personHeight * 0.5;
          
          detections.push({
            bbox: [aidX, aidY, aidWidth, aidHeight],
            score: 0.75,
            class: mobilityAid,
            classId: aidClassId,
            color: aidColor
          });
        }
      }
    }
    
    return detections;
  }
}

export default CustomYoloDetector; 