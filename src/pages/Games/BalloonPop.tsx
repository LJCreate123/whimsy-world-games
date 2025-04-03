
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bomb, Trophy } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

interface Balloon {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  popped: boolean;
}

const BalloonPop: React.FC = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [missed, setMissed] = useState(0);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastBalloonTime = useRef<number>(0);
  
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
  ];

  // Load high score on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('balloonPopHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);
  
  // Timer effect
  useEffect(() => {
    let timer: number;
    if (gameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameActive, timeLeft]);

  const startGame = () => {
    setBalloons([]);
    setScore(0);
    setTimeLeft(30);
    setMissed(0);
    setGameActive(true);
    
    // Start the game loop
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    lastBalloonTime.current = performance.now();
    animationLoop(performance.now());
    
    toast('Game Started!', {
      description: `Pop the balloons before they float away! Difficulty: ${difficulty}`
    });
  };

  const endGame = () => {
    setGameActive(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('balloonPopHighScore', score.toString());
      toast('New High Score!', {
        description: `You popped ${score} balloons!`
      });
    } else {
      toast('Game Over!', {
        description: `You popped ${score} balloons!`
      });
    }
  };

  const animationLoop = (timestamp: number) => {
    if (!gameActive) return;
    
    // Create new balloons based on difficulty
    const now = performance.now();
    const balloonInterval = difficulty === 'easy' ? 1200 : 
                            difficulty === 'medium' ? 800 : 500;
    
    if (now - lastBalloonTime.current > balloonInterval) {
      createBalloon();
      lastBalloonTime.current = now;
    }
    
    // Update balloon positions
    updateBalloons();
    
    // Continue the animation loop
    animationFrameId.current = requestAnimationFrame(animationLoop);
  };

  const createBalloon = () => {
    if (!gameAreaRef.current) return;
    
    const gameAreaWidth = gameAreaRef.current.offsetWidth;
    const gameAreaHeight = gameAreaRef.current.offsetHeight;
    
    const size = Math.random() * 20 + 40; // Random size between 40-60
    const x = Math.random() * (gameAreaWidth - size);
    const y = gameAreaHeight + size; // Start from below the game area
    
    // Different speeds based on difficulty
    const baseSpeed = difficulty === 'easy' ? 1.5 :
                      difficulty === 'medium' ? 2.5 : 3.5;
    const speed = baseSpeed + Math.random() * 1;
    
    const newBalloon: Balloon = {
      id: Date.now(),
      x,
      y,
      size,
      speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      popped: false
    };
    
    setBalloons(prevBalloons => [...prevBalloons, newBalloon]);
  };

  const updateBalloons = () => {
    setBalloons(prevBalloons => {
      const updatedBalloons = prevBalloons
        .map(balloon => {
          // Move balloon upward
          if (!balloon.popped) {
            return {
              ...balloon,
              y: balloon.y - balloon.speed
            };
          }
          return balloon;
        })
        .filter(balloon => {
          // Remove balloons that have floated off the top
          if (balloon.y < -balloon.size && !balloon.popped) {
            setMissed(prev => prev + 1);
            return false;
          }
          
          // Remove popped balloons after animation
          if (balloon.popped && balloon.y < -balloon.size) {
            return false;
          }
          
          return true;
        });
      
      return updatedBalloons;
    });
  };

  const popBalloon = (id: number) => {
    setBalloons(prevBalloons => 
      prevBalloons.map(balloon => 
        balloon.id === id && !balloon.popped
          ? { ...balloon, popped: true, speed: balloon.speed * 3 }
          : balloon
      )
    );
    
    setScore(prev => prev + 1);
    
    // Add a small time bonus every 10 points
    if (score > 0 && score % 10 === 9) {
      setTimeLeft(prev => Math.min(prev + 5, 60));
      toast.success('+5 seconds bonus!');
    }
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <Bomb className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-red-500 mb-2">Balloon Pop</h1>
            <p className="text-gray-600">Pop balloons before they float away!</p>
            
            <div className="mt-4 flex justify-center space-x-8">
              {gameActive && (
                <>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-500">Time</div>
                    <div className="text-2xl font-bold">{timeLeft}s</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-500">Score</div>
                    <div className="text-2xl font-bold">{score}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-500">Missed</div>
                    <div className="text-2xl font-bold">{missed}</div>
                  </div>
                </>
              )}
              
              {!gameActive && (
                <div className="text-center">
                  <div className="flex items-center text-xl font-bold text-yellow-600">
                    <Trophy className="h-5 w-5 mr-2" />
                    <span>High Score</span>
                  </div>
                  <div className="text-2xl font-bold">{highScore}</div>
                </div>
              )}
            </div>
          </div>
          
          {!gameActive && (
            <div className="bg-white p-6 rounded-xl shadow-md text-center mb-6">
              <h3 className="text-xl font-bold mb-4">Select Difficulty</h3>
              
              <div className="flex justify-center space-x-4 mb-6">
                <Button
                  onClick={() => setDifficulty('easy')}
                  className={`px-6 ${difficulty === 'easy' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Easy
                </Button>
                <Button
                  onClick={() => setDifficulty('medium')}
                  className={`px-6 ${difficulty === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Medium
                </Button>
                <Button
                  onClick={() => setDifficulty('hard')}
                  className={`px-6 ${difficulty === 'hard' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Hard
                </Button>
              </div>
              
              <Button
                onClick={startGame}
                className="bg-red-500 hover:bg-red-600 text-white px-8"
              >
                Start Game
              </Button>
            </div>
          )}
          
          <div 
            ref={gameAreaRef}
            className="bg-gradient-to-b from-sky-300 to-sky-500 relative rounded-lg overflow-hidden"
            style={{ height: '500px' }}
          >
            {/* Background clouds */}
            <div className="absolute left-5 top-20 w-20 h-12 bg-white rounded-full opacity-70"></div>
            <div className="absolute left-20 top-10 w-32 h-16 bg-white rounded-full opacity-70"></div>
            <div className="absolute right-10 top-40 w-24 h-12 bg-white rounded-full opacity-70"></div>
            <div className="absolute right-30 top-20 w-16 h-10 bg-white rounded-full opacity-70"></div>
            
            {/* Balloons */}
            {balloons.map(balloon => (
              <div
                key={balloon.id}
                className={`absolute ${balloon.color} rounded-full cursor-pointer transition-transform ${balloon.popped ? 'animate-pop' : 'hover:scale-110'}`}
                style={{
                  width: `${balloon.size}px`,
                  height: `${balloon.size * 1.2}px`,
                  left: `${balloon.x}px`,
                  bottom: `${gameAreaRef.current?.offsetHeight ? gameAreaRef.current.offsetHeight - balloon.y : 0}px`,
                  transform: balloon.popped ? 'scale(0.2)' : 'scale(1)',
                  opacity: balloon.popped ? '0' : '1',
                  transition: 'transform 0.3s, opacity 0.3s'
                }}
                onClick={() => !balloon.popped && popBalloon(balloon.id)}
              >
                {/* Balloon string */}
                {!balloon.popped && (
                  <div className="absolute bottom-0 left-1/2 w-1 h-10 bg-gray-300 -translate-x-1/2"></div>
                )}
                
                {/* Balloon highlight */}
                <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white rounded-full opacity-30"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalloonPop;
