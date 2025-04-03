
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Puzzle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

const PuzzleSlider: React.FC = () => {
  const gridSize = 4;
  const totalTiles = gridSize * gridSize;
  
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyTileIndex, setEmptyTileIndex] = useState<number>(totalTiles - 1);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  
  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);
  
  // Timer effect
  useEffect(() => {
    let timer: number;
    
    if (gameActive && !isSolved) {
      timer = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameActive, isSolved]);
  
  // Check for win condition effect
  useEffect(() => {
    if (gameActive && tiles.length > 0) {
      const solved = tiles.every((tile, index) => {
        if (index === emptyTileIndex) {
          return tile === 0;
        }
        return tile === index + 1;
      });
      
      if (solved && moves > 0) {
        setIsSolved(true);
        setGameActive(false);
        toast.success('Puzzle Solved!', {
          description: `You solved it in ${moves} moves and ${formatTime(timeElapsed)}!`
        });
      }
    }
  }, [tiles, emptyTileIndex, gameActive, moves, timeElapsed]);
  
  const initializeGame = () => {
    // Create ordered tiles
    let orderedTiles = Array.from({ length: totalTiles }, (_, i) => i);
    
    // Shuffle tiles for a new game
    let shuffledTiles = shuffleTilesWithSolvability([...orderedTiles]);
    
    // Find the empty tile (0)
    const emptyIndex = shuffledTiles.indexOf(0);
    
    setTiles(shuffledTiles);
    setEmptyTileIndex(emptyIndex);
    setMoves(0);
    setTimeElapsed(0);
    setIsSolved(false);
  };
  
  const startGame = () => {
    initializeGame();
    setGameActive(true);
    toast('Game Started!', {
      description: 'Slide tiles to arrange them in order!'
    });
  };

  // Function to shuffle tiles while ensuring puzzle is solvable
  const shuffleTilesWithSolvability = (tilesArray: number[]): number[] => {
    let shuffled = [...tilesArray];
    let iterations = 0;
    
    do {
      // Simple Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      iterations++;
    } while (!isPuzzleSolvable(shuffled) && iterations < 100); // Limit iterations to avoid infinite loop
    
    return shuffled;
  };
  
  // Function to check if a puzzle configuration is solvable
  const isPuzzleSolvable = (puzzle: number[]): boolean => {
    // Convert puzzle to array without the empty tile (0)
    const puzzleWithoutEmpty = puzzle.filter(tile => tile !== 0);
    
    // Count inversions
    let inversions = 0;
    for (let i = 0; i < puzzleWithoutEmpty.length; i++) {
      for (let j = i + 1; j < puzzleWithoutEmpty.length; j++) {
        if (puzzleWithoutEmpty[i] > puzzleWithoutEmpty[j]) {
          inversions++;
        }
      }
    }
    
    // Find row of empty tile from the bottom (0-indexed)
    const emptyIndex = puzzle.indexOf(0);
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const rowFromBottom = gridSize - 1 - emptyRow;
    
    // For odd grid size, puzzle is solvable if inversions is even
    if (gridSize % 2 === 1) {
      return inversions % 2 === 0;
    } 
    // For even grid size, puzzle is solvable if
    // (inversions + row of empty from bottom) is odd
    else {
      return (inversions + rowFromBottom) % 2 === 1;
    }
  };
  
  // Attempt to move a tile
  const handleTileClick = (index: number) => {
    if (!gameActive || isSolved) return;
    
    // Check if the tile is adjacent to the empty tile
    if (isAdjacent(index, emptyTileIndex)) {
      // Swap the tile with the empty tile
      const newTiles = [...tiles];
      newTiles[emptyTileIndex] = tiles[index];
      newTiles[index] = 0;
      
      setTiles(newTiles);
      setEmptyTileIndex(index);
      setMoves(moves + 1);
    }
  };
  
  // Check if two tiles are adjacent
  const isAdjacent = (index1: number, index2: number): boolean => {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) || 
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Generate color for tile based on its value
  const getTileColor = (tileValue: number): string => {
    if (tileValue === 0) return 'bg-transparent';
    
    // Calculate color based on tile value for a nice gradient effect
    const hue = (tileValue * 15) % 360;
    return `bg-indigo-600 hover:bg-indigo-700`;
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Puzzle className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-indigo-500 mb-2">Puzzle Slider</h1>
            <p className="text-gray-600">Slide tiles to arrange them in numerical order!</p>
            
            <div className="mt-4 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-500">Moves</div>
                <div className="text-2xl font-bold">{moves}</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">Time</div>
                <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-center mb-6">
              <div className="flex space-x-4">
                <Button
                  onClick={startGame}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Game
                </Button>
              </div>
            </div>
            
            <div className={`aspect-square grid grid-cols-${gridSize} gap-1 mb-6`}>
              {tiles.map((tile, index) => (
                <div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`
                    ${getTileColor(tile)}
                    relative aspect-square flex items-center justify-center
                    text-2xl font-bold rounded-md shadow-sm cursor-pointer
                    transform hover:scale-105 transition-transform
                    ${tile === 0 ? 'border-2 border-dashed border-gray-300' : 'text-white'}
                  `}
                >
                  {tile !== 0 && tile}
                </div>
              ))}
            </div>
            
            {isSolved && (
              <div className="text-center text-green-500 font-bold">
                Puzzle Solved! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleSlider;
