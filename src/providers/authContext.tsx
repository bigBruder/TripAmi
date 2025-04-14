import React, { createContext, useEffect, useState } from 'react';

import {
  OAuthProvider,
  createUserWithEmailAndPassword,
  linkWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { ENV } from '~/app_config/app.config';
import { firebaseErrors } from '~/constants/firebaseErrors';
import { UserLoginType } from '~/emuns/userLoginType';
import { auth, db, facebookProvider, googleProvider } from '~/firebase';
import { usersCollection } from '~/types/firestoreCollections';
import { IUser } from '~/types/user';
import { uploadProfileImageToFirebase } from '~/utils/firebaseStorageUtils';

import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  UserCredential,
  fetchSignInMethodsForEmail,
  getAuth,
  linkWithCredential,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
} from '@firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@firebase/firestore';

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
  accessToken: string;
  setFirestoreUser: (user: IUser | null) => void;
  setCurrentUser: (user: User | null) => void;
}

const defaultValue = {
  currentUser: null,
  signUp: () => {},
  signIn: () => {},
  signOutUser: () => {},
  loading: true,
  firestoreUser: null,
  updateFirestoreUser: () => {},
  signInViaGoogle: () => new Promise((resolve) => {}),
  signInWithFacebook: () => new Promise((resolve) => {}),
  accessToken: '',
};

const AuthContext = createContext<AuthContext>(defaultValue);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreUser, setFirestoreUser] = useState<null | IUser>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const appId = ENV.FACEBOOK_APP_ID;
  const appSecret = ENV.FACEBOOK_APP_SECRET;
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
        const firestoreData = {
          ...querySnapshot.docs[0]?.data(),
          id: querySnapshot.docs[0]?.id,
        };

        localStorage.setItem('firestore_user', JSON.stringify(firestoreData));
        setFirestoreUser(firestoreData as IUser);
      } else {
        const localUser = localStorage.getItem('firestore_user');

        if (localUser) {
          try {
            const parsedUser = JSON.parse(localUser);
            setFirestoreUser(parsedUser as IUser);
            setCurrentUser(parsedUser);
            setLoading(false);
            return;
          } catch (err) {
            console.warn('Помилка при парсингу firestore_user з localStorage', err);
          }
        } else {
          setFirestoreUser(null);
        }
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
          ...querySnapshot.docs[0]?.data(),
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
    setLoading(true);
    try {
      const response: any = await new Promise((resolve, reject) => {
        window.FB.login(
          (response) => {
            if (response.authResponse) {
              resolve(response);
            } else {
              reject(new Error('User cancelled login or did not fully authorize.'));
            }
          },
          { scope: 'email,public_profile,user_friends' }
        );
      });

      const accessToken = response.authResponse.accessToken;
      const credential = FacebookAuthProvider.credential(accessToken);

      // for getting long live facebook token
      const longLivedTokenResponse = await fetch(
        `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`
      );
      const longLivedTokenData = await longLivedTokenResponse.json();

      const longLiveAccessToken = longLivedTokenData.access_token;

      // Використовуємо await замість then для signInWithCredential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      setAccessToken(accessToken);
      localStorage.setItem('facebook_token', longLiveAccessToken);

      const avatarUrl = (await uploadProfileImageToFirebase(user.photoURL, user.uid)) || null;

      if (querySnapshot.docs.length === 0) {
        await addDoc(usersCollection, {
          email: user.email,
          username: user.displayName,
          friends: [],
          friends_count: 0,
          createdAt: new Date().toISOString(),
          firebaseUid: user.uid,
          postsCount: 0,
          tripCount: 0,
          friends_request_limit: 10,
          avatarUrl: avatarUrl,
          loginType: UserLoginType.facebook,
          whereToNext: '',
          itinerary: [],
          userFromFacebook: true,
          facebookId: user.providerData[0].uid,
        });
      } else {
        const facebookId = user.providerData.find(
          (provider) => provider.providerId === 'facebook.com'
        )?.uid;
        setAccessToken(longLiveAccessToken);
        localStorage.setItem('facebook_token', longLiveAccessToken);
        await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
          userFromFacebook: true,
          facebookId: facebookId,
          username: user.displayName,
          avatarUrl: avatarUrl,
          loginType: UserLoginType.facebook,
        });
        console.log('UPDATE USER');
      }

      return true;
    } catch (error: any) {
      console.error('Error during Facebook sign-in:', error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData.email;
        const pendingCredential = FacebookAuthProvider.credential(
          error.customData._tokenResponse.oauthAccessToken
        );

        const existingSignInMethods = await fetchSignInMethodsForEmail(auth, email);

        if (existingSignInMethods.includes('google.com')) {
          const googleProvider = new GoogleAuthProvider();
          try {
            const googleResult = await signInWithPopup(auth, googleProvider);
            await linkWithCredential(googleResult.user, pendingCredential);
            await signInWithCredential(auth, pendingCredential);

            const q = query(usersCollection, where('email', '==', googleResult.user.email));
            const querySnapshot = await getDocs(q);
            const facebookId = error.customData._tokenResponse.federatedId.split('/').pop();

            if (querySnapshot.docs.length > 0) {
              setAccessToken(pendingCredential.accessToken!);
              localStorage.setItem('facebook_token', pendingCredential.accessToken!);
              await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
                userFromFacebook: true,
                facebookId: facebookId,
                loginType: UserLoginType.facebook,
              });
            }
            console.info('Facebook account linked to Google account');
            return true;
          } catch (linkError: any) {
            if (
              linkError.code === 'auth/provider-already-linked' ||
              linkError.code === 'auth/popup-blocked'
            ) {
              const pendingCredential = FacebookAuthProvider.credential(
                error.customData._tokenResponse.oauthAccessToken
              );

              const q = query(usersCollection, where('email', '==', error.customData.email));
              const querySnapshot = await getDocs(q);
              const facebookId = error.customData._tokenResponse.federatedId.split('/').pop();

              // set states
              setAccessToken(pendingCredential.accessToken!);
              localStorage.setItem('facebook_token', pendingCredential.accessToken!);

              const fbData = error.customData._tokenResponse;

              if (querySnapshot.docs.length > 0) {
                await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
                  userFromFacebook: true,
                  facebookId: facebookId,
                  loginType: UserLoginType.facebook,
                });

                setAccessToken(pendingCredential.accessToken!);
                localStorage.setItem('facebook_token', pendingCredential.accessToken!);

                localStorage.setItem(
                  'firestore_user',
                  JSON.stringify({
                    ...querySnapshot.docs[0]?.data(),
                    id: querySnapshot.docs[0].id,
                    userFromFacebook: true,
                    facebookId: facebookId,
                    loginType: UserLoginType.facebook,
                  })
                );

                setCurrentUser({
                  ...querySnapshot.docs[0]?.data(),
                  // id: querySnapshot.docs[0].id,
                } as User);
                setFirestoreUser({
                  ...querySnapshot.docs[0]?.data(),
                  id: querySnapshot.docs[0].id,
                } as IUser);
              } else {
                const avatarUrl =
                  (await uploadProfileImageToFirebase(fbData.photoURL, fbData.localId)) || null;
                const newUserRef = await addDoc(usersCollection, {
                  email: fbData.email,
                  username: fbData.displayName,
                  friends: [],
                  friends_count: 0,
                  createdAt: new Date().toISOString(),
                  firebaseUid: fbData.localId,
                  postsCount: 0,
                  tripCount: 0,
                  friends_request_limit: 10,
                  avatarUrl: avatarUrl,
                  loginType: UserLoginType.facebook,
                  whereToNext: '',
                  itinerary: [],
                  userFromFacebook: true,
                  facebookId: facebookId,
                });

                const newUserInState = {
                  email: fbData.email,
                  username: fbData.displayName,
                  friends: [],
                  friends_count: 0,
                  createdAt: new Date().toISOString(),
                  firebaseUid: fbData.localId,
                  postsCount: 0,
                  tripCount: 0,
                  friends_request_limit: 10,
                  loginType: UserLoginType.facebook,
                  whereToNext: '',
                  itinerary: [],
                  avatarUrl: avatarUrl,
                  userFromFacebook: true,
                  facebookId: facebookId,
                  id: newUserRef.id,
                };

                localStorage.setItem('firestore_user', JSON.stringify(newUserInState));
                setAccessToken(pendingCredential.accessToken!);
                localStorage.setItem('facebook_token', pendingCredential.accessToken!);

                setCurrentUser(newUserInState as any);
                setFirestoreUser(newUserInState as IUser);
              }
              console.log('Accounts already linked, fields updated');

              return true;
            } else {
              console.error('Error linking Facebook to Google account:', linkError);
            }
          }
        } else {
          console.error('The email is linked with a provider other than Google.');
        }
      } else {
        console.error('Error during Facebook sign-in:', error);
      }
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
          loginType: UserLoginType.google,
        });
      } else {
        await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
          accessToken: null,
          userFromFacebook: false,
          facebookId: null,
          loginType: UserLoginType.google,
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
        loginType: UserLoginType.email,
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      // for old users, to set the field with the login type
      // to access the password change field in the settings
      const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
      await updateDoc(userDocRef, {
        loginType: UserLoginType.email,
      });

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
      const localUser = localStorage.getItem('firestore_user');
      if (localUser) {
        localStorage.removeItem('firestore_user');
        window.location.href = '/';
        setFirestoreUser(null);
        setCurrentUser(null);
      }
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
    accessToken,
    setFirestoreUser,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
