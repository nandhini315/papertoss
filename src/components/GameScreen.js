import { useState, useEffect, useRef } from 'react';
import './GameScreen.css';

export default function PaperTossGame() {
  // Game state
  const [gameState, setGameState] = useState('ready'); // 'ready', 'throwing', 'scored', 'missed'
  const [score, setScore] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [paperPosition, setPaperPosition] = useState({ x: 200, y: 500 });
  const [trashPosition, setTrashPosition] = useState({ x: 200, y: 100 });
  const [windForce, setWindForce] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const gameAreaRef = useRef(null);
  
  // Animation frame reference
  const animationRef = useRef(null);
  
  // Physics variables
  const gravity = 0.5;
  const friction = 0.98;
  const paperRadius = 20;
  const trashWidth = 80;
  const trashHeight = 100;
  
  // Generate new wind force
  useEffect(() => {
    generateWind();
  }, [difficulty, gameState]);
  
  const generateWind = () => {
    let wind = 0;
    switch (difficulty) {
      case 'easy':
        wind = Math.random() * 2 - 1; // -1 to 1
        break;
      case 'medium':
        wind = Math.random() * 4 - 2; // -2 to 2
        break;
      case 'hard':
        wind = Math.random() * 6 - 3; // -3 to 3
        break;
      default:
        wind = Math.random() * 2 - 1;
        break;
    }
    setWindForce(wind);
  };

  // Reset game
  const resetGame = () => {
    setPaperPosition({ x: 200, y: 500 });
    setGameState('ready');
    cancelAnimationFrame(animationRef.current);
  };

  // Handle mouse down
  const handleMouseDown = (e) => {
    if (gameState !== 'ready') return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    setDragEnd({ x, y }); // Initialize the end point to start position
    setIsMouseDown(true);
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isMouseDown || gameState !== 'ready') return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragEnd({ x, y });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isMouseDown || gameState !== 'ready') return;
    
    setIsMouseDown(false);
    
    // Calculate velocity based on drag distance and direction
    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    
    // Only throw if there was significant movement
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      // Start throwing animation
      throwPaper(dx * 0.1, dy * 0.1);
    }
  };

  // Throw paper
  const throwPaper = (vx, vy) => {
    setGameState('throwing');
    
    let velocity = { x: vx, y: vy };
    let position = { ...paperPosition };
    
    const animateThrow = () => {
      // Apply physics
      velocity.x = velocity.x * friction + windForce * 0.1;
      velocity.y = velocity.y * friction + gravity;
      
      position.x += velocity.x;
      position.y -= velocity.y;
      
      setPaperPosition({ ...position });
      
      // Check if paper is in trash
      if (
        position.x > trashPosition.x - trashWidth/2 &&
        position.x < trashPosition.x + trashWidth/2 &&
        position.y > trashPosition.y - trashHeight/2 &&
        position.y < trashPosition.y + trashHeight/2
      ) {
        setScore(prevScore => prevScore + 1);
        setGameState('scored');
        setTimeout(resetGame, 1500);
        return;
      }
      
      // Check if paper is off-screen
      if (
        position.x < 0 ||
        position.x > 400 ||
        position.y < 0 ||
        position.y > 600
      ) {
        setGameState('missed');
        setTimeout(resetGame, 1500);
        return;
      }
      
      animationRef.current = requestAnimationFrame(animateThrow);
    };
    
    animateThrow();
  };
  
  // Change difficulty
  const changeDifficulty = (level) => {
    setDifficulty(level);
    resetGame();
  };

  // Calculate wind arrow width proportional to force
  const windArrowWidth = Math.min(Math.abs(windForce) * 10, 40);

  return (
    <div className="paper-toss-container">
      <h1 className="game-title">Paper Toss Game</h1>
      
      <div className="game-info">
        <div className="score-display">
          Score: {score}
        </div>
        <div className="wind-indicator">
          Wind: 
          <div className="wind-arrow" style={{ color: Math.abs(windForce) > 2 ? '#e53e3e' : '#4299e1' }}>
            {windForce !== 0 && (
              <div className="arrow-container">
                {windForce < 0 && (
                  <svg width={windArrowWidth} height="20" viewBox="0 0 20 10">
                    <line x1="0" y1="5" x2={windArrowWidth} y2="5" stroke="currentColor" strokeWidth="2" />
                    <polygon points={`0,5 5,0 5,10`} fill="currentColor" />
                  </svg>
                )}
                {windForce > 0 && (
                  <svg width={windArrowWidth} height="20" viewBox="0 0 20 10">
                    <line x1="0" y1="5" x2={windArrowWidth} y2="5" stroke="currentColor" strokeWidth="2" />
                    <polygon points={`${windArrowWidth},5 ${windArrowWidth-5},0 ${windArrowWidth-5},10`} fill="currentColor" />
                  </svg>
                )}
              </div>
            )}
            {windForce === 0 && <span className="wind-calm">Calm</span>}
          </div>
        </div>
      </div>
      
      <div className="difficulty-controls">
        <button 
          className={`difficulty-btn ${difficulty === 'easy' ? 'active easy' : ''}`}
          onClick={() => changeDifficulty('easy')}
        >
          Easy
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'medium' ? 'active medium' : ''}`}
          onClick={() => changeDifficulty('medium')}
        >
          Medium
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'hard' ? 'active hard' : ''}`}
          onClick={() => changeDifficulty('hard')}
        >
          Hard
        </button>
      </div>
      
      <div 
        ref={gameAreaRef}
        className="game-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchEnd={handleMouseUp}
      >
        {/* Trash can */}
        <div 
          className="trash-can"
          style={{
            width: `${trashWidth}px`,
            height: `${trashHeight}px`,
            left: `${trashPosition.x - trashWidth/2}px`,
            top: `${trashPosition.y - trashHeight/2}px`
          }}
        >
          <div className="trash-lid"></div>
        </div>
        
        {/* Paper ball */}
        <div 
          className={`paper-ball ${gameState === 'scored' ? 'scored-animation' : gameState === 'missed' ? 'missed-animation' : ''}`}
          style={{
            width: `${paperRadius * 2}px`,
            height: `${paperRadius * 2}px`,
            left: `${paperPosition.x - paperRadius}px`,
            top: `${paperPosition.y - paperRadius}px`
          }}
        >
          <div className="paper-highlight"></div>
        </div>
        
        {/* Drag line */}
        {isMouseDown && (
          <svg width="100%" height="100%" className="drag-svg">
            <line
              x1={dragStart.x}
              y1={dragStart.y}
              x2={dragEnd.x}
              y2={dragEnd.y}
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="2"
              className="drag-line"
            />
            <circle cx={dragEnd.x} cy={dragEnd.y} r="5" fill="rgba(0,0,0,0.6)" />
          </svg>
        )}
        
        {/* Game messages */}
        {gameState === 'scored' && (
          <div className="message-container">
            <div className="message scored">
              Nice Shot! +1
            </div>
          </div>
        )}
        
        {gameState === 'missed' && (
          <div className="message-container">
            <div className="message missed">
              Missed!
            </div>
          </div>
        )}
        
        {gameState === 'ready' && (
          <div className="instruction">
            {isMouseDown ? "Release to throw!" : "Drag and release to throw the paper"}
          </div>
        )}
      </div>
      
      {/* <div className="game-tip">
        Account for the wind direction and strength when aiming. The stronger the wind, the more it will affect your throw!
      </div> */}
    </div>
  );
}