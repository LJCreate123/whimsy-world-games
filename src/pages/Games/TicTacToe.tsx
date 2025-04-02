
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Award, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });

  const checkWinner = (squares: Array<string | null>): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] as string;
      }
    }
    
    if (!squares.includes(null)) {
      return 'Tie';
    }
    
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      
      const newScores = {...scores};
      if (gameWinner === 'Tie') {
        newScores.ties += 1;
        toast.info('Game ended in a tie!');
      } else {
        newScores[gameWinner as 'X' | 'O'] += 1;
        toast.success(`Player ${gameWinner} wins!`);
      }
      setScores(newScores);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderSquare = (index: number) => {
    const value = board[index];
    return (
      <button 
        className={`w-20 h-20 md:w-24 md:h-24 text-4xl font-bold flex items-center justify-center 
          ${value === 'X' ? 'text-game-primary' : 'text-game-secondary'}
          border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200
          ${!value && !winner ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}
          ${board[index] ? 'animate-pop' : ''}
        `}
        onClick={() => handleClick(index)}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-game-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-game-primary mb-2">Tic-Tac-Toe</h1>
            <p className="text-gray-600">Classic game of X's and O's</p>
            
            <div className="flex justify-center mt-6 space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold text-game-primary mb-1">Player X</div>
                <div className="text-3xl font-bold">{scores.X}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-500 mb-1">Ties</div>
                <div className="text-3xl font-bold">{scores.ties}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-game-secondary mb-1">Player O</div>
                <div className="text-3xl font-bold">{scores.O}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            {!winner && (
              <div className="text-center mb-4">
                <span className="text-lg font-semibold">
                  Current Player: <span className={isXNext ? 'text-game-primary' : 'text-game-secondary'}>
                    {isXNext ? 'X' : 'O'}
                  </span>
                </span>
              </div>
            )}

            {winner && (
              <div className="text-center mb-4 py-2 bg-gray-50 rounded-lg flex items-center justify-center">
                {winner === 'Tie' ? (
                  <span className="text-lg font-semibold text-gray-700">Game ended in a tie!</span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-game-accent" />
                    <span className="text-lg font-semibold">
                      Player <span className={winner === 'X' ? 'text-game-primary' : 'text-game-secondary'}>
                        {winner}
                      </span> wins!
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mx-auto w-max">
              {Array(9).fill(null).map((_, index) => (
                <div key={index}>
                  {renderSquare(index)}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={resetGame} 
                className="game-button-accent flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>New Game</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
