import styles from './commetActions.module.css';
import {IComment} from "~/types/comments";
import {FC, useContext, useMemo} from "react";
import {LikeIcon} from "@assets/icons/likeIcon";
import commentsIcon from "@assets/icons/comments.svg";
import shareIcon from "@assets/icons/share.svg";
import BinIcon from "@assets/icons/BinIcon.svg";
import {useComment} from "~/hooks/comment/useComment";
import {AuthContext} from "~/providers/authContext";

interface Props {
  comment: IComment;
}

export const CommentActions: FC<Props> = ({comment}) => {
  const {handleLikeComment, handleDislikeComment} = useComment(comment);
  const {likes, id, dislikes} = comment;
  const {firestoreUser} = useContext(AuthContext);

  const likedByUser = useMemo(() => firestoreUser?.id && likes.includes(firestoreUser.id),[likes, firestoreUser?.id]);
  const dislikedByUser = useMemo(() => firestoreUser?.id && dislikes.includes(firestoreUser.id),[dislikes, firestoreUser?.id]);

  return (
    <div className={styles.footer}>
      <div className={styles.shareContainer} onClick={handleLikeComment}>
        <div>
          <LikeIcon color={likedByUser ? '#55BEF5' : undefined} />
        </div>
        <span className={`${styles.share} ${likedByUser && styles.liked}`}>{likes.length} Likes</span>
      </div>
      <div className={styles.shareContainer} onClick={handleDislikeComment}>
        <div className={styles.dislike}>
          <LikeIcon color={dislikedByUser ? '#F00' : undefined} />
        </div>
        <span className={`${styles.share} ${dislikedByUser && styles.disliked}`}>{dislikes?.length || 0} Dislikes</span>
      </div>
    </div>
  );
};
