import Header from "~/components/profile/Header";
import styles from "./posts.module.css";
import {useLocation} from "react-router";
import {BigPost} from "~/components/BigPost";
import {CommentField} from "~/components/CommentField";
import {useEffect, useState} from "react";
import {onSnapshot, orderBy, query, where} from "@firebase/firestore";
import {commentsCollection} from "~/types/firestoreCollections";
import {IComment} from "~/types/comments";
import {Comment} from "~/components/Comment";
import {IPost} from "~/types/post";
import {PageTitle} from "~/components/PageTitle";

const PostsPage = () => {
  const {state} = useLocation();
  // console.log(state);
  const [comments, setComments] = useState<IComment[] | null>(null);
  const [post, setPost] = useState<IPost>(state);

  useEffect(() => {
    const q = query(
      commentsCollection,
      where('postId', "==", post.id),
      orderBy('createdAt', "desc"),
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setComments(fetchedDocs as IComment[]);
    });

    return () => {
      unsubscribe();
    }
  }, [post]);

  return (
    <div className={styles.mainContainer}>
      <Header />
      <div className={styles.main}>
        <PageTitle title={'Posts'} />

        <div className={styles.post}>
          <BigPost post={post} setPost={setPost} />
          <CommentField postId={post.id} commentsCount={post.comments_count} contentType="post"/>
          {comments?.map(comment => <Comment key={comment.id} comment={comment} />)}
        </div>
      </div>
    </div>
  );
};

export default PostsPage;
