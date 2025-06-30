import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Position {
  achilles: number;
  tortoise: number;
}

function App() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [positions, setPositions] = useState<Position>({ achilles: 0, tortoise: 100 });
  const [containerWidth, setContainerWidth] = useState(800);
  const [animationTime, setAnimationTime] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        setContainerWidth(trackRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate correct approach (fixed frame of reference)
  const calculateCorrectAnimation = () => {
    const achillesSpeed = 10;
    const tortoiseSpeed = 1;
    const tortoiseHeadStart = 100;

    const catchTime = tortoiseHeadStart / (achillesSpeed - tortoiseSpeed);

    const catchPosition = achillesSpeed * catchTime;

    return { catchTime, catchPosition };
  };

  const startAnimation = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationTime(0);
    setPositions({ achilles: 0, tortoise: 100 });
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationTime(0);
    setPositions({ achilles: 0, tortoise: 100 });
  };

  // Correct animation (continuous, fixed frame of reference)
  useEffect(() => {
    if (isAnimating) {
      const { catchTime } = calculateCorrectAnimation();
      const interval = setInterval(() => {
        setAnimationTime(prev => {
          const newTime = prev + 0.1;

          // Stop at catch time instead of continuing
          if (newTime >= catchTime) {
            setIsAnimating(false);
            return catchTime;
          }

          // Fixed frame of reference calculations
          const achillesPos = 10 * newTime;
          const tortoisePos = 100 + 1 * newTime;

          setPositions({
            achilles: achillesPos,
            tortoise: tortoisePos
          });

          return newTime;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const getPixelPosition = (logicalPosition: number) => {
    const trackWidth = containerWidth - 60;
    const maxPosition = 150;
    return 30 + (logicalPosition / maxPosition) * trackWidth;
  };

  const { catchPosition } = calculateCorrectAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Zeno's Paradox: Achilles and the Tortoise
          </h1>
          <p className="text-lg text-gray-600">
            Watch as Achilles catches and overtakes the tortoise
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isAnimating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isAnimating ? 'Animating...' : 'Start Race'}
          </button>
          <button
            onClick={resetAnimation}
            className="px-6 py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Animation Status */}
        {isAnimating && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center px-4 py-2 bg-blue-100 rounded-full gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-800 font-medium">
                Time: {animationTime.toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        <div ref={trackRef} className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="grid grid-rows-[auto_1fr_auto] gap-6 h-64">

            <div className="flex justify-center">
              <div className="flex gap-6 text-sm text-gray-700 font-medium">
                <span>Achilles: {positions.achilles.toFixed(1)}</span>
                <span>Gap: {(positions.tortoise - positions.achilles).toFixed(1)}</span>
                <span>Tortoise: {positions.tortoise.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4">

              {/* Achilles Lane */}
              <div className="relative h-12 flex items-center">
                <motion.div
                  className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-2xl absolute z-10"
                  animate={{
                    left: `${getPixelPosition(positions.achilles)}px`
                  }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  style={{ transform: 'translateX(-50%)' }}
                >
                  🏃
                </motion.div>
              </div>

              <div className="relative flex items-center px-8">
                <div
                  className="bg-gray-200 rounded-full h-3 flex-1 relative"
                >
                  {/* Gap overlay */}
                  {positions.tortoise > positions.achilles && (
                    <motion.div
                      className="absolute bg-yellow-300 opacity-70 rounded-full h-3 top-0"
                      style={{
                        left: `${getPixelPosition(positions.achilles) - 30}px`,
                        width: `${getPixelPosition(positions.tortoise) - getPixelPosition(positions.achilles)}px`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                </div>
              </div>

              {/* Tortoise Lane */}
              <div className="relative h-12 flex items-center">
                <motion.div
                  className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl absolute z-10"
                  animate={{
                    left: `${getPixelPosition(positions.tortoise)}px`
                  }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  style={{ transform: 'translateX(-50%)' }}
                >
                  🐢
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-1">
              <div className="flex justify-center">
                <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  Catch Point: {catchPosition.toFixed(1)}
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-sm">🏃</div>
              <span className="text-sm font-medium">Achilles</span>
              <span className="text-xs text-gray-500">(Speed: 10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">🐢</div>
              <span className="text-sm font-medium">Tortoise</span>
              <span className="text-xs text-gray-500">(Speed: 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 bg-yellow-300 rounded"></div>
              <span className="text-sm font-medium">Gap</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium">Catch Point</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
