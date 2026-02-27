import { useState, useEffect } from 'react';

interface ScoreEntry {
  rank: number;
  name: string;
  score: number;
  category: string;
  difficulty: string;
}

interface GameState {
  word: string;
  category: string;
  difficulty: string;
  guessedLetters: Set<string>;
  lives: number;
  score: number;
  isGameOver: boolean;
  isWon: boolean;
}

const categories = ['All', 'Animals', 'Countries', 'Science', 'Movies', 'Technology'];

// Word lists by category
const wordLists: Record<string, string[]> = {
  Animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'KANGAROO', 'DOLPHIN', 'CHEETAH', 'OCTOPUS'],
  Countries: ['AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT', 'FRANCE', 'GERMANY'],
  Science: ['CHEMISTRY', 'PHYSICS', 'BIOLOGY', 'ASTRONOMY', 'GEOLOGY', 'QUANTUM', 'MOLECULE'],
  Movies: ['INCEPTION', 'MATRIX', 'AVATAR', 'GLADIATOR', 'TITANIC', 'FROZEN', 'INTERSTELLAR'],
  Technology: ['JAVASCRIPT', 'COMPUTER', 'ALGORITHM', 'DATABASE', 'NETWORK', 'SOFTWARE', 'PROGRAMMING']
};

// Mock CSV data - in production, this would be fetched from scores.csv
const mockCSVData = `name,score,category,difficulty
Alice,2500,Animals,Hard
Bob,2200,Countries,Medium
Charlie,1900,Science,Hard
Diana,1700,Movies,Easy
Eve,1600,Technology,Medium
Frank,1500,Animals,Medium
Grace,1400,Countries,Hard
Henry,1300,Science,Medium
Iris,1200,Movies,Hard
Jack,1100,Technology,Easy
Karen,1000,Animals,Easy
Leo,950,Countries,Medium
Mike,900,Science,Easy
Nina,850,Movies,Medium
Oscar,800,Technology,Hard`;

export default function App() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [filteredScores, setFilteredScores] = useState<ScoreEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Game state
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [selectedGameCategory, setSelectedGameCategory] = useState<string>('Animals');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Parse CSV data
  const parseCSV = (csv: string): ScoreEntry[] => {
    const lines = csv.trim().split('\n');
    const data: ScoreEntry[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length === 4) {
        data.push({
          rank: 0,
          name: parts[0],
          score: parseInt(parts[1]),
          category: parts[2],
          difficulty: parts[3]
        });
      }
    }
    
    data.sort((a, b) => b.score - a.score);
    data.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return data;
  };

  // Load scores from CSV
  const loadScores = () => {
    const parsedScores = parseCSV(mockCSVData);
    setScores(parsedScores);
    setLastUpdated(new Date());
  };

  // Start new game
  const startNewGame = () => {
    const categoryWords = wordLists[selectedGameCategory];
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    
    const livesMap = { Easy: 10, Medium: 6, Hard: 4 };
    
    setGame({
      word: randomWord,
      category: selectedGameCategory,
      difficulty: selectedDifficulty,
      guessedLetters: new Set(),
      lives: livesMap[selectedDifficulty],
      score: 0,
      isGameOver: false,
      isWon: false
    });
    setShowNameInput(false);
  };

  // Guess a letter
  const guessLetter = (letter: string) => {
    if (!game || game.isGameOver || game.guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set(game.guessedLetters);
    newGuessedLetters.add(letter);

    const isCorrect = game.word.includes(letter);
    const newLives = isCorrect ? game.lives : game.lives - 1;

    // Calculate score
    const basePoints = { Easy: 100, Medium: 200, Hard: 300 };
    const letterPoints = isCorrect ? basePoints[game.difficulty] : 0;
    const newScore = game.score + letterPoints;

    // Check if won
    const isWon = game.word.split('').every(char => newGuessedLetters.has(char));
    const isGameOver = newLives === 0 || isWon;

    // Bonus for winning
    const finalScore = isWon ? newScore + (newLives * 100) : newScore;

    setGame({
      ...game,
      guessedLetters: newGuessedLetters,
      lives: newLives,
      score: finalScore,
      isGameOver,
      isWon
    });

    if (isGameOver && isWon) {
      setShowNameInput(true);
    }
  };

  // Add score to leaderboard
  const addToLeaderboard = () => {
    if (!game || !playerName.trim()) return;

    const newEntry = `${playerName.trim()},${game.score},${game.category},${game.difficulty}`;
    const updatedCSV = mockCSVData + '\n' + newEntry;
    
    // In production, this would save to scores.csv
    const parsedScores = parseCSV(updatedCSV);
    setScores(parsedScores);
    setShowNameInput(false);
    setPlayerName('');
  };

  // Get displayed word
  const getDisplayWord = () => {
    if (!game) return '';
    return game.word.split('').map(char => 
      game.guessedLetters.has(char) ? char : '_'
    ).join(' ');
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!game || game.isGameOver) return;
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) {
        guessLetter(letter);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [game]);

  // Filter scores by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredScores(scores);
    } else {
      setFilteredScores(scores.filter(score => score.category === selectedCategory));
    }
  }, [selectedCategory, scores]);

  // Initial load
  useEffect(() => {
    loadScores();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadScores();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Get rank color
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-foreground';
  };

  // Get rank background
  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400/10';
    if (rank === 2) return 'bg-gray-300/10';
    if (rank === 3) return 'bg-orange-400/10';
    return '';
  };

  // Get hangman drawing
  const getHangmanDrawing = (lives: number, maxLives: number) => {
    const stage = maxLives - lives;
    const drawings = [
      `
  +---+
  |   |
      |
      |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
    ];
    
    return drawings[Math.min(stage, drawings.length - 1)];
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="dark min-h-screen w-full bg-[#1a1a2e] text-white p-4 md:p-8">
      {/* ASCII Art Header */}
      <header className="mb-8">
        <pre className="text-center text-[#eee] font-mono text-xs md:text-sm leading-tight overflow-x-auto">
{` _   _    _    _   _  ____ __  __    _    _   _ 
| | | |  / \\  | \\ | |/ ___|  \\/  |  / \\  | \\ | |
| |_| | / _ \\ |  \\| | |  _| |\\/| | / _ \\ |  \\| |
|  _  |/ ___ \\| |\\  | |_| | |  | |/ ___ \\| |\\  |
|_| |_/_/   \\_\\_| \\_|\\____|_|  |_/_/   \\_\\_| \\_|`}
        </pre>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leaderboard Panel */}
          <div className="md:col-span-2">
            <div className="bg-[#16213e] rounded-lg p-6 shadow-xl border border-[#0f3460]">
              <h2 className="mb-4">Leaderboard</h2>
              
              {/* Category Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-md transition-all ${
                      selectedCategory === category
                        ? 'bg-[#e94560] text-white'
                        : 'bg-[#0f3460] text-gray-300 hover:bg-[#1a4d7a]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto">
                <table id="leaderboard-table" className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#0f3460]">
                      <th className="text-left py-3 px-4 text-gray-400">Rank</th>
                      <th className="text-left py-3 px-4 text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400">Score</th>
                      <th className="text-left py-3 px-4 text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 text-gray-400">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScores.map((entry) => (
                      <tr
                        key={`${entry.name}-${entry.rank}`}
                        className={`border-b border-[#0f3460] hover:bg-[#0f3460]/50 transition-colors ${getRankBg(entry.rank)}`}
                      >
                        <td className={`py-3 px-4 ${getRankColor(entry.rank)}`}>
                          {entry.rank <= 3 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-current/20">
                              #{entry.rank}
                            </span>
                          ) : (
                            `#${entry.rank}`
                          )}
                        </td>
                        <td className={`py-3 px-4 ${getRankColor(entry.rank)}`}>
                          {entry.name}
                        </td>
                        <td className={`py-3 px-4 ${getRankColor(entry.rank)}`}>
                          {entry.score.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{entry.category}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            entry.difficulty === 'Hard' ? 'bg-red-500/20 text-red-300' :
                            entry.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {entry.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Last Updated */}
              <div className="mt-4 text-right text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Game Status Panel */}
          <div className="md:col-span-1">
            <div id="game-status" className="bg-[#16213e] rounded-lg p-6 shadow-xl border border-[#0f3460]">
              <h2 className="mb-6">Play Game</h2>
              
              {!game ? (
                /* New Game Setup */
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Category</div>
                    <select
                      value={selectedGameCategory}
                      onChange={(e) => setSelectedGameCategory(e.target.value)}
                      className="w-full bg-[#0f3460] p-3 rounded-lg text-white border border-[#0f3460] focus:border-[#e94560] outline-none"
                    >
                      {Object.keys(wordLists).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-gray-400 mb-2">Difficulty</div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`py-2 rounded-lg transition-all ${
                            selectedDifficulty === diff
                              ? 'bg-[#e94560] text-white'
                              : 'bg-[#0f3460] text-gray-300 hover:bg-[#1a4d7a]'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {selectedDifficulty === 'Easy' && '10 lives • 100 pts/letter'}
                      {selectedDifficulty === 'Medium' && '6 lives • 200 pts/letter'}
                      {selectedDifficulty === 'Hard' && '4 lives • 300 pts/letter'}
                    </div>
                  </div>

                  <button
                    onClick={startNewGame}
                    className="w-full bg-[#e94560] hover:bg-[#d13350] text-white py-3 rounded-lg transition-all"
                  >
                    Start New Game
                  </button>
                </div>
              ) : (
                /* Active Game */
                <div>
                  {/* Score and Lives */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Score</div>
                      <div className="text-2xl text-[#e94560]">{game.score}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Lives</div>
                      <div className="text-2xl text-yellow-400">{game.lives}</div>
                    </div>
                  </div>

                  {/* Current Word */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Word</div>
                    <div className="bg-[#0f3460] p-4 rounded-lg text-center font-mono text-xl md:text-2xl tracking-wider">
                      {getDisplayWord()}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      {game.category} • {game.difficulty}
                    </div>
                  </div>

                  {/* Hangman Drawing */}
                  <div className="mb-4">
                    <div className="bg-[#0f3460] p-4 rounded-lg">
                      <pre className="text-center font-mono text-xs leading-tight text-gray-300">
                        {getHangmanDrawing(game.lives, game.difficulty === 'Easy' ? 10 : game.difficulty === 'Medium' ? 6 : 4)}
                      </pre>
                    </div>
                  </div>

                  {/* Letter Keyboard */}
                  {!game.isGameOver && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2">Click or type a letter</div>
                      <div className="grid grid-cols-7 gap-1">
                        {alphabet.map(letter => {
                          const isGuessed = game.guessedLetters.has(letter);
                          const isCorrect = isGuessed && game.word.includes(letter);
                          return (
                            <button
                              key={letter}
                              onClick={() => guessLetter(letter)}
                              disabled={isGuessed}
                              className={`aspect-square rounded text-sm transition-all ${
                                isGuessed
                                  ? isCorrect
                                    ? 'bg-green-500/50 text-white cursor-not-allowed'
                                    : 'bg-red-500/50 text-white cursor-not-allowed'
                                  : 'bg-[#0f3460] text-gray-300 hover:bg-[#1a4d7a]'
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Game Over */}
                  {game.isGameOver && (
                    <div className="mt-4">
                      {game.isWon ? (
                        <div>
                          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
                            <div className="text-green-400 text-center mb-2">🎉 You Won! 🎉</div>
                            <div className="text-center text-gray-300">
                              The word was: <span className="text-white font-bold">{game.word}</span>
                            </div>
                            <div className="text-center text-yellow-400 mt-2">
                              Final Score: {game.score}
                            </div>
                          </div>
                          
                          {showNameInput ? (
                            <div>
                              <input
                                type="text"
                                placeholder="Enter your name"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full bg-[#0f3460] p-3 rounded-lg mb-2 text-white border border-[#0f3460] focus:border-[#e94560] outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && addToLeaderboard()}
                              />
                              <button
                                onClick={addToLeaderboard}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg mb-2"
                              >
                                Add to Leaderboard
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
                          <div className="text-red-400 text-center mb-2">Game Over</div>
                          <div className="text-center text-gray-300">
                            The word was: <span className="text-white font-bold">{game.word}</span>
                          </div>
                          <div className="text-center text-yellow-400 mt-2">
                            Final Score: {game.score}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={startNewGame}
                        className="w-full bg-[#e94560] hover:bg-[#d13350] text-white py-3 rounded-lg"
                      >
                        Play Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}