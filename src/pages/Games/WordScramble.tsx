import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BookOpen, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

const WordScramble: React.FC = () => {
  const wordList = [
    "PUZZLE", "GAMING", "PLAYER", "ARCADE", "LEVEL", "SCORE", "BONUS",
    "JOYSTICK", "CONSOLE", "VICTORY", "CHALLENGE", "WIZARD", "QUEST",
    "ADVENTURE", "CHAMPION", "TROPHY", "MONSTER", "BATTLE", "MAGIC", "POWER"
  ];
  
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameActive && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameActive, gameOver]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setGameOver(false);
    setUserInput("");
    getNewWord();
    toast('Game Started!', {
      description: "Unscramble as many words as you can!"
    });
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    toast('Game Over!', {
      description: `Your score: ${score}`
    });
  };

  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const word = wordList[randomIndex];
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
  };

  const scrambleWord = (word: string) => {
    const wordArr = word.split('');
    let scrambled;
    // Keep scrambling until different from original
    do {
      for (let i = wordArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordArr[i], wordArr[j]] = [wordArr[j], wordArr[i]];
      }
      scrambled = wordArr.join('');
    } while (scrambled === word);
    
    return scrambled;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive || gameOver) return;

    if (userInput.toUpperCase() === currentWord) {
      setScore((prev) => prev + 1);
      setUserInput("");
      getNewWord();
      toast.success('Correct!');
    } else {
      toast.error('Try again!');
    }
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-blue-500 mb-2">Word Scramble</h1>
            <p className="text-gray-600">Unscramble the letters to form the correct word!</p>
            
            {gameActive && !gameOver && (
              <div className="mt-4 flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-600">Time</div>
                  <div className="text-2xl font-bold">{timeLeft}s</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-500">Score</div>
                  <div className="text-2xl font-bold">{score}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            {!gameActive && !gameOver && (
              <div className="text-center mb-6">
                <Button
                  onClick={startGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                >
                  Start Game
                </Button>
              </div>
            )}
            
            {gameActive && !gameOver && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-500 mb-1">Scrambled Word</div>
                  <div className="flex justify-center mb-4">
                    {scrambledWord.split('').map((letter, index) => (
                      <div 
                        key={index} 
                        className="w-10 h-12 mx-1 flex items-center justify-center bg-blue-100 rounded-md font-bold text-xl text-blue-700"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleSubmit} className="mb-4">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-medium"
                      placeholder="Type your answer"
                      autoFocus
                    />
                    
                    <div className="mt-4 flex space-x-3">
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Submit
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={getNewWord}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Skip
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {gameOver && (
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                  <p className="text-lg text-gray-600 mb-4">Your final score: <span className="font-bold text-blue-500">{score}</span></p>
                  <Button
                    onClick={startGame}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                  >
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordScramble;
