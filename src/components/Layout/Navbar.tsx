
import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Gamepad2 className="h-8 w-8 text-game-primary animate-bounce-slight" />
          <span className="text-xl font-bold text-game-primary">Whimsy World Games</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-game-primary transition-colors">
            <Home className="h-5 w-5" />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
