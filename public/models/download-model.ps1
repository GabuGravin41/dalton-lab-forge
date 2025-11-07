# PowerShell script to download YOLOv8n model
# Run this script from the public/models directory

Write-Host "Downloading YOLOv8n ONNX model..." -ForegroundColor Cyan

# Try multiple sources
$sources = @(
    "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx",
    "https://huggingface.co/Ultralytics/YOLOv8/resolve/main/yolov8n.onnx"
)

$downloaded = $false

foreach ($url in $sources) {
    Write-Host "Trying source: $url" -ForegroundColor Yellow
    
    try {
        # Use .NET WebClient for more reliable downloads
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($url, "yolov8n.onnx")
        
        if (Test-Path "yolov8n.onnx") {
            $fileSize = (Get-Item "yolov8n.onnx").Length / 1MB
            Write-Host "✅ Download successful! File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
            $downloaded = $true
            break
        }
    }
    catch {
        Write-Host "❌ Failed from this source: $_" -ForegroundColor Red
        continue
    }
}

if (-not $downloaded) {
    Write-Host ""
    Write-Host "=== Manual Download Instructions ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Download from browser" -ForegroundColor Cyan
    Write-Host "  1. Open: https://github.com/ultralytics/assets/releases" -ForegroundColor White
    Write-Host "  2. Find and download 'yolov8n.onnx' (should be ~6MB)" -ForegroundColor White
    Write-Host "  3. Move it to this directory: $PWD" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Convert from PyTorch" -ForegroundColor Cyan
    Write-Host "  pip install ultralytics" -ForegroundColor White
    Write-Host "  python -c 'from ultralytics import YOLO; YOLO(\"yolov8n.pt\").export(format=\"onnx\")'" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Try wget (if installed)" -ForegroundColor Cyan
    Write-Host "  wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "🎉 Model ready! You can now:" -ForegroundColor Green
    Write-Host "  1. Start the dev server: npm run dev" -ForegroundColor White
    Write-Host "  2. Go to Playground > Object Detection tab" -ForegroundColor White
    Write-Host "  3. Click 'Load YOLOv8n Model'" -ForegroundColor White
    Write-Host "  4. Click 'Start Camera' and 'Start Detection'" -ForegroundColor White
}
