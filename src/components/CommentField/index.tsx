import {FC, useCallback, useContext, useState} from "react";
import styles from './commentField.module.css';
import {addDoc, doc, updateDoc} from "@firebase/firestore";
import {commentsCollection} from "~/types/firestoreCollections";
import {AuthContext} from "~/providers/authContext";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {db} from "~/firebase";
import {IPost} from "~/types/post";
import { ToastContainer, toast } from "react-toastify";

interface Props {
  postId: string;
  commentsCount: number;
  contentType: 'post' | 'trip';
}

export const CommentField: FC<Props> = ({postId, commentsCount, contentType}) => {
  const {firestoreUser} = useContext(AuthContext);
  const [enteredText, setEnteredText] = useState('');
  const notify = (text: string) => toast.error(text);

  const handleComment = useCallback(async () => {
    try {
      if (!enteredText) {
        notify('Please enter a comment');
        return;
      }
      const collection = contentType === 'post' ? 'posts' : 'trips';
      const docRef = doc(db, collection, postId);

      await updateDoc<IPost>(docRef, {
        comments_count: commentsCount + 1,
      });

      await addDoc(commentsCollection, {
        likes: [],
        dislikes: [],
        postId,
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
  }, [contentType, postId, commentsCount, firestoreUser?.id, firestoreUser?.username, enteredText]);

  return (
    <div className={styles.container}>
      <textarea
        className={styles.input}
        placeholder={'What are your thoughts?'}
        onChange={(event) => setEnteredText(event.target.value)}
        value={enteredText}
      />
      <div className={styles.buttonsContainer}>
        <button className={styles.commentButton} onClick={handleComment}>Comment</button>
      </div>

      <ToastContainer closeOnClick autoClose={2000} limit={1} pauseOnHover={false} />
    </div>
  );
};
