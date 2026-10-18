import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { DevRoot } from './preview/DevRoot.js';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <DevRoot />
    </StrictMode>,
  );
}