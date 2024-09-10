import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import cn from 'classnames';
import { AuthContext } from '~/providers/authContext';
import { UserCard } from '~/routes/AppRoutes/AddNewFriends/AddNewFriends';
import { usersCollection } from '~/types/firestoreCollections';
import { IUser } from '~/types/user';

import { documentId, onSnapshot, query, where } from '@firebase/firestore';

import styles from './myFriends.module.css';
import no_trips_search from '/no_trips_search.svg';

export const MyFriends = () => {
  const { firestoreUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState<IUser[]>([]);
  const [copyLink, setCopyLink] = useState(false);

  useEffect(() => {
    if (firestoreUser?.friends?.length) {
      const q = query(usersCollection, where(documentId(), 'in', firestoreUser?.friends));
      const unsub = onSnapshot(q, (querySnapshot) => {
        const fetchedUsers = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setFriends(fetchedUsers as IUser[]);
      });

      return () => {
        unsub();
      };
    } else {
      setFriends([]);
    }
  }, [firestoreUser?.friends]);

  const handleCopyLink = () => {
    const link = window.location.origin + '/?ref=' + firestoreUser?.id;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopyLink(true);
        setTimeout(() => {
          setCopyLink(false);
        }, 5000);
      })
      .catch(() => {
        console.log('Failed to copy link to clipboard');
      });
  };

  return (
    <div className={styles.container}>
      <div
        className={cn([styles.usersContainer], { [styles.displayEmptyFriends]: !friends.length })}
      >
        {friends.length ? (
          friends.map((friend) => <UserCard key={friend.id} user={friend} isFriend isTabs />)
        ) : (
          <>
            <p className={styles.emptyState}>Hmm... Unfortunately, you have no friends.</p>
            <p className={styles.emptyState}>Fix it now and add your first friends!</p>
            <button
              className={styles.button}
              onClick={() => navigate('/add-friends')}
              style={{ marginTop: '16px' }}
            >
              Add friends
            </button>
            <img src={no_trips_search} alt='no_trips_search' className={styles.imageF} />
            <div className={styles.invitePeopleContainer}>
              <p className={styles.emptyState}>
                Also, you can add only {firestoreUser?.friends_request_limit} new friends!
              </p>
              <button
                className={`${styles.button} ${styles.invite_button}`}
                onClick={() => handleCopyLink()}
                style={{ backgroundColor: '#629015' }}
              >
                {copyLink ? 'Link copied!' : 'Invite friends'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
