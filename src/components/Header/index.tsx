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
import { SignUpModal } from '~/components/SignUpModal/SignUpModal';
import { AuthContext } from '~/providers/authContext';
import { notificationsCollection } from '~/types/firestoreCollections';
import { Notification } from '~/types/notifications/notifications';

import defaultUserIcon from '@assets/icons/defaultUserIcon.svg';
import facebook_white from '@assets/icons/facebook_white.svg';
import Logo from '@assets/icons/headerLogo.svg';
import instagram_white from '@assets/icons/instagram_white.svg';
import x_white from '@assets/icons/x_white.svg';

import { DropdownProvider } from '../DropdownProvider/DropdownProvider';
import { Notifications } from '../Notifications/Notifications';
import styles from './header.module.css';

interface HeaderProps {
  avatar?: string;
  isFirestoreUser?: boolean;
}

const Header: React.FC<HeaderProps> = ({ avatar, isFirestoreUser }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { firestoreUser } = useContext(AuthContext);

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
          <>
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
          </>
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
