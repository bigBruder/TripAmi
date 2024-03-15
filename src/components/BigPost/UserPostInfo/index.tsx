import styles from './userPostInfo.module.css';
import Avatar from "@assets/icons/defaultUserIcon.svg";
import {FC, useCallback, useContext, useEffect, useState} from "react";
import {IUser} from "~/types/user";
import {timeAgo} from "@utils/daysAgo";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "~/providers/authContext";
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '~/firebase';

interface Props {
  userData: IUser;
  createdAt: string;
  userPhotoUrl?: string;
}

export const UserPostInfo: FC<Props> = ({userData, createdAt, userPhotoUrl}) => {
  const navigate = useNavigate();
  const {firebaseUid} = userData;
  const {firestoreUser} = useContext(AuthContext);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const handleOpenUserProfile = useCallback(() => {
    if (firebaseUid !== firestoreUser?.firebaseUid) {
      navigate('/user/' + firebaseUid);
    } else {
      navigate('/profile');
    }
  }, [firebaseUid, firestoreUser?.firebaseUid, navigate]);

  useEffect(() => {
    (async () => {
      const avatarLink = await getDownloadURL(ref(storage, userData?.avatarUrl));
      setUserAvatar(avatarLink);
    })();
  }, [userData?.avatarUrl, userPhotoUrl]);

  return (
    <div className={styles.userContainer} onClick={handleOpenUserProfile}>
      <div className={styles.leftContainer}>
        <img src={userAvatar || Avatar} style={{width: 24, height: 24, borderRadius: 50}} />
        <div>
          <p className={styles.location}>{userData?.username}</p>
          <p className={styles.postedAgo}>{timeAgo(createdAt)}</p>
        </div>
      </div>
      <button className={styles.button}>
        <p className={styles.buttonText}>
          join
        </p>
      </button>
    </div>
  );
};
