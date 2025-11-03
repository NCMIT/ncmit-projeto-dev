import path from 'path';
import { defineConfig } from 'vite'; // Não precisamos mais do loadEnv
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, '.', ''); // LINHA REMOVIDA
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // O bloco 'define' que injetava a API_KEY foi REMOVIDO.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});