# YOLOv8n Model Setup

This folder should contain the YOLOv8n ONNX model for object detection.

## Quick Setup

### Option 1: Download Pre-converted ONNX Model (Recommended)

Download the pre-converted YOLOv8n ONNX model:

```bash
# Using wget (Linux/Mac)
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx -O yolov8n.onnx

# Using curl (Linux/Mac)
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx -o yolov8n.onnx

# Using PowerShell (Windows)
Invoke-WebRequest -Uri "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx" -OutFile "yolov8n.onnx"
```

Or manually download from: https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx

**Place the downloaded `yolov8n.onnx` file in this directory (`public/models/`).**

### Option 2: Convert from PyTorch (Advanced)

If you prefer to convert the model yourself:

1. Install Ultralytics:
   ```bash
   pip install ultralytics
   ```

2. Convert the model:
   ```python
   from ultralytics import YOLO

   # Load the YOLOv8n model
   model = YOLO('yolov8n.pt')

   # Export to ONNX format
   model.export(format='onnx', dynamic=False, simplify=True)
   ```

3. Move the generated `yolov8n.onnx` to this directory.

## Model Details

- **Model**: YOLOv8n (Nano) - The lightest and fastest YOLO v8 variant
- **Input Size**: 640x640 pixels
- **Classes**: 80 object classes from COCO dataset
- **Format**: ONNX (Open Neural Network Exchange)
- **File Size**: ~6 MB
- **Inference Speed**: 30-60 FPS on modern browsers (WebGL backend)

## Supported Classes (COCO Dataset)

The model can detect 80 different object classes including:
- **People**: person
- **Vehicles**: bicycle, car, motorcycle, airplane, bus, train, truck, boat
- **Animals**: bird, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe
- **Objects**: backpack, umbrella, handbag, tie, suitcase, bottle, cup, fork, knife, spoon, bowl
- **Food**: banana, apple, sandwich, orange, broccoli, carrot, hot dog, pizza, donut, cake
- **Furniture**: chair, couch, potted plant, bed, dining table, toilet
- **Electronics**: tv, laptop, mouse, remote, keyboard, cell phone
- **And more...**

## Troubleshooting

### Model not loading?

1. **Check file location**: Ensure `yolov8n.onnx` is in `public/models/` directory
2. **Check file size**: The model should be around 6 MB
3. **Check browser console**: Look for error messages
4. **Try a different browser**: WebGL support varies by browser
5. **Clear cache**: Sometimes cached files can be corrupted

### Slow inference?

1. **Check GPU acceleration**: The model uses WebGL when available
2. **Close other tabs**: Browser resources are shared
3. **Reduce confidence threshold**: Lower threshold = fewer detections processed
4. **Check video resolution**: Lower camera resolution improves performance

### Camera not working?

1. **Grant permissions**: Allow camera access in browser
2. **Check if camera is in use**: Close other apps using the camera
3. **Try different browser**: Camera API support varies
4. **Check HTTPS**: Camera API requires secure context (HTTPS or localhost)

## Performance Tips

- **WebGL Backend**: Automatically selected for best performance
- **WASM Fallback**: Used if WebGL is unavailable (slower)
- **Optimize Settings**: Adjust confidence threshold for speed/accuracy trade-off
- **Modern Browser**: Chrome, Edge, or Firefox recommended

## Security Note

The model runs entirely in your browser. No video or image data is sent to any server. Everything is processed locally on your device.
