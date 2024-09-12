import { FC, useCallback, useContext, useState } from 'react';

import { firebaseErrors } from '~/constants/firebaseErrors';
import { AuthContext } from '~/providers/authContext';
import { placesCommentsCollection } from '~/types/firestoreCollections';

import { addDoc } from '@firebase/firestore';

import styles from './placeCommentField.module.css';

interface Props {
  placeId: string;
}

export const PlaceCommentField: FC<Props> = ({ placeId }) => {
  const { firestoreUser } = useContext(AuthContext);
  const [enteredText, setEnteredText] = useState('');

  const handleComment = useCallback(async () => {
    try {
      await addDoc(placesCommentsCollection, {
        likes: [],
        dislikes: [],
        placeId,
        userId: firestoreUser?.id,
        userName: firestoreUser?.username,
        userImage: firestoreUser?.avatarUrl,
        createdAt: new Date().toISOString(),
        text: enteredText,
      });

      setEnteredText('');
    } catch (e) {
      // @ts-ignore
      alert(firebaseErrors[e.code]);
    }
  }, [enteredText, firestoreUser?.avatarUrl, firestoreUser?.id, firestoreUser?.username, placeId]);

  return (
    <div className={styles.container}>
      <textarea
        className={styles.input}
        placeholder={'What are your thoughts?'}
        onChange={(event) => setEnteredText(event.target.value)}
        value={enteredText}
      />
      <div className={styles.buttonsContainer}>
        <button className={styles.commentButton} onClick={handleComment}>
          Comment
        </button>
      </div>
    </div>
  );
};
