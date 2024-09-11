import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  deleteDoc,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { NotificationsIcon } from '~/assets/icons/NotificationsIcon';
import { useInputFocus } from '~/hooks/useInputRef';
import { AuthContext } from '~/providers/authContext';
import { notificationsCollection } from '~/types/firestoreCollections';
import { Notification } from '~/types/notifications/notifications';

import Logo from '@assets/icons/headerLogo.svg';

import { DropdownProvider } from '../DropdownProvider/DropdownProvider';
import { Notifications } from '../Notifications/Notifications';
import SearchInputComponent from '../SearchInputComponent';
import styles from './HeaderNew.module.css';

interface HeaderNewProps {
  avatar: string;
}

const HeaderNew: React.FC<HeaderNewProps> = ({ avatar }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { firestoreUser } = useContext(AuthContext);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (!firestoreUser) return;
    const q = query(
      notificationsCollection,
      where('targetUserId', '==', firestoreUser?.id),
      orderBy('isReaded'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotifications(fetchedDocs as Notification[]);
    });

    return () => {
      unsubscribe();
    };
  }, [firestoreUser?.id]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [screenWidth]);

  const handleDeleteMessages = async () => {
    if (!notifications.length) return;
    try {
      const q = query(
        notificationsCollection,
        where('targetUserId', '==', notifications[0].targetUserId)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error removing document: ', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const q = query(notificationsCollection, where(documentId(), '==', messageId));

      const querySnapshot = await getDocs(q);
      await deleteDoc(querySnapshot.docs[0].ref);
    } catch (error) {
      console.error('Error removing document: ', error);
    }
  };

  return (
    <header className={styles.header}>
      {screenWidth > 530 ? (
        <div className={styles.headerContainer}>
          <div className={styles.notificationContainer}>
            {notifications && (
              <DropdownProvider
                trigger={
                  <NotificationsIcon
                    isActive={notifications.length > 0}
                    counter={notifications.length}
                  />
                }
                content={
                  <Notifications
                    onClose={() => { }}
                    notifications={notifications}
                    deleteMessages={handleDeleteMessages}
                    deleteMessage={handleDeleteMessage}
                  />
                }
              />
            )}
          </div>
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
          <div className={styles.notificationContainer}>
            {notifications && (
              <DropdownProvider
                trigger={
                  <NotificationsIcon
                    isActive={notifications.length > 0}
                    counter={notifications.length}
                  />
                }
                content={
                  <Notifications
                    onClose={() => { }}
                    notifications={notifications}
                    deleteMessages={handleDeleteMessages}
                    deleteMessage={handleDeleteMessage}
                  />
                }
              />
            )}
          </div>
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
