import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';
import TriviaGame from './NetworkedTriviaGame';

function App() {
  return (
    <div className="App">
      <header className="App-header">   
        <ThemeProvider>     
          <TriviaGame/>
        </ThemeProvider>
      </header>
    </div>
  );
}

export default App;
