// DreamLayer API Service
// Communicates with your local DreamLayer AI backend

export interface GenerationRequest {
  prompt: string;
  negative_prompt?: string;
  checkpoint?: string;
  steps?: number;
  cfg?: number;
  width?: number;
  height?: number;
  batch_size?: number;
}

export interface GeneratedImage {
  filename: string;
  url?: string;
}

export interface GenerationResponse {
  status: string;
  message?: string;
  generated_images?: GeneratedImage[];
  error?: string;
}

export interface Model {
  filename: string;
  id: string;
  name: string;
}

export interface ModelsResponse {
  status: string;
  models: Model[];
}

class DreamLayerAPI {
  private baseURL: string;
  private txt2imgURL: string;
  private modelsURL: string;
  private imagesURL: string;

  constructor(baseURL: string = 'http://localhost') {
    this.baseURL = baseURL;
    this.txt2imgURL = `${baseURL}:5001/api/txt2img`;
    this.modelsURL = `${baseURL}:5002/api/models`;
    this.imagesURL = `${baseURL}:5001/api/images`;
  }

  /**
   * Get available models from DreamLayer
   */
  async getModels(): Promise<Model[]> {
    try {
      const response = await fetch(this.modelsURL);
      const data: ModelsResponse = await response.json();
      
      if (data.status === 'success') {
        return data.models;
      } else {
        throw new Error('Failed to fetch models');
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  /**
   * Generate image from text prompt
   */
  async generateImage(request: GenerationRequest): Promise<GenerationResponse> {
    const payload = {
      prompt: request.prompt,
      negative_prompt: request.negative_prompt || 'blurry, low quality, bad anatomy',
      checkpoint: request.checkpoint || 'stable-diffusion-v1-5.safetensors',
      steps: request.steps || 20,
      cfg: request.cfg || 7.0,
      width: request.width || 300,
      height: request.height || 300,
      batch_size: request.batch_size || 1,
    };

    try {
      const response = await fetch(this.txt2imgURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: GenerationResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Get full URL for a generated image
   */
  getImageURL(filename: string): string {
    return `${this.imagesURL}/${filename}`;
  }

  /**
   * Download image as blob
   */
  async downloadImage(filename: string): Promise<Blob> {
    try {
      const response = await fetch(this.getImageURL(filename));
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Generate Spotify playlist cover with specific parameters
   */
  async generatePlaylistCover(
    style: 'gradients' | 'abstract' | 'nature',
    mood: string,
    playlistName?: string
  ): Promise<GenerationResponse> {
    const prompts = {
      gradients: `beautiful gradient, ${mood}, artistic, 300x300px, square`,
      abstract: `abstract geometric shapes, ${mood}, modern art, 300x300px, square`,
      nature: `nature landscape, ${mood}, scenic, 300x300px, square`
    };

    const prompt = prompts[style];
    
    if (playlistName) {
      // Add playlist name influence to prompt
      const enhancedPrompt = `${prompt}, inspired by "${playlistName}"`;
      return this.generateImage({ prompt: enhancedPrompt });
    }

    return this.generateImage({ prompt });
  }
}

export default new DreamLayerAPI();
