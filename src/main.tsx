
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure we create the root element before rendering
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root element not found');
}
