import search from "@assets/icons/iconamoon_search-thin.svg";
import styles from "./header.module.css";
import {SignUpModal} from "~/components/SignUpModal/SignUpModal";
import React, {useContext, useState} from "react";
import Logo from '@assets/icons/headerLogo.svg';
import { AuthContext } from "~/providers/authContext";

const Header = () => {
  const { firestoreUser } = useContext(AuthContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
 
  return (
    <div className={styles.header}>
      <img src={Logo} />
      { firestoreUser && (
         <div className={styles.inputWrapper}>
         <img className={styles.search} src={search} alt="search" />
         <input className={styles.input} placeholder="Search"></input>
       </div>
      )}
      <div className={styles.icon}>
        <button className={styles.button} onClick={() => setModalIsOpen(true)}>Log in</button>
      </div>

      <SignUpModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} isLogin />
    </div>
  );
};

export default Header;
