
'use client';
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
// To enable actual Firebase functionality:
// 1. Uncomment the Firebase imports below.
// 2. Ensure you have initialized Firebase in `@/lib/firebase.ts`.
// 3. Set up Firebase Authentication (Google provider) and Firestore in your Firebase project.

// import { auth, db } from '@/lib/firebase';
// import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
// import { doc, getDoc, setDoc } from 'firebase/firestore';

// Placeholder User type until FirebaseUser is used
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    alert('signInWithGoogle: Placeholder. Implement with Firebase.');
    // Example of actual Firebase implementation:
    // setLoading(true);
    // const provider = new GoogleAuthProvider();
    // try {
    //   const result = await signInWithPopup(auth, provider);
    //   if (result.user) {
    //     const firebaseUser = result.user;
    //     const userRef = doc(db, 'users', firebaseUser.uid);
    //     const userSnap = await getDoc(userRef);
    //     if (!userSnap.exists()) {
    //       await setDoc(userRef, {
    //         displayName: firebaseUser.displayName,
    //         email: firebaseUser.email,
    //         photoURL: firebaseUser.photoURL,
    //         createdAt: new Date(),
    //       });
    //     }
    //     // setUser will be handled by onAuthStateChanged
    //   }
    // } catch (error) {
    //   console.error("Error signing in with Google", error);
    //   // Potentially show a toast message
    // } finally {
    //   // setLoading(false); // Handled by onAuthStateChanged
    // }
  };

  const signOutUser = async () => {
    alert('signOutUser: Placeholder. Implement with Firebase.');
    // setLoading(true);
    // try {
    //   await signOut(auth);
    //   setUser(null);
    // } catch (error) {
    //   console.error("Error signing out", error);
    // } finally {
    //  setLoading(false);
    // }
  };

  useEffect(() => {
    // Placeholder to simulate auth state change
    // To test logged in state:
    // setTimeout(() => {
    //   setUser({ uid: 'test-user', email: 'test@example.com', displayName: 'Test User', photoURL: null });
    //   setLoading(false);
    // }, 1000);
    // To test logged out state:
     setTimeout(() => {
       setUser(null);
       setLoading(false);
     }, 500);

    // Actual Firebase onAuthStateChanged listener:
    // const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    //   if (firebaseUser) {
    //     const userRef = doc(db, 'users', firebaseUser.uid);
    //     const userSnap = await getDoc(userRef);
    //     if (userSnap.exists()) {
    //       setUser({ uid: firebaseUser.uid, ...userSnap.data() } as User);
    //     } else {
    //       // This case should ideally be handled at sign-in, but as a fallback:
    //       const newUserPayload = { displayName: firebaseUser.displayName, email: firebaseUser.email, photoURL: firebaseUser.photoURL, createdAt: new Date() };
    //       await setDoc(userRef, newUserPayload);
    //       setUser({ uid: firebaseUser.uid, ...newUserPayload });
    //     }
    //   } else {
    //     setUser(null);
    //   }
    //   setLoading(false);
    // });
    // return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
