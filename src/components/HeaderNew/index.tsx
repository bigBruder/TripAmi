import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Logo from '@assets/icons/headerLogo.svg';

import SearchInputComponent from '../SearchInputComponent';
import styles from './HeaderNew.module.css';

interface HeaderNewProps {
  avatar: string;
}

const HeaderNew: React.FC<HeaderNewProps> = ({ avatar }) => {
  const navigate = useNavigate();

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [screenWidth]);

  return (
    <header className={styles.header}>
      {screenWidth > 530 ? (
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
          <SearchInputComponent />
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
      ) : (
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
          <div className={styles.mobileSearchContainer}>
            <SearchInputComponent />
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
        </div>
      )}
    </header>
  );
};

export default HeaderNew;
