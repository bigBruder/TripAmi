import React, { createContext, useState, useEffect } from 'react';
import {auth, db, facebookProvider, googleProvider} from "~/firebase";
import {signInWithPopup, signInWithRedirect, User} from "@firebase/auth";
import {createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {addDoc, getDoc, doc, where, query, getDocs, updateDoc, orderBy, onSnapshot} from "@firebase/firestore";
import {IUser} from "~/types/user";
import {postsCollection, usersCollection} from "~/types/firestoreCollections";
import {getDocument} from "@floating-ui/utils/react";
import {IPost} from "~/types/post";
import {set} from "@firebase/database";
import { useNavigate } from 'react-router-dom';



interface AuthContext {
  currentUser: null | User,
  signUp: (() => void) | ((email: string, password: string, userName: string) => Promise<boolean>),
  signIn: (() => void) | ((email: string, password: string) => Promise<boolean>),
  signOutUser: () => void,
  loading: boolean,
  firestoreUser: null | IUser,
  updateFirestoreUser: (() => void) | ((data: IUser) => void),
  signInViaFacebook: () => void,
  signInViaGoogle: () => Promise<unknown>,
  setModalOpen: (value: boolean) => void
  modalOpen: boolean;
}

const defaultValue = {
  currentUser: null,
  signUp: () => {},
  signIn: () => {},
  signOutUser: () => {},
  loading: true,
  firestoreUser: null,
  updateFirestoreUser: () => {},
  signInViaFacebook: () => {},
  signInViaGoogle: () => new Promise(resolve => {}),
  setModalOpen: () => {},
  modalOpen: false,
}

const AuthContext = createContext<AuthContext>(defaultValue);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreUser, setFirestoreUser] = useState<null | IUser>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user?.uid) {
        const q = query(usersCollection, where('firebaseUid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        setFirestoreUser({
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        } as IUser);
        setCurrentUser(user);
        navigate('/profile')
      } else {
        setFirestoreUser(null);
        setCurrentUser(null)
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      const q = query(
        usersCollection,
        where("firebaseUid", "==", currentUser.uid),
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setFirestoreUser({
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        } as IUser);
      });


      return () => {
        unsubscribe();
      }
    }
  }, [currentUser]);

  const updateFirestoreUser = async (data: IUser) => {
    if (firestoreUser?.id) {
      const docRef = doc(db, "users", firestoreUser?.id);

      try {
        await updateDoc(docRef, {
          ...firestoreUser,
          ...data,
        });
      } catch (err) {
        // @ts-ignore
        alert(firebaseErrors[err.code]);
      }
    }
  }

  const signInViaFacebook = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, facebookProvider);
    } catch (err) {
      // @ts-ignore
      alert(firebaseErrors[err.code]);
    } finally {
      setLoading(false);
    }
  };

  const signInViaGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      setCurrentUser(result.user);

      const q = query(usersCollection, where('firebaseUid', '==', result.user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length === 0) {
        await addDoc(usersCollection, {
          email: result.user.email,
          username: result.user.displayName,
          friends: [],
          friends_count: 0,
          createdAt: new Date().toISOString(),
          firebaseUid: result.user.uid,
          postsCount: 0,
          friends_request_limit: 10,
          avatarUrl: null,
        });
      }

      return true;
    } catch (err) {
      // @ts-ignore
      alert(firebaseErrors[err.code]);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userName: string) => {
    setLoading(true);
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);

      await addDoc(usersCollection, {
        email,
        username: userName,
        friends: [],
        primaryLocation: {
          country: null,
          city: null,
        },
        avatarUrl: null,
        friends_count: 0,
        createdAt: new Date().toISOString(),
        firebaseUid: user.user.uid,
        postsCount: 0,
        friends_request_limit: 10,
      });

      return true;
    } catch (error) {
      console.error('Sign Up Error:', error);

      // @ts-ignore
      alert(firebaseErrors[error.code]);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Sign In Error:', error);

      // @ts-ignore
      alert(firebaseErrors[error.code]);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirestoreUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign Out Error:', error);
    } finally {
      setLoading(false); 
    }
  };

  const value = {
    currentUser,
    signUp,
    signIn,
    signOutUser,
    loading,
    firestoreUser,
    updateFirestoreUser,
    signInViaFacebook,
    signInViaGoogle,
    setModalOpen,
    modalOpen,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
  </AuthContext.Provider>
);
};

export { AuthContext, AuthProvider };
