import styles from './postActions.module.css';
import {LikeIcon} from "@assets/icons/likeIcon";
import commentsIcon from "@assets/icons/comments.svg";
import shareIcon from "@assets/icons/share.svg";
import BinIcon from "@assets/icons/BinIcon.svg";
import {FC, useContext, useMemo, useState} from "react";
import {AuthContext} from "~/providers/authContext";
import {usePost} from "~/hooks/post/usePost";
import {IPost} from "~/types/post";
import {useNavigate} from "react-router-dom";
import ShareModal from '../ShareModal/ShareModal';

interface Props {
  postData: IPost;
}

export const PostActions: FC<Props> = ({postData}) => {
  const {firestoreUser} = useContext(AuthContext);
  const {
    imageUrls,
    createAt,
    userId,
    comments_count,
    likes,
    text,
    id,
  } = postData;
  const {handleDeletePost, isLoading, setIsLoading, handleLikePost} = usePost(id);
  const navigate = useNavigate();
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);

  const likedByUser = useMemo(() => firestoreUser?.id && likes.includes(firestoreUser.id),[likes, firestoreUser?.id]);

  return (
    <div className={styles.footer}>
      <div className={styles.shareContainer} onClick={() => handleLikePost(likes)}>
        <div className={styles.icon}>
          <LikeIcon color={likedByUser ? '#55BEF5' : undefined} />
        </div>
        <span className={`${styles.share} ${likedByUser && styles.liked}`}>{likes.length} Likes</span>
      </div>
      <div
        className={styles.shareContainer}
        onClick={() =>navigate('/posts/' + postData.id)}
      >
        <img
          className={styles.icon}
          src={commentsIcon}
          alt="comments"
        />
        <span className={`${styles.share} ${styles.comments}`}>{comments_count} Comments</span>
      </div>
      <div className={styles.shareContainer} onClick={() => setIsModalShareOpen(true)}>
        <img className={styles.icon} src={shareIcon} alt="share" />
        <span className={styles.share} >Share</span>
      </div>
      {firestoreUser?.id === userId ? (
        <div className={styles.shareContainer} onClick={() => handleDeletePost(imageUrls)}>
          <img className={styles.icon} src={BinIcon} alt="dots" />
          <span className={styles.share}>Delete</span>
        </div>
      ) : null}

      <ShareModal isOpen={isModalShareOpen} onRequestClose={() => setIsModalShareOpen(false)} linkTo={'https://tripamimain.netlify.app/posts/' + postData.id}/>

    </div>
  );
};
