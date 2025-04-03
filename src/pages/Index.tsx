import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import GameCard from '@/components/Layout/GameCard';
import { 
  Dices, Grid3X3, Brain, Gamepad2, BookOpen, Music, 
  Rabbit, Puzzle, Palette, HelpCircle, Bomb, Calculator,
  Zap, Map
} from 'lucide-react';

const Index = () => {
  const games = [
    {
      id: 'tic-tac-toe',
      title: 'Tic-Tac-Toe',
      description: 'Classic game of X\'s and O\'s. Challenge yourself or play with a friend!',
      icon: <Grid3X3 className="h-12 w-12" />,
      path: '/tictactoe',
      color: 'bg-game-primary'
    },
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Test your memory by finding matching pairs of cards before time runs out.',
      icon: <Brain className="h-12 w-12" />,
      path: '/memory-match',
      color: 'bg-game-secondary'
    },
    {
      id: 'whac-a-mole',
      title: 'Whac-A-Mole',
      description: 'Hit the moles as they appear to score points in this arcade classic!',
      icon: <Dices className="h-12 w-12" />,
      path: '/whac-a-mole',
      color: 'bg-game-accent'
    },
    {
      id: 'word-scramble',
      title: 'Word Scramble',
      description: 'Unscramble letters to form words as fast as you can!',
      icon: <BookOpen className="h-12 w-12" />,
      path: '/word-scramble',
      color: 'bg-blue-500'
    },
    {
      id: 'simon-says',
      title: 'Simon Says',
      description: 'Test your memory by repeating the sequence of colors and sounds.',
      icon: <Music className="h-12 w-12" />,
      path: '/simon-says',
      color: 'bg-green-500'
    },
    {
      id: 'snake-game',
      title: 'Snake Game',
      description: 'Control a growing snake to eat food without hitting walls or yourself!',
      icon: <Rabbit className="h-12 w-12" />,
      path: '/snake-game',
      color: 'bg-emerald-500'
    },
    {
      id: 'puzzle-slider',
      title: 'Puzzle Slider',
      description: 'Slide tiles to arrange them in the correct order to complete the image.',
      icon: <Puzzle className="h-12 w-12" />,
      path: '/puzzle-slider',
      color: 'bg-indigo-500'
    },
    {
      id: 'color-match',
      title: 'Color Match',
      description: 'Match colors to their written names, but watch out for the tricky ones!',
      icon: <Palette className="h-12 w-12" />,
      path: '/color-match',
      color: 'bg-pink-500'
    },
    {
      id: 'quiz-challenge',
      title: 'Quiz Challenge',
      description: 'Test your knowledge across various categories with fun trivia questions.',
      icon: <HelpCircle className="h-12 w-12" />,
      path: '/quiz-challenge',
      color: 'bg-yellow-500'
    },
    {
      id: 'balloon-pop',
      title: 'Balloon Pop',
      description: 'Pop balloons as they float up before they escape!',
      icon: <Bomb className="h-12 w-12" />,
      path: '/balloon-pop',
      color: 'bg-red-500'
    },
    {
      id: 'math-blaster',
      title: 'Math Blaster',
      description: 'Solve math equations as quickly as you can to earn points!',
      icon: <Calculator className="h-12 w-12" />,
      path: '/math-blaster',
      color: 'bg-purple-500'
    },
    {
      id: 'reaction-test',
      title: 'Reaction Test',
      description: 'Test your reflexes by clicking targets as fast as possible!',
      icon: <Zap className="h-12 w-12" />,
      path: '/reaction-test',
      color: 'bg-orange-500'
    },
    {
      id: 'maze-solver',
      title: 'Maze Solver',
      description: 'Navigate through increasingly difficult mazes against the clock!',
      icon: <Map className="h-12 w-12" />,
      path: '/maze-solver',
      color: 'bg-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-game-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16 mt-8">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-game-primary animate-float" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-game-primary mb-4">
            Whimsy World Games
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Welcome to a world of fun, immersive mini-games that will challenge your skills and entertain you for hours!
          </p>
        </div>

        {/* Featured Games */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Games</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <div key={game.id} className="animate-scale-in">
                <GameCard
                  id={game.id}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  path={game.path}
                  color={game.color}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* How to Play */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="bg-game-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-game-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Choose a Game</h3>
              <p className="text-gray-600">
                Browse our collection and select a game that catches your interest.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-game-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-game-secondary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Learn the Rules</h3>
              <p className="text-gray-600">
                Each game has simple instructions to get you started quickly.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-game-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-game-accent">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Have Fun!</h3>
              <p className="text-gray-600">
                Play, compete for high scores, and challenge yourself to improve!
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center py-6 text-gray-500 text-sm">
          <p>© 2023 Whimsy World Games. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
