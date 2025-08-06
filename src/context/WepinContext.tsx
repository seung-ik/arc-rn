import React, { createContext, useContext, useState } from 'react';
import Wepin from '@wepin/react-native-sdk';
import WepinLogin from '@wepin/login-rn';

interface WepinContextType {
  wepinSdk: Wepin | null;
  wepinLogin: WepinLogin | null;
  isInitialized: boolean;
  setWepinSdk: (sdk: Wepin) => void;
  setWepinLogin: (login: WepinLogin) => void;
  setIsInitialized: (initialized: boolean) => void;
}

const WepinContext = createContext<WepinContextType | undefined>(undefined);

export const useWepin = () => {
  const context = useContext(WepinContext);
  if (!context) {
    throw new Error('useWepin must be used within a WepinProvider');
  }
  return context;
};

interface WepinProviderProps {
  children: React.ReactNode;
}

export const WepinProvider: React.FC<WepinProviderProps> = ({ children }) => {
  const [wepinSdk, setWepinSdk] = useState<Wepin | null>(null);
  const [wepinLogin, setWepinLogin] = useState<WepinLogin | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const value = {
    wepinSdk,
    wepinLogin,
    isInitialized,
    setWepinSdk,
    setWepinLogin,
    setIsInitialized,
  };

  return (
    <WepinContext.Provider value={value}>{children}</WepinContext.Provider>
  );
};
