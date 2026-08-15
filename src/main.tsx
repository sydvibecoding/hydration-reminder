import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Material 3 web components (Lit). Registers every custom element on load —
// bundling the full set (~150KB extra) is worth the price to avoid silent
// "unknown element renders as bare text" failures when a new component gets
// used in JSX without a matching side-effect import.
import '@material/web/all.js';
// `all.js` no incluye labs/ — registrar aparte los que usamos.
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js';
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
