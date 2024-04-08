import { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { documentId, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '~/firebase';
import { usersCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';

import Avatar from '@assets/icons/defaultUserIcon.svg';

import Rating from '../Rating';
import styles from './placeReview.module.css';

interface Props {
  trip: ITravel;
}
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MAX_LENGTH = 200;

export const PlaceReview: FC<Props> = ({ trip }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isExtended, setIsExtended] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      (async () => {
        const q = query(usersCollection, where(documentId(), '==', trip.userId));
        const querySnapshot = await getDocs(q);
        const fetchedUser = querySnapshot.docs[0].data();
        const avatarUrl = await getDownloadURL(ref(storage, fetchedUser.avatarUrl));

        setUser({ ...fetchedUser, avatarUrl: avatarUrl } as IUser);
      })();
    } catch (error) {
      console.error(error);
    }
  }, [trip.userId]);

  useEffect(() => {
    try {
      (async () => {
        const imagesUrls = await Promise.all(
          trip.imageUrl.slice(0, 2).map(async (image) => {
            const url = await getDownloadURL(ref(storage, image.url));
            return url;
          })
        );

        setImages(imagesUrls);
      })();
    } catch (error) {
      console.error(error);
    }
  }, [trip.id]);

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <Rating selectedStars={trip.rate} />
        <div>
          <img
            className={styles.avatar}
            src={user?.avatarUrl || Avatar}
            alt='user avatar'
            onClick={() => {
              navigate(`/user/${user?.id}`);
            }}
          />
        </div>
        <div className={styles.secondContainer}>
          <div className={styles.name}>{user?.username}</div>
          <div className={styles.imagesContainer}>
            {images.map((image, index) => (
              <img key={image + index} src={image} alt='place image' className={styles.image} />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.rightContainer}>
        <div className={styles.dateContainer}>
          <div>
            <p>{`${months[Number(trip.endDate.split('/')[1])]} ${trip.endDate.split('/')[2]}`}</p>
          </div>
        </div>
        <div>
          {isExtended ? (
            <>
              <p className={styles.description}>{trip.text}</p>
              <button className={styles.seeMoreButton} onClick={() => setIsExtended(false)}>
                see less
              </button>
            </>
          ) : (
            <>
              <p className={styles.description}>
                {trip.text.slice(0, MAX_LENGTH)}{' '}
                {trip.text.length > MAX_LENGTH && (
                  <button
                    className={styles.seeMoreButton}
                    onClick={() => {
                      console.log('clicked');
                      setIsExtended(true);
                    }}
                  >
                    see more
                  </button>
                )}
              </p>
            </>
          )}
          {/* <div dangerouslySetInnerHTML={{ __html: trip.text }} /> */}
        </div>
      </div>
    </div>
  );
};
