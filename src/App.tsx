import AIChat from './AIChat';
import AIImageGenerator from './AIImageGenerator';
import './App.css';
import viteLogo from '/vite.svg';

function App() {
  const API_WORKER_URL = import.meta.env.VITE_API_WORKER_URL;
  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <div>{API_WORKER_URL}</div>

        <AIChat />
        <AIImageGenerator />
      </div>
    </>
  );
}

export default App;
