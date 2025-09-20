#!/bin/bash

# DreamLayer - Free Model Downloader
# Download popular free Stable Diffusion models

echo "🎨 DreamLayer Free Model Downloader"
echo "Choose a model to download:"
echo ""
echo "1. DreamShaper v8 (Versatile, artistic)"
echo "2. Realistic Vision v6 (Photorealistic)"  
echo "3. Anything v3 (Anime/illustration)"
echo "4. SDXL Base (High quality, larger)"
echo "5. Download all basic models"
echo ""
read -p "Enter choice (1-5): " choice

cd ComfyUI/models/checkpoints

case $choice in
  1)
    echo "Downloading DreamShaper v8..."
    curl -L -o "dreamshaper_8.safetensors" "https://civitai.com/api/download/models/128713"
    ;;
  2)
    echo "Downloading Realistic Vision v6..."
    curl -L -o "realisticVision_v6.safetensors" "https://civitai.com/api/download/models/245598"
    ;;
  3)
    echo "Downloading Anything v3..."
    curl -L -o "anything_v3.safetensors" "https://huggingface.co/Linaqruf/anything-v3.0/resolve/main/anything-v3-fp16-pruned.safetensors"
    ;;
  4)
    echo "Downloading SDXL Base..."
    curl -L -o "sdxl_base.safetensors" "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
    ;;
  5)
    echo "Downloading all models... This will take a while!"
    curl -L -o "dreamshaper_8.safetensors" "https://civitai.com/api/download/models/128713" &
    curl -L -o "realisticVision_v6.safetensors" "https://civitai.com/api/download/models/245598" &
    curl -L -o "anything_v3.safetensors" "https://huggingface.co/Linaqruf/anything-v3.0/resolve/main/anything-v3-fp16-pruned.safetensors" &
    wait
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo "✅ Download complete! Restart DreamLayer to see the new model."
echo "🔄 Run: ./start_dream_layer.sh" 