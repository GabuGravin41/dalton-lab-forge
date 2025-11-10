import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Square, Loader2, Cpu, AlertCircle } from 'lucide-react';
import { YOLOv8Detector, Detection } from '@/utils/yolo';
import { Slider } from '@/components/ui/slider';

const ObjectDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<YOLOv8Detector | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [allDetectedObjects, setAllDetectedObjects] = useState<Map<string, { count: number; lastSeen: number; confidence: number }>>(new Map());
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const latestDetectionsRef = useRef<Detection[]>([]);

  // Initialize detector
  useEffect(() => {
    const det = new YOLOv8Detector();
    setDetector(det);
    
    return () => {
      det.dispose();
    };
  }, []);

  // Load model
  const loadModel = async () => {
    if (!detector) return;
    
    setIsModelLoading(true);
    setError(null);
    setIsModelLoaded(false);
    
    try {
      console.log('Loading YOLO model from /models/yolov8n.onnx...');
      await detector.loadModel('/models/yolov8n.onnx');

      // Verify the detector instance reports itself as loaded (defensive check)
      const ready = typeof (detector as any).isLoaded === 'function' ? (detector as any).isLoaded() : true;
      if (ready) {
        console.log('✅ Model loaded successfully!');
        setIsModelLoaded(true);
        setError(null);
      } else {
        console.warn('Model load returned but detector reports not ready.');
        setIsModelLoaded(false);
        setError('Model loaded but session not initialized.');
      }
    } catch (err) {
      console.error('❌ Failed to load model:', err);
      setIsModelLoaded(false);
      setError(
        'Failed to load YOLOv8n model. Please download yolov8n.onnx and place it in the public/models/ folder. ' +
        'Download from: https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx'
      );
    } finally {
      setIsModelLoading(false);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Failed to access camera. Please grant camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setIsDetecting(false);
    setDetections([]);
    latestDetectionsRef.current = [];
    isProcessingRef.current = false;
    frameCountRef.current = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Clear detection history
  const clearDetectionHistory = () => {
    setAllDetectedObjects(new Map());
  };

  // Draw current video frame and detections on canvas
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match video (only if dimensions changed)
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    
    // Always draw the current video frame for live feed
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Overlay detections on top of live video
    const detections = latestDetectionsRef.current;
    detections.forEach((det) => {
      const [x, y, w, h] = det.bbox;
      
      // Generate color based on class index
      const hue = (det.classIndex * 137.5) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      
      // Draw label background
      const label = `${det.class} ${(det.confidence * 100).toFixed(1)}%`;
      ctx.font = '16px Arial';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 7);
    });
  }, []);

  // Main detection and rendering loop
  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!isDetecting || !detector || !isModelLoaded) {
      return;
    }

    // Extra safety: ensure the detector instance actually has a loaded ONNX session
    if (detector && typeof (detector as any).isLoaded === 'function' && !(detector as any).isLoaded()) {
      console.warn('Detector exists but model session not ready. Skipping this detection cycle.');
      return;
    }
    
    // Continue loop
    animationFrameRef.current = requestAnimationFrame(detectLoop);
    
    // Check if video is ready
    if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Always draw the latest detections on every frame
    const currentDetections = latestDetectionsRef.current;
    currentDetections.forEach((det) => {
      const [x, y, w, h] = det.bbox;
      
      // Generate color based on class index
      const hue = (det.classIndex * 137.5) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      
      // Draw label background
      const label = `${det.class} ${(det.confidence * 100).toFixed(1)}%`;
      ctx.font = '16px Arial';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 7);
    });
    
    // Run detection every 6th frame
    frameCountRef.current++;
    const shouldRunDetection = frameCountRef.current % 6 === 0;
    
    if (shouldRunDetection && !isProcessingRef.current) {
      isProcessingRef.current = true;
      
      // Run detection asynchronously
      (async () => {
        try {
          // Create temporary canvas for model input
          if (!tempCanvasRef.current) {
            tempCanvasRef.current = document.createElement('canvas');
            tempCanvasRef.current.width = 640;
            tempCanvasRef.current.height = 640;
          }
          
          const tempCanvas = tempCanvasRef.current;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            // Draw and resize video frame to model input size
            tempCtx.drawImage(video, 0, 0, 640, 640);
            const imageData = tempCtx.getImageData(0, 0, 640, 640);
            
            // Run detection (ensure the detector actually has a loaded session)
            if (typeof (detector as any).isLoaded === 'function' && !(detector as any).isLoaded()) {
              console.warn('Skipping detect(): model not loaded on detector instance.');
            } else {
              const dets = await detector.detect(imageData, confidenceThreshold);

              // Scale detections back to display size
              const scaleX = video.videoWidth / 640;
              const scaleY = video.videoHeight / 640;
              const scaledDets = dets.map(det => ({
                ...det,
                bbox: [
                  det.bbox[0] * scaleX,
                  det.bbox[1] * scaleY,
                  det.bbox[2] * scaleX,
                  det.bbox[3] * scaleY
                ]
              }));

              // Update detections
              latestDetectionsRef.current = scaledDets;
              setDetections(scaledDets);

              // Update detection history
              setAllDetectedObjects(prev => {
                const updated = new Map(prev);
                scaledDets.forEach(det => {
                  const existing = updated.get(det.class);
                  if (existing) {
                    updated.set(det.class, {
                      count: existing.count + 1,
                      lastSeen: Date.now(),
                      confidence: Math.max(existing.confidence, det.confidence)
                    });
                  } else {
                    updated.set(det.class, {
                      count: 1,
                      lastSeen: Date.now(),
                      confidence: det.confidence
                    });
                  }
                });
                return updated;
              });

              // Calculate FPS
              const now = Date.now();
              const delta = now - lastTimeRef.current;
              if (delta > 0) {
                setFps(Math.round(1000 / delta));
              }
              lastTimeRef.current = now;
            }
          }
        } catch (err) {
          console.error('Detection error:', err);
        } finally {
          isProcessingRef.current = false;
        }
      })();
    }
  }, [isDetecting, detector, isModelLoaded, confidenceThreshold]);

  // Start/stop detection loop
  useEffect(() => {
    if (isDetecting && isModelLoaded) {
      console.log('Starting detection loop...');
      detectLoop();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, isModelLoaded, detectLoop]);
  
  // Clear detections when stopping detection
  useEffect(() => {
    if (!isDetecting) {
      latestDetectionsRef.current = [];
      setDetections([]);
    }
  }, [isDetecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Camera/Canvas Display */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Object Detection
          </CardTitle>
          <CardDescription>
            Real-time object detection using YOLOv8n - the lightest YOLO model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive flex-1">
                {error}
              </div>
            </div>
          )}

          {/* Video/Canvas Display */}
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: isDetecting ? 'block' : 'none' }}
            />
            
            {/* FPS Counter */}
            {isDetecting && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-mono">
                {fps} FPS
              </div>
            )}
            
            {/* Placeholder */}
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Camera not active</p>
                </div>
              </div>
            )}
          </div>

          {/* Confidence Threshold Slider */}
          {isModelLoaded && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%
              </label>
              <Slider
                value={[confidenceThreshold]}
                onValueChange={(values) => setConfidenceThreshold(values[0])}
                min={0.1}
                max={0.9}
                step={0.05}
                className="w-full"
              />
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isModelLoaded ? (
              <Button
                onClick={loadModel}
                disabled={isModelLoading}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
              >
                {isModelLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Model...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 mr-2" />
                    Load YOLOv8n Model
                  </>
                )}
              </Button>
            ) : (
              <>
                {!isCameraActive ? (
                  <Button
                    onClick={startCamera}
                    className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        if (isDetecting) {
                          // Clear detections when stopping
                          setDetections([]);
                          latestDetectionsRef.current = [];
                        }
                        setIsDetecting(!isDetecting);
                      }}
                      className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      {isDetecting ? 'Stop Detection' : 'Start Detection'}
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="destructive"
                      className="flex-1"
                    >
                      Stop Camera
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detection Results */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detected Objects</CardTitle>
              <CardDescription>
                {detections.length} in frame • {allDetectedObjects.size} unique total
              </CardDescription>
            </div>
            {allDetectedObjects.size > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearDetectionHistory}
                className="text-xs"
              >
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Current frame detections */}
          {detections.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-primary">Currently in Frame</h4>
              <div className="space-y-1">
                {detections.map((det, idx) => {
                  const hue = (det.classIndex * 137.5) % 360;
                  const color = `hsl(${hue}, 70%, 50%)`;
                  
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium capitalize">{det.class}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(det.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* All detected objects history */}
          {allDetectedObjects.size > 0 ? (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">All Objects Detected</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from(allDetectedObjects.entries())
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([className, data]) => {
                    const isCurrentlyVisible = detections.some(d => d.class === className);
                    
                    return (
                      <div
                        key={className}
                        className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                          isCurrentlyVisible 
                            ? 'bg-accent/20 border-accent/40' 
                            : 'bg-card/50 border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {isCurrentlyVisible ? '👁️' : '✓'}
                          </span>
                          <div>
                            <span className="font-medium capitalize block">{className}</span>
                            <span className="text-xs text-muted-foreground">
                              Seen {data.count} time{data.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {(data.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              {isDetecting ? (
                <div>
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin opacity-50" />
                  <p>Looking for objects...</p>
                </div>
              ) : (
                <div>
                  <Square className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start detection to see objects</p>
                </div>
              )}
            </div>
          )}
          
          {/* Model Info */}
          {isModelLoaded && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="font-semibold mb-2">Model Information</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>• Model: YOLOv8n (Nano)</p>
                <p>• Input Size: 640x640</p>
                <p>• Classes: 80 (COCO dataset)</p>
                <p>• Backend: ONNX Runtime Web</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ObjectDetection;
