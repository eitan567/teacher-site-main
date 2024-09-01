import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "./components/ui/button.tsx";
import { Input } from "./components/ui/input.tsx";
import { Card, CardHeader, CardContent, CardFooter } from "./components/ui/card.tsx";
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { BsFillPlayFill, BsPersonPlus, BsPlusCircle, BsXCircle } from "react-icons/bs";


// Memoized Timer Component
const Timer = React.memo(({ timeLeft }) => {
  return <div className="text-2xl font-bold mb-2">זמן נותר: {timeLeft} שניות</div>;
});

// Memoized Question Component
const Question = React.memo(({ question, onAnswer, isCurrentPlayer, timeLeft }) => {
  return (
    <>
      <div className="text-lg mb-6">{question?.text}</div>
      {question?.answers.map((answer, index) => (
        <Button
          key={index}
          onClick={() => onAnswer(index)}
          disabled={!isCurrentPlayer || timeLeft === 0}
          className="block w-full mb-4 bg-gray-700 hover:bg-gray-600 text-center px-4 py-1 text-lg"
        >
          {answer}
        </Button>
      ))}
    </>
  );
});

// Memoized ScoreBoard Component
const ScoreBoard = React.memo(({ players }) => (
  <div className="mt-4 border-t pt-4 w-full">
    <h3 className="text-xl font-bold mb-2">ניקוד</h3>
    <div className="flex flex-wrap justify-between">
      {players.map((player, index) => (
        <div key={index} className="text-center mb-2 w-1/2 sm:w-auto">
          <div className="text-sm">{player.name}</div>
          <div className="text-lg font-bold">{player.score}</div>
        </div>
      ))}
    </div>
  </div>
));

// Memoized GamePlay Component
const GamePlay = React.memo(({ 
  players, 
  question, 
  currentPlayer, 
  timeLeft, 
  answerQuestion, 
  socket 
}) => {
  const isCurrentPlayer = currentPlayer?.id === socket?.id;

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white">
        <CardHeader>
          <Timer timeLeft={timeLeft} />
          <div className="text-xl">תור: {currentPlayer?.name}</div>
        </CardHeader>
        <CardContent>
          <Question 
            question={question} 
            onAnswer={answerQuestion} 
            isCurrentPlayer={isCurrentPlayer}
            timeLeft={timeLeft} 
          />
        </CardContent>
        <CardFooter>
          <ScoreBoard players={players} />
        </CardFooter>
      </Card>
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
}) => (
  <div className="flex justify-center items-center min-h-screen p-4">
    <Card className="w-full max-w-md bg-gray-800 text-white">
      <CardHeader className="text-2xl font-bold">לובי משחק רשת טריוויה</CardHeader>
      <CardContent>
        <Input
          placeholder="שם שחקן"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="mb-4 bg-gray-700 text-white w-full"
        />
        <Input
          placeholder="קוד משחק"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          className="mb-4 bg-gray-700 text-white w-full"
        />
        {createGameError && <div className="text-red-500 mb-2">{createGameError}</div>}
        <Button 
          onClick={createGame} 
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
          disabled={isCreatingGame}
        >
          <BsPlusCircle className='ml-2'/> 
          {isCreatingGame ? 'יוצר משחק...' : 'צור משחק חדש'}
        </Button>
        <Button onClick={joinGame} className="w-full bg-green-600 hover:bg-green-700">
          <BsPersonPlus className='ml-2'/> הצטרף למשחק קיים
        </Button>
      </CardContent>
    </Card>
  </div>
));

// Memoized WaitingRoom Component
const WaitingRoom = React.memo(({ 
  gameCode, 
  players, 
  startGame, 
  leaveGame, 
  socket 
}) => (
  <div className="flex justify-center items-center min-h-screen p-4">
    <Card className="w-full max-w-md bg-gray-800 text-white">
      <CardHeader>
        <h2 className="text-2xl font-bold">חדר המתנה</h2>
        <p className="text-lg">קוד המשחק: {gameCode}</p>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl mb-2">שחקנים:</h3>
        <ul className="space-y-2">
          {players.map((player, index) => (
            <li key={index} className="text-lg">{player.name}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {players[0]?.id === socket?.id && (
          <Button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700">
            <BsFillPlayFill className='ml-2 rotate-180'/>התחל משחק
          </Button>
        )}
        <Button onClick={leaveGame} className="w-full bg-red-600 hover:bg-red-700">
          <BsXCircle className='ml-2'/>עזוב משחק
        </Button>
      </CardFooter>
    </Card>
  </div>
));

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

  const timerRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://84.229.242.33:3001', {
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
          <div className="flex justify-center items-center min-h-screen p-4">
            <Card className="w-full max-w-md bg-gray-800 text-white">
              <CardHeader className="text-2xl font-bold">המשחק הסתיים!</CardHeader>
              <CardContent>
                {(() => {
                  const maxScore = Math.max(...players.map(p => p.score));
                  const winners = players.filter(p => p.score === maxScore);
                  if (winners.length === 1) {
                    shootConfetti();
                    return <div className="text-xl mb-4">המנצח: {winners[0].name}</div>;
                  } else {
                    return <div className="text-xl mb-4">תיקו בין: {winners.map(w => w.name).join(', ')}</div>;
                  }
                })()}
                <div className="text-lg mb-4">ניקוד סופי:</div>
                {players.map((player, index) => (
                  <div key={index} className="text-lg mb-2">
                    השחקן {player.name}: <span className='font-bold pr-2'>{player.score} נקודות.</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button onClick={leaveGame} className="w-full mt-6 bg-blue-600 hover:bg-blue-700">משחק חדש</Button>
              </CardFooter>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-white min-h-screen w-[360px] sm:w-[850px]">
      {renderContent()}
    </div>
  );
};

export default NetworkedTriviaGame;