
import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import GameCard from '@/components/Layout/GameCard';
import { Dices, Grid3X3, Brain, Gamepad2 } from 'lucide-react';

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
