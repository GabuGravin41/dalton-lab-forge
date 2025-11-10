import * as ort from 'onnxruntime-web';

// COCO dataset class names (80 classes that YOLOv8 is trained on)
export const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
  'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
  'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
  'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
  'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant',
  'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
  'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors',
  'teddy bear', 'hair drier', 'toothbrush'
];

export interface Detection {
  bbox: number[]; // [x, y, width, height]
  class: string;
  confidence: number;
  classIndex: number;
}

export class YOLOv8Detector {
  private session: ort.InferenceSession | null = null;
  private modelInputShape: number[] = [1, 3, 640, 640]; // [batch, channels, height, width]
  private inferenceSize: number = 416; // Reduced size for faster inference

  async loadModel(modelPath: string): Promise<void> {
    try {
      console.log('Loading YOLOv8n model from:', modelPath);
      console.log('ONNX Runtime version:', ort.env.versions);
      
      // Try with WASM backend first (more compatible)
      try {
        this.session = await ort.InferenceSession.create(modelPath, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        });
        console.log('YOLOv8n model loaded successfully with WASM backend!');
      } catch (wasmError) {
        console.warn('WASM backend failed, trying WebGL:', wasmError);
        // Fallback to WebGL if WASM fails
        this.session = await ort.InferenceSession.create(modelPath, {
          executionProviders: ['webgl'],
          graphOptimizationLevel: 'all',
        });
        console.log('YOLOv8n model loaded successfully with WebGL backend!');
      }
    } catch (error) {
      console.error('Failed to load YOLO model:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Returns true when the ONNX session has been created and the model is ready for inference.
   */
  public isLoaded(): boolean {
    return this.session !== null;
  }

  /**
   * Preprocess image for YOLO inference
   */
  private preprocessImage(imageData: ImageData): Float32Array {
    const [, , height, width] = this.modelInputShape;
    const { data } = imageData;
    
    // Create Float32Array for model input (CHW format)
    const input = new Float32Array(width * height * 3);
    
    // Normalize and convert from NHWC to NCHW format
    for (let i = 0; i < height * width; i++) {
      input[i] = data[i * 4] / 255.0; // R
      input[height * width + i] = data[i * 4 + 1] / 255.0; // G
      input[height * width * 2 + i] = data[i * 4 + 2] / 255.0; // B
    }
    
    return input;
  }

  /**
   * Non-Maximum Suppression to filter overlapping boxes
   */
  private nms(detections: Detection[], iouThreshold: number = 0.45): Detection[] {
    // Sort by confidence
    detections.sort((a, b) => b.confidence - a.confidence);
    
    const keep: Detection[] = [];
    
    while (detections.length > 0) {
      const current = detections.shift()!;
      keep.push(current);
      
      detections = detections.filter(det => {
        const iou = this.calculateIoU(current.bbox, det.bbox);
        return iou < iouThreshold;
      });
    }
    
    return keep;
  }

  /**
   * Calculate Intersection over Union
   */
  private calculateIoU(box1: number[], box2: number[]): number {
    const [x1, y1, w1, h1] = box1;
    const [x2, y2, w2, h2] = box2;
    
    const x1Max = x1 + w1;
    const y1Max = y1 + h1;
    const x2Max = x2 + w2;
    const y2Max = y2 + h2;
    
    const intersectX = Math.max(0, Math.min(x1Max, x2Max) - Math.max(x1, x2));
    const intersectY = Math.max(0, Math.min(y1Max, y2Max) - Math.max(y1, y2));
    const intersectArea = intersectX * intersectY;
    
    const box1Area = w1 * h1;
    const box2Area = w2 * h2;
    const unionArea = box1Area + box2Area - intersectArea;
    
    return intersectArea / unionArea;
  }

  /**
   * Run inference on image
   */
  async detect(
    imageData: ImageData,
    confidenceThreshold: number = 0.25
  ): Promise<Detection[]> {
    if (!this.session) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const [, , modelHeight, modelWidth] = this.modelInputShape;
    
    // Preprocess image
    const input = this.preprocessImage(imageData);
    
    // Create tensor
    const tensor = new ort.Tensor('float32', input, this.modelInputShape);
    
    // Run inference
    const feeds = { images: tensor };
    const results = await this.session.run(feeds);
    
    // Get output tensor
    const output = results.output0.data as Float32Array;
    const outputShape = results.output0.dims; // [1, 84, 8400]
    
    // Parse detections
    const detections: Detection[] = [];
    const numDetections = outputShape[2]; // 8400 for YOLOv8
    
    for (let i = 0; i < numDetections; i++) {
      // Get bounding box coordinates and dimensions
      const x = output[i];
      const y = output[numDetections + i];
      const w = output[2 * numDetections + i];
      const h = output[3 * numDetections + i];
      
      // Get class scores (starting from index 4)
      let maxScore = 0;
      let maxIndex = 0;
      
      for (let j = 0; j < 80; j++) { // 80 COCO classes
        const score = output[(4 + j) * numDetections + i];
        if (score > maxScore) {
          maxScore = score;
          maxIndex = j;
        }
      }
      
      // Filter by confidence threshold
      if (maxScore > confidenceThreshold) {
        // Scale coordinates back to original image size
        const scaleX = imageData.width / modelWidth;
        const scaleY = imageData.height / modelHeight;
        
        detections.push({
          bbox: [
            (x - w / 2) * scaleX,
            (y - h / 2) * scaleY,
            w * scaleX,
            h * scaleY
          ],
          class: COCO_CLASSES[maxIndex],
          confidence: maxScore,
          classIndex: maxIndex
        });
      }
    }
    
    // Apply NMS
    return this.nms(detections);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.session) {
      this.session = null;
    }
  }
}
