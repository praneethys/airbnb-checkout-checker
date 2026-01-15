import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { HomePage } from './pages/HomePage';
import { PropertyPage } from './pages/PropertyPage';

const queryClient = new QueryClient();

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  colors: {
    brand: {
      50: '#fff5f5',
      100: '#fed7d7',
      500: '#FF5A5F',
      600: '#e04e53',
      700: '#c44247',
    },
  },
});

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/property/:id" element={<PropertyPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
