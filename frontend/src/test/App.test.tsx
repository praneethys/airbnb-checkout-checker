import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Simple test to verify test setup works
describe('App', () => {
  it('renders without crashing', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <BrowserRouter>
            <div data-testid="test-element">Test</div>
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });
});
