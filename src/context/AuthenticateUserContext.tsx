import React, { createContext, useState, useEffect } from 'react';
import { firebase } from '../config/firebaseConfig';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Định nghĩa kiểu cho đối tượng người dùng
interface User extends FirebaseAuthTypes.User {
  name?: string;
  age?: number;
  gender?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
}

// Định nghĩa kiểu cho context
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

export const AuthenticatedUserContext = createContext<AuthContextType>({ user: null, setUser: () => {}, loading: true });

export const AuthenticatedUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Lấy thông tin bổ sung từ Firestore
        const userDoc = await firebase.firestore().collection('users').doc(authUser.uid).get();
        const firestoreData = userDoc.data() as Omit<User, keyof FirebaseAuthTypes.User> | undefined;
        setUser({ ...authUser, ...firestoreData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};