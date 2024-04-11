import { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { documentId, getDocs, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { usersCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';

import Avatar from '@assets/icons/defaultUserIcon.svg';

import styles from './placeTripReview.module.css';

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

export const PlaceTripReview: FC<Props> = ({ trip }) => {
  const { firestoreUser } = useContext(AuthContext);
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
          trip.imageUrl.map(async (image) => {
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
      <div className={`${styles.dateContainer} ${styles.activeOnMobile}`}>
        <div>
          <h3>{trip.tripName || ''}</h3>
        </div>
        <div>
          <p>{`${months[Number(trip.endDate.split('/')[1])]} ${trip.endDate.split('/')[2]}`}</p>
        </div>
      </div>
      <div className={styles.leftContainer}>
        {/* <Rating selectedStars={trip.rate} /> */}
        <div className={styles.topLeftContainer}>
          <img
            className={styles.avatar}
            src={user?.avatarUrl || Avatar}
            alt='user avatar'
            onClick={() => {
              if (user?.id !== firestoreUser?.id) navigate(`/user/${user?.id}`);
            }}
            style={{ cursor: user?.id !== firestoreUser?.id ? 'pointer' : 'default' }}
          />

          <div className={styles.secondContainer}>
            <div className={styles.name}>{user?.username}</div>
            <div className={styles.imagesContainer}>
              {images.slice(0, 2).map((image, index) => (
                <div key={image + index} style={{ position: 'relative' }}>
                  <img
                    src={image}
                    alt='place image'
                    className={`${styles.image} ${images.length > 2 && index === 1 && styles.lastImage}`}
                  />
                  {images.length > 2 && index === 1 && styles.lastImage && (
                    <p className={styles.lastImageIndicator}>+{images.length - 2}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.geoTagsContainer}>
          {trip?.cities?.map((tag) => (
            <p
              onClick={() => navigate('/place/' + tag.placeID)}
              key={tag.placeID}
              className={styles.tag}
            >
              {tag.address.split(',')[0]}
            </p>
          ))}
          {trip?.geoTags?.map((tag) => (
            <p
              onClick={() => navigate('/place/' + tag.placeID)}
              key={tag.placeID}
              className={styles.tag}
            >
              {tag.address.split(',')[0]}
            </p>
          ))}
        </div>
      </div>
      <div className={styles.rightContainer}>
        <div className={`${styles.dateContainer} ${styles.inActiveOnMobile}`}>
          <div>
            <h3>{trip.tripName}</h3>
          </div>
          <div>
            <p>{`${months[Number(trip.endDate.split('/')[1])]} ${trip.endDate.split('/')[2]}`}</p>
          </div>
        </div>
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
              {trip.text.slice(0, MAX_LENGTH)} {/* {trip.text.length > MAX_LENGTH && ( */}
              {trip.text.length > MAX_LENGTH && (
                <button
                  className={styles.seeMoreButton}
                  onClick={() => {
                    setIsExtended(true);
                  }}
                >
                  see more
                </button>
              )}
              {/* )} */}
            </p>
          </>
        )}
        {/* <div dangerouslySetInnerHTML={{ __html: trip.text }} /> */}
      </div>
    </div>
  );
};
