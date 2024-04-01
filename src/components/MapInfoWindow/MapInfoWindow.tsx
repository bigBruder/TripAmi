import React, { FC, useEffect, useState } from 'react';

import { storage } from '~/firebase';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';

import defaultUserIcon from '@assets/icons/defaultUserIcon.svg';
import { getDownloadURL, ref } from '@firebase/storage';
import { InfoWindow } from '@vis.gl/react-google-maps';

import Rating from '../Rating';
import styles from './MapInfoWindow.module.css';

interface Props {
  selectedTravel: ITravel;
  travels: ITravel[];
  friends: IUser[];
  selectedUser: IUser;
  handleClose: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MapInfoWindow: FC<Props> = ({ selectedTravel, handleClose, travels, friends }) => {
  const { location } = selectedTravel;
  const [userAvatars, setUserAvatars] = useState<any>([]);
  const [reviews, setReviews] = useState<ITravel[]>([]);

  useEffect(() => {
    setReviews(
      travels.filter(
        (travel) =>
          travel.location.latitude === location.latitude &&
          travel.location.longitude === location.longitude
      )
    );
  }, [selectedTravel]);

  useEffect(() => {
    Promise.all(
      reviews.map(async (review) => {
        const user = friends.find((friend) => friend.id === review.userId);

        if (user?.avatarUrl !== null) {
          return getDownloadURL(ref(storage, user?.avatarUrl));
        } else {
          return defaultUserIcon;
        }
      })
    ).then((urls) => {
      setUserAvatars(urls);
    });
  }, [reviews]);

  return (
    <InfoWindow
      position={{ lat: location.latitude, lng: location.longitude }}
      onCloseClick={() => handleClose(false)}
    >
      <div className={styles.reviews}>
        {reviews.map((review, idx) => (
          <div className={styles.info} key={review.id}>
            <div className={styles.top_container}>
              <div className={styles.short_info}>
                <img src={userAvatars[idx]} alt='avatar' className={styles.avatar} />

                <div className={styles.user_container}>
                  <p className={styles.user_name}>
                    {friends.find((friend) => friend.id === review.userId)?.username}
                  </p>
                  <p className={styles.location_name}>{review.location.name}</p>
                </div>
              </div>
              <Rating disabled selectedStars={review.rate} />
            </div>
            <div className={styles.bottom_container}>
              <p className={styles.trip_comment}>{review.text}</p>
            </div>
          </div>
        ))}
      </div>
    </InfoWindow>
  );
};
