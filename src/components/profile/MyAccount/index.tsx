import defaultUserIcon from "@assets/icons/defaultUserIcon.svg";
import styles from "./myaccount.module.css";
import CustomModal from "~/components/CustomModal";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import CreatePostModal from "~/components/CreatePostModal";
import CreateTripModal from "~/components/CreateTripModal";
import {AuthContext} from "~/providers/authContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import {getDocs, limit, onSnapshot, orderBy, query, where} from "@firebase/firestore";
import {postsCollection, tripsCollection} from "~/types/firestoreCollections";
import {IPost} from "~/types/post";
import PostItem from "~/components/Posts";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {Footer} from "~/components/Footer";
import {useWindowDimensions} from "~/hooks/useWindowDimensions";
import {MyFriends} from "~/components/MyFriends";
import {getDownloadURL} from "firebase/storage";
import {storage} from "~/firebase";
import {ref} from "@firebase/storage";
import EditMap from "~/components/EditMap";
import useMapContext from "~/components/EditMap/store";
import useMyPosts from "~/components/profile/store";
import {TravelItinerary} from "~/components/TravelItinerary/TravelItinerary";
import Skeleton from "react-loading-skeleton";
import Map from "~/components/Map/Map";
import {ITravel} from "~/types/travel";
import GoogleMaps from "~/components/GoogleMaps/GoogleMaps";

const TABS = [
  'Home',
  'My friends',
  'Google Maps',
  'My trips',
]

const MyAccount = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tripModalIsOpen, setTripModalIsOpen] = useState(false);
  const {posts, setPosts} = useMyPosts();
  const [suggestedPosts, setSuggestedPosts] = useState<IPost[] | null>(null);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isSuggestedPostsLoading, setIsSuggestedPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [avatar, setAvatar] = useState<string>(defaultUserIcon);
  const [avatarIsLoading, setAvatarIsLoading] = useState(true);
  const {setTips} = useMapContext();

  const {firestoreUser, loading} = useContext(AuthContext);
  const {width} = useWindowDimensions();

  useEffect(() => {
    if (firestoreUser?.id) {
      const q = query(
        tripsCollection,
        where("userId", "==", firestoreUser?.id),
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTips(fetchedPosts as ITravel[]);
      });

      return () => {
        unsubscribe();
      }
    }
  }, [firestoreUser, setTips]);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
  }, []);

  const closeTripModal = useCallback(() => {
    setTripModalIsOpen(false);
  }, []);

  useEffect(() => {
    (async () => {
      if (firestoreUser?.id) {
        try {
          setIsPostsLoading(true);
          const q = query(
            postsCollection, where('userId', '==', firestoreUser?.id),
            orderBy('createAt', 'desc'),
          );
          const querySnapshot = await getDocs(q);
          const fetchedPosts = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));

          setPosts(fetchedPosts as IPost[]);
        } catch (err) {
          // @ts-ignore
          alert(firebaseErrors[err.code]);
        } finally {
          setIsPostsLoading(false);
        }
      }
    })();

    (async () => {
      if (firestoreUser?.id) {
        try {
          setIsSuggestedPostsLoading(true);
          const q = query(
            postsCollection,
            orderBy('userId'),
            where('userId', '!=', firestoreUser?.id),
            orderBy('createAt', 'desc'),
          );
          const querySnapshot = await getDocs(q);
          const fetchedPosts = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));

          setSuggestedPosts(fetchedPosts as IPost[]);


          if (firestoreUser.avatarUrl) {
            const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl))
            setAvatar(url);
          }

        } catch (err) {
          console.log(err);
          // @ts-ignore
          alert(firebaseErrors[err.code]);
        } finally {
          setIsSuggestedPostsLoading(false);
          setAvatarIsLoading(false);
        }
      }
    })();

    if (firestoreUser?.id) {
      const q = query(
        postsCollection,
        where("userId", "==", firestoreUser?.id),
        orderBy('createAt', 'desc'),
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPosts(fetchedPosts as IPost[]);
      });


      return () => {
        unsubscribe();
      }
    }
  }, [firestoreUser]);

  useEffect(() => {
    if (suggestedPosts?.length && firestoreUser?.id) {
      const arrayOfDates = suggestedPosts.map(post => post.createAt);

      const qu = query(
        postsCollection,
        orderBy('userId', 'desc'),
        where("userId", "!=", firestoreUser.id),
        where("createAt", "in", arrayOfDates),
        orderBy('createAt', 'desc'),
        limit(10),
      );

      const unsubscribeFromSuggestedPosts = onSnapshot(qu, (querySnapshot) => {
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setSuggestedPosts(fetchedPosts as IPost[]);
      });

      return () => {
        unsubscribeFromSuggestedPosts();
      };
    }
  }, [firestoreUser, suggestedPosts?.length]);

  const getSlidesPerPage = useMemo(() => {
    if (width < 768) {
      return 1;
    } else if (width < 1142) {
      return 2;
    } else {
      return 3;
    }
  }, [width]);

  return (
    <>
      <div>
        <div className={styles.myAccount}>
          <div className={styles.genaralInfo}>
            <div className={styles.userInfo}>
              <div className={styles.imageContainer}>
                <img
                  className={styles.defaultUserIcon}
                  src={avatar}
                  alt="default user icon"
                />
                {avatarIsLoading && <Skeleton className={styles.loader} />}
              </div>
              <div className={styles.description}>
                {firestoreUser?.username ? (
                  <div className={styles.edit}>
                    <p className={styles.text}
                       style={{margin: 0}}>{firestoreUser?.username}</p>
                    <div className={styles.inputWrapper}>
                      <button className={styles['trip-button']} onClick={() => setTripModalIsOpen(true)}>
                        Post a trip
                      </button>
                    </div>
                  </div>
                ) : null}
                {!firestoreUser?.username && <Skeleton style={{width: 100, height: 20}}/>}
                <p className={styles.text}>
                  {firestoreUser?.tripCount !== undefined ? `My trips: ${firestoreUser?.tripCount || 0}` : ''}
                </p>
                {firestoreUser?.tripCount === undefined && <Skeleton style={{width: 100, height: 20}}/>}
                <p className={styles.text}>
                  {firestoreUser?.tripCount !== undefined ? 'Where to next?:' : ''}
                </p>
                {firestoreUser?.tripCount === undefined && <Skeleton style={{width: 100, height: 20}}/>}
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.features}>
              {TABS.map((tab, index) => (
                <span className={`${styles.feature} ${index === activeTab && styles.activeFeature}`} onClick={() => setActiveTab(index)} key={tab}>
                {tab} {index === 1 && <div className={styles.friendsCount}>{firestoreUser?.friends_count || 0}</div>}
              </span>
              ))}
            </div>
          </div>
          {activeTab !== 4 && (
            <div className={styles.mapContainer}>
              <div className={styles.mapContainer}>
                <Map />
              </div>
            </div>
          )}
        </div>
        {activeTab === 0 ? (
          <>
            <div className={styles.travelContainer}>
              <span className={styles.title}>My posts</span>
              {(!posts?.length && !isPostsLoading) ? (
                <>
                  <p className={styles.paragraph}>
                    Hmm... {firestoreUser?.username} hasn't posted anything yet. Start sharing your
                    experience with other participants!
                  </p>
                  <button className={styles.button} onClick={() => setModalIsOpen(true)}>NEW POST</button>
                </>
              ) : (
                <div className={styles.sliderContainer}>
                  <Swiper
                    spaceBetween={30}
                    slidesPerView={getSlidesPerPage}
                  >
                    {posts?.map(post => (
                      <SwiperSlide key={post.id}>
                        <PostItem postData={post}/>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>
            {suggestedPosts?.length ? <span className={styles.postsTitle}>You may also like</span> : null}
            <div className={styles.bottomSliderContainer}>
              <Swiper
                spaceBetween={30}
                slidesPerView={getSlidesPerPage}
              >
                {suggestedPosts?.map(post => (
                  <SwiperSlide key={post.id}>
                    <PostItem postData={post}/>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        ) : activeTab === 1 ? (
          <MyFriends />
        ) : activeTab === 2 ? (
          <GoogleMaps />
        ) : activeTab === 3 ? (
          <TravelItinerary />
        ) : activeTab === 4 ? (
          <EditMap />
        ) : (
          <MyFriends />
        )}
      </div>

      <Footer />

      <CustomModal isOpen={modalIsOpen} onCloseModal={closeModal}>
        <CreatePostModal closeModal={closeModal}/>
      </CustomModal>
      <CustomModal isOpen={tripModalIsOpen} onCloseModal={closeTripModal}>
        <CreateTripModal closeModal={closeTripModal} />
      </CustomModal>
    </>
  );
};

export default MyAccount;
