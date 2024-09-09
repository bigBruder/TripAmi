import { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { PlaceReviewType } from '~/types/placeReviews';

import Avatar from '@assets/icons/defaultUserIcon.svg';

import Rating from '../Rating';
import styles from './placeReview.module.css';

interface Props {
  review: PlaceReviewType;
  mainTitle: string;
}

const MAX_LENGTH = 200;

//@ts-ignore
const getDate = (timestamp) => {
  const options = {
    year: 'numeric' as const,
    month: 'long' as const,
  };
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  return date.toLocaleString('en-US', options);
};

export const PlaceReview: FC<Props> = ({ review, mainTitle }) => {
  const { firestoreUser } = useContext(AuthContext);
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [isExtended, setIsExtended] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const userAvatarRef = await getDownloadURL(ref(storage, review.authorAvatar));
      setUserAvatar(userAvatarRef);
    })();
  }, [review.authorAvatar]);

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <div className={styles.reviewInfoContainer}>
          <div className={styles.avatarContainer}>
            <img
              className={styles.avatar}
              src={userAvatar || Avatar}
              alt='user avatar'
              onClick={() => {
                if (review.authorId !== firestoreUser?.id) navigate(`/user/${review.authorId}`);
              }}
              style={{ cursor: review.authorId === firestoreUser?.id ? 'default' : 'pointer' }}
            />

            <div className={styles.rate}>
              <div className={`${styles.name}`}>{review.authorName}</div>
              <p style={{ display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                {getDate(review.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.upperRightContainer}`}>
          <div className={styles.dateContainer}>
            <Rating selectedStars={review.rate} />
          </div>
        </div>
      </div>
      <div className={styles.rightContainer}>
        <div className={styles.lowerRightContainer}>
          <div className={styles.descriptionContainer}>
            {isExtended ? (
              <>
                <p className={styles.description}>{mainTitle.replaceAll('<br />', '\n')}</p>
                <button className={styles.seeMoreButton} onClick={() => setIsExtended(false)}>
                  see less
                </button>
              </>
            ) : (
              <>
                <p className={styles.description}>
                  {mainTitle.slice(0, MAX_LENGTH).replaceAll('<br />', '\n')}{' '}
                  {mainTitle.length > MAX_LENGTH && (
                    <button className={styles.seeMoreButton} onClick={() => setIsExtended(true)}>
                      see more
                    </button>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
