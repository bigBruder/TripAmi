import {IComment} from "~/types/comments";
import {FC} from "react";
import styles from './comment.module.css';
import {UserPostInfo} from "~/components/BigPost/UserPostInfo";
import {CommentActions} from "~/components/CommentActions";

interface Props {
  comment: IComment;
}

export const Comment: FC<Props> = ({comment}) => {
  return (
    <div className={styles.container}>
      <UserPostInfo
        userData={{
          username: comment.userName,
          id: comment.userId,
        }}
        createdAt={comment.createdAt}
      />
      <p>{comment.text}</p>
      <CommentActions comment={comment} />
    </div>
  );
};
