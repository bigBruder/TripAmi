import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignUpModal } from '~/components/SignUpModal/SignUpModal';

import facebook_white from '@assets/icons/facebook_white.svg';
import Logo from '@assets/icons/headerLogo.svg';
import search from '@assets/icons/iconamoon_search-thin.svg';
import instagram_white from '@assets/icons/instagram_white.svg';
import x_white from '@assets/icons/x_white.svg';

import styles from './header.module.css';

import defaultUserIcon from '@assets/icons/defaultUserIcon.svg';

interface HeaderProps {
  avatar?: string;
  isFirestoreUser?: boolean;
}

const Header: React.FC<HeaderProps> = ({ avatar, isFirestoreUser }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <img
          className={styles.logoHeader}
          src={Logo}
          onClick={() =>
            navigate('/profile', {
              state: {
                activeTab: 0,
              },
            })
          }
        />
        <div className={styles.header_icons}>
          <img src={facebook_white} alt='facebook_white' className={styles.iconSocial} />
          <img src={x_white} alt='x_white' className={styles.iconSocial} />
          <img src={instagram_white} alt='instagram_white' className={styles.iconSocial} />
        </div>
        {isFirestoreUser ? (
          <img
            className={styles.defaultUserIcon}
            src={isFirestoreUser ? avatar : defaultUserIcon}
            alt='default user icon'
            onClick={() =>
              navigate('/profile', {
                state: {
                  activeTab: 0,
                },
              })
            }
          />
        ) : (
          <div className={styles.icon}>
            <div className={styles.button} onClick={() => setModalIsOpen(true)}>
              Join Us
            </div>
          </div>
        )}
      </div>
      <SignUpModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} isLogin />
    </header>
  );
};

export default Header;
