# 🚀 Quick Start: YOLOv8n Object Detection

Your playground now features real-time object detection using YOLOv8n!

## ⚡ Quick Setup (2-3 minutes)

### Step 1: Get the Model

**Recommended Method - Convert from PyTorch (Most Reliable):**

1. Install Ultralytics (one-time setup):
   ```bash
   pip install ultralytics
   ```

2. Run the conversion script:
   ```bash
   cd public/models
   python convert_yolo.py
   ```

This will automatically download YOLOv8n and convert it to ONNX format (~6 MB).

**Alternative - Manual Download:**

If the conversion script doesn't work:
1. Visit: https://github.com/ultralytics/ultralytics/releases
2. Look for model assets or download links
3. Save `yolov8n.onnx` to the `public/models/` directory

**Alternative - Use Online Converter:**
1. Download YOLOv8n.pt from https://github.com/ultralytics/ultralytics
2. Use an online ONNX converter
3. Save the result as `yolov8n.onnx` in `public/models/`

### Step 2: Start the Dev Server

```bash
npm run dev
```

### Step 3: Test It Out

1. Navigate to the Playground page
2. Click on the **"Object Detection"** tab
3. Click **"Load YOLOv8n Model"**
4. Click **"Start Camera"**
5. Click **"Start Detection"**

That's it! 🎉

## 🎯 What Can It Detect?

The model can detect **80 different objects** including:
- 👤 People
- 🚗 Vehicles (cars, bikes, buses, trucks)
- 🐕 Animals (dogs, cats, birds, horses)
- 📱 Electronics (phones, laptops, TVs)
- 🍕 Food (pizza, fruits, vegetables)
- 🪑 Furniture (chairs, tables, beds)
- And much more!

## ⚙️ Features

- ✅ **Real-time detection** - 30-60 FPS on modern browsers
- ✅ **Privacy-focused** - All processing happens in your browser
- ✅ **Lightweight** - Only ~6 MB model size
- ✅ **Adjustable confidence** - Fine-tune detection sensitivity
- ✅ **WebGL accelerated** - Fast inference using GPU
- ✅ **No API costs** - Completely free to use

## 🎨 How to Use

1. **Confidence Threshold**: Adjust the slider to control detection sensitivity
   - Lower values (10-30%): Detect more objects but with more false positives
   - Higher values (50-80%): Only show highly confident detections

2. **Camera Settings**: 
   - Grant camera permissions when prompted
   - Works with webcam or external cameras
   - Automatically adjusts to your camera resolution

3. **Detection Results**:
   - Bounding boxes show detected objects
   - Color-coded by object class
   - Confidence percentage displayed
   - Real-time FPS counter

## 🔧 Troubleshooting

**Model won't load?**
- Verify `yolov8n.onnx` is in `public/models/` folder
- Check browser console for errors
- File should be ~6 MB in size

**Camera not working?**
- Allow camera permissions in browser
- Close other apps using the camera
- Try a different browser (Chrome recommended)

**Slow performance?**
- Close unnecessary browser tabs
- Lower the confidence threshold
- Check if WebGL is enabled in your browser

## 📊 Technical Details

- **Model**: YOLOv8n (Nano variant)
- **Framework**: ONNX Runtime Web
- **Backend**: WebGL (GPU) with WASM fallback
- **Input**: 640x640 pixels
- **Output**: Bounding boxes + class labels + confidence scores
- **Dataset**: COCO (80 classes)

## 🎓 Learn More

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [COCO Dataset Classes](https://cocodataset.org/#explore)

## 🆚 Why YOLOv8n Instead of Veo/Sora?

| Feature | YOLOv8n | Veo/Sora |
|---------|---------|----------|
| **Cost** | Free | Paid API |
| **Privacy** | Local processing | Cloud processing |
| **Speed** | Real-time | Processing time required |
| **Use Case** | Object detection | Video generation |
| **Requirements** | Browser only | API key + credits |

YOLOv8n is perfect for real-time object detection from your camera without any API costs or privacy concerns!

---

**Need help?** Check the browser console for detailed logs and error messages.
