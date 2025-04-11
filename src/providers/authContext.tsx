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

  // console.log('firestoreUser', firestoreUser);
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

        console.log('currentUser', currentUser);

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
    console.info('[Facebook Login] Починаємо вхід через Facebook');

    try {
      const fbResponse = await new Promise((resolve, reject) => {
        window.FB.login(
          (response) => {
            if (response.authResponse) {
              console.info('[Facebook Login] Отримано authResponse');
              resolve(response);
            } else {
              console.warn('[Facebook Login] Користувач скасував або не авторизувався');
              reject(new Error('User cancelled login or did not fully authorize.'));
            }
          },
          { scope: 'email,public_profile,user_friends' }
        );
      });

      const accessToken = fbResponse.authResponse.accessToken;
      console.log('[Facebook Login] Facebook accessToken:', accessToken);

      const credential = FacebookAuthProvider.credential(accessToken);

      // Optional: отримання long-lived токена
      const longLivedTokenResponse = await fetch(
        `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`
      );
      const longLivedTokenData = await longLivedTokenResponse.json();
      const longLiveAccessToken = longLivedTokenData.access_token;
      console.log('[Facebook Login] Long-lived access token:', longLiveAccessToken);

      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      console.log('[Facebook Login] Firebase user:', user);

      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      setAccessToken(accessToken);
      localStorage.setItem('facebook_token', longLiveAccessToken);

      const avatarUrl = (await uploadProfileImageToFirebase(user.photoURL, user.uid)) || null;

      if (querySnapshot.docs.length === 0) {
        console.info('[Facebook Login] Створюємо нового користувача в Firestore');
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
        console.info('[Facebook Login] Оновлюємо існуючого користувача');
        const facebookId = user.providerData.find(
          (provider) => provider.providerId === 'facebook.com'
        )?.uid;

        await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
          userFromFacebook: true,
          facebookId: facebookId,
          username: user.displayName,
          avatarUrl: avatarUrl,
          loginType: UserLoginType.facebook,
        });
      }

      return true;
    } catch (error: any) {
      console.error('[Facebook Login] Помилка авторизації:', error);

      if (error.code === 'auth/account-exists-with-different-credential') {
        console.warn('[Facebook Login] Акаунт вже існує з іншим провайдером');
        const email = error.customData.email;
        const pendingCredential = FacebookAuthProvider.credential(
          error.customData._tokenResponse.oauthAccessToken
        );
        const existingSignInMethods = await fetchSignInMethodsForEmail(auth, email);

        if (existingSignInMethods.includes('google.com')) {
          console.info('[Facebook Login] Email привʼязаний до Google — намагаємось зʼєднати');
          try {
            const googleProvider = new GoogleAuthProvider();
            const googleResult = await signInWithPopup(auth, googleProvider);
            await linkWithCredential(googleResult.user, pendingCredential);
            await signInWithCredential(auth, pendingCredential);

            const q = query(usersCollection, where('email', '==', googleResult.user.email));
            const querySnapshot = await getDocs(q);
            const facebookId = error.customData._tokenResponse.federatedId.split('/').pop();

            if (querySnapshot.docs.length > 0) {
              console.info('[Facebook Login] Зʼєднані акаунти, оновлюємо дані');
              setAccessToken(pendingCredential.accessToken!);
              localStorage.setItem('facebook_token', pendingCredential.accessToken!);
              await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
                userFromFacebook: true,
                facebookId: facebookId,
                loginType: UserLoginType.facebook,
              });
            }

            return true;
          } catch (linkError: any) {
            console.warn('[Facebook Login] Помилка при зʼєднанні акаунтів:', linkError.code);
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

              const linkedUserCredential = await signInWithCredential(auth, pendingCredential);
              const linkedUser = linkedUserCredential.user;

              console.log('[Facebook Login] Акаунти вже зʼєднані. Користувач:', linkedUser);
              setAccessToken(pendingCredential.accessToken!);
              localStorage.setItem('facebook_token', pendingCredential.accessToken!);

              if (querySnapshot.docs.length > 0) {
                await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
                  userFromFacebook: true,
                  facebookId: facebookId,
                  loginType: UserLoginType.facebook,
                });
                setCurrentUser({
                  ...querySnapshot.docs[0]?.data(),
                } as User);
                setFirestoreUser({
                  ...querySnapshot.docs[0]?.data(),
                  id: querySnapshot.docs[0].id,
                } as IUser);
              }

              return true;
            } else {
              console.error('[Facebook Login] Неочікувана помилка при лінкуванні:', linkError);
            }
          }
        } else {
          console.error('[Facebook Login] Email привʼязаний не до Google:', existingSignInMethods);
        }
      }

      return false;
    } finally {
      setLoading(false);
      console.info('[Facebook Login] Завершення процесу');
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
