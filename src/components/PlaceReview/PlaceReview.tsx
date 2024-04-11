import { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { PlaceReviewType } from '~/types/placeReviews';
import { getDateToDisplay } from '~/utils/getDateToDisplay';

import Avatar from '@assets/icons/defaultUserIcon.svg';

import Rating from '../Rating';
import styles from './placeReview.module.css';

interface Props {
  review: PlaceReviewType;
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

const getDate = (timestamp) => {
  const options = {
    year: 'numeric',
    month: 'long',
    // day: 'numeric',
  };
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  return date.toLocaleString('en-US', options);
};

export const PlaceReview: FC<Props> = ({ review }) => {
  const { firestoreUser } = useContext(AuthContext);
  const [images, setImages] = useState<string[]>([]);
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [isExtended, setIsExtended] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const userAvatarRef = await getDownloadURL(ref(storage, review.authorAvatar));
      setUserAvatar(userAvatarRef);
    })();
  }, [review.authorAvatar]);

  useEffect(() => {
    (async () => {
      const images = await Promise.all(
        review.images.map(async (image) => await getDownloadURL(ref(storage, image)))
      );
      setImages(images);
    })();
  }, [review.images.join(',')]);

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <Rating selectedStars={review.rate} />
        <div>
          <img
            className={styles.avatar}
            src={userAvatar || Avatar}
            alt='user avatar'
            onClick={() => {
              if (review.authorId !== firestoreUser?.id) navigate(`/user/${review.authorId}`);
            }}
            style={{ cursor: review.authorId === firestoreUser?.id ? 'default' : 'pointer' }}
          />
        </div>
        <div className={styles.secondContainer}>
          <div className={styles.name}>{review.authorName}</div>
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
            {/* <p>{`${months[Number(trip.endDate.split('/')[1])]} ${trip.endDate.split('/')[2]}`}</p> */}
            <p>{getDate(review.createdAt)}</p>
          </div>
        </div>
        <div>
          {isExtended ? (
            <>
              <p className={styles.description}>{review.text}</p>
              <button className={styles.seeMoreButton} onClick={() => setIsExtended(false)}>
                see less
              </button>
            </>
          ) : (
            <>
              <p className={styles.description}>
                {review.text.slice(0, MAX_LENGTH)} {/* {trip.text.length > MAX_LENGTH && ( */}
                {review.text.length > MAX_LENGTH && (
                  <button className={styles.seeMoreButton}>see more</button>
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
