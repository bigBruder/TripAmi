  import {useParams} from "react-router-dom";
  import styles from './userProfile.module.css';
  import Header from "~/components/profile/Header";
  import Skeleton from "react-loading-skeleton";
  import {Footer} from "~/components/Footer";
  import {useEffect, useState} from "react";
  import {getDocs, query, where} from "@firebase/firestore";
  import {tripsCollection, usersCollection} from "~/types/firestoreCollections";
  import {storage} from "~/firebase";
  import {IUser} from "~/types/user";
  import {getDownloadURL} from "firebase/storage";
  import {ref} from "@firebase/storage";
  import Map from "~/components/Map/Map";
  import Avatar from '@assets/icons/defaultUserIcon.svg';
  import { onSnapshot, orderBy } from "firebase/firestore";
  import { ITravel } from "~/types/travel";
  import TravelCard from "~/components/TravelCard/TravelCard";
  import { firebaseErrors } from "~/constants/firebaseErrors";
import { Sort } from "~/components/Sort/Sort";

  const UserProfile = () => {
    const {id} = useParams();
    const [userData, setUserData] = useState<IUser>();
    const [userPhotoUrl, setUserPhotoUrl] = useState<string>();
    const [avatarIsLoading, setAvatarIsLoading] = useState<boolean>(false);
    const [travelsIsLoading, setTravelsIsLoading] = useState<boolean>(true);
    const [userTravels, setUserTravels] = useState<ITravel[]>([]);
    const [isReverse, setIsReverse] = useState(false);
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
      (async () => {

        // console.log(id);
        const q = query(usersCollection, where('id', '==', id), orderBy('tripCount', isReverse ? 'desc' : 'asc'));
        const querySnapshot = await getDocs(q);

        setUserData(querySnapshot.docs[0].data());
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

    useEffect(() => {
      // console.log(id);

      (async () => {
        try {
          let q;
  
          switch (sortBy) {
            case 'date':
              q = query(
                tripsCollection, 
                where('userId', '==', id),
                orderBy('startDate', !isReverse ? 'desc' : 'asc'),
              );
              break;
            case 'alphabetically':
              q = query(
                tripsCollection, 
                where('userId', '==', id),
                orderBy('tripName', !isReverse ? 'desc' : 'asc'),
              );
              break;
            case 'rate':
              q = query(
                tripsCollection, 
                where('userId', '==', id),
                orderBy('rate', !isReverse ? 'desc' : 'asc'),
              );
              break;
          }
  
          const querySnapshot = await getDocs(q);
          const fetchedUserTravels = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));

          setUserTravels(fetchedUserTravels as ITravel[]);
        } catch (err) {
          // @ts-ignore
          alert(firebaseErrors[err.code]);
        } finally {
            setTravelsIsLoading(false);
        }
      })();
    }, [id, isReverse, sortBy]);

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
                        {userData?.tripCount !== undefined ? `Trips: ${userData?.tripCount || 0}` : ''}
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
            <div className={styles.container}>
              {
                userTravels.length === 0 ? (
                  <p className={styles.title}>{userData?.username} has not any travels</p>
                ) : (
                  <>
                    <p className={styles.title}>{userData?.username}`s travels</p>
                    <Sort onSelect={setSortBy} isReverse={isReverse} setReverse={() => setIsReverse(prevState => !prevState)}/>
                    <div className={styles.travelsContainer}>
                      {travelsIsLoading ? <Skeleton count={2} height={100} width={400} style={{margin: '10px 0'}}/> : userTravels.map(travel => <TravelCard key={travel.id} travel={travel} />)}
                    </div>
                  </>
                )
              }
            </div>
          {/* )} */}
          
          
            
            <Footer/>
          </>
        </div>
      </>
    );
  };

  export default UserProfile;
