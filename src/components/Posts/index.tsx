import styles from "./posts.module.css";
import {IPost} from "~/types/post";
import {ref, getDownloadURL} from "firebase/storage";
import {FC, useContext, useEffect, useMemo, useState} from "react";
import {storage} from "~/firebase";
import Rating from "~/components/Rating";
import './styles.css';
import {usePost} from "~/hooks/post/usePost";
import {AuthContext} from "~/providers/authContext";
import Avatar from '@assets/icons/ava1.svg';
import {getDocs, query, where} from "@firebase/firestore";
import {usersCollection} from "~/types/firestoreCollections";
import {IUser} from "~/types/user";
import {timeAgo} from "@utils/daysAgo";
import {useNavigate} from "react-router-dom";
import {PostActions} from "~/components/PostActions";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface Props {
  postData: IPost;
}

const PostItem: FC<Props> = ({postData}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
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
  const {firestoreUser} = useContext(AuthContext);
  const {handleDeletePost, isLoading, setIsLoading, handleLikePost} = usePost(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (imageUrls[0]?.length) {
      (async () => {
        try {
          setIsLoading(true);
          const url = await getDownloadURL(ref(storage, imageUrls[0]));
          setImageUrl(url);
        } catch (error) {
          console.log('[ERROR downloading image] => ', error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (firestoreUser?.id && firestoreUser?.id !== userId) {
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
        }
      }
    })();
  }, [firestoreUser?.id, userId]);

  const isPostMy = useMemo(() => firestoreUser?.id === userId, [firestoreUser?.id, userId]);

  return (
    <div className={styles.cardContainer}>
      {!isPostMy ? (
        <div className={styles.userSection}>
          <div className={styles.wrapper}>
            <img src={Avatar}/>
            <div className={styles.topContainer}>
              <p className={styles.userName}>{userData?.username}</p>
              <p className={styles.postedAgo}>{timeAgo(createAt)}</p>
            </div>
          </div>
          <Rating disabled selectedStars={rate - 1} />
          <button className={styles.button}>
            <p className={styles.buttonText}>
              join
            </p>
          </button>
        </div>
      ) : null}
      <div className={styles.header}>
        <span className={styles.caption}>{text}</span>

        {isPostMy ? <Rating disabled selectedStars={rate - 1} /> : null}
      </div>

      <img
        className={styles.img}
        src={imageUrl || ''}
        alt="img"
        onClick={() =>
          navigate(
            '/posts',
            {state: {
                ...postData,
                imageUrls: [imageUrl],
              }})
        }
        onLoadedData={() => setIsLoading(false)}
      />
      {isLoading && <Skeleton className={styles.loader}/>}

      <PostActions postData={postData} />
    </div>
  );
};

export default PostItem;
