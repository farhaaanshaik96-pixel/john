import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

type Point = { x: number; y: number };

export default function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  
  const directionRef = useRef(direction);
  directionRef.current = direction;

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    onScoreChange(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) return;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused) return;

      const { x, y } = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prevScore => prevScore + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, BASE_SPEED - Math.floor(score / 50) * 10);
    const intervalId = setInterval(moveSnake, speed);
    
    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, isPaused, score, generateFood]);

  return (
    <div className="w-full h-full relative isolate flex items-center justify-center pointer-events-auto">
      
      <div 
        className="game-board grid w-full max-w-[600px] aspect-square relative z-10"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          
          const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`
                w-full h-full p-[1px]
                ${isHead ? 'bg-cyan-400 rounded-md shadow-[0_0_15px_#22d3ee] z-20 relative scale-110' : 
                  isSnake ? 'bg-cyan-500 rounded-md scale-90 opacity-90' : 
                  isFood ? 'bg-red-500 rounded-full blur-[1px] shadow-[0_0_12px_#ef4444] scale-[0.6] z-10 relative' : 
                  'bg-transparent'}
              `}
            />
          );
        })}
      </div>

      {/* Game UI Overlay - Speed/Level */}
      <div className="absolute bottom-6 left-6 flex gap-4 z-20 pointer-events-none">
        <div className="px-4 py-2 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-full text-xs font-mono text-zinc-400 shadow-lg">
          SCORE: <span className="text-white">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="px-4 py-2 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-full text-xs font-mono text-zinc-400 shadow-lg hidden sm:block">
          SPEED: <span className="text-white">{Math.round((BASE_SPEED - Math.max(50, BASE_SPEED - Math.floor(score / 50) * 10)) / 10 + 1)}x</span>
        </div>
      </div>

      {/* Control Overlay - Play/Pause */}
      {(gameOver || isPaused) && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center shadow-2xl"
          >
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-2">
              {gameOver ? 'Game Over' : 'Paused'}
            </h2>
            {gameOver && (
              <p className="text-zinc-500 mb-6 font-mono text-sm">Final Score: <span className="text-cyan-400 font-bold">{score}</span></p>
            )}
            <button
              onClick={gameOver ? resetGame : () => setIsPaused(false)}
              className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {gameOver ? 'PLAY AGAIN' : 'RESUME'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
