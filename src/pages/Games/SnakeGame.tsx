
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Rabbit, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const directionQueueRef = useRef<Direction[]>([]);

  useEffect(() => {
    // Load high score
    const savedHighScore = localStorage.getItem('snakeGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Set up event listeners for keyboard controls
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    renderGame();
  }, [snake, food]);

  useEffect(() => {
    if (!gameActive) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    // Start game loop
    lastTimeRef.current = 0;
    const animate = (time: number) => {
      if (time - lastTimeRef.current >= speed) {
        lastTimeRef.current = time;
        
        // Process direction queue
        if (directionQueueRef.current.length > 0) {
          const nextDirection = directionQueueRef.current.shift();
          if (nextDirection) {
            // Prevent 180-degree turns
            if (
              !(nextDirection === 'UP' && direction === 'DOWN') &&
              !(nextDirection === 'DOWN' && direction === 'UP') &&
              !(nextDirection === 'LEFT' && direction === 'RIGHT') &&
              !(nextDirection === 'RIGHT' && direction === 'LEFT')
            ) {
              setDirection(nextDirection);
            }
          }
        }
        
        updateGame();
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameActive, direction, speed]);

  const startGame = () => {
    // Reset game state
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFoodPosition([{ x: 10, y: 10 }]));
    setDirection('RIGHT');
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameActive(true);
    directionQueueRef.current = [];
    
    toast('Game Started!', {
      description: 'Use arrow keys or on-screen controls to move the snake!'
    });
  };

  const updateGame = () => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }
      
      // Check for collisions
      if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= GRID_SIZE || 
        head.y >= GRID_SIZE ||
        newSnake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)
      ) {
        gameOver();
        return prevSnake;
      }
      
      // Check for food
      if (head.x === food.x && head.y === food.y) {
        // Eat food
        newSnake.unshift(head); // Add new head
        setFood(generateFoodPosition(newSnake));
        setScore(prev => prev + 1);
        
        // Increase speed every 5 points
        if (score > 0 && score % 5 === 0) {
          setSpeed(prevSpeed => Math.max(prevSpeed * 0.9, 60)); // Minimum speed is 60ms
        }
      } else {
        // Just move
        newSnake.unshift(head); // Add new head
        newSnake.pop(); // Remove tail
      }
      
      return newSnake;
    });
  };

  const generateFoodPosition = (snakePositions: Position[]): Position => {
    let newFood: Position;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (
      snakePositions.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    
    return newFood;
  };

  const gameOver = () => {
    setGameActive(false);
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeGameHighScore', score.toString());
      toast('New High Score!', {
        description: `You scored ${score} points!`
      });
    } else {
      toast('Game Over!', {
        description: `You scored ${score} points!`
      });
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!gameActive) return;
    
    const key = e.key;
    
    if (key === 'ArrowUp' || key === 'w') {
      e.preventDefault();
      directionQueueRef.current.push('UP');
    } else if (key === 'ArrowDown' || key === 's') {
      e.preventDefault();
      directionQueueRef.current.push('DOWN');
    } else if (key === 'ArrowLeft' || key === 'a') {
      e.preventDefault();
      directionQueueRef.current.push('LEFT');
    } else if (key === 'ArrowRight' || key === 'd') {
      e.preventDefault();
      directionQueueRef.current.push('RIGHT');
    }
  };

  const handleDirectionButton = (dir: Direction) => {
    if (!gameActive) return;
    directionQueueRef.current.push(dir);
  };

  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (optional)
    ctx.strokeStyle = '#e2e8f0';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw food
    ctx.fillStyle = '#ef4444'; // red
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 * 0.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Draw snake
    snake.forEach((segment, index) => {
      // Head is darker, body gets progressively lighter
      const colorFactor = Math.max(0.5, 1 - index * 0.05);
      ctx.fillStyle = `rgb(22, ${Math.floor(163 * colorFactor)}, ${Math.floor(74 * colorFactor)})`;
      
      if (index === 0) {
        // Draw the head as a rounded rectangle
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        const radius = 5;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + CELL_SIZE, y, x + CELL_SIZE, y + CELL_SIZE, radius);
        ctx.arcTo(x + CELL_SIZE, y + CELL_SIZE, x, y + CELL_SIZE, radius);
        ctx.arcTo(x, y + CELL_SIZE, x, y, radius);
        ctx.arcTo(x, y, x + CELL_SIZE, y, radius);
        ctx.closePath();
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = 'white';
        
        // Position eyes based on direction
        let eyeX1 = 0, eyeY1 = 0, eyeX2 = 0, eyeY2 = 0;
        
        switch (direction) {
          case 'UP':
            eyeX1 = x + CELL_SIZE * 0.3;
            eyeY1 = y + CELL_SIZE * 0.3;
            eyeX2 = x + CELL_SIZE * 0.7;
            eyeY2 = y + CELL_SIZE * 0.3;
            break;
          case 'DOWN':
            eyeX1 = x + CELL_SIZE * 0.3;
            eyeY1 = y + CELL_SIZE * 0.7;
            eyeX2 = x + CELL_SIZE * 0.7;
            eyeY2 = y + CELL_SIZE * 0.7;
            break;
          case 'LEFT':
            eyeX1 = x + CELL_SIZE * 0.3;
            eyeY1 = y + CELL_SIZE * 0.3;
            eyeX2 = x + CELL_SIZE * 0.3;
            eyeY2 = y + CELL_SIZE * 0.7;
            break;
          case 'RIGHT':
            eyeX1 = x + CELL_SIZE * 0.7;
            eyeY1 = y + CELL_SIZE * 0.3;
            eyeX2 = x + CELL_SIZE * 0.7;
            eyeY2 = y + CELL_SIZE * 0.7;
            break;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, CELL_SIZE * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, CELL_SIZE * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = 'black';
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, CELL_SIZE * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, CELL_SIZE * 0.07, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw body segments
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        const size = CELL_SIZE * 0.9;
        const offset = (CELL_SIZE - size) / 2;
        
        ctx.beginPath();
        ctx.roundRect(x + offset, y + offset, size, size, 4);
        ctx.fill();
      }
    });
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Rabbit className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-emerald-500 mb-2">Snake Game</h1>
            <p className="text-gray-600">Control the snake to eat food and grow without hitting walls or yourself!</p>
            
            <div className="mt-4 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-500">Score</div>
                <div className="text-2xl font-bold">{score}</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">High Score</div>
                <div className="text-2xl font-bold">{highScore}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            {!gameActive ? (
              <div className="mb-6">
                <Button
                  onClick={startGame}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                >
                  Start Game
                </Button>
              </div>
            ) : null}
            
            <div className="relative mb-4">
              <canvas 
                ref={canvasRef} 
                width={GRID_SIZE * CELL_SIZE} 
                height={GRID_SIZE * CELL_SIZE}
                className="border border-gray-200 mx-auto bg-gray-50"
              />
            </div>
            
            {/* Mobile controls */}
            <div className="mt-6 max-w-xs mx-auto">
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <button 
                  className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                  onClick={() => handleDirectionButton('UP')}
                  aria-label="Move Up"
                >
                  <ArrowUp className="h-6 w-6" />
                </button>
                <div></div>
                
                <button 
                  className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                  onClick={() => handleDirectionButton('LEFT')}
                  aria-label="Move Left"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button 
                  className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                  onClick={() => handleDirectionButton('DOWN')}
                  aria-label="Move Down"
                >
                  <ArrowDown className="h-6 w-6" />
                </button>
                <button 
                  className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                  onClick={() => handleDirectionButton('RIGHT')}
                  aria-label="Move Right"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
