import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { create } from 'zustand';
import { storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { IPost } from '~/types/post';
import { IUser } from '~/types/user';

import Avatar from '@assets/icons/defaultUserIcon.svg';
import { timeAgo } from '@utils/daysAgo';

import styles from './userPostInfo.module.css';

interface Props {
  userData: IUser;
  createdAt?: string;
  userPhotoUrl?: string;
  postData?: IPost;
  imagesUrl?: string[] | null;
  isMasterPage?: boolean;
  setPosted?: React.Dispatch<React.SetStateAction<string>>;
}
//@ts-ignore
const getDate = (createdAt) => {
  const dateTo = new Date(createdAt);

  const seconds = Math.floor(dateTo.getTime() / 1000);
  const nanoseconds = (dateTo.getTime() % 1000) * 1e6; // перетворення мілісекунд у наносекунди

  // Створення Timestamp
  const timestamp = new Timestamp(seconds, nanoseconds);
  const options = {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
    hour: 'numeric' as const,
    minute: 'numeric' as const,
  };
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  return date.toLocaleString('en-US', options);
};

export const UserPostInfo: FC<Props> = ({
  userData,
  createdAt,
  userPhotoUrl,
  postData,
  imagesUrl,
  isMasterPage = false,
  setPosted,
}) => {
  const navigate = useNavigate();
  const { firestoreUser } = useContext(AuthContext);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const handleOpenUserProfile = useCallback(() => {
    if (userData.id !== firestoreUser?.id) {
      navigate('/user/' + userData.id);
    } else {
      navigate('/profile');
    }
  }, [firestoreUser, navigate, userData]);

  useEffect(() => {
    if (userData?.avatarUrl) {
      (async () => {
        const avatarLink = await getDownloadURL(ref(storage, userData?.avatarUrl));
        setUserAvatar(avatarLink);
      })();
    }
  }, [userData?.avatarUrl, userPhotoUrl]);

  return (
    <div className={styles.userContainer}>
      <div className={styles.leftContainer} onClick={handleOpenUserProfile}>
        <img src={userAvatar || Avatar} style={{ width: 40, height: 40, borderRadius: 50 }} />
        <div>
          <p className={styles.location}>{userData?.username}</p>
          {createdAt && <p className={styles.time}>{getDate(Date.parse(createdAt))}</p>}
        </div>
      </div>
      {/* {!isMasterPage && (
        <button className={styles.button}>
          <p
            className={styles.buttonText}
            onClick={() =>
              navigate('/posts/' + postData?.id, {
                state: {
                  ...postData,
                  imageUrls: imagesUrl,
                },
              })
            }
          >
            view
          </p>
        </button>
      )} */}
    </div>
  );
};
