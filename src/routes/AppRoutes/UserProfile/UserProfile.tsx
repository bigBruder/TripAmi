import {useParams} from "react-router-dom";
import styles from './userProfile.module.css';
import Header from "~/components/profile/Header";
import Skeleton from "react-loading-skeleton";
import {Footer} from "~/components/Footer";
import {useEffect, useState} from "react";
import {getDocs, query, where} from "@firebase/firestore";
import {usersCollection} from "~/types/firestoreCollections";
import {storage} from "~/firebase";
import {IUser} from "~/types/user";
import {getDownloadURL} from "firebase/storage";
import {ref} from "@firebase/storage";
import Map from "~/components/Map/Map";
import Avatar from '@assets/icons/defaultUserIcon.svg';

const UserProfile = () => {
  const {id} = useParams();
  const [userData, setUserData] = useState<IUser>();
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>();
  const [avatarIsLoading, setAvatarIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      console.log(id);
      const q = query(usersCollection, where('firebaseUid', '==', id));
      const querySnapshot = await getDocs(q);
      setUserData(querySnapshot.docs[0].data());
      console.log(querySnapshot.docs);
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (userData?.avatarUrl) {
        setAvatarIsLoading(true);
        try {
          const url = await getDownloadURL(ref(storage, userData.avatarUrl));
          setUserPhotoUrl(url);
        } catch (error) {
          console.log('[ERROR getting user photo] => ', error);
        } finally {
          setAvatarIsLoading(false);
        }
      }
    })();
  }, [userData]);

  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#DAE0E1" }} className={styles.main}>
        <>
          <div>
            <div className={styles.myAccount}>
              <div className={styles.genaralInfo}>
                <div className={styles.userInfo}>
                  <div className={styles.imageContainer}>
                    <img
                      className={styles.defaultUserIcon}
                      src={userPhotoUrl || Avatar}
                      alt="default user icon"
                    />
                    {avatarIsLoading && <Skeleton className={styles.loader}/>}
                  </div>
                  <div className={styles.description}>
                    {userData?.username ? (
                      <div className={styles.edit}>
                        <p className={styles.text}
                           style={{margin: 0}}>{userData?.username}
                        </p>
                      </div>
                    ) : null}
                    {!userData?.username && <Skeleton style={{width: 100, height: 20}}/>}
                    <p className={styles.text}>
                      {userData?.tripCount !== undefined ? `My trips: ${userData?.tripCount || 0}` : ''}
                    </p>
                    {userData?.tripCount === undefined && <Skeleton style={{width: 100, height: 20}}/>}
                  </div>
                </div>
                <div className={styles.divider}></div>
              </div>
              <div className={styles.mapContainer}>
                <div className={styles.mapContainer}>
                  <Map userId={userData?.id} />
                </div>
              </div>
            </div>
          </div>

          <Footer/>
        </>
      </div>
    </>
  );
};

export default UserProfile;
