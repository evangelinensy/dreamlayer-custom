// Spotify Playlist Analyzer
// Extracts playlist info and analyzes mood/sentiment

export interface PlaylistInfo {
  name: string;
  description?: string;
  tracks: TrackInfo[];
  mood: string;
  genres: string[];
}

export interface TrackInfo {
  name: string;
  artists: string[];
  album: string;
}

export interface MoodAnalysis {
  primaryMood: string;
  confidence: number;
  keywords: string[];
  colorPalette: string[];
}

class SpotifyAnalyzer {
  private moodKeywords = {
    happy: ['happy', 'joy', 'celebration', 'party', 'dance', 'upbeat', 'energetic', 'sunshine', 'smile'],
    sad: ['sad', 'lonely', 'heartbreak', 'tears', 'crying', 'depression', 'blue', 'melancholy', 'hurt'],
    energetic: ['energy', 'power', 'strong', 'intense', 'fire', 'electric', 'thunder', 'storm', 'wild'],
    calm: ['calm', 'peaceful', 'quiet', 'gentle', 'soft', 'serene', 'zen', 'meditation', 'tranquil'],
    romantic: ['love', 'romance', 'heart', 'kiss', 'sweet', 'passion', 'darling', 'honey', 'forever'],
    dark: ['dark', 'shadow', 'night', 'black', 'gothic', 'evil', 'sinister', 'creepy', 'haunted'],
    nostalgic: ['memory', 'yesterday', 'old', 'vintage', 'retro', 'past', 'remember', 'childhood', 'golden'],
    rebellious: ['rebel', 'fight', 'anger', 'rage', 'against', 'system', 'freedom', 'revolution', 'protest']
  };

  private colorMappings = {
    happy: ['bright yellow', 'orange', 'pink', 'vibrant colors'],
    sad: ['monochrome', 'black and white', 'blue tones', 'muted colors'],
    energetic: ['red', 'orange', 'bright colors', 'electric blue'],
    calm: ['soft blues', 'green tones', 'pastel colors', 'light colors'],
    romantic: ['pink', 'red', 'warm tones', 'rose colors'],
    dark: ['black', 'dark purple', 'deep red', 'shadow colors'],
    nostalgic: ['sepia', 'warm browns', 'golden tones', 'vintage colors'],
    rebellious: ['red', 'black', 'contrasting colors', 'bold colors']
  };

  /**
   * Parse Spotify playlist URL to extract playlist ID
   */
  parseSpotifyURL(url: string): string | null {
    const patterns = [
      /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
      /spotify\.com\/user\/[^\/]+\/playlist\/([a-zA-Z0-9]+)/,
      /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Mock function to simulate Spotify API call
   * In production, you'd use the actual Spotify Web API
   */
  async fetchPlaylistInfo(playlistId: string): Promise<PlaylistInfo> {
    // This is a mock - in production you'd call Spotify API
    // For now, we'll return sample data based on common playlist names
    
    const mockPlaylists: Record<string, PlaylistInfo> = {
      'sample1': {
        name: 'Chill Vibes',
        description: 'Relaxing music for peaceful moments',
        tracks: [
          { name: 'Sunset Dreams', artists: ['Chill Artist'], album: 'Peaceful' },
          { name: 'Ocean Waves', artists: ['Nature Sounds'], album: 'Serenity' },
          { name: 'Gentle Rain', artists: ['Ambient'], album: 'Calm' }
        ],
        mood: 'calm',
        genres: ['ambient', 'chill', 'instrumental']
      },
      'sample2': {
        name: 'Party Hits',
        description: 'High energy tracks for dancing',
        tracks: [
          { name: 'Dance All Night', artists: ['Party DJ'], album: 'Energy' },
          { name: 'Electric Storm', artists: ['Energetic Band'], album: 'Power' },
          { name: 'Fire Dance', artists: ['Hot Music'], album: 'Intense' }
        ],
        mood: 'energetic',
        genres: ['electronic', 'dance', 'pop']
      }
    };

    // Return mock data or random sample
    const playlistKeys = Object.keys(mockPlaylists);
    const randomKey = playlistKeys[Math.floor(Math.random() * playlistKeys.length)];
    return mockPlaylists[randomKey];
  }

  /**
   * Analyze mood from playlist information
   */
  analyzeMood(playlist: PlaylistInfo): MoodAnalysis {
    const allText = [
      playlist.name,
      playlist.description || '',
      ...playlist.tracks.flatMap(track => [
        track.name,
        ...track.artists,
        track.album
      ])
    ].join(' ').toLowerCase();

    const moodScores: Record<string, number> = {};

    // Score each mood based on keyword matches
    Object.entries(this.moodKeywords).forEach(([mood, keywords]) => {
      moodScores[mood] = keywords.reduce((score, keyword) => {
        const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
        return score + matches;
      }, 0);
    });

    // Find the mood with highest score
    const primaryMood = Object.entries(moodScores).reduce((a, b) => 
      moodScores[a[0]] > moodScores[b[0]] ? a : b
    )[0];

    const totalScore = Object.values(moodScores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? moodScores[primaryMood] / totalScore : 0.5;

    // Extract keywords that influenced the mood
    const keywords = this.moodKeywords[primaryMood as keyof typeof this.moodKeywords]
      .filter(keyword => allText.includes(keyword));

    return {
      primaryMood,
      confidence,
      keywords,
      colorPalette: this.colorMappings[primaryMood as keyof typeof this.colorMappings] || ['neutral colors']
    };
  }

  /**
   * Generate prompt variance based on mood analysis
   */
  generatePromptVariance(moodAnalysis: MoodAnalysis): string {
    const { primaryMood, colorPalette, keywords } = moodAnalysis;
    
    const varianceComponents = [
      ...colorPalette,
      ...keywords.slice(0, 2), // Use top 2 keywords
      primaryMood
    ];

    return varianceComponents.join(', ');
  }

  /**
   * Main function to analyze a Spotify playlist URL
   */
  async analyzePlaylist(url: string): Promise<{
    playlist: PlaylistInfo;
    moodAnalysis: MoodAnalysis;
    promptVariance: string;
  }> {
    const playlistId = this.parseSpotifyURL(url);
    
    if (!playlistId) {
      throw new Error('Invalid Spotify playlist URL');
    }

    const playlist = await this.fetchPlaylistInfo(playlistId);
    const moodAnalysis = this.analyzeMood(playlist);
    const promptVariance = this.generatePromptVariance(moodAnalysis);

    return {
      playlist,
      moodAnalysis,
      promptVariance
    };
  }
}

export default new SpotifyAnalyzer();
