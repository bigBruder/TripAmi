import styles from './postActions.module.css';
import {LikeIcon} from "@assets/icons/likeIcon";
import commentsIcon from "@assets/icons/comments.svg";
import shareIcon from "@assets/icons/share.svg";
import BinIcon from "@assets/icons/BinIcon.svg";
import {FC, useContext, useMemo} from "react";
import {AuthContext} from "~/providers/authContext";
import {usePost} from "~/hooks/post/usePost";
import {IPost} from "~/types/post";

interface Props {
  postData: IPost;
}

export const PostActions: FC<Props> = ({postData}) => {
  const {firestoreUser} = useContext(AuthContext);
  const {
    imageUrls,
    createAt,
    rate,
    userId,
    comments_count,
    likes,
    text,
    id,
  } = postData;
  const {handleDeletePost, isLoading, setIsLoading, handleLikePost} = usePost(id);

  const likedByUser = useMemo(() => firestoreUser?.id && likes.includes(firestoreUser.id),[likes, firestoreUser?.id]);

  return (
    <div className={styles.footer}>
      <div className={styles.shareContainer} onClick={() => handleLikePost(likes)}>
        <div>
          <LikeIcon color={likedByUser ? '#55BEF5' : undefined} />
        </div>
        <span className={`${styles.share} ${likedByUser && styles.liked}`}>{likes.length} Likes</span>
      </div>
      <div className={styles.shareContainer}>
        <img
          className={styles.commentsIcon}
          src={commentsIcon}
          alt="comments"
        />
        <span className={styles.comments}>{comments_count} Comments</span>
      </div>
      <div className={styles.shareContainer}>
        <img className={styles.shareIcon} src={shareIcon} alt="share" />
        <span className={styles.share}>Share</span>
      </div>
      {firestoreUser?.id === userId ? (
        <div className={styles.shareContainer} onClick={() => handleDeletePost(imageUrls)}>
          <img className={styles.dotsIcon} src={BinIcon} alt="dots" />
          <span className={styles.share}>Delete</span>
        </div>
      ) : null}
    </div>
  );
};
