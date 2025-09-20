# DreamLayer AI - App Integration Examples

## 🚀 Quick API Test

First, test that the API is working:
```bash
curl -X POST http://localhost:5001/api/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a cute cat",
    "checkpoint": "stable-diffusion-v1-5.safetensors",
    "steps": 20,
    "cfg": 7.0,
    "width": 512,
    "height": 512,
    "batch_size": 1
  }'
```

## 📱 JavaScript/React Integration

### Simple React Hook
```javascript
// useDreamLayer.js
import { useState } from 'react';

export const useDreamLayer = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  const generateImage = async (prompt, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5001/api/txt2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          checkpoint: 'stable-diffusion-v1-5.safetensors',
          steps: 20,
          cfg: 7.0,
          width: 512,
          height: 512,
          batch_size: 1,
          ...options
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setImages(result.generated_images || []);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateImage, loading, images, error };
};

// ImageGenerator.jsx
import React, { useState } from 'react';
import { useDreamLayer } from './useDreamLayer';

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const { generateImage, loading, images, error } = useDreamLayer();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    try {
      await generateImage(prompt);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        disabled={loading}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
      
      <div>
        {images.map((img, index) => (
          <img 
            key={index}
            src={`http://localhost:5001/api/images/${img.filename}`}
            alt={`Generated ${index + 1}`}
            style={{maxWidth: '512px', margin: '10px'}}
          />
        ))}
      </div>
    </div>
  );
};
```

## 🐍 Python Integration

### Simple Python Client
```python
# dreamlayer_client.py
import requests
import json
import time
from typing import Dict, List, Optional

class DreamLayerClient:
    def __init__(self, base_url: str = "http://localhost"):
        self.txt2img_url = f"{base_url}:5001/api/txt2img"
        self.img2img_url = f"{base_url}:5004/api/img2img"
        self.models_url = f"{base_url}:5002/api/models"
        self.images_url = f"{base_url}:5001/api/images"
    
    def get_models(self) -> List[Dict]:
        """Get available models"""
        response = requests.get(self.models_url)
        if response.status_code == 200:
            return response.json()['models']
        return []
    
    def generate_image(self, prompt: str, **kwargs) -> Dict:
        """Generate image from text prompt"""
        payload = {
            'prompt': prompt,
            'checkpoint': 'stable-diffusion-v1-5.safetensors',
            'steps': 20,
            'cfg': 7.0,
            'width': 512,
            'height': 512,
            'batch_size': 1,
            **kwargs
        }
        
        response = requests.post(self.txt2img_url, json=payload)
        return response.json()
    
    def transform_image(self, image_path: str, prompt: str, **kwargs) -> Dict:
        """Transform existing image with prompt"""
        import base64
        
        # Read and encode image
        with open(image_path, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode()
        
        payload = {
            'prompt': prompt,
            'input_image': img_data,
            'denoising_strength': 0.6,
            'checkpoint': 'stable-diffusion-v1-5.safetensors',
            **kwargs
        }
        
        response = requests.post(self.img2img_url, json=payload)
        return response.json()
    
    def download_image(self, filename: str, save_path: str):
        """Download generated image"""
        response = requests.get(f"{self.images_url}/{filename}")
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        return False

# Example usage
if __name__ == "__main__":
    client = DreamLayerClient()
    
    # Generate an image
    result = client.generate_image("a beautiful sunset over mountains")
    
    if result['status'] == 'success':
        images = result.get('generated_images', [])
        for i, img in enumerate(images):
            filename = img['filename']
            client.download_image(filename, f"generated_{i}.png")
            print(f"Downloaded: generated_{i}.png")
    else:
        print(f"Error: {result.get('message')}")
```

## 🌐 Node.js/Express Integration

### Express Middleware
```javascript
// dreamlayer-middleware.js
const axios = require('axios');
const FormData = require('form-data');

class DreamLayerAPI {
  constructor(baseUrl = 'http://localhost') {
    this.baseUrl = baseUrl;
  }

  async generateImage(prompt, options = {}) {
    const payload = {
      prompt,
      checkpoint: 'stable-diffusion-v1-5.safetensors',
      steps: 20,
      cfg: 7.0,
      width: 512,
      height: 512,
      batch_size: 1,
      ...options
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}:5001/api/txt2img`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(`DreamLayer API error: ${error.message}`);
    }
  }

  async getModels() {
    try {
      const response = await axios.get(`${this.baseUrl}:5002/api/models`);
      return response.data.models;
    } catch (error) {
      throw new Error(`Failed to fetch models: ${error.message}`);
    }
  }

  getImageUrl(filename) {
    return `${this.baseUrl}:5001/api/images/${filename}`;
  }
}

// Express route example
const express = require('express');
const app = express();
const dreamLayer = new DreamLayerAPI();

app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, ...options } = req.body;
    const result = await dreamLayer.generateImage(prompt, options);
    
    // Add full image URLs
    if (result.generated_images) {
      result.generated_images = result.generated_images.map(img => ({
        ...img,
        url: dreamLayer.getImageUrl(img.filename)
      }));
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const models = await dreamLayer.getModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('App server running on port 3000');
  console.log('DreamLayer integration ready!');
});
```

## 📱 Swift/iOS Integration

### iOS Client
```swift
// DreamLayerClient.swift
import Foundation

struct GenerationRequest: Codable {
    let prompt: String
    let checkpoint: String
    let steps: Int
    let cfg: Double
    let width: Int
    let height: Int
    let batch_size: Int
}

struct GenerationResponse: Codable {
    let status: String
    let message: String?
    let generated_images: [GeneratedImage]?
}

struct GeneratedImage: Codable {
    let filename: String
    let url: String?
}

class DreamLayerClient {
    private let baseURL = "http://localhost"
    
    func generateImage(prompt: String, completion: @escaping (Result<GenerationResponse, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL):5001/api/txt2img") else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        let request = GenerationRequest(
            prompt: prompt,
            checkpoint: "stable-diffusion-v1-5.safetensors",
            steps: 20,
            cfg: 7.0,
            width: 512,
            height: 512,
            batch_size: 1
        )
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            urlRequest.httpBody = try JSONEncoder().encode(request)
        } catch {
            completion(.failure(error))
            return
        }
        
        URLSession.shared.dataTask(with: urlRequest) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: 0)))
                return
            }
            
            do {
                let result = try JSONDecoder().decode(GenerationResponse.self, from: data)
                completion(.success(result))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getImageURL(filename: String) -> String {
        return "\(baseURL):5001/api/images/\(filename)"
    }
}
```

## 🔧 Advanced Usage Examples

### Batch Generation with Queue
```javascript
// batch-generator.js
class BatchImageGenerator {
  constructor(concurrency = 2) {
    this.queue = [];
    this.running = 0;
    this.concurrency = concurrency;
  }

  async generateBatch(prompts, options = {}) {
    const promises = prompts.map(prompt => 
      this.enqueue(() => this.generateSingle(prompt, options))
    );
    
    return Promise.all(promises);
  }

  async enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }

  async generateSingle(prompt, options) {
    const response = await fetch('http://localhost:5001/api/txt2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        checkpoint: 'stable-diffusion-v1-5.safetensors',
        ...options
      })
    });
    
    return response.json();
  }
}

// Usage
const generator = new BatchImageGenerator(2);
const prompts = [
  "a red car",
  "a blue house", 
  "a green tree"
];

generator.generateBatch(prompts).then(results => {
  console.log('All images generated:', results);
});
```

## 🛠️ Integration Tips

### 1. **Error Handling**
Always check the `status` field in responses:
```javascript
if (result.status === 'success') {
  // Handle success
} else {
  // Handle error: result.message
}
```

### 2. **Image URLs**
Generated images are served at:
```
http://localhost:5001/api/images/{filename}
```

### 3. **Model Selection**
Get available models first:
```javascript
const models = await fetch('http://localhost:5002/api/models').then(r => r.json());
```

### 4. **Performance**
- Use appropriate batch sizes
- Consider image dimensions (512x512 is fastest)
- Cache generated images locally

---

## 🚀 Ready to Integrate!

Your DreamLayer AI backend is ready to power any application with AI image generation. Simply send HTTP requests to the endpoints and handle the JSON responses! 