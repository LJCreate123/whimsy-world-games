import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calculator } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

type Operator = '+' | '-' | '*' | '/';

interface Problem {
  num1: number;
  num2: number;
  operator: Operator;
  answer: number;
}

const MathBlaster: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
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
    setTimeLeft(30);
    setGameActive(true);
    setGameOver(false);
    setUserAnswer('');
    generateNewProblem();
    toast('Game Started!', {
      description: "Solve math equations as quickly as you can!"
    });
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    toast('Game Over!', {
      description: `Your score: ${score}`
    });
  };

  const generateNewProblem = () => {
    const newProblem = generateProblem(difficulty);
    setProblem(newProblem);
  };

  // Make sure the operator is typed correctly when generating problems
  const generateProblem = (difficulty: number): Problem => {
    const operators: Operator[] = ['+', '-', '*', '/'];
    let num1 = Math.floor(Math.random() * (difficulty * 10)) + 1;
    let num2 = Math.floor(Math.random() * (difficulty * 5)) + 1;
    
    // For division, ensure we get whole number answers
    let operator = operators[Math.floor(Math.random() * (difficulty < 2 ? 2 : operators.length))] as Operator;
    
    if (operator === '/') {
      // Ensure division results in a whole number
      const answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer;
    }
    
    let answer: number;
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        // Ensure no negative answers for beginners
        if (difficulty === 1 && num1 < num2) {
          [num1, num2] = [num2, num1]; // Swap if num1 is smaller
        }
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      case '/':
        answer = num1 / num2;
        break;
    }
    
    return { num1, num2, operator, answer };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive || gameOver || !problem) return;

    const parsedAnswer = parseFloat(userAnswer);
    if (!isNaN(parsedAnswer) && Math.abs(parsedAnswer - problem.answer) < 0.001) {
      setScore((prev) => prev + 1);
      setUserAnswer('');
      generateNewProblem();
      if (score > 5 && difficulty < 4) {
        setDifficulty((prev) => prev + 1);
      }
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
            <Calculator className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-purple-500 mb-2">Math Blaster</h1>
            <p className="text-gray-600">Solve math equations as quickly as you can!</p>
            
            {gameActive && !gameOver && (
              <div className="mt-4 flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-600">Time</div>
                  <div className="text-2xl font-bold">{timeLeft}s</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-500">Score</div>
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
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8"
                >
                  Start Game
                </Button>
              </div>
            )}
            
            {gameActive && !gameOver && problem && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-500 mb-1">Solve the equation</div>
                  <div className="text-3xl font-bold text-purple-700 mb-4">
                    {problem.num1} {problem.operator} {problem.num2} = ?
                  </div>
                  
                  <form onSubmit={handleSubmit} className="mb-4">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xl font-medium"
                      placeholder="Your answer"
                      autoFocus
                    />
                    
                    <Button
                      type="submit"
                      className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Submit
                    </Button>
                  </form>
                </div>
              </div>
            )}
            
            {gameOver && (
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                  <p className="text-lg text-gray-600 mb-4">Your final score: <span className="font-bold text-purple-500">{score}</span></p>
                  <Button
                    onClick={startGame}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-8"
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

export default MathBlaster;
