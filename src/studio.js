import { renderStudio } from 'sanity';
import config from '../studio/sanity.config.js';

// Add the basePath for embedded studio
const embeddedConfig = {
  ...config,
  basePath: '/studio.html', // Or '/studio' if using rewrites, but .html is safer for basic Vite on Vercel
};

renderStudio(document.getElementById('sanity'), embeddedConfig);
