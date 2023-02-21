import React from 'react';
import './App.css';
import RoutesPath from './Components/RoutesPath';
import { useEffect } from "react";

declare let window: any

function App() {
  
  
  const handleAccountsChanged = () => {
    window.location.reload();
  }

  const handleChainChanged = () => {
    window.location.reload();
  }

  useEffect(() => {
    if (!window.ethereum) {
      return
    }
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeAllListeners('accountsChanged');
    };
  }, []);

  useEffect(() => {
    if (!window.ethereum) {
      return
    }
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeAllListeners('chainChanged');
    };
  }, []);




  return (
    <div className="App">
        <RoutesPath />
    </div>
  );
}

export default App;
