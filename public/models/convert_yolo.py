"""
Script to download and convert YOLOv8n model to ONNX format
Requirements: pip install ultralytics
"""

import os
from pathlib import Path

def main():
    print("=" * 60)
    print("YOLOv8n ONNX Model Converter")
    print("=" * 60)
    print()
    
    try:
        from ultralytics import YOLO
        print("✅ Ultralytics package found")
    except ImportError:
        print("❌ Ultralytics not installed")
        print()
        print("Please install it first:")
        print("  pip install ultralytics")
        print()
        return
    
    print()
    print("Downloading YOLOv8n model...")
    print("This will download the PyTorch model (~6 MB) and convert to ONNX")
    print()
    
    try:
        # Load the model (will download if not present)
        model = YOLO('yolov8n.pt')
        print("✅ Model downloaded successfully")
        
        print()
        print("Converting to ONNX format...")
        
        # Export to ONNX
        success = model.export(
            format='onnx',
            dynamic=False,      # Fixed input shape for web
            simplify=True,      # Simplify model for better performance
            opset=12            # ONNX opset version
        )
        
        if success:
            # Check if file exists
            if os.path.exists('yolov8n.onnx'):
                file_size = os.path.getsize('yolov8n.onnx') / (1024 * 1024)
                print(f"✅ Conversion successful!")
                print(f"   File: yolov8n.onnx")
                print(f"   Size: {file_size:.2f} MB")
                print()
                print("🎉 Model is ready to use!")
                print()
                print("Next steps:")
                print("  1. Start dev server: npm run dev")
                print("  2. Go to Playground > Object Detection")
                print("  3. Click 'Load YOLOv8n Model'")
                print("  4. Click 'Start Camera' then 'Start Detection'")
                
                # Clean up PyTorch model if user wants
                print()
                response = input("Delete PyTorch model (yolov8n.pt) to save space? (y/n): ")
                if response.lower() == 'y':
                    try:
                        os.remove('yolov8n.pt')
                        print("✅ PyTorch model deleted")
                    except:
                        pass
            else:
                print("❌ ONNX file not found after conversion")
        else:
            print("❌ Conversion failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("Troubleshooting:")
        print("  1. Make sure you have internet connection")
        print("  2. Try: pip install --upgrade ultralytics")
        print("  3. Try: pip install onnx onnxruntime")

if __name__ == "__main__":
    main()
