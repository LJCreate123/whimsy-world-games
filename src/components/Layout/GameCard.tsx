
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
}

const GameCard: React.FC<GameCardProps> = ({ 
  id, 
  title, 
  description, 
  icon, 
  path,
  color = 'bg-game-primary'
}) => {
  return (
    <Card className="game-card h-full flex flex-col group">
      <CardHeader className={`${color} text-white p-6`}>
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
        </div>
        <CardTitle className="text-center text-xl font-bold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="py-4 flex-grow">
        <p className="text-gray-600 text-center">{description}</p>
      </CardContent>

      <CardFooter className="pt-0 pb-6 flex justify-center">
        <Button asChild className="game-button-primary rounded-full px-8">
          <Link to={path}>Play Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
