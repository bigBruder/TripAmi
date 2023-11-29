import facebookIcon from "@assets/icons/uil_facebook.svg";
import appleIcon from "@assets/icons/ic_apple.svg";
import globeImg from "@assets/icons/globe.svg";
import globearoud from "@assets/icons/globearound.svg";
import styles from "./auth.module.css";
import { useNavigate } from 'react-router-dom';
import React, {useCallback, useState} from "react";
import CreatePostModal from "~/components/CreatePostModal";
import CustomModal from "~/components/CustomModal";
import {SignUpModal} from "~/components/SignUpModal/SignUpModal";

const AuthModal = () => {
  const navigate = useNavigate();
  const [signUpFormIsOpen, setSignUpFormIsOpen] = useState(false);

  const onCloseModal = useCallback(() => {
    setSignUpFormIsOpen(false);
  }, []);

  return (
    <div className={styles.box}>
      <h3 className={styles.title}>Sign up for an account</h3>
      <div className={styles.container}>
        <button className={styles.email} onClick={() => setSignUpFormIsOpen(true)}>Join us</button>
      </div>
      <img className={styles.globe} src={globeImg} alt="globe" />
      <img className={styles.globearound} src={globearoud} alt="aroundglobe" />

      <SignUpModal isOpen={signUpFormIsOpen} onClose={onCloseModal} />
    </div>
  );
};

export default AuthModal;
