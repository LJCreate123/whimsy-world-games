
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calculator, Clock, BarChart } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

type Operator = '+' | '-' | '×' | '÷';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Problem {
  num1: number;
  num2: number;
  operator: Operator;
  answer: number;
  options: number[];
}

const MathBlaster: React.FC = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [totalProblems, setTotalProblems] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('mathBlasterHighScore');
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
  
  // Create a new math problem when game starts or after answering
  useEffect(() => {
    if (gameActive && (!currentProblem || selectedAnswer !== null)) {
      const timer = setTimeout(() => {
        setSelectedAnswer(null);
        setAnsweredCorrectly(null);
        setCurrentProblem(generateProblem());
      }, selectedAnswer !== null ? 1000 : 0);
      
      return () => clearTimeout(timer);
    }
  }, [gameActive, currentProblem, selectedAnswer]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswer(null);
    setAnsweredCorrectly(null);
    setTotalProblems(0);
    setCorrectAnswers(0);
    setCurrentProblem(null);
    
    toast('Game Started!', {
      description: `Solve math problems as quickly as you can! Difficulty: ${difficulty}`
    });
  };

  const endGame = () => {
    setGameActive(false);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('mathBlasterHighScore', score.toString());
      toast('New High Score!', {
        description: `You scored ${score} points! Accuracy: ${Math.round((correctAnswers / totalProblems) * 100)}%`
      });
    } else {
      toast('Game Over!', {
        description: `You scored ${score} points! Accuracy: ${totalProblems ? Math.round((correctAnswers / totalProblems) * 100) : 0}%`
      });
    }
  };

  const generateProblem = (): Problem => {
    const operators: Operator[] = ['+', '-', '×', '÷'];
    
    // Select which operators to use based on difficulty
    const availableOperators = difficulty === 'easy' ? ['+', '-'] :
                              difficulty === 'medium' ? ['+', '-', '×'] :
                              operators;
    
    // Select a random operator
    const operator = availableOperators[Math.floor(Math.random() * availableOperators.length)];
    
    // Generate numbers based on difficulty
    let num1: number, num2: number, answer: number;
    
    switch(operator) {
      case '+':
        num1 = getRandomNumber(difficulty, 1, 50);
        num2 = getRandomNumber(difficulty, 1, 50);
        answer = num1 + num2;
        break;
      case '-':
        // Ensure positive result
        num1 = getRandomNumber(difficulty, 1, 50);
        num2 = getRandomNumber(difficulty, 1, Math.min(num1, 50));
        answer = num1 - num2;
        break;
      case '×':
        num1 = getRandomNumber(difficulty, 1, 12);
        num2 = getRandomNumber(difficulty, 1, 10);
        answer = num1 * num2;
        break;
      case '÷':
        // Ensure integer division result
        num2 = getRandomNumber(difficulty, 1, 10);
        answer = getRandomNumber(difficulty, 1, 10);
        num1 = num2 * answer;
        break;
      default:
        // TypeScript safety
        num1 = 0;
        num2 = 0;
        answer = 0;
    }
    
    // Generate answer options
    const options = generateAnswerOptions(answer);
    
    setTotalProblems(prev => prev + 1);
    
    return {
      num1,
      num2,
      operator,
      answer,
      options
    };
  };

  const getRandomNumber = (difficulty: Difficulty, min: number, max: number): number => {
    const range = max - min + 1;
    
    if (difficulty === 'easy') {
      return Math.floor(Math.random() * (range * 0.5)) + min;
    } else if (difficulty === 'medium') {
      return Math.floor(Math.random() * (range * 0.8)) + min;
    } else {
      return Math.floor(Math.random() * range) + min;
    }
  };

  const generateAnswerOptions = (correctAnswer: number): number[] => {
    const options: number[] = [correctAnswer];
    
    // Generate 3 wrong options
    while (options.length < 4) {
      let wrongAnswer: number;
      
      // Different strategies for generating plausible wrong answers
      const strategy = Math.floor(Math.random() * 3);
      
      if (strategy === 0) {
        // Off by a small amount
        wrongAnswer = correctAnswer + (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 5) + 1);
      } else if (strategy === 1) {
        // Off by a larger amount
        wrongAnswer = correctAnswer + (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 10) + 5);
      } else {
        // Completely different answer
        wrongAnswer = Math.floor(Math.random() * 100) + 1;
      }
      
      // Ensure no duplicates and no negative numbers
      if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle the options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  };

  const handleOptionClick = (selectedOption: number) => {
    if (selectedAnswer !== null || !currentProblem) return;
    
    const isCorrect = selectedOption === currentProblem.answer;
    setSelectedAnswer(selectedOption);
    setAnsweredCorrectly(isCorrect);
    
    if (isCorrect) {
      // Calculate points based on difficulty and current streak
      const basePoints = difficulty === 'easy' ? 1 :
                        difficulty === 'medium' ? 2 : 3;
      
      // Bonus points for streaks
      const streakBonus = Math.floor(streak / 3);
      const points = basePoints + streakBonus;
      
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));
      setCorrectAnswers(prev => prev + 1);
      
      // Add time bonus for streak milestones
      if ((streak + 1) % 5 === 0) {
        const timeBonus = 3;
        setTimeLeft(prev => Math.min(prev + timeBonus, 60));
        toast.success(`Streak bonus! +${timeBonus} seconds`);
      }
    } else {
      setStreak(0);
    }
  };

  const getOperatorDisplay = (operator: Operator): string => {
    return operator;
  };

  const getButtonClass = (option: number): string => {
    if (selectedAnswer === null) {
      return 'bg-white border-2 border-purple-300 text-purple-800 hover:bg-purple-50';
    }
    
    if (option === currentProblem?.answer) {
      return 'bg-green-100 border-2 border-green-500 text-green-800';
    }
    
    if (option === selectedAnswer) {
      return 'bg-red-100 border-2 border-red-500 text-red-800';
    }
    
    return 'bg-white border-2 border-gray-200 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Calculator className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-purple-500 mb-2">Math Blaster</h1>
            <p className="text-gray-600">Solve math problems quickly to score points!</p>
            
            {gameActive ? (
              <div className="mt-4 flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-xl font-bold flex items-center justify-center text-red-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Time</span>
                  </div>
                  <div className="text-2xl font-bold">{timeLeft}s</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-500">Score</div>
                  <div className="text-2xl font-bold">{score}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold flex items-center justify-center text-blue-500">
                    <BarChart className="h-4 w-4 mr-1" />
                    <span>Streak</span>
                  </div>
                  <div className="text-2xl font-bold">{streak}</div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="text-xl font-bold text-purple-700">High Score: {highScore}</div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            {!gameActive ? (
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Select Difficulty</h3>
                
                <div className="flex justify-center space-x-4 mb-6">
                  <Button
                    onClick={() => setDifficulty('easy')}
                    className={`px-6 ${difficulty === 'easy' ? 'bg-green-500' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Easy
                  </Button>
                  <Button
                    onClick={() => setDifficulty('medium')}
                    className={`px-6 ${difficulty === 'medium' ? 'bg-yellow-500' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Medium
                  </Button>
                  <Button
                    onClick={() => setDifficulty('hard')}
                    className={`px-6 ${difficulty === 'hard' ? 'bg-red-500' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Hard
                  </Button>
                </div>
                
                <Button
                  onClick={startGame}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8"
                >
                  Start Game
                </Button>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg text-left">
                  <h3 className="font-bold text-lg mb-2">Game Rules</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Solve math problems before time runs out</li>
                    <li>Easy: Addition & Subtraction</li>
                    <li>Medium: Adds Multiplication</li>
                    <li>Hard: Adds Division</li>
                    <li>Build a streak for bonus points and extra time!</li>
                  </ul>
                </div>
              </div>
            ) : currentProblem ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-800">
                    {currentProblem.num1} {getOperatorDisplay(currentProblem.operator)} {currentProblem.num2} = ?
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {currentProblem.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      disabled={selectedAnswer !== null}
                      className={`
                        py-4 px-2 rounded-lg text-xl font-bold transition-colors
                        ${getButtonClass(option)}
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 h-6">
                  {answeredCorrectly === true && (
                    <div className="text-green-500 font-bold animate-fade-in">
                      Correct!
                    </div>
                  )}
                  {answeredCorrectly === false && (
                    <div className="text-red-500 font-bold animate-fade-in">
                      Wrong! The answer is {currentProblem.answer}
                    </div>
                  )}
                </div>
                
                {totalProblems > 0 && (
                  <div className="mt-4 text-xs text-gray-500">
                    Accuracy: {Math.round((correctAnswers / totalProblems) * 100)}%
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-pulse">Loading problem...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathBlaster;
