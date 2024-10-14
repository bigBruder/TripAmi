import React, { createContext, useEffect, useState } from 'react';

import {
  OAuthProvider,
  createUserWithEmailAndPassword,
  linkWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseErrors } from '~/constants/firebaseErrors';
import { auth, db, facebookProvider, googleProvider } from '~/firebase';
import { usersCollection } from '~/types/firestoreCollections';
import { IUser } from '~/types/user';

import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  fetchSignInMethodsForEmail,
  getAuth,
  linkWithCredential,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
} from '@firebase/auth';
import { addDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from '@firebase/firestore';

interface AuthContext {
  currentUser: null | User;
  signUp: (() => void) | ((email: string, password: string, userName: string) => Promise<boolean>);
  signIn: (() => void) | ((email: string, password: string) => Promise<boolean>);
  signOutUser: () => void;
  loading: boolean;
  firestoreUser: null | IUser;
  updateFirestoreUser: (() => void) | ((data: IUser) => void);
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
  signInViaGoogle: () => new Promise((resolve) => { }),
  signInWithFacebook: () => new Promise((resolve) => { }),
};

const AuthContext = createContext<AuthContext>(defaultValue);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreUser, setFirestoreUser] = useState<null | IUser>(null);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1181353093153013',
        cookie: true,
        xfbml: true,
        version: 'v17.0',
      });
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.uid) {
        const q = query(usersCollection, where('email', '==', user.email));
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
      const q = query(usersCollection, where('email', '==', currentUser.email));
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

  const signInWithFacebook = async () => {
    // setLoading(true);

    // window.FB.login(
    //   (response) => {
    //     if (response.authResponse) {
    //       const accessToken = response.authResponse.accessToken;

    //       const credential = FacebookAuthProvider.credential(accessToken);
    //       signInWithCredential(auth, credential)
    //         .then((userCredential) => {
    //           console.log('Успішний вхід до Firebase', userCredential);
    //         })
    //         .catch((error) => {
    //           console.error('Помилка при вході до Firebase', error);
    //         });
    //     }
    //   },
    //   { scope: 'email,public_profile,user_friends' }
    // );

    // try {
    //   const provider = new FacebookAuthProvider();
    //   provider.addScope('user_friends');

    //   const result: any = await signInWithPopup(auth, provider);

    //   const credential = FacebookAuthProvider.credentialFromResult(result);
    //   const accessToken = credential?.accessToken;

    //   setCurrentUser(result.user);

    //   const q = query(usersCollection, where('email', '==', result.user.email));
    //   const querySnapshot = await getDocs(q);

    //   if (querySnapshot.docs.length === 0) {
    //     await addDoc(usersCollection, {
    //       email: result.user.email,
    //       username: result.user.displayName,
    //       friends: [],
    //       friends_count: 0,
    //       createdAt: new Date().toISOString(),
    //       firebaseUid: result.user.uid,
    //       postsCount: 0,
    //       tripCount: 0,
    //       friends_request_limit: 10,
    //       avatarUrl: null,
    //       whereToNext: '',
    //       itinerary: [],
    //       accessToken: accessToken,
    //       userFromFacebook: true,
    //       facebookId: result.user.providerData[0].uid,
    //     });
    //   } else {
    //     const facebookId = result.user.providerData.find(
    //       (provider) => provider.providerId === 'facebook.com'
    //     )?.uid;
    //     await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
    //       accessToken: accessToken,
    //       userFromFacebook: true,
    //       facebookId: facebookId,
    //     });

    //     console.log('UPDATE USER');
    //   }

    //   return true;
    // } catch (error: any) {
    //   if (error.code === 'auth/account-exists-with-different-credential') {
    //     const email = error.customData.email;
    //     const auth = getAuth();
    //     const pendingCredential = FacebookAuthProvider.credential(
    //       error.customData._tokenResponse.oauthAccessToken
    //     );

    //     const existingSignInMethods = await fetchSignInMethodsForEmail(auth, email);

    //     if (existingSignInMethods.includes('google.com')) {
    //       const googleProvider = new GoogleAuthProvider();

    //       try {
    //         const googleResult = await signInWithPopup(auth, googleProvider);

    //         await linkWithCredential(googleResult.user, pendingCredential);

    //         const q = query(usersCollection, where('email', '==', googleResult.user.email));
    //         const querySnapshot = await getDocs(q);
    //         const facebookId = error.customData._tokenResponse.federatedId.split('/').pop();
    //         if (querySnapshot.docs.length > 0) {
    //           await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
    //             accessToken: pendingCredential.accessToken,
    //             userFromFacebook: true,
    //             facebookId: facebookId,
    //           });
    //         }
    //         console.info('Facebook account linked to Google account');

    //         return true;
    //       } catch (linkError: any) {
    //         if (linkError.code === 'auth/provider-already-linked') {
    //           const q = query(usersCollection, where('email', '==', error.customData.email));
    //           const querySnapshot = await getDocs(q);

    //           const facebookId = error.customData._tokenResponse.federatedId.split('/').pop();

    //           if (querySnapshot.docs.length > 0) {
    //             const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
    //             await updateDoc(userDocRef, {
    //               accessToken: pendingCredential.accessToken,
    //               userFromFacebook: true,
    //               facebookId: facebookId,
    //             });
    //           }
    //           console.log('Accounts already linked, fields updated');
    //           return true;
    //         }
    //         console.error('Error linking Facebook to Google account:', linkError);
    //         return true;
    //       }
    //     } else {
    //       console.error('The email is linked with a provider other than Google.');
    //     }
    //   } else {
    //     console.error('Error during Facebook sign-in:', error);
    //   }

    //   return false;
    // } finally {
    //   setLoading(false);
    // }
  };

  const signInViaGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setCurrentUser(result.user);

      const q = query(usersCollection, where('email', '==', result.user.email));
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
      } else {
        await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
          accessToken: null,
          userFromFacebook: false,
          facebookId: null,
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
    signInViaGoogle,
    signInWithFacebook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
