import React, {FC, useContext, useEffect, useState} from 'react';
import {IPost} from "~/types/post";
import styles from './bigPost.module.css';
import Rating from "~/components/Rating";
import {PostActions} from "~/components/PostActions";
import {getDownloadURL, ref} from "firebase/storage";
import {db, storage} from "~/firebase";
import {doc, getDoc, getDocs, onSnapshot, query, where} from "@firebase/firestore";
import {usersCollection} from "~/types/firestoreCollections";
import {IUser} from "~/types/user";
import {usePost} from "~/hooks/post/usePost";
import {AuthContext} from "~/providers/authContext";
import {UserPostInfo} from "~/components/BigPost/UserPostInfo";

interface Props {
  post: IPost;
  setPost: (value: (((prevState: IPost) => IPost) | IPost)) => void;
}

export const BigPost: FC<Props> = ({
  post,
  setPost,
}) => {
  const {setIsLoading} = usePost(post.id);
  const {firestoreUser} = useContext(AuthContext);
  const [imageUrl, setImageUrl] = useState<string>(post.imageUrls[0]);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const docSnapshot = doc(db, 'users', post.userId);
        const querySnapshot = await getDoc(docSnapshot);
        const fetchedUser = querySnapshot.data();

        setUserData(fetchedUser as IUser);
      } catch (error) {
        console.log('[ERROR getting user from firestore] => ', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [firestoreUser?.id, post.userId]);

  useEffect(() => {
    if (post?.imageUrls[0]?.length) {
      (async () => {
        try {
          setIsLoading(true);
          const url = await getDownloadURL(ref(storage, post.imageUrls[0]));
          setImageUrl(url);
        } catch (error) {
          console.log('[ERROR downloading image] => ', error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [post?.imageUrls]);

  useEffect(() => {
    (async () => {
      if (firestoreUser?.id && firestoreUser?.id !== post?.userId) {
        try {
          setIsLoading(true);
          const q = query(
            usersCollection,
            where('firebaseUid', '!=', firestoreUser?.firebaseUid),
          );
          const querySnapshot = await getDocs(q);
          const fetchedUser = querySnapshot.docs[0].data();

          setUserData(fetchedUser as IUser);
        } catch (error) {
          console.log('[ERROR getting user from firestore] => ', error);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [firestoreUser?.id, post?.userId]);

  useEffect(() => {
    if (firestoreUser?.id) {
      const unsubscribe = onSnapshot(doc(db, "posts", post.id), (doc) => {
        const fetchedPost = {
          ...doc.data(),
          id: doc.id,
        };
        setPost(fetchedPost as IPost);
      });


      return () => {
        unsubscribe();
      }
    }
  }, [firestoreUser]);

  return (
    <div className={styles.container}>
      {userData ? <UserPostInfo userData={userData} createdAt={post.createAt} />  : null}

      <Rating disabled selectedStars={post?.rate - 1} />
      <div className={styles.postContainer}>
        <img src={imageUrl} className={styles.postIMage} />
        <div className={styles.textContainer}>
          <p className={styles.postText}>{post?.text}</p>
          <div className={styles.postActionsWrapper}>
            <PostActions postData={post} />
          </div>
        </div>
      </div>
    </div>
  );
};

