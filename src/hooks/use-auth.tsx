
'use client';
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase'; // Use your actual firebase config
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from './use-toast';

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
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const firebaseUser = result.user;
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp(), // Use serverTimestamp for consistency
          });
        }
        // setUser will be handled by onAuthStateChanged
      }
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      toast({
        title: "Sign-in Error",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      // setLoading(false); // onAuthStateChanged will set loading to false
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error("Error signing out", error);
      toast({
        title: "Sign-out Error",
        description: error.message || "Could not sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
     setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({ 
            uid: firebaseUser.uid,
            email: firebaseUser.email, // Always take fresh email from FirebaseUser
            displayName: firebaseUser.displayName, // Always take fresh displayName
            photoURL: firebaseUser.photoURL // Always take fresh photoURL
          });
        } else {
          // This case should ideally be handled at sign-in, but as a fallback:
          const newUserPayload = { 
            displayName: firebaseUser.displayName, 
            email: firebaseUser.email, 
            photoURL: firebaseUser.photoURL, 
            createdAt: serverTimestamp() 
          };
          try {
            await setDoc(userRef, newUserPayload);
            setUser({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            });
          } catch (error) {
            console.error("Error creating user document during auth state change:", error);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
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
