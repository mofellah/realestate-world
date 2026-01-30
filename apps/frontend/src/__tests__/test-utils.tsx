/**
 * Test Utilities
 * Common test helpers and wrappers for components requiring providers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

/**
 * AllProviders wrapper - wraps components with all necessary context providers
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <MemoryRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>
  );
};

/**
 * RoutingOnly wrapper - wraps components with MemoryRouter only, no AuthProvider
 * Use this when mocking useAuth hook directly
 */
const RoutingOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ThemeProvider>
  );
};

/**
 * Custom render function that includes all providers
 * Use this instead of render() in component tests
 */
const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

/**
 * Custom render function with routing only
 * Use this when you're mocking useAuth hook directly
 */
const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: RoutingOnly, ...options });

// Re-export everything from react-testing-library
export * from '@testing-library/react';

// Override render with provider-wrapped version
export { renderWithProviders as render, renderWithRouter };
