import React, { useState } from 'react';
import dreamLayerAPI from '../services/dreamLayerAPI';
import spotifyAnalyzer from '../services/spotifyAnalyzer';
import imageCompositor from '../services/imageCompositor';
import './PlaylistCoverGenerator.css';

interface GenerationState {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  playlistInfo: any | null;
  moodAnalysis: any | null;
}

const PlaylistCoverGenerator: React.FC = () => {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'gradients' | 'abstract' | 'nature'>('gradients');
  const [generationState, setGenerationState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    generatedImage: null,
    playlistInfo: null,
    moodAnalysis: null
  });

  const handleGenerate = async () => {
    if (!spotifyUrl.trim()) {
      setGenerationState(prev => ({ ...prev, error: 'Please enter a Spotify playlist URL' }));
      return;
    }

    setGenerationState({
      isLoading: true,
      error: null,
      generatedImage: null,
      playlistInfo: null,
      moodAnalysis: null
    });

    try {
      // Step 1: Analyze Spotify playlist
      console.log('Analyzing Spotify playlist...');
      const analysis = await spotifyAnalyzer.analyzePlaylist(spotifyUrl);
      
      console.log('Playlist analysis:', analysis);

      // Step 2: Generate image with DreamLayer
      console.log('Generating image with DreamLayer...');
      const generationResult = await dreamLayerAPI.generatePlaylistCover(
        selectedStyle,
        analysis.promptVariance,
        analysis.playlist.name
      );

      if (generationResult.status !== 'success' || !generationResult.generated_images?.length) {
        throw new Error(generationResult.message || 'Failed to generate image');
      }

      const generatedImage = generationResult.generated_images[0];
      const imageUrl = dreamLayerAPI.getImageURL(generatedImage.filename);

      // Step 3: Composite with disc overlay
      console.log('Compositing with disc overlay...');
      const compositeImage = await imageCompositor.compositeDiscCover(imageUrl);

      setGenerationState({
        isLoading: false,
        error: null,
        generatedImage: compositeImage,
        playlistInfo: analysis.playlist,
        moodAnalysis: analysis.moodAnalysis
      });

    } catch (error) {
      console.error('Generation error:', error);
      setGenerationState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    }
  };

  const handleDownload = () => {
    if (generationState.generatedImage) {
      const filename = `${generationState.playlistInfo?.name || 'playlist'}-cover.png`;
      imageCompositor.downloadImage(generationState.generatedImage, filename);
    }
  };

  const styleOptions = [
    { value: 'gradients' as const, label: 'Gradients', description: 'Beautiful color gradients and transitions' },
    { value: 'abstract' as const, label: 'Abstract', description: 'Modern geometric and abstract shapes' },
    { value: 'nature' as const, label: 'Nature', description: 'Natural landscapes and organic forms' }
  ];

  return (
    <div className="playlist-cover-generator">
      <div className="header">
        <h1>🎵 Spotify Playlist Cover Generator</h1>
        <p>Generate unique 300x300px disc covers for your Spotify playlists using AI</p>
      </div>

      <div className="input-section">
        <div className="url-input">
          <label htmlFor="spotify-url">Spotify Playlist URL:</label>
          <input
            id="spotify-url"
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            disabled={generationState.isLoading}
          />
        </div>

        <div className="style-selection">
          <label>Style Template:</label>
          <div className="style-options">
            {styleOptions.map((style) => (
              <div
                key={style.value}
                className={`style-option ${selectedStyle === style.value ? 'selected' : ''}`}
                onClick={() => setSelectedStyle(style.value)}
              >
                <h3>{style.label}</h3>
                <p>{style.description}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={generationState.isLoading}
        >
          {generationState.isLoading ? 'Generating...' : 'Generate Cover'}
        </button>
      </div>

      {generationState.error && (
        <div className="error-message">
          ❌ {generationState.error}
        </div>
      )}

      {generationState.isLoading && (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Analyzing playlist and generating your cover...</p>
        </div>
      )}

      {generationState.generatedImage && (
        <div className="result-section">
          <div className="playlist-info">
            <h3>📊 Analysis Results</h3>
            <div className="info-grid">
              <div>
                <strong>Playlist:</strong> {generationState.playlistInfo?.name}
              </div>
              <div>
                <strong>Mood:</strong> {generationState.moodAnalysis?.primaryMood}
              </div>
              <div>
                <strong>Confidence:</strong> {Math.round((generationState.moodAnalysis?.confidence || 0) * 100)}%
              </div>
              <div>
                <strong>Style:</strong> {selectedStyle}
              </div>
            </div>
          </div>

          <div className="generated-cover">
            <h3>🎨 Your Generated Cover</h3>
            <div className="cover-display">
              <img
                src={generationState.generatedImage}
                alt="Generated playlist cover"
                className="cover-image"
              />
            </div>
            <button className="download-button" onClick={handleDownload}>
              💾 Download Cover
            </button>
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>ℹ️ How it works:</h3>
        <ol>
          <li>Paste your Spotify playlist URL above</li>
          <li>Choose a style template (gradients, abstract, or nature)</li>
          <li>Our AI analyzes your playlist's mood and song titles</li>
          <li>DreamLayer generates a 300x300px image based on the mood</li>
          <li>The image is composited onto a perfect disc shape</li>
          <li>Download your custom playlist cover!</li>
        </ol>
      </div>
    </div>
  );
};

export default PlaylistCoverGenerator;
