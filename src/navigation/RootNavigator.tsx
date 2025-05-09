import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthenticatedUserContext } from '../context/AuthenticateUserContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const RootNavigator = () => {
  const { user, loading } = useContext(AuthenticatedUserContext);

  if (loading) {
    return null; // Có thể thêm màn hình loading
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;