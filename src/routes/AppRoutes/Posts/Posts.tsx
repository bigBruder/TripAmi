import Header from "~/components/profile/Header";
import styles from "./posts.module.css";
import {useLocation} from "react-router";
import {BigPost} from "~/components/BigPost";
import {CommentField} from "~/components/CommentField";
import {useEffect, useState} from "react";
import {onSnapshot, orderBy, query, where} from "@firebase/firestore";
import {commentsCollection, postsCollection} from "~/types/firestoreCollections";
import {IComment} from "~/types/comments";
import {Comment} from "~/components/Comment";
import {IPost} from "~/types/post";
import {PageTitle} from "~/components/PageTitle";
import { useParams } from "react-router-dom";
import { documentId } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "~/firebase";

const PostsPage = () => {
  // const {state} = useLocation();
  const [comments, setComments] = useState<IComment[] | null>(null);
  const [post, setPost] = useState<IPost | null>(null);
  const [imagesUrl, setImagesUrl] = useState<string[] | null>(null);
  const {id} = useParams();

  useEffect(() => {
      const q = query(
        postsCollection,
        where(documentId(), '==', id),
      )
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedDocs = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPost(fetchedDocs[0] as IPost);
      });

      return () => {
        unsubscribe();
      }
  }, [id]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!post?.imageUrls) return;
  
      const promises = post.imageUrls.map((url) => {
        return getDownloadURL(ref(storage, url)).catch((error) => {
          console.log('[ERROR getting image] => ', error);
          return null;
        });
      });
  
      const results = await Promise.allSettled(promises);
      const downloadedImages = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
  
      setImagesUrl(downloadedImages);
    };
  
    fetchImages();
  }, [post]);
  

  console.log('post', imagesUrl);

  useEffect(() => {
    if (post?.id) {
      const q = query(
        commentsCollection,
        where('postId', "==", post?.id),
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
    }
  }, [post]);

  console.log(imagesUrl, 'imagesUrl');

  return (
    <div className={styles.mainContainer}>
      <Header />
      <div className={styles.main}>
        <PageTitle title={'Posts'} />

        {
          post && (
            <div className={styles.post}>
              <BigPost post={{...post, imageUrls: imagesUrl}} setPost={setPost} />
              <CommentField postId={post.id} commentsCount={post.comments_count} contentType="post"/>
              {comments?.map(comment => <Comment key={comment.id} comment={comment} />)}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default PostsPage;
