import commentsIcon from "@assets/icons/comments.svg";
import shareIcon from "@assets/icons/share.svg";
import dotsIcon from "@assets/icons/dots.svg";
import stars from "@assets/icons/stars.svg";
import styles from "./posts.module.css";
import type { Post } from "~/utils/posts";

const PostItem = ({
  id,
  userIcon,
  timeAgo,
  userName,
  caption,
  img,
  commentsNumber,
}: Post) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.headerContainer}>
        <img className={styles.icon} src={userIcon} alt="avatar" />
        <div className={styles.description}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.timeAgo}>Posted {timeAgo} hours ago</span>
        </div>
        <img className={styles.stars} src={stars} alt="stars" />

        <button className={styles.joinBtn}>join</button>
      </div>
      <span className={styles.caption}>{caption}...</span>
      <img className={styles.img} src={img} alt="img" />
      <div className={styles.footer}>
        <div className={styles.commentsContainer}>
          <img
            className={styles.commentsIcon}
            src={commentsIcon}
            alt="comments"
          />
          <span className={styles.comments}>{commentsNumber} Comments</span>
        </div>
        <div className={styles.shareContainer}>
          <img className={styles.shareIcon} src={shareIcon} alt="share" />
          <span className={styles.share}>Share</span>
        </div>
        <img className={styles.dotsIcon} src={dotsIcon} alt="dots" />
      </div>
    </div>
  );
};

export default PostItem;
