
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Zap, Award, Timer, Check, X } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

type GameState = 'ready' | 'waiting' | 'click' | 'result' | 'complete';

interface Attempt {
  reactionTime: number;
  success: boolean;
}

const ReactionTest: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [waitTimeout, setWaitTimeout] = useState<number | null>(null);
  const maxAttempts = 5;
  const timerRef = useRef<number | null>(null);
  
  // Load best time from localStorage on component mount
  useEffect(() => {
    const savedBestTime = localStorage.getItem('reactionTestBestTime');
    if (savedBestTime) {
      setBestTime(parseInt(savedBestTime));
    }
  }, []);
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  
  // Update best time and average when attempts change
  useEffect(() => {
    if (attempts.length > 0) {
      const successfulAttempts = attempts.filter(a => a.success);
      
      if (successfulAttempts.length > 0) {
        // Calculate average
        const sum = successfulAttempts.reduce((acc, attempt) => acc + attempt.reactionTime, 0);
        const avg = Math.round(sum / successfulAttempts.length);
        setAverageTime(avg);
        
        // Update best time
        const best = Math.min(...successfulAttempts.map(a => a.reactionTime));
        if (bestTime === null || best < bestTime) {
          setBestTime(best);
          localStorage.setItem('reactionTestBestTime', best.toString());
        }
      }
    }
  }, [attempts, bestTime]);

  const startGame = () => {
    setAttempts([]);
    setCurrentAttempt(0);
    setReactionTime(0);
    setGameState('waiting');
    startWaiting();
    
    toast('Game Started!', {
      description: 'Wait for the green screen, then click as fast as you can!'
    });
  };

  const startWaiting = () => {
    // Random delay between 1-5 seconds
    const delay = Math.floor(Math.random() * 4000) + 1000;
    
    timerRef.current = window.setTimeout(() => {
      setGameState('click');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    switch (gameState) {
      case 'waiting':
        // Clicked too soon
        if (timerRef.current) clearTimeout(timerRef.current);
        setAttempts(prev => [...prev, { reactionTime: 0, success: false }]);
        setGameState('result');
        break;
        
      case 'click':
        // Successful click
        const clickTime = Date.now();
        const reaction = clickTime - startTime;
        setReactionTime(reaction);
        setAttempts(prev => [...prev, { reactionTime: reaction, success: true }]);
        setGameState('result');
        break;
        
      case 'result':
        // Move to next attempt or end game
        if (currentAttempt + 1 >= maxAttempts) {
          setGameState('complete');
          
          toast('Test Complete!', {
            description: `Your average reaction time: ${averageTime || 0}ms`
          });
        } else {
          setCurrentAttempt(prev => prev + 1);
          setGameState('waiting');
          startWaiting();
        }
        break;
    }
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'ready': return 'bg-white';
      case 'waiting': return 'bg-red-500';
      case 'click': return 'bg-green-500';
      case 'result': 
        return attempts[currentAttempt]?.success ? 'bg-blue-500' : 'bg-yellow-500';
      case 'complete': return 'bg-purple-500';
      default: return 'bg-gray-100';
    }
  };

  const getMessage = () => {
    switch (gameState) {
      case 'ready':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">Test Your Reflexes!</h3>
            <p className="mb-4 text-gray-600">
              When you start, wait for the red box to turn green, then click as fast as you can!
            </p>
            <Button
              onClick={startGame}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              Start Test
            </Button>
          </div>
        );
      case 'waiting':
        return (
          <div className="text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Wait...</h3>
            <p>Get ready to click when this turns green!</p>
          </div>
        );
      case 'click':
        return (
          <div className="text-center text-white">
            <h3 className="text-3xl font-bold mb-4">CLICK NOW!</h3>
          </div>
        );
      case 'result':
        if (!attempts[currentAttempt]?.success) {
          return (
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-4">Too Early! <X className="inline h-8 w-8" /></h3>
              <p>You clicked before the screen turned green.</p>
              <Button
                onClick={handleClick}
                className="mt-4 bg-white text-yellow-500 hover:bg-gray-100"
              >
                Continue
              </Button>
            </div>
          );
        } else {
          return (
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                <Check className="inline h-8 w-8 mr-2" />
                {reactionTime} ms
              </h3>
              <p>{getReactionComment(reactionTime)}</p>
              <Button
                onClick={handleClick}
                className="mt-4 bg-white text-blue-500 hover:bg-gray-100"
              >
                Continue
              </Button>
            </div>
          );
        }
      case 'complete':
        return (
          <div className="text-center text-white">
            <h3 className="text-3xl font-bold mb-6">Test Complete!</h3>
            
            {averageTime && (
              <p className="text-xl mb-2">Your average: {averageTime} ms</p>
            )}
            
            {bestTime && (
              <p className="text-xl mb-4">Your best time: {bestTime} ms</p>
            )}
            
            <div className="mt-4">
              <Button
                onClick={startGame}
                className="bg-white text-purple-500 hover:bg-gray-100"
              >
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  const getReactionComment = (time: number): string => {
    if (time < 200) return "Incredible reflexes!";
    if (time < 250) return "Amazing! That's really fast!";
    if (time < 300) return "Great reaction time!";
    if (time < 350) return "Good job!";
    if (time < 400) return "Pretty decent!";
    if (time < 500) return "Average reaction time.";
    return "Keep practicing!";
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Zap className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-orange-500 mb-2">Reaction Test</h1>
            <p className="text-gray-600">Test your reflexes and see how fast you can react!</p>
            
            <div className="mt-4 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold flex items-center justify-center text-blue-500">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>Average</span>
                </div>
                <div className="text-2xl font-bold">{averageTime ? `${averageTime}ms` : "-"}</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold flex items-center justify-center text-yellow-500">
                  <Award className="h-4 w-4 mr-1" />
                  <span>Best</span>
                </div>
                <div className="text-2xl font-bold">{bestTime ? `${bestTime}ms` : "-"}</div>
              </div>
            </div>
          </div>
          
          <div 
            className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${getBackgroundColor()}`}
            style={{ height: '340px' }}
          >
            <div className="h-full flex flex-col items-center justify-center p-6">
              {getMessage()}
              
              {gameState !== 'ready' && gameState !== 'complete' && (
                <div className="mt-auto">
                  <p className="text-white text-sm">
                    Attempt {currentAttempt + 1} of {maxAttempts}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {(gameState === 'waiting' || gameState === 'click') && (
            <div 
              className="mt-4 p-4 text-center bg-white rounded-lg shadow-md cursor-pointer"
              onClick={handleClick}
            >
              <div className="text-gray-700 font-medium">
                {gameState === 'waiting' ? "Click here if the box turns green" : "CLICK NOW!"}
              </div>
            </div>
          )}
          
          {gameState !== 'ready' && gameState !== 'waiting' && gameState !== 'click' && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">Results</h3>
              <div className="space-y-2">
                {attempts.map((attempt, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-2 rounded-md ${
                      attempt.success 
                        ? 'bg-green-100 border-l-4 border-green-500' 
                        : 'bg-red-100 border-l-4 border-red-500'
                    }`}
                  >
                    <span>Attempt {index + 1}:</span>
                    <span className="font-bold">
                      {attempt.success 
                        ? `${attempt.reactionTime} ms` 
                        : 'Too early!'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionTest;
