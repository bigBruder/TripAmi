import {FC, useCallback, useContext, useState} from "react";
import styles from './commentField.module.css';
import {addDoc, doc, updateDoc} from "@firebase/firestore";
import {commentsCollection} from "~/types/firestoreCollections";
import {AuthContext} from "~/providers/authContext";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {db} from "~/firebase";
import {IPost} from "~/types/post";

interface Props {
  postId: string;
  commentsCount: number;
}

export const CommentField: FC<Props> = ({postId, commentsCount}) => {
  const {firestoreUser} = useContext(AuthContext);
  const [enteredText, setEnteredText] = useState('');

  const handleComment = useCallback(async () => {
    try {
      const docRef = doc(db, "posts", postId);

      await updateDoc<IPost>(docRef, {
        comments_count: commentsCount + 1,
      });

      await addDoc(commentsCollection, {
        likes: [],
        dislikes: [],
        postId,
        userId: firestoreUser?.id,
        userName: firestoreUser?.username,
        // userImage: firestoreUser?.userImage,
        createdAt: new Date().toISOString(),
        text: enteredText,
      });

      setEnteredText('');
    } catch (e) {
      // @ts-ignore
      alert(firebaseErrors[e.code]);
    }
  }, [enteredText, firestoreUser?.id, postId, commentsCount]);

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
    </div>
  );
};
