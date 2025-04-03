
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Music, Play } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

const SimonSays: React.FC = () => {
  const colors = ['red', 'green', 'blue', 'yellow'];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([null, null, null, null]);

  const frequencies = [220, 330, 440, 550]; // Frequencies in Hz for different tones

  useEffect(() => {
    // Initialize audio contexts
    audioRefs.current = colors.map((_, index) => {
      const audio = new Audio();
      audio.src = `data:audio/wav;base64,${generateToneBase64(frequencies[index])}`;
      return audio;
    });
    
    // Load high score
    const savedHighScore = localStorage.getItem('simonSaysHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Generate a simple tone in base64 format
  const generateToneBase64 = (frequency: number) => {
    const sampleRate = 44100;
    const duration = 0.3; // Duration in seconds
    const amplitude = 0.2;
    
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < sampleRate * duration; i++) {
      // Simple sine wave
      channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude;
    }
    
    // Fade in/out to avoid clicks
    const fadeLength = sampleRate * 0.05;
    for (let i = 0; i < fadeLength; i++) {
      const factor = i / fadeLength;
      channelData[i] *= factor;
      channelData[channelData.length - 1 - i] *= factor;
    }
    
    // Convert to WAV
    const wavHeader = createWavHeader(buffer.length, 1, sampleRate, 16);
    const wavData = new Int16Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      wavData[i] = channelData[i] * 0x7FFF;
    }
    
    // Combine header and data
    const blob = new Blob([wavHeader, wavData], { type: 'audio/wav' });
    const reader = new FileReader();
    let base64data = '';
    reader.onloadend = () => {
      base64data = reader.result as string;
    };
    reader.readAsDataURL(blob);
    
    return base64data.split(',')[1];
  };

  // Create a WAV header
  const createWavHeader = (dataLength: number, numChannels: number, sampleRate: number, bitsPerSample: number) => {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength * 2, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // byte rate
    view.setUint16(32, numChannels * bitsPerSample / 8, true); // block align
    view.setUint16(34, bitsPerSample, true);
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength * 2, true);
    
    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const startGame = () => {
    setGameActive(true);
    setSequence([]);
    setPlayerSequence([]);
    setLevel(1);
    setPlayerTurn(false);
    setTimeout(addToSequence, 1000);
    toast('Game Started!', {
      description: 'Watch the pattern and repeat it!'
    });
  };

  const addToSequence = () => {
    const newColorIndex = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, newColorIndex];
    setSequence(newSequence);
    
    // Play the sequence
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    setPlayerTurn(false);
    
    // Play each color in the sequence
    for (let i = 0; i < seq.length; i++) {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          playSound(seq[i]);
          setActiveButton(seq[i]);
          
          setTimeout(() => {
            setActiveButton(null);
            resolve();
          }, 500);
        }, i * 800);
      });
    }
    
    // Player's turn
    setTimeout(() => {
      setPlayerTurn(true);
      setPlayerSequence([]);
    }, seq.length * 800 + 500);
  };

  const handleButtonPress = (colorIndex: number) => {
    if (!playerTurn || !gameActive) return;
    
    playSound(colorIndex);
    setActiveButton(colorIndex);
    setTimeout(() => setActiveButton(null), 300);
    
    const updatedPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(updatedPlayerSequence);
    
    // Check if the player pressed the correct button
    const currentIndex = playerSequence.length;
    if (colorIndex !== sequence[currentIndex]) {
      gameOver();
      return;
    }
    
    // Check if the player completed the sequence
    if (updatedPlayerSequence.length === sequence.length) {
      setPlayerTurn(false);
      toast.success('Level complete!');
      
      // Move to the next level
      setTimeout(() => {
        setLevel(level + 1);
        setPlayerSequence([]);
        addToSequence();
      }, 1000);
    }
  };

  const playSound = (colorIndex: number) => {
    if (audioRefs.current[colorIndex]) {
      const audio = audioRefs.current[colorIndex];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Audio play error:", err));
      }
    }
  };

  const gameOver = () => {
    setGameActive(false);
    
    // Update high score
    if (level > highScore) {
      setHighScore(level);
      localStorage.setItem('simonSaysHighScore', level.toString());
      toast('New High Score!', { 
        description: `You reached level ${level}!`
      });
    } else {
      toast('Game Over!', { 
        description: `You reached level ${level}. Try again!`
      });
    }
  };

  // Generate color classes
  const getButtonClasses = (colorIndex: number) => {
    const baseClasses = "w-32 h-32 rounded-lg transition-transform transform hover:scale-105 active:scale-95";
    const activeClass = activeButton === colorIndex ? "brightness-150 shadow-lg" : "";
    
    switch (colorIndex) {
      case 0: return `${baseClasses} ${activeClass} bg-red-500`;
      case 1: return `${baseClasses} ${activeClass} bg-green-500`;
      case 2: return `${baseClasses} ${activeClass} bg-blue-500`;
      case 3: return `${baseClasses} ${activeClass} bg-yellow-500`;
      default: return baseClasses;
    }
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Music className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-green-500 mb-2">Simon Says</h1>
            <p className="text-gray-600">Watch, remember, and repeat the pattern!</p>
            
            <div className="mt-4 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">Level</div>
                <div className="text-2xl font-bold">{gameActive ? level : "-"}</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">High Score</div>
                <div className="text-2xl font-bold">{highScore}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            {!gameActive ? (
              <div className="mb-6">
                <Button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 flex items-center"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Game
                </Button>
              </div>
            ) : (
              <div className="mb-4">
                <div className="text-lg font-semibold mb-2">
                  {playerTurn ? "Your turn - Repeat the pattern!" : "Watch carefully..."}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className={getButtonClasses(index)}
                  onClick={() => handleButtonPress(index)}
                  disabled={!playerTurn || !gameActive}
                />
              ))}
            </div>
            
            {gameActive && (
              <div className="mt-6 text-sm text-gray-500">
                {playerTurn 
                  ? `${playerSequence.length} of ${sequence.length} steps completed`
                  : "Watch the pattern..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimonSays;
