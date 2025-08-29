import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

// Class labels that the model can detect
const CLASS_NAMES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
  'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
  'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
  'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
  'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
  'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
  'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book',
  'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

// Configuration for the model
const MODEL_CONFIG = {
  modelPath: '/best.pt',
  inputSize: 640,
  scoreThreshold: 0.5,
  iouThreshold: 0.45
};

// Color palette for bounding boxes
const COLORS = [
  '#FF3838', '#FF9D97', '#FF701F', '#FFB21D', '#CFD231', '#48F90A',
  '#92CC17', '#3DDB86', '#1A9334', '#00D4BB', '#2C99A8', '#00C2FF',
  '#344593', '#6473FF', '#0018EC', '#8438FF', '#520085', '#CB38FF',
  '#FF95C8', '#FF37C7'
];

let yoloModel = null;

/**
 * Load the YOLO model
 */
export const loadYoloModel = async () => {
  try {
    // Set the backend to WebGL for better performance
    await tf.setBackend('webgl');
    
    // Load the model
    yoloModel = await tf.loadGraphModel('model_web/model.json');
    
    // Warm up the model
    const dummyInput = tf.zeros([1, MODEL_CONFIG.inputSize, MODEL_CONFIG.inputSize, 3]);
    await yoloModel.executeAsync(dummyInput);
    dummyInput.dispose();
    
    return true;
  } catch (error) {
    console.error('Error loading YOLO model:', error);
    return false;
  }
};

/**
 * Preprocess the image before feeding it to the model
 */
const preprocess = async (imageData) => {
  // Convert to tensor
  const imgTensor = tf.browser.fromPixels(imageData);
  
  // Resize the image to the model's input size
  const resized = tf.image.resizeBilinear(imgTensor, [MODEL_CONFIG.inputSize, MODEL_CONFIG.inputSize]);
  
  // Normalize pixel values to [0, 1]
  const normalized = resized.div(255.0);
  
  // Add batch dimension [1, height, width, 3]
  const batched = normalized.expandDims(0);
  
  imgTensor.dispose();
  resized.dispose();
  normalized.dispose();
  
  return batched;
};

/**
 * Detect objects in an image using the YOLO model
 */
export const detectObjects = async (imageElement) => {
  if (!yoloModel) {
    console.error('Model not loaded');
    return [];
  }
  
  try {
    // Convert image to tensor and preprocess
    const input = await preprocess(imageElement);
    
    // Run inference
    const outputs = await yoloModel.executeAsync(input);
    
    // Process the output to get detection boxes, scores, and classes
    const [boxes, scores, classes] = processOutput(outputs);
    
    // Clean up tensors
    input.dispose();
    outputs.forEach(t => t.dispose());
    
    // Format the results
    const detections = [];
    for (let i = 0; i < boxes.length; i++) {
      if (scores[i] > MODEL_CONFIG.scoreThreshold) {
        const className = CLASS_NAMES[classes[i]];
        const color = COLORS[classes[i] % COLORS.length];
        
        detections.push({
          bbox: boxes[i],
          class: className,
          score: scores[i],
          color: color
        });
      }
    }
    
    return detections;
  } catch (error) {
    console.error('Error during object detection:', error);
    return [];
  }
};

/**
 * Process the raw output from the YOLO model
 */
const processOutput = (outputs) => {
  // This is a simplified processing function
  // The actual processing will depend on the specific YOLO model format
  // For a custom YOLO model, you'll need to adjust this based on the model's output format
  
  // Get the data from tensors
  const [boxes, scores, classes] = outputs;
  
  // Convert to arrays
  const boxesArray = boxes.arraySync()[0];
  const scoresArray = scores.arraySync()[0];
  const classesArray = classes.arraySync()[0];
  
  return [boxesArray, scoresArray, classesArray];
};

/**
 * Draw bounding boxes on a canvas
 */
export const drawDetections = (canvas, detections) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  detections.forEach(detection => {
    const [x, y, width, height] = detection.bbox;
    
    // Draw bounding box
    ctx.strokeStyle = detection.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw background for label
    ctx.fillStyle = detection.color;
    const textWidth = ctx.measureText(`${detection.class} ${Math.round(detection.score * 100)}%`).width;
    ctx.fillRect(x, y - 20, textWidth + 10, 20);
    
    // Draw label
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(
      `${detection.class} ${Math.round(detection.score * 100)}%`,
      x + 5,
      y - 5
    );
  });
};

// Function to convert PyTorch model (.pt) to TensorFlow.js format
// This is a placeholder - conversion typically requires server-side processing
export const convertPtToTfjs = () => {
  console.warn('Model conversion from .pt to TensorFlow.js format needs to be done separately.');
  console.info('Please use tools like ONNX or the TensorFlow.js converter to convert your PyTorch model.');
}; 