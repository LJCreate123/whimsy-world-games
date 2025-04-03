
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Maze, Clock, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

interface Position {
  x: number;
  y: number;
}

interface MazeCell {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
}

type Direction = 'up' | 'right' | 'down' | 'left';

const MazeSolver: React.FC = () => {
  const [mazeSize, setMazeSize] = useState(8);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
  const [goalPosition, setGoalPosition] = useState<Position>({ x: 7, y: 7 });
  const [gameActive, setGameActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [level, setLevel] = useState(1);
  const [bestTimes, setBestTimes] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [moves, setMoves] = useState(0);
  
  const mazeRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Load best times from localStorage
  useEffect(() => {
    const savedBestTimes = localStorage.getItem('mazeSolverBestTimes');
    if (savedBestTimes) {
      setBestTimes(JSON.parse(savedBestTimes));
    }
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (gameActive) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive]);
  
  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      
      switch (e.key) {
        case 'ArrowUp':
          movePlayer('up');
          e.preventDefault();
          break;
        case 'ArrowRight':
          movePlayer('right');
          e.preventDefault();
          break;
        case 'ArrowDown':
          movePlayer('down');
          e.preventDefault();
          break;
        case 'ArrowLeft':
          movePlayer('left');
          e.preventDefault();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive, playerPosition, maze]);
  
  // Check win condition
  useEffect(() => {
    if (gameActive && 
        playerPosition.x === goalPosition.x && 
        playerPosition.y === goalPosition.y) {
      mazeCompleted();
    }
  }, [playerPosition, goalPosition, gameActive]);

  const startGame = () => {
    // Generate maze based on level
    const size = Math.min(8 + (level - 1) * 2, 16);
    setMazeSize(size);
    
    const newMaze = generateMaze(size);
    setMaze(newMaze);
    
    // Set player at start (top-left)
    setPlayerPosition({ x: 0, y: 0 });
    
    // Set goal at bottom-right
    setGoalPosition({ x: size - 1, y: size - 1 });
    
    setTimeElapsed(0);
    setGameActive(true);
    setShowHint(false);
    setMoves(0);
    
    toast('Maze Started!', {
      description: `Navigate from the start (green) to the finish (red). Level ${level}`
    });
  };

  const mazeCompleted = () => {
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Update best time for level
    const currentBest = bestTimes[level] || Infinity;
    if (timeElapsed < currentBest) {
      const updatedBestTimes = { ...bestTimes, [level]: timeElapsed };
      setBestTimes(updatedBestTimes);
      localStorage.setItem('mazeSolverBestTimes', JSON.stringify(updatedBestTimes));
      
      toast('New Record!', {
        description: `You completed level ${level} in ${formatTime(timeElapsed)}!`
      });
    } else {
      toast('Maze Completed!', {
        description: `You finished in ${formatTime(timeElapsed)}!`
      });
    }
  };

  const moveToNextLevel = () => {
    setLevel(prev => prev + 1);
    startGame();
  };

  const generateMaze = (size: number): MazeCell[][] => {
    // Initialize grid with walls
    const grid: MazeCell[][] = Array(size).fill(0).map(() => 
      Array(size).fill(0).map(() => ({
        top: true,
        right: true,
        bottom: true,
        left: true,
        visited: false
      }))
    );
    
    // Depth-first search maze generation algorithm (recursive backtracking)
    const stack: Position[] = [];
    const startX = 0;
    const startY = 0;
    
    grid[startY][startX].visited = true;
    stack.push({ x: startX, y: startY });
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const { x, y } = current;
      
      // Find all unvisited neighbors
      const neighbors: { direction: Direction; x: number; y: number }[] = [];
      
      if (y > 0 && !grid[y-1][x].visited) {
        neighbors.push({ direction: 'up', x, y: y-1 });
      }
      if (x < size - 1 && !grid[y][x+1].visited) {
        neighbors.push({ direction: 'right', x: x+1, y });
      }
      if (y < size - 1 && !grid[y+1][x].visited) {
        neighbors.push({ direction: 'down', x, y: y+1 });
      }
      if (x > 0 && !grid[y][x-1].visited) {
        neighbors.push({ direction: 'left', x: x-1, y });
      }
      
      if (neighbors.length > 0) {
        // Choose a random neighbor
        const nextIndex = Math.floor(Math.random() * neighbors.length);
        const next = neighbors[nextIndex];
        
        // Remove wall between current cell and chosen neighbor
        if (next.direction === 'up') {
          grid[y][x].top = false;
          grid[next.y][next.x].bottom = false;
        } else if (next.direction === 'right') {
          grid[y][x].right = false;
          grid[next.y][next.x].left = false;
        } else if (next.direction === 'down') {
          grid[y][x].bottom = false;
          grid[next.y][next.x].top = false;
        } else if (next.direction === 'left') {
          grid[y][x].left = false;
          grid[next.y][next.x].right = false;
        }
        
        // Mark neighbor as visited and add to stack
        grid[next.y][next.x].visited = true;
        stack.push({ x: next.x, y: next.y });
      } else {
        // Backtrack
        stack.pop();
      }
    }
    
    // Reset visited property for later use
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid[y][x].visited = false;
      }
    }
    
    return grid;
  };

  const movePlayer = (direction: Direction) => {
    if (!gameActive) return;
    
    const { x, y } = playerPosition;
    let newX = x;
    let newY = y;
    let canMove = false;
    
    // Check if there's a wall in the direction
    switch (direction) {
      case 'up':
        if (!maze[y][x].top) {
          newY = y - 1;
          canMove = true;
        }
        break;
      case 'right':
        if (!maze[y][x].right) {
          newX = x + 1;
          canMove = true;
        }
        break;
      case 'down':
        if (!maze[y][x].bottom) {
          newY = y + 1;
          canMove = true;
        }
        break;
      case 'left':
        if (!maze[y][x].left) {
          newX = x - 1;
          canMove = true;
        }
        break;
    }
    
    if (canMove) {
      setPlayerPosition({ x: newX, y: newY });
      setMoves(prev => prev + 1);
      
      // Mark visited cells for hint
      const newMaze = [...maze];
      newMaze[y][x].visited = true;
      setMaze(newMaze);
    }
  };

  const toggleHint = () => {
    setShowHint(prev => !prev);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <Maze className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-cyan-500 mb-2">Maze Solver</h1>
            <p className="text-gray-600">Navigate through the maze from start to finish!</p>
            
            <div className="mt-4 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-500">Level</div>
                <div className="text-2xl font-bold">{level}</div>
              </div>
              
              {gameActive && (
                <div className="text-center">
                  <div className="text-xl font-bold flex items-center justify-center text-red-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Time</span>
                  </div>
                  <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-xl font-bold flex items-center justify-center text-amber-500">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span>Best</span>
                </div>
                <div className="text-2xl font-bold">
                  {bestTimes[level] ? formatTime(bestTimes[level]) : "-"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              {!gameActive ? (
                <Button
                  onClick={startGame}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
                >
                  {level === 1 && Object.keys(bestTimes).length === 0
                    ? "Start Game"
                    : "Start Level"}
                </Button>
              ) : (
                <div className="flex space-x-4">
                  <div className="text-gray-700">
                    Moves: <span className="font-bold">{moves}</span>
                  </div>
                  <Button
                    onClick={toggleHint}
                    className={showHint 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"}
                    size="sm"
                  >
                    {showHint ? "Hide Path" : "Show Hint"}
                  </Button>
                </div>
              )}
              
              {!gameActive && playerPosition.x === goalPosition.x && playerPosition.y === goalPosition.y && (
                <Button
                  onClick={moveToNextLevel}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Next Level
                </Button>
              )}
            </div>
            
            <div 
              ref={mazeRef}
              className={`mx-auto border border-gray-300 rounded overflow-hidden bg-gray-50`}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${mazeSize}, 1fr)`,
                gap: '0px',
                maxWidth: '500px',
                aspectRatio: '1/1'
              }}
            >
              {maze.map((row, y) => 
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      relative
                      ${cell.top ? 'border-t-2 border-gray-800' : ''}
                      ${cell.right ? 'border-r-2 border-gray-800' : ''}
                      ${cell.bottom ? 'border-b-2 border-gray-800' : ''}
                      ${cell.left ? 'border-l-2 border-gray-800' : ''}
                      ${showHint && cell.visited ? 'bg-blue-100' : ''}
                      ${x === playerPosition.x && y === playerPosition.y ? 'bg-green-500' : ''}
                      ${x === goalPosition.x && y === goalPosition.y ? 'bg-red-500' : ''}
                    `}
                  >
                    {x === playerPosition.x && y === playerPosition.y && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2/3 h-2/3 bg-yellow-300 rounded-full flex items-center justify-center">
                          <div className="w-1/2 h-1/2 bg-yellow-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                    
                    {x === goalPosition.x && y === goalPosition.y && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Mobile controls */}
            {gameActive && (
              <div className="mt-6 max-w-xs mx-auto">
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                    onClick={() => movePlayer('up')}
                  >
                    <ArrowUp className="h-6 w-6" />
                  </button>
                  <div></div>
                  
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                    onClick={() => movePlayer('left')}
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                    onClick={() => movePlayer('down')}
                  >
                    <ArrowDown className="h-6 w-6" />
                  </button>
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md flex justify-center"
                    onClick={() => movePlayer('right')}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeSolver;
