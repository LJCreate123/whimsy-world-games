
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { HelpCircle, Clock, Award } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'general' | 'science' | 'history' | 'geography' | 'entertainment';
}

const QuizChallenge: React.FC = () => {
  // Sample quiz questions across different categories
  const questionsData: Question[] = [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      category: 'geography'
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Jupiter', 'Venus', 'Mars', 'Saturn'],
      correctAnswer: 2,
      category: 'science'
    },
    {
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
      correctAnswer: 1,
      category: 'history'
    },
    {
      question: 'What is the chemical symbol for gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctAnswer: 2,
      category: 'science'
    },
    {
      question: 'Which movie features a character named Jack Dawson?',
      options: ['The Departed', 'Inception', 'Titanic', 'Shutter Island'],
      correctAnswer: 2,
      category: 'entertainment'
    },
    {
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 3,
      category: 'geography'
    },
    {
      question: 'Who wrote "Romeo and Juliet"?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correctAnswer: 1,
      category: 'history'
    },
    {
      question: 'What is the smallest prime number?',
      options: ['0', '1', '2', '3'],
      correctAnswer: 2,
      category: 'general'
    },
    {
      question: 'Which element has the chemical symbol "O"?',
      options: ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],
      correctAnswer: 1,
      category: 'science'
    },
    {
      question: 'Who directed the movie "Jurassic Park"?',
      options: ['James Cameron', 'Steven Spielberg', 'Christopher Nolan', 'George Lucas'],
      correctAnswer: 1,
      category: 'entertainment'
    },
    {
      question: 'Which of these is NOT a programming language?',
      options: ['Java', 'Python', 'Cougar', 'Ruby'],
      correctAnswer: 2,
      category: 'general'
    },
    {
      question: 'What year did World War II end?',
      options: ['1943', '1945', '1947', '1950'],
      correctAnswer: 1,
      category: 'history'
    },
    {
      question: 'Which country is home to the Great Barrier Reef?',
      options: ['Brazil', 'Australia', 'Thailand', 'Mexico'],
      correctAnswer: 1,
      category: 'geography'
    },
    {
      question: 'What is the capital of Japan?',
      options: ['Seoul', 'Beijing', 'Shanghai', 'Tokyo'],
      correctAnswer: 3,
      category: 'geography'
    },
    {
      question: 'Which superhero is known as the "Man of Steel"?',
      options: ['Batman', 'Superman', 'Iron Man', 'Captain America'],
      correctAnswer: 1,
      category: 'entertainment'
    }
  ];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'science' | 'history' | 'geography' | 'entertainment'>('all');
  
  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('quizChallengeHighScore');
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
    // Filter questions by category if needed
    let gameQuestions = [...questionsData];
    if (selectedCategory !== 'all') {
      gameQuestions = questionsData.filter(q => q.category === selectedCategory);
    }
    
    // Shuffle questions
    for (let i = gameQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameQuestions[i], gameQuestions[j]] = [gameQuestions[j], gameQuestions[i]];
    }
    
    setQuestions(gameQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setGameActive(true);
    setTimeLeft(60);
    
    toast('Quiz Started!', {
      description: 'Answer as many questions as you can!'
    });
  };

  const endGame = () => {
    setGameActive(false);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('quizChallengeHighScore', score.toString());
      toast('New High Score!', {
        description: `You scored ${score} points!`
      });
    } else {
      toast('Quiz Complete!', {
        description: `You scored ${score} points!`
      });
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    
    setSelectedOption(optionIndex);
    
    // Check if the answer is correct
    if (optionIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    // Move to the next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        endGame();
      }
    }, 1000);
  };

  // Get current category color
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'science': return 'bg-blue-500 text-white';
      case 'history': return 'bg-amber-500 text-white';
      case 'geography': return 'bg-emerald-500 text-white';
      case 'entertainment': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  // Get option button styles based on selection and correctness
  const getOptionClasses = (index: number) => {
    if (selectedOption === null) {
      return 'bg-white hover:bg-yellow-50 text-gray-800 border border-gray-300';
    }
    
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    
    if (index === correctAnswer) {
      return 'bg-green-100 border-green-500 border-2 text-green-800';
    }
    
    if (index === selectedOption) {
      return 'bg-red-100 border-red-500 border-2 text-red-800';
    }
    
    return 'bg-white text-gray-400 border border-gray-200';
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <HelpCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-yellow-500 mb-2">Quiz Challenge</h1>
            <p className="text-gray-600">Test your knowledge with fun trivia questions!</p>
            
            {gameActive ? (
              <div className="mt-4 flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-xl font-bold text-red-500 flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time
                  </div>
                  <div className="text-2xl font-bold">{timeLeft}s</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-500">Score</div>
                  <div className="text-2xl font-bold">{score}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold flex items-center justify-center text-yellow-700">
                    <Award className="h-4 w-4 mr-1" />
                    Best
                  </div>
                  <div className="text-2xl font-bold">{highScore}</div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="text-center mb-4">
                  <label className="text-lg font-semibold text-gray-700">Select Category:</label>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <Button 
                      onClick={() => setSelectedCategory('all')}
                      className={selectedCategory === 'all' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    >
                      All
                    </Button>
                    <Button 
                      onClick={() => setSelectedCategory('general')}
                      className={selectedCategory === 'general' ? 'bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    >
                      General
                    </Button>
                    <Button 
                      onClick={() => setSelectedCategory('science')}
                      className={selectedCategory === 'science' ? 'bg-blue-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    >
                      Science
                    </Button>
                    <Button 
                      onClick={() => setSelectedCategory('history')}
                      className={selectedCategory === 'history' ? 'bg-amber-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    >
                      History
                    </Button>
                    <Button 
                      onClick={() => setSelectedCategory('geography')}
                      className={selectedCategory === 'geography' ? 'bg-emerald-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    >
                      Geography
                    </Button>
                    <Button 
                      onClick={() => setSelectedCategory('entertainment')}
                      className={selectedCategory === 'entertainment' ? 'bg-purple-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    >
                      Entertainment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            {!gameActive ? (
              <div className="text-center">
                <Button
                  onClick={startGame}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8"
                >
                  Start Quiz
                </Button>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg text-left">
                  <h3 className="font-bold text-lg mb-2">How to Play</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Answer as many questions as you can before time runs out.</li>
                    <li>Each correct answer earns you 1 point.</li>
                    <li>You have 60 seconds to answer as many questions as possible.</li>
                    <li>Choose a specific category or play with all categories mixed!</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center">
                {questions.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs text-right">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    
                    <div className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wide">
                      <span className={`px-3 py-1 rounded-full ${getCategoryColor(questions[currentQuestionIndex].category)}`}>
                        {questions[currentQuestionIndex].category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-6">
                      {questions[currentQuestionIndex].question}
                    </h3>
                    
                    <div className="space-y-3">
                      {questions[currentQuestionIndex].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionSelect(index)}
                          disabled={selectedOption !== null}
                          className={`
                            w-full py-3 px-4 rounded-lg text-left transition-colors
                            ${getOptionClasses(index)}
                          `}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizChallenge;
