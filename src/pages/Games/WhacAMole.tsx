
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Play, Timer, Trophy } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

const WhacAMole: React.FC = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [moleSpeed, setMoleSpeed] = useState(1000); // milliseconds

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('whacAMoleHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    let moleInterval: number;
    let timerInterval: number;
    
    if (gameActive) {
      // Start mole appearance interval
      moleInterval = window.setInterval(() => {
        setActiveMole(Math.floor(Math.random() * 9));
        
        // Speed up the game gradually
        if (timeLeft < 20 && moleSpeed > 800) {
          setMoleSpeed(800);
        } else if (timeLeft < 15 && moleSpeed > 700) {
          setMoleSpeed(700);
        } else if (timeLeft < 10 && moleSpeed > 600) {
          setMoleSpeed(600);
        } else if (timeLeft < 5 && moleSpeed > 500) {
          setMoleSpeed(500);
        }
      }, moleSpeed);

      // Start timer countdown
      timerInterval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Game over
            clearInterval(moleInterval);
            clearInterval(timerInterval);
            setGameActive(false);
            
            // Check for high score
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('whacAMoleHighScore', score.toString());
              toast.success('New High Score!', { 
                description: `You scored ${score} points!` 
              });
            } else {
              toast('Game Over!', { 
                description: `You scored ${score} points!` 
              });
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(moleInterval);
      clearInterval(timerInterval);
    };
  }, [gameActive, timeLeft, highScore, score, moleSpeed]);
  
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setMoleSpeed(1000);
    setGameActive(true);
    toast('Game Started!', { 
      description: `Whac the moles as they appear!` 
    });
  };

  const whacMole = (index: number) => {
    if (gameActive && index === activeMole) {
      setScore((prev) => prev + 1);
      setActiveMole(null); // Hide the mole
    }
  };

  return (
    <div className="min-h-screen bg-game-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-game-primary mb-2">Whac-A-Mole</h1>
            <p className="text-gray-600">Hit the moles as fast as you can!</p>
            
            <div className="flex justify-center mt-6 space-x-8">
              {gameActive ? (
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center space-x-1 text-xl font-bold text-red-500 mb-1">
                    <Timer className="h-4 w-4" />
                    <span>Time Left</span>
                  </div>
                  <div className="text-2xl font-bold">{timeLeft}s</div>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center">
                  <div className="text-xl font-bold text-gray-600 mb-1">Game Time</div>
                  <div className="text-2xl font-bold">30s</div>
                </div>
              )}

              <div className="text-center flex flex-col items-center">
                <div className="text-xl font-bold text-gray-600 mb-1">Score</div>
                <div className="text-2xl font-bold">{score}</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="flex items-center space-x-1 text-xl font-bold text-game-accent mb-1">
                  <Trophy className="h-4 w-4" />
                  <span>Best</span>
                </div>
                <div className="text-2xl font-bold">{highScore}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            {!gameActive && timeLeft === 30 && (
              <div className="text-center mb-6">
                <Button
                  onClick={startGame}
                  className="game-button-primary flex items-center space-x-2 px-8"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Game</span>
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3 mx-auto">
              {Array(9).fill(null).map((_, index) => (
                <div
                  key={index}
                  onClick={() => whacMole(index)}
                  className={`
                    relative aspect-square bg-yellow-800 rounded-lg overflow-hidden cursor-pointer
                    shadow-inner flex items-end justify-center
                  `}
                >
                  {activeMole === index && (
                    <div className="absolute bottom-0 w-full h-3/4 animate-pop">
                      <div className="relative w-full h-full">
                        <div className="absolute bottom-0 w-full h-4/5 bg-brown-600 rounded-t-full overflow-hidden">
                          <div className="absolute top-1/4 w-full h-1/2 bg-amber-700 rounded-t-full flex flex-col items-center pt-2">
                            <div className="bg-black w-2 h-2 rounded-full"></div>
                            <div className="bg-black w-2 h-2 rounded-full mt-1"></div>
                            <div className="bg-red-400 w-4 h-1 mt-2 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-full h-1/4 bg-green-600 border-b-2 border-green-800"></div>
                </div>
              ))}
            </div>
            
            {!gameActive && timeLeft === 0 && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={startGame}
                  className="game-button-accent flex items-center space-x-2"
                >
                  <span>Play Again</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhacAMole;
