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

    // Using physics: time when Achilles catches tortoise
    const catchTime = tortoiseHeadStart / (achillesSpeed - tortoiseSpeed);
    const catchPosition = achillesSpeed * catchTime;

    // Fixed frame of reference - always measured from starting line
    const totalTime = catchTime + 2; // Show a bit after catching

    return { catchTime, catchPosition, totalTime };
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
      const { catchTime, totalTime } = calculateCorrectAnimation();
      const interval = setInterval(() => {
        setAnimationTime(prev => {
          const newTime = prev + 0.1;

          if (newTime >= totalTime) {
            setIsAnimating(false);
            return totalTime;
          }

          // Fixed frame of reference calculations
          const achillesPos = Math.min(10 * newTime, 10 * catchTime + 10 * (newTime - catchTime));
          const tortoisePos = Math.min(100 + 1 * newTime, 100 + 1 * catchTime);

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
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-blue-800 font-medium">
                Time: {animationTime.toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* Race Track */}
        <div ref={trackRef} className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="relative w-full" style={{ height: '260px' }}>
            {/* Track */}
            <div
              className="absolute top-20 bg-gray-200 rounded-full"
              style={{
                height: '8px',
                left: '30px',
                right: '30px',
                width: 'calc(100% - 60px)'
              }}
            />

            {/* Distance markers */}
            {[0, 25, 50, 75, 100, 125, 150].map(distance => (
              <div
                key={distance}
                className="absolute top-16 text-xs text-gray-500 text-center"
                style={{
                  left: `${getPixelPosition(distance)}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                {distance}
              </div>
            ))}

            {/* Starting line indicator */}
            <div
              className="absolute top-12 w-0.5 h-12 bg-gray-400"
              style={{ left: `${getPixelPosition(0)}px` }}
            />
            <div
              className="absolute top-6 text-xs text-gray-600 text-center"
              style={{
                left: `${getPixelPosition(0)}px`,
                transform: 'translateX(-50%)'
              }}
            >
              Start Line
            </div>

            {/* Catch point indicator */}
            <div
              className="absolute top-12 w-0.5 h-12 bg-green-500"
              style={{ left: `${getPixelPosition(catchPosition)}px` }}
            />
            <div
              className="absolute top-6 text-xs text-green-600 text-center font-medium"
              style={{
                left: `${getPixelPosition(catchPosition)}px`,
                transform: 'translateX(-50%)'
              }}
            >
              Catch Point
            </div>

            {/* Achilles */}
            <motion.div
              className="absolute top-8 text-4xl flex items-center justify-center"
              animate={{ x: getPixelPosition(positions.achilles) }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              🏃
            </motion.div>

            {/* Tortoise */}
            <motion.div
              className="absolute top-32 text-4xl flex items-center justify-center"
              animate={{ x: getPixelPosition(positions.tortoise) }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              🐢
            </motion.div>

            {/* Gap visualization */}
            {positions.tortoise > positions.achilles && (
              <motion.div
                className="absolute top-48 bg-yellow-300 opacity-60 rounded"
                style={{
                  left: `${getPixelPosition(positions.achilles)}px`,
                  width: `${Math.max(getPixelPosition(positions.tortoise) - getPixelPosition(positions.achilles), 2)}px`,
                  height: '6px'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Gap distance label */}
            {positions.tortoise > positions.achilles && (
              <motion.div
                className="absolute top-56 text-xs text-gray-600 font-medium"
                style={{
                  left: `${getPixelPosition((positions.achilles + positions.tortoise) / 2)}px`,
                  transform: 'translateX(-50%)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Gap: {(positions.tortoise - positions.achilles).toFixed(1)}
              </motion.div>
            )}

            {/* Overtake indicator */}
            {positions.achilles > positions.tortoise && (
              <motion.div
                className="absolute top-56 text-sm text-green-600 font-bold"
                style={{
                  left: `${getPixelPosition(positions.achilles)}px`,
                  transform: 'translateX(-50%)'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                🎉 Achilles Wins!
              </motion.div>
            )}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏃</span>
              <span className="text-sm font-medium">Achilles (Speed: 10)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🐢</span>
              <span className="text-sm font-medium">Tortoise (Speed: 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-yellow-300 rounded"></div>
              <span className="text-sm font-medium">Gap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
