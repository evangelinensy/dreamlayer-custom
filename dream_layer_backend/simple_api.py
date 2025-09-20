#!/usr/bin/env python3
"""
Simple DreamLayer API - Minimal version for deployment
This version provides basic API endpoints without ComfyUI dependency
"""

import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

# Basic configuration
API_PORT = int(os.environ.get('PORT', 5002))

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get available models"""
    try:
        # Return basic models for now
        models = [
            {
                "filename": "stable-diffusion-v1-5.safetensors",
                "id": "stable-diffusion-v1-5",
                "name": "Stable Diffusion v1.5"
            }
        ]
        
        return jsonify({
            "status": "success",
            "models": models
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/txt2img', methods=['POST'])
def txt2img():
    """Text to image generation endpoint"""
    try:
        data = request.get_json()
        
        # For now, return a placeholder response
        # In a real implementation, this would call your image generation service
        return jsonify({
            "status": "success",
            "message": "Image generation endpoint is ready",
            "data": {
                "prompt": data.get('prompt', ''),
                "model": data.get('model_name', 'stable-diffusion-v1-5'),
                "note": "This is a placeholder response. Connect to your actual image generation service."
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "dreamlayer-backend",
        "version": "1.0.0"
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "message": "DreamLayer API is running!",
        "endpoints": {
            "models": "/api/models",
            "txt2img": "/api/txt2img",
            "health": "/health"
        }
    })

if __name__ == '__main__':
    print(f"Starting DreamLayer Simple API on port {API_PORT}")
    print("Available endpoints:")
    print("  GET  / - Root endpoint")
    print("  GET  /api/models - Get available models")
    print("  POST /api/txt2img - Text to image generation")
    print("  GET  /health - Health check")
    
    app.run(host='0.0.0.0', port=API_PORT, debug=False)
