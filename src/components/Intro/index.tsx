import styles from "./intro.module.css";
import React, {useContext, useState} from "react";
import {SignUpModal} from "~/components/SignUpModal/SignUpModal";
import { AuthContext } from "~/providers/authContext";

const Intro = () => {
  const { modalOpen, setModalOpen} = useContext(AuthContext);

  return (
    <div className={styles.container}>
      <p className={styles.first}>Tired of relying on travel reviews from randoms? Now see reviews only from people you know!</p>
      <p className={styles.second}>Join the platform and find out what people are saying about their travels!</p>
      <button className={styles.email} onClick={() => setModalOpen(true)}>Join us</button>

      <SignUpModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Intro;
