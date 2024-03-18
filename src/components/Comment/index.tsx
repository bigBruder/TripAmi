import {IComment, IPlaceComment} from "~/types/comments";
import {FC, useCallback, useContext, useEffect, useMemo, useState} from "react";
import styles from './comment.module.css';
import {UserPostInfo} from "~/components/BigPost/UserPostInfo";
import {CommentActions} from "~/components/CommentActions";
import {LikeIcon} from "@assets/icons/likeIcon";
import {AuthContext} from "~/providers/authContext";
import {doc, updateDoc} from "@firebase/firestore";
import {db, storage} from "~/firebase";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {getDownloadURL} from "firebase/storage";
import {ref} from "@firebase/storage";

interface Props {
  comment: IComment | IPlaceComment;
}

export const Comment: FC<Props> = ({comment}) => {
  const {likes, dislikes, id} = comment;
  const {firestoreUser} = useContext(AuthContext);
  const likedByUser = useMemo(() => firestoreUser?.id && likes.includes(firestoreUser.id),[likes, firestoreUser?.id]);
  const dislikedByUser = useMemo(() => firestoreUser?.id && dislikes.includes(firestoreUser.id),[dislikes, firestoreUser?.id]);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>();

  // useEffect(() => {
  //   (async () => {
  //     if (firestoreUser?.avatarUrl) {
  //       const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl));

  //       setUserPhotoUrl(url);
  //     }
  //   })();
  // }, [firestoreUser?.avatarUrl]);

  useEffect(() => {
    console.log(comment.userImage);
    (async () => {
      if (comment.userId) {
        // const url = await getDownloadURL(ref(storage, comment.userImage));
        // console.log(url);

        setUserPhotoUrl(comment.userImage);
      }
    })();
  }, [comment.userId, comment.userImage]);

  const spliceFromArr = useCallback((arr: string[], value: string) => {
    const index = arr.indexOf(value);

    const updatedArr = arr;
    updatedArr.splice(index, 1)

    return updatedArr;
  }, []);

  const handleLikeComment = useCallback(async () => {
    try {
      if (firestoreUser?.id) {
        const docRef = doc(db, 'places_comments', id);

        if (likes.includes(firestoreUser.id)) {
          const updatedArr = spliceFromArr(likes, firestoreUser.id);

          await updateDoc(docRef, {
            likes: [
              ...updatedArr,
            ],
          });
        } else {
          let updatedDislikes = dislikes;

          if (dislikes.includes(firestoreUser.id)) {
            updatedDislikes = spliceFromArr(dislikes, firestoreUser.id);
          }

          await updateDoc(docRef, {
            likes: [
              ...likes,
              firestoreUser.id,
            ],
            dislikes: [
              ...updatedDislikes,
            ],
          });
        }
      }
    } catch (e) {
      // @ts-ignore
      alert(firebaseErrors[e.code]);
    }
  }, [firestoreUser?.id, id, likes, spliceFromArr, dislikes]);

  const handleDislikeComment = useCallback(async () => {
    try {
      if (firestoreUser?.id) {
        const docRef = doc(db, 'places_comments', id);

        if (dislikes.includes(firestoreUser.id)) {
          const updatedArr = spliceFromArr(dislikes, firestoreUser.id);

          await updateDoc(docRef, {
            dislikes: [
              ...updatedArr,
            ],
          });
        } else {
          let updatedLikes = dislikes;

          if (likes.includes(firestoreUser.id)) {
            updatedLikes = spliceFromArr(likes, firestoreUser.id);
          }

          await updateDoc(docRef, {
            dislikes: [
              ...dislikes,
              firestoreUser.id,
            ],
            likes: [
              ...updatedLikes,
            ],
          });
        }
      }
    } catch (e) {
      // @ts-ignore
      alert(firebaseErrors[e.code]);
    }
  }, [firestoreUser?.id, id, dislikes, spliceFromArr, likes]);

  return (
    <div className={styles.container}>
      <UserPostInfo
        userData={{
          username: comment.userName,
          id: comment.userId,
          firebaseUid: firestoreUser?.firebaseUid,
          avatarUrl: comment.userImage,
        }}
        // userPhotoUrl={userPhotoUrl}
        createdAt={comment.createdAt}
      />
      <p>{comment.text}</p>
      {comment?.placeId ? (
          <div className={styles.footer}>
            <div className={styles.shareContainer} onClick={handleLikeComment}>
              <div>
                <LikeIcon color={likedByUser ? '#55BEF5' : undefined}/>
              </div>
              <span className={`${styles.share} ${likedByUser && styles.liked}`}>{likes.length} Likes</span>
            </div>
            <div className={styles.shareContainer} onClick={handleDislikeComment}>
              <div className={styles.dislike}>
                <LikeIcon color={dislikedByUser ? '#F00' : undefined}/>
              </div>
              <span
                className={`${styles.share} ${dislikedByUser && styles.disliked}`}>{dislikes?.length || 0} Dislikes</span>
            </div>
          </div>
        ) : <CommentActions comment={comment} />
}
</div>
)
  ;
};
