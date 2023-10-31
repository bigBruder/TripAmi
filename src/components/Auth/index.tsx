import facebookIcon from "@assets/icons/uil_facebook.svg";
import appleIcon from "@assets/icons/ic_apple.svg";
import globeImg from "@assets/icons/globe.svg";
import globearoud from "@assets/icons/globearound.svg";
import styles from "./auth.module.css";
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.box}>
      <h3 className={styles.title}>Sign up for an account</h3>
      <div className={styles.container}>
        <div className={styles.facebook}>
          <img className={styles.icon} src={facebookIcon} alt="facebookIcon" />
          <span className={styles.name}>Continue with Facebook</span>
        </div>
        <div className={styles.apple}>
          <img className={styles.icon} src={appleIcon} alt="appleIcon" />
          <span className={styles.name}>Continue with Apple</span>
        </div>
        <div className={styles.devideContainer}>
          <div className={styles.divider}></div>
          <span className={styles.or}>OR</span>
          <div className={styles.divider}></div>
        </div>
        <button className={styles.email} onClick={() => navigate('/profile')}>Sign up with email</button>
        <span className={styles.text}>
          By creating an account, you agree to the Goodreads{" "}
          <a href="#service">Terms of Service</a> and{" "}
          <a href="#privacy">Privacy Policy</a>.
        </span>
        <div className={styles.divider}></div>
        <div className={styles.footer}>
          <span className={styles.accquestion}>Have an account?</span>
          <span className={styles.loginBtn}>Log in</span>
        </div>
      </div>
      <img className={styles.globe} src={globeImg} alt="globe" />
      <img className={styles.globearound} src={globearoud} alt="aroundglobe" />
    </div>
  );
};

export default AuthModal;
