import { useContext } from 'react';
import { GlobalContext } from './globalContext';

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
};
