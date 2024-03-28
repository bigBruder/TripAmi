import styles from './userPostInfo.module.css';
import Avatar from "@assets/icons/defaultUserIcon.svg";
import {FC, useCallback, useContext, useEffect, useState} from "react";
import {IUser} from "~/types/user";
import {timeAgo} from "@utils/daysAgo";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "~/providers/authContext";
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '~/firebase';
import { IPost } from '~/types/post';

interface Props {
  userData: IUser;
  createdAt: string;
  userPhotoUrl?: string;
  postData: IPost;
  imagesUrl: string[] | null;
}

export const UserPostInfo: FC<Props> = ({userData, createdAt, userPhotoUrl, postData, imagesUrl}) => {
  const navigate = useNavigate();
  const {firestoreUser} = useContext(AuthContext);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const handleOpenUserProfile = useCallback(() => {
    if (userData.id !== firestoreUser?.id) {
      navigate('/user/' + userData.id);
    } else {
      navigate('/profile');
    }
  }, [firestoreUser, navigate, userData]);

  useEffect(() => {
    if (userData?.avatarUrl) {
      (async () => {
        const avatarLink = await getDownloadURL(ref(storage, userData?.avatarUrl));
        setUserAvatar(avatarLink);
      })();
    }
  }, [userData?.avatarUrl, userPhotoUrl]);

  return (
    <div className={styles.userContainer}>
      <div className={styles.leftContainer} onClick={handleOpenUserProfile}>
        <img src={userAvatar || Avatar} style={{width: 24, height: 24, borderRadius: 50}} />
        <div>
          <p className={styles.location}>{userData?.username}</p>
          <p className={styles.postedAgo}>{timeAgo(createdAt)}</p>
        </div>
      </div>
      <button className={styles.button}>
        <p className={styles.buttonText} onClick={() =>
                navigate(
                  '/posts/' + postData.id,
                  {state: {
                      ...postData,
                      imageUrls: imagesUrl,
                  }})
              }>
          join
        </p>
      </button>
    </div>
  );
};
