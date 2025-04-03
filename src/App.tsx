
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TicTacToe from "./pages/Games/TicTacToe";
import MemoryMatch from "./pages/Games/MemoryMatch";
import WhacAMole from "./pages/Games/WhacAMole";
import WordScramble from "./pages/Games/WordScramble";
import SimonSays from "./pages/Games/SimonSays";
import SnakeGame from "./pages/Games/SnakeGame";
import PuzzleSlider from "./pages/Games/PuzzleSlider";
import ColorMatch from "./pages/Games/ColorMatch";
import QuizChallenge from "./pages/Games/QuizChallenge";
import BalloonPop from "./pages/Games/BalloonPop";
import MathBlaster from "./pages/Games/MathBlaster";
import ReactionTest from "./pages/Games/ReactionTest";
import MazeSolver from "./pages/Games/MazeSolver";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
          <Route path="/memory-match" element={<MemoryMatch />} />
          <Route path="/whac-a-mole" element={<WhacAMole />} />
          <Route path="/word-scramble" element={<WordScramble />} />
          <Route path="/simon-says" element={<SimonSays />} />
          <Route path="/snake-game" element={<SnakeGame />} />
          <Route path="/puzzle-slider" element={<PuzzleSlider />} />
          <Route path="/color-match" element={<ColorMatch />} />
          <Route path="/quiz-challenge" element={<QuizChallenge />} />
          <Route path="/balloon-pop" element={<BalloonPop />} />
          <Route path="/math-blaster" element={<MathBlaster />} />
          <Route path="/reaction-test" element={<ReactionTest />} />
          <Route path="/maze-solver" element={<MazeSolver />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
