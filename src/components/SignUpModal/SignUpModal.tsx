import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import { LoadingScreen } from '~/components/LoadingScreen';
import { auth } from '~/firebase';
import { AuthContext } from '~/providers/authContext';

import GoogleIcon from '@assets/icons/GoogleIcon.svg';
import FacebookIcon from '@assets/icons/facebook_logo_login.svg';

import styles from './signUpModal.module.css';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  isLogin?: boolean;
}

export const SignUpModal: FC<Props> = ({ onClose, isOpen, isLogin = false }) => {
  const [isRegisterForm, setIsRegisterForm] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(isLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const { signUp, signIn, signInViaGoogle, loading, signInWithFacebook, firestoreUser } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const handelRegister = useCallback(async () => {
    const result = await signUp(email, password, userName);

    if (result) {
      navigate('/profile');
    }
  }, [email, password, userName]);

  const handelLogin = useCallback(async () => {
    const result = await signIn(email, password);

    if (result) {
      if (auth.currentUser) {
        navigate('/profile');
      } else {
        console.error('User not authenticated');
      }
    }
  }, [email, password]);

  const handleLoginWithGoogle = useCallback(async () => {
    const result = await signInViaGoogle();

    if (result) {
      navigate('/profile');
    }
  }, []);

  const handleLoginFacebook = async () => {
    const result = await signInWithFacebook();
    if (result) {
      navigate('/profile');
    }
  };

  const registerFormOrOAuth = useMemo(() => {
    if (isRegisterForm) {
      return (
        <div className={styles.inputContainer}>
          <input
            type='email'
            placeholder='Write your email'
            className={styles.facebook}
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <input
            placeholder='Write your password'
            type='password'
            className={styles.facebook}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <input
            placeholder='Write your username'
            type='text'
            className={styles.facebook}
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
          />
        </div>
      );
    } else if (isLoginForm) {
      return (
        <>
          <div className={styles.apple}>
            <input
              placeholder='Write your email'
              type='email'
              className={styles.facebook}
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className={styles.apple}>
            <input
              placeholder='Write your password'
              type='password'
              className={styles.facebook}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <div className={`${styles.facebook} ${styles.google}`} onClick={handleLoginWithGoogle}>
            <img className={styles.icon} src={GoogleIcon} alt='google icon' />
            <span className={styles.name}>Continue with Google</span>
          </div>

          <div
            className={`${styles.facebook} ${styles.google} ${styles.facebookBg}`}
            onClick={handleLoginFacebook}
          >
            <img className={styles.icon} src={FacebookIcon} alt='google icon' />
            <span className={styles.name}>Continue with Facebook</span>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={`${styles.facebook} ${styles.google}`} onClick={handleLoginWithGoogle}>
            <img className={styles.icon} src={GoogleIcon} alt='google icon' />
            <span className={styles.name}>Continue with Google</span>
          </div>
          <div
            className={`${styles.facebook} ${styles.google} ${styles.facebookBg}`}
            onClick={handleLoginFacebook}
          >
            <img className={styles.icon} src={FacebookIcon} alt='google icon' />
            <span className={styles.name}>Continue with Facebook</span>
          </div>
        </>
      );
    }
  }, [password, isRegisterForm, email, isLoginForm, userName]);

  const handleOpenRegisterForm = useCallback(() => {
    setPassword('');
    setEmail('');
    setIsRegisterForm((prevState) => !prevState);
  }, []);

  const handleOpenSignInForm = useCallback(() => {
    setPassword('');
    setEmail('');
    setIsRegisterForm(false);
    setIsLoginForm((prevState) => !prevState);
  }, []);

  return isOpen ? (
    <>
      <div className={styles.background} onClick={onClose} />
      <div className={styles.box} onClick={onClose}>
        <div className={styles.container} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.title}>{isLoginForm ? 'Login in' : 'Sign up'}</h3>
          {registerFormOrOAuth}
          <div className={styles.buttonsContainer}>
            {!isLoginForm && (
              <button
                className={isRegisterForm ? styles.back : styles.email}
                onClick={handleOpenRegisterForm}
              >
                {isRegisterForm ? 'Back' : 'Sign up with email'}
              </button>
            )}
            {isRegisterForm ? (
              <button
                type='submit'
                className={styles.email}
                style={{ marginTop: 0 }}
                onClick={handelRegister}
              >
                Register!
              </button>
            ) : null}
            {isLoginForm && (
              <button className={styles.email} onClick={handelLogin}>
                {'Login'}
              </button>
            )}
          </div>
          <div className={styles.footer}>
            <span className={styles.accquestion}>
              {isLoginForm ? 'Don’t have an account?' : 'Have an account?'}
            </span>
            <span className={styles.loginBtn} onClick={handleOpenSignInForm}>
              {isLoginForm ? 'Register' : 'Log in'}
            </span>
          </div>
          {!isLoginForm && (
            <span className={styles.text}>
              By creating an account, you agree to the Goodreads{' '}
              <a href='#service'>Terms of Service</a> and <a href='#privacy'>Privacy Policy</a>.
            </span>
          )}
        </div>
      </div>
      {loading && <LoadingScreen />}
    </>
  ) : null;
};
