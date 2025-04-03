
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Palette, Clock, Check, X } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

interface ColorOption {
  name: string;
  bg: string;
  text: string;
}

const ColorMatch: React.FC = () => {
  const colorOptions: ColorOption[] = [
    { name: 'Red', bg: 'bg-red-500', text: 'text-red-500' },
    { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
    { name: 'Green', bg: 'bg-green-500', text: 'text-green-500' },
    { name: 'Yellow', bg: 'bg-yellow-500', text: 'text-yellow-500' },
    { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500' },
    { name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500' },
  ];

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [currentColor, setCurrentColor] = useState<ColorOption>(colorOptions[0]);
  const [displayedName, setDisplayedName] = useState<string>('Red');
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [roundResult, setRoundResult] = useState<'correct' | 'incorrect' | null>(null);

  // Set up a timer for the game
  useEffect(() => {
    let timer: number;
    
    if (gameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameActive, timeLeft]);

  // Fetch high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('colorMatchHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    setStreak(0);
    setMaxStreak(0);
    setRoundResult(null);
    generateNewRound();
    
    toast('Game Started!', {
      description: 'Choose whether the color matches the text or not!'
    });
  };

  const endGame = () => {
    setGameActive(false);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('colorMatchHighScore', score.toString());
      toast('New High Score!', {
        description: `You scored ${score} points!`
      });
    } else {
      toast('Game Over!', {
        description: `You scored ${score} points!`
      });
    }
  };

  const generateNewRound = () => {
    // Select a random color for the background
    const bgColorIndex = Math.floor(Math.random() * colorOptions.length);
    const bgColor = colorOptions[bgColorIndex];
    
    // Decide whether to make this a matching or non-matching round (50% chance each)
    const shouldMatch = Math.random() > 0.5;
    
    if (shouldMatch) {
      // Matching: text name is the same as the background color
      setCurrentColor(bgColor);
      setDisplayedName(bgColor.name);
    } else {
      // Non-matching: pick a different color for the text name
      let textNameIndex = bgColorIndex;
      while (textNameIndex === bgColorIndex) {
        textNameIndex = Math.floor(Math.random() * colorOptions.length);
      }
      setCurrentColor(bgColor);
      setDisplayedName(colorOptions[textNameIndex].name);
    }
    
    // Clear the previous round result after a short delay
    setTimeout(() => {
      setRoundResult(null);
    }, 300);
  };

  const handleAnswer = (matches: boolean) => {
    const isCorrect = (matches && currentColor.name === displayedName) || 
                      (!matches && currentColor.name !== displayedName);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));
      setRoundResult('correct');
      
      // Add bonus time for streaks
      if (streak > 0 && streak % 5 === 0) {
        setTimeLeft(prev => Math.min(prev + 3, 60));
        toast.success(`Streak bonus! +3 seconds`);
      }
    } else {
      setStreak(0);
      setRoundResult('incorrect');
    }
    
    // Generate a new round after a short delay
    setTimeout(() => {
      generateNewRound();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Palette className="h-16 w-16 text-pink-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-pink-500 mb-2">Color Match</h1>
            <p className="text-gray-600">Does the text color match the written word?</p>
            
            {gameActive && (
              <div className="mt-4 flex justify-center space-x-8">
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center space-x-1 text-xl font-bold text-red-500">
                    <Clock className="h-4 w-4" />
                    <span>Time</span>
                  </div>
                  <div className="text-2xl font-bold">{timeLeft}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-pink-500">Score</div>
                  <div className="text-2xl font-bold">{score}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-600">Best</div>
                  <div className="text-2xl font-bold">{highScore}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            {!gameActive ? (
              <div className="text-center mb-6">
                <Button
                  onClick={startGame}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8"
                >
                  Start Game
                </Button>
                
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">How to Play</h3>
                  <p className="text-gray-700">
                    Look at the colored text and decide if the written word matches 
                    the color of the text. Tap "Match" if they match, tap "No Match" 
                    if they don't. Score points for each correct answer!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className={`
                  ${currentColor.bg} py-16 px-8 rounded-xl mb-6
                  ${roundResult === 'correct' ? 'ring-4 ring-green-500' : ''}
                  ${roundResult === 'incorrect' ? 'ring-4 ring-red-500' : ''}
                `}>
                  <h2 className="text-5xl font-bold text-white">
                    {displayedName}
                  </h2>
                </div>
                
                <div className="flex space-x-4 justify-center">
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="bg-green-500 hover:bg-green-600 text-white flex-1 flex items-center justify-center px-4"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Match
                  </Button>
                  
                  <Button
                    onClick={() => handleAnswer(false)}
                    className="bg-red-500 hover:bg-red-600 text-white flex-1 flex items-center justify-center px-4"
                  >
                    <X className="h-5 w-5 mr-2" />
                    No Match
                  </Button>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    Current Streak: <span className="font-bold">{streak}</span> | 
                    Max Streak: <span className="font-bold">{maxStreak}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMatch;
