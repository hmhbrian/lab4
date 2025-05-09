import React from 'react';
import { AuthenticatedUserProvider } from './src/context/AuthenticateUserContext';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
};

export default App;