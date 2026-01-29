/**
 * Mock react-router-dom
 * Provides mocked useNavigate and useLocation for testing
 */

import React from 'react';

export const useNavigate = jest.fn();
export const useLocation = jest.fn(() => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
}));

export const Navigate = ({ to, _replace }: { to: string; replace?: boolean }) => {
  React.useEffect(() => {
    useNavigate()(to);
  }, [to]);
  return null;
};

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const Router = BrowserRouter;

export const Routes = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const Route = ({ element }: { element: React.ReactNode }) => {
  return <>{element}</>;
};

export const Link = ({ 
  to, 
  children, 
  ...props 
}: { 
  to: string; 
  children: React.ReactNode; 
  [key: string]: any 
}) => {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
};
