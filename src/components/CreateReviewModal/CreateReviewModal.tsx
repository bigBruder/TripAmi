import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { getBlob, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { firebaseErrors } from '~/constants/firebaseErrors';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { PlaceReviewType } from '~/types/placeReviews';

import { LoadingScreen } from '../LoadingScreen';
import Rating from '../Rating';
import styles from './createReviewModal.module.css';
import { create } from 'zustand';

interface Props {
  closeModal: () => void;
  placeId: string;
  startReview?: PlaceReviewType;
  placeName: string;
  isReview?: boolean;
  isAdvice?: boolean;
  fetchReviews: () => void;
}

export const CreateReviewModal: FC<Props> = ({
  closeModal,
  placeId,
  startReview,
  placeName,
  isReview,
  isAdvice,
  fetchReviews,
}) => {
  const { firestoreUser, updateFirestoreUser } = useContext(AuthContext);
  const [postText, setPostText] = useState(startReview?.text || '');
  const [adviceText, setAdviceText] = useState(startReview?.advice || '');
  const [selectedStars, setSelectedStars] = useState(startReview?.rate || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaxError, setIsMaxError] = useState(false);

  console.log(adviceText, 'adviceText');

  useEffect(() => {
    if (isMaxError) {
      notify('The maximum number of photos is 3');

      setIsMaxError(false);
    }
  }, [isMaxError]);

  const notify = (text: string) => toast.error(text);

  const handleSavePost = useCallback(async () => {
    try {
      setIsLoading(true);
      (async () => {
        if (startReview) {
          await updateDoc(doc(db, 'reviews', startReview.id), {
            text: postText,
            advice: adviceText,
            rate: selectedStars,
            createdAt: new Date(),
          });
          fetchReviews();
        } else {
          await addDoc(collection(db, 'reviews'), {
            authorId: firestoreUser?.id,
            authorName: firestoreUser?.username,
            authorAvatar: firestoreUser?.avatarUrl,
            text: postText,
            advice: adviceText,
            rate: selectedStars,
            createdAt: new Date(),
            placeId: placeId,
            placeName: placeName,
          });
          fetchReviews();
        }
      })();

      closeModal();
    } catch (err) {
      // @ts-ignore
      console.error(firebaseErrors[err.code]);
    } finally {
      setIsLoading(false);
    }
  }, [
    placeId,
    selectedStars,
    closeModal,
    postText,
    firestoreUser?.id,
    firestoreUser?.postsCount,
    updateFirestoreUser,
    adviceText,
  ]);

  const content = useMemo(() => {
    return (
      <div className={styles.contentContainer}>
        {isReview && (
          <>
            <h2>Add your review</h2>
            <textarea
              className={styles.textArea}
              placeholder='Describe your experience...'
              onChange={(e) => setPostText(e.target.value)}
              value={postText}
            />
            <div className={styles.rateContainer}>
              <p>Your Rate:</p>
              <Rating
                selectedStars={selectedStars}
                setSelectedStars={setSelectedStars}
                disabled={false}
              />
            </div>
          </>
        )}
        {isAdvice && (
          <>
            <h2>Add your advice</h2>
            <textarea
              className={styles.textArea}
              placeholder='Add advice...'
              onChange={(e) => setAdviceText(e.target.value)}
              value={adviceText}
            />
          </>
        )}
      </div>
    );
  }, [isReview, isAdvice, postText, selectedStars, adviceText]);

  return (
    <div className={styles.outer_container}>
      <div className={styles.container}>
        {content}
        <div className={styles.bottomRow}>
          <button className={styles.button} onClick={handleSavePost}>
            Post
          </button>
          <button
            className={`${styles.button} ${styles['button-gray']}`}
            onClick={() => closeModal()}
          >
            Cancel
          </button>
        </div>
      </div>

      {isLoading && <LoadingScreen />}
    </div>
  );
};
