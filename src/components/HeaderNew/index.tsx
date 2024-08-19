import React from 'react';
import { useNavigate } from 'react-router-dom';

import Logo from '@assets/icons/headerLogo.svg';

import styles from './HeaderNew.module.css';

interface HeaderNewProps {
  avatar: string;
}

const HeaderNew: React.FC<HeaderNewProps> = ({ avatar }) => {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <img
          className={styles.logoHeader}
          src={Logo}
          onClick={() =>
            navigate('/', {
              state: {
                activeTab: 0,
              },
            })
          }
        />
        <div className={styles.iconsHeader}>
          <img src='' alt='' />
          <img src='' alt='' />
          <img src='' alt='' />
        </div>
        <img
          className={styles.defaultUserIcon}
          src={avatar}
          alt='default user icon'
          onClick={() =>
            navigate('/profile', {
              state: {
                activeTab: 0,
              },
            })
          }
        />
      </div>
    </header>
  );
};

export default HeaderNew;
