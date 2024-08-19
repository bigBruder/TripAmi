import React, { createContext, useEffect, useState } from 'react';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseErrors } from '~/constants/firebaseErrors';
import { auth, db, facebookProvider, googleProvider } from '~/firebase';
import { usersCollection } from '~/types/firestoreCollections';
import { IUser } from '~/types/user';

import { FacebookAuthProvider, User, signInWithPopup, signInWithRedirect } from '@firebase/auth';
import { addDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from '@firebase/firestore';

interface AuthContext {
  currentUser: null | User;
  signUp: (() => void) | ((email: string, password: string, userName: string) => Promise<boolean>);
  signIn: (() => void) | ((email: string, password: string) => Promise<boolean>);
  signOutUser: () => void;
  loading: boolean;
  firestoreUser: null | IUser;
  updateFirestoreUser: (() => void) | ((data: IUser) => void);
  signInViaFacebook: () => void;
  signInViaGoogle: () => Promise<unknown>;
  signInWithFacebook: () => Promise<boolean>;
}

const defaultValue = {
  currentUser: null,
  signUp: () => { },
  signIn: () => { },
  signOutUser: () => { },
  loading: true,
  firestoreUser: null,
  updateFirestoreUser: () => { },
  signInViaFacebook: () => { },
  signInViaGoogle: () => new Promise((resolve) => { }),
  signInWithFacebook: () => new Promise((resolve) => { }),
};

const AuthContext = createContext<AuthContext>(defaultValue);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreUser, setFirestoreUser] = useState<null | IUser>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.uid) {
        const q = query(usersCollection, where('firebaseUid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        setFirestoreUser({
          ...querySnapshot.docs[0]?.data(),
          id: querySnapshot.docs[0]?.id,
        } as IUser);
      } else {
        setFirestoreUser(null);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      const q = query(usersCollection, where('firebaseUid', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setFirestoreUser({
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        } as IUser);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [currentUser]);

  const updateFirestoreUser = async (data: IUser) => {
    if (firestoreUser?.id) {
      const docRef = doc(db, 'users', firestoreUser?.id);

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
  };

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

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('user_friends');
      const result = await signInWithPopup(auth, provider);
      console.log(result, 'result');      

      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      const qe = query(usersCollection, where('firebaseUid', '==', result.user.uid));
      const querySnapshotR = await getDocs(qe);
      if (accessToken && querySnapshotR.docs.length > 0) {
        await updateDoc(doc(db, 'users', querySnapshotR.docs[0].id), {
          accessToken,
        });
      }

      const friends = await fetch(
        `https://graph.facebook.com/v12.0/me/friends?access_token=${accessToken}`
      ).then((res) => res.json());

      console.log(friends, 'friends');

      const response = await fetch(
        `https://graph.facebook.com/v12.0/me/permissions?access_token=${accessToken}`
      );

      const permissions = await response.json();
      console.log(permissions, 'permissions');

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
          tripCount: 0,
          friends_request_limit: 10,
          avatarUrl: null,
          whereToNext: '',
          itinerary: [],
          accessToken: accessToken,
          userFromFacebook: true,
          facebookId: result.user.providerData[0].uid,
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

  const signInViaGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
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
          tripCount: 0,
          friends_request_limit: 10,
          avatarUrl: null,
          whereToNext: '',
          itinerary: [],
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
        tripCount: 0,
        friends_request_limit: 10,
        whereToNext: '',
        itinerary: [],
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
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
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
    signInWithFacebook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
