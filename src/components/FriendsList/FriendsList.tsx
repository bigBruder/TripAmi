import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { documentId, getDocs, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '~/firebase';
import { usersCollection } from '~/types/firestoreCollections';
import { IUser } from '~/types/user';

import Avatar from '@assets/icons/defaultUserIcon.svg';

import styles from './friendsList.module.css';

interface Props {
  friendsId: string[];
}

export const FriendsList: FC<Props> = ({ friendsId }) => {
  const [friends, setFriends] = useState<IUser[]>([]);
  const navigate = useNavigate();
  console.log(friendsId);

  useEffect(() => {
    if (friendsId.length === 0) return;
    try {
      (async () => {
        const q = query(usersCollection, where(documentId(), 'in', friendsId));
        const querySnapshot = await getDocs(q);
        const friends = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as IUser);
        const friendsWithAvatars = await Promise.all(
          friends.map(async (friend) => {
            if (!friend.avatarUrl || friend.avatarUrl === 'null') {
              return { ...friend, avatarUrl: Avatar };
            }
            const avatarUrl = await getDownloadURL(ref(storage, friend.avatarUrl));
            return { ...friend, avatarUrl: avatarUrl };
          })
        );

        setFriends(friendsWithAvatars);
      })();
    } catch (error) {
      console.error('Error getting documents: ', error);
    }
  }, [friendsId.join('')]);

  const handleOpenProfile = (id: string) => {
    if (!id) return;
    navigate('/user/' + id);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Friends</h2>

      <div className={styles.listContainer}>
        {friends &&
          friends.length > 0 &&
          friends.map((friend) => (
            <div
              key={friend.id}
              className={styles.userContainer}
              onClick={() => handleOpenProfile(friend.id)}
            >
              <img src={friend.avatarUrl} alt='friend avatar' className={styles.avatar} />
              <div className={styles.descriptionContainer}>
                <p>{friend.username}</p>
                <p>{friend.email}</p>
              </div>
            </div>
          ))}
        {friends &&
          friends.length > 0 &&
          friends.map((friend) => (
            <div key={friend.id} className={styles.userContainer}>
              <img src={friend.avatarUrl} alt='friend avatar' className={styles.avatar} />
              <div className={styles.descriptionContainer}>
                <p>{friend.username}</p>
                <p>{friend.email}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
