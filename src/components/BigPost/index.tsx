import {FC, useContext, useEffect, useState} from 'react';
import {IPost} from "~/types/post";
import styles from './bigPost.module.css';
import {PostActions} from "~/components/PostActions";
import {db} from "~/firebase";
import {doc, getDoc, getDocs, onSnapshot, query, where} from "@firebase/firestore";
import {usersCollection} from "~/types/firestoreCollections";
import {IUser} from "~/types/user";
import {usePost} from "~/hooks/post/usePost";
import {AuthContext} from "~/providers/authContext";
import {UserPostInfo} from "~/components/BigPost/UserPostInfo";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

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
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  console.log('post => ', post);

  useEffect(() => {
    setImageUrl(post.imageUrls);
  }, [post]);

  console.log('post => ', post);



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
  }, [firestoreUser.id, post.userId]);

  useEffect(() => {
    (async () => {
      if (firestoreUser?.id && firestoreUser?.id !== post?.userId) {
        try {
          setIsLoading(true);
          const q = query(
            usersCollection,
            where('firebaseUid', '==', post.userId),
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

      <div className={styles.postContainer}>
        <div className={styles.swiperContainer}>
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            style={{width: '100%', height: '100%'}}
            // wrapperClass={styles.swiperWrapper}
            pagination={true}
            modules={[Pagination]}
          >
            {imageUrl?.map(link => (
              <SwiperSlide key={link} style={{display: 'flex', justifyContent: 'center'}}>
                <img src={link} className={styles.postIMage}/>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

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

