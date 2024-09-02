import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { BsFillPlayFill, BsPersonPlus, BsPlusCircle, BsXCircle } from "react-icons/bs";
import { ThemedCard }  from './components/ThemedCard';
import { ThemedButton }  from './components/ThemedButton';
import {ThemedInput } from './components/ThemedInput';
import { useTheme } from './contexts/ThemeContext';

// Memoized Timer Component
const Timer = React.memo(({ timeLeft }) => {
  const { theme } = useTheme();
  return <div className={`text-base leading-none ${theme.textSecondary} font-semibold`}>זמן נותר: {timeLeft} שניות</div>;
});

// Memoized Question Component
const Question = React.memo(({ question, onAnswer, isCurrentPlayer, timeLeft }) => {
  const { theme } = useTheme();
  return (
    <>
      <div className={`text-lg leading-6 font-bold ${theme.text} flex flex-col justify-center items-center h-[70px]`}>{question?.text}</div>
      {question?.answers.map((answer, index) => (
        <ThemedButton
          key={index}
          onClick={() => onAnswer(index)}
          disabled={!isCurrentPlayer || timeLeft === 0}
          className="block w-full mb-4"
        >
          {answer}
        </ThemedButton>
      ))}
    </>
  );
});

// Memoized ScoreBoard Component
const ScoreBoard = React.memo(({ players }) => {
  const { theme } = useTheme();
  return (
    <div className={`mt-2 border-t pt-2 w-full h-[40px]`}>
      <h3 className={`text-base font-semibold leading-7 ${theme.text} mb-2 relative mx-auto ${theme.background} top-[-23px] w-[53px]`}>ניקוד</h3>
      <div className="flex flex-wrap justify-between relative top-[-34px]">
        {players.map((player, index) => (
          <div key={index} className="text-center mb-2 w-1/2 sm:w-auto">
            <div className={`text-sm ${theme.textSecondary}`}>{player.name}</div>
            <div className={`text-[1.5rem] leading-none ${theme.text} font-bold`}>{player.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Memoized GamePlay Component
const GamePlay = React.memo(({ 
  players, 
  question, 
  currentPlayer, 
  timeLeft, 
  answerQuestion, 
  socket 
}) => {
  const { theme } = useTheme();
  const isCurrentPlayer = currentPlayer?.id === socket?.id;

  return (
    <div className="flex justify-center items-start min-h-screen w-full mx-2">
      <ThemedCard>
        <div className="flex justify-center items-center mb-4">          
          <div className="">
            <h2 className={`text-xl font-bold leading-7 ${theme.text}`}>טריוויה רשת</h2>
            <p className={`text-sm leading-6 ${theme.textSecondary}`}>תור: {currentPlayer?.name}</p>
          </div>
        </div>
        <Timer timeLeft={timeLeft} />
        <Question 
          question={question} 
          onAnswer={answerQuestion} 
          isCurrentPlayer={isCurrentPlayer}
          timeLeft={timeLeft} 
        />
        <ScoreBoard players={players} />
      </ThemedCard>
    </div>
  );
});

// Memoized Lobby Component
const Lobby = React.memo(({ 
  playerName, 
  setPlayerName, 
  createGame, 
  gameCode, 
  setGameCode, 
  joinGame,
  isCreatingGame,
  createGameError
}) => {
  const { theme } = useTheme();
  return (
    <div className="flex justify-center items-start min-h-screen w-full mx-2">
      <ThemedCard>
        <div className="flex justify-center mb-4">          
          <div className="m-0">
            <h2 className={`text-lg font-bold leading-7 ${theme.titleText}`}>לובי משחק רשת טריוויה</h2>
            <p className={`text-sm leading-6 ${theme.textSecondary}`}>הצטרף או צור משחק חדש</p>
          </div>
        </div>
        <ThemedInput
          placeholder="שם שחקן"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="mb-4"
        />
        <ThemedInput
          placeholder="קוד משחק"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          className="mb-4"
        />
        {createGameError && <div className="text-red-500 mb-2 text-base">{createGameError}</div>}
        <ThemedButton 
          onClick={createGame} 
          className="w-full mb-4"
          disabled={isCreatingGame}
        >
          <BsPlusCircle className='ml-2 inline'/> 
          {isCreatingGame ? 'יוצר משחק...' : 'צור משחק חדש'}
        </ThemedButton>
        <ThemedButton onClick={joinGame} className="w-full">
          <BsPersonPlus className='ml-2 inline'/>הצטרף למשחק קיים
        </ThemedButton>
      </ThemedCard>
    </div>
  );
});

// Memoized WaitingRoom Component
const WaitingRoom = React.memo(({ 
  gameCode, 
  players, 
  startGame, 
  leaveGame, 
  socket 
}) => {
  const { theme } = useTheme();
  return (
    <div className="flex justify-center items-start min-h-screen w-full mx-2">
      <ThemedCard>
        <div className="flex mb-4">          
          <div className="m-0">
            <h2 className={`text-md font-semibold leading-7 mb-4 ${theme.text}`}>חדר המתנה</h2>
            <p className={`text-base leading-6 ${theme.textSecondary}`}>קוד המשחק: {gameCode}</p>
          </div>
        </div>
        <h3 className={`text-base font-semibold leading-7 ${theme.text} mb-2`}>שחקנים:</h3>
        <ul className="space-y-2">
          {players.map((player, index) => (
            <li key={index} className={`text-sm leading-6 ${theme.textSecondary}`}>{player.name}</li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col space-y-2">
          {players[0]?.id === socket?.id && (
            <ThemedButton onClick={startGame} className="w-full">
              <BsFillPlayFill className='ml-2 rotate-180 inline'/>התחל משחק
            </ThemedButton>
          )}
          <ThemedButton onClick={leaveGame} className="w-full">
            <BsXCircle className='ml-2 inline'/>עזוב משחק
          </ThemedButton>
        </div>
      </ThemedCard>
    </div>
  );
});

const NetworkedTriviaGame = () => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [createGameError, setCreateGameError] = useState('');
  const { theme, toggleTheme } = useTheme();

  const timerRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://176.231.157.72:3001', {
      headers: {
        "user-agent": "chrome"
      }
    });
    setSocket(newSocket);

    newSocket.on('gameCreated', (code) => {
      setGameCode(code);
      setGameState('waiting');
      setIsCreatingGame(false);
    });

    newSocket.on('gameCreationError', (error) => {
      setCreateGameError(error);
      setIsCreatingGame(false);
    });

    newSocket.on('gameState', setGameState);

    newSocket.on('playerList', setPlayers);

    newSocket.on('questionUpdate', ({ question: newQuestion, currentPlayer: newCurrentPlayer, timeLeft: newTimeLeft }) => {
      setQuestion(newQuestion);
      setCurrentPlayer(newCurrentPlayer);
      setTimeLeft(newTimeLeft);
    });

    newSocket.on('error', (error) => alert(error));

    return () => {
      newSocket.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timerRef.current);
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, question, timeLeft]);

  const createGame = useCallback(() => {
    if (socket && playerName.trim() && gameCode.trim()) {
      setIsCreatingGame(true);
      setCreateGameError('');
      socket.emit('createGame', { gameCode: gameCode.trim(), playerName: playerName.trim() });
    } else {
      setCreateGameError('יש להזין שם שחקן וקוד משחק');
    }
  }, [socket, playerName, gameCode]);

  const joinGame = useCallback(() => {
    if (socket && playerName.trim() && gameCode.trim()) {
      socket.emit('joinGame', { gameCode: gameCode.trim(), playerName: playerName.trim() });
    }
  }, [socket, playerName, gameCode]);

  const startGame = useCallback(() => {
    if (socket) {
      socket.emit('startGame');
    }
  }, [socket]);

  const leaveGame = useCallback(() => {
    if (socket) {
      socket.emit('leaveGame');
      setGameState('setup');
      setGameCode('');
      setPlayers([]);
      setQuestion(null);
      setTimeLeft(10);
      setCurrentPlayer(null);
    }
  }, [socket]);

  const answerQuestion = useCallback((answerIndex) => {
    if (socket && timeLeft > 0 && currentPlayer?.id === socket?.id) {
      socket.emit('answer', answerIndex);
    }
  }, [socket, timeLeft, currentPlayer]);

  const shootConfetti = () => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star']
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle']
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'setup':
        return (
          <Lobby 
            playerName={playerName}
            setPlayerName={setPlayerName}
            createGame={createGame}
            gameCode={gameCode}
            setGameCode={setGameCode}
            joinGame={joinGame}
            isCreatingGame={isCreatingGame}
            createGameError={createGameError}
          />
        );
      case 'waiting':
        return (
          <WaitingRoom 
            gameCode={gameCode}
            players={players}
            startGame={startGame}
            leaveGame={leaveGame}
            socket={socket}
          />
        );
      case 'playing':
        return (
          <GamePlay 
            players={players}
            question={question}
            currentPlayer={currentPlayer}
            timeLeft={timeLeft}
            answerQuestion={answerQuestion}
            socket={socket}
          />
        );
      case 'finished':
        return (
          <div className="flex justify-center items-start min-h-screen w-full mx-2">
            <ThemedCard>
              <div className="flex mb-4">
                <svg className="h-14 w-14 flex-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* SVG content here */}
                </svg>
                <div className="ml-4">
                  <h2 className={`text-base font-semibold leading-7 ${theme.text}`}>המשחק הסתיים!</h2>
                  <p className={`text-sm leading-6 ${theme.textSecondary}`}>תוצאות סופיות</p>
                </div>
              </div>
              {(() => {
                const maxScore = Math.max(...players.map(p => p.score));
                const winners = players.filter(p => p.score === maxScore);
                if (winners.length === 1) {
                  shootConfetti();
                  return <div className={`text-base font-semibold leading-7 ${theme.text} mb-4`}>המנצח: {winners[0].name}</div>;
                } else {
                  return <div className={`text-base font-semibold leading-7 ${theme.text} mb-4`}>תיקו בין: {winners.map(w => w.name).join(', ')}</div>;
                }
              })()}
              <div className={`text-sm leading-6 ${theme.textSecondary} mb-4`}>ניקוד סופי:</div>
              {players.map((player, index) => (
                <div key={index} className={`text-sm leading-6 ${theme.textSecondary} mb-2`}>
                  השחקן {player.name}: <span className='font-semibold pr-2'>{player.score} נקודות.</span>
                </div>
              ))}
              <div className="mt-8">
                <ThemedButton onClick={leaveGame} className="w-full">משחק חדש</ThemedButton>
              </div>
            </ThemedCard>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${theme.text} min-h-screen w-full sm:w-[350px] mx-auto`}>
      <ThemedButton onClick={toggleTheme} className="m-1">Toggle Theme</ThemedButton>
      {renderContent()}
    </div>
  );
};

export default NetworkedTriviaGame;