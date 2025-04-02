
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RotateCcw, Timer, Trophy } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';

const CARD_SYMBOLS = ['🍕', '🍔', '🍦', '🍩', '🍎', '🍓', '🍑', '🍇', '🌮', '🥑', '🍋', '🍉'];

interface Card {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryMatch: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const initializeGame = () => {
    // Create a deck with pairs of cards
    const symbols = [...CARD_SYMBOLS];
    const allCards: Card[] = [];
    
    // We want 8 pairs (16 cards)
    const selectedSymbols = symbols.slice(0, 8);
    
    // Create pairs
    selectedSymbols.forEach((symbol, index) => {
      // Create two cards with the same symbol
      allCards.push({ id: index * 2, symbol, flipped: false, matched: false });
      allCards.push({ id: index * 2 + 1, symbol, flipped: false, matched: false });
    });
    
    // Shuffle the cards
    const shuffledCards = allCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameStarted(false);
    setGameCompleted(false);
  };

  useEffect(() => {
    initializeGame();
    // Load best score from localStorage
    const savedBestScore = localStorage.getItem('memoryMatchBestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    
    if (gameStarted && !gameCompleted) {
      interval = window.setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  useEffect(() => {
    // Check if the game is completed
    if (matchedPairs === 8 && gameStarted) {
      setGameCompleted(true);
      
      // Update best score
      if (bestScore === null || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem('memoryMatchBestScore', moves.toString());
        toast.success('New best score!', { 
          description: `You completed the game in ${moves} moves!` 
        });
      } else {
        toast.success('Game completed!', { 
          description: `You completed the game in ${moves} moves!` 
        });
      }
    }
  }, [matchedPairs, moves, bestScore, gameStarted]);

  useEffect(() => {
    // If we have 2 cards flipped, check for a match
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      
      if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
        // Match found
        setCards(prevCards => {
          return prevCards.map((card, index) => {
            if (index === firstIndex || index === secondIndex) {
              return { ...card, matched: true };
            }
            return card;
          });
        });
        
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setCards(prevCards => {
            return prevCards.map((card, index) => {
              if (index === firstIndex || index === secondIndex) {
                return { ...card, flipped: false };
              }
              return card;
            });
          });
          
          setFlippedCards([]);
        }, 1000);
      }
      
      setMoves(prevMoves => prevMoves + 1);
    }
  }, [flippedCards, cards]);

  const handleCardClick = (index: number) => {
    // Prevent clicking if already 2 cards are flipped or this card is already flipped/matched
    if (
      flippedCards.length === 2 || 
      cards[index].flipped || 
      cards[index].matched ||
      gameCompleted
    ) {
      return;
    }
    
    // Start the game when first card is clicked
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Flip the card
    setCards(prevCards => {
      return prevCards.map((card, i) => {
        if (i === index) {
          return { ...card, flipped: true };
        }
        return card;
      });
    });
    
    // Add to flipped cards
    setFlippedCards(prev => [...prev, index]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-game-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-game-primary mb-2">Memory Match</h1>
            <p className="text-gray-600">Find all matching pairs of cards</p>
            
            <div className="flex justify-center mt-6 space-x-8">
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center space-x-1 text-xl font-bold text-gray-600 mb-1">
                  <Timer className="h-4 w-4" />
                  <span>Time</span>
                </div>
                <div className="text-2xl font-bold">{formatTime(timer)}</div>
              </div>
              
              <div className="text-center flex flex-col items-center">
                <div className="text-xl font-bold text-gray-600 mb-1">Moves</div>
                <div className="text-2xl font-bold">{moves}</div>
              </div>

              {bestScore !== null && (
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center space-x-1 text-xl font-bold text-game-accent mb-1">
                    <Trophy className="h-4 w-4" />
                    <span>Best</span>
                  </div>
                  <div className="text-2xl font-bold">{bestScore} moves</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-4 gap-3 mx-auto">
              {cards.map((card, index) => (
                <div 
                  key={card.id} 
                  onClick={() => handleCardClick(index)}
                  className={`
                    aspect-square flex items-center justify-center text-3xl md:text-4xl cursor-pointer
                    rounded-lg transition-all duration-300 transform select-none
                    ${card.flipped || card.matched ? 'bg-white rotate-y-0' : 'bg-game-primary rotate-y-180'}
                    ${card.matched ? 'bg-green-100' : ''}
                    ${!card.flipped && !card.matched ? 'hover:bg-game-primary/90' : ''}
                    shadow
                    ${card.flipped && !card.matched ? 'animate-pop' : ''}
                  `}
                >
                  {(card.flipped || card.matched) && card.symbol}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={initializeGame} 
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

export default MemoryMatch;
