import { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { doc, onSnapshot, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CanYouDoCard from '~/components/CanYouDoCard/CanYouDoCard';
import Footer from '~/components/Footer';
import { SignUpModal } from '~/components/SignUpModal/SignUpModal';
import TravelCard from '~/components/TravelCard/TravelCard';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { tripsCollection, usersCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';

import defaultUserIcon from '@assets/icons/ph_user-light.svg';
import searchButton from '@assets/icons/searchButton.svg';
import { getDocs, limit, orderBy, query } from '@firebase/firestore';

import Header from '../../../components/Header';
import styles from './intro.module.css';
import pic1 from '/pic1.png';
import pic2 from '/pic2.png';
import pic3 from '/pic3.png';

import 'swiper/css';
import SearchTripsCard from '~/components/SearchTripsCard';
import { IPlace } from '~/routes/AppRoutes/Posts/types';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { firestoreUser } = useContext(AuthContext);
  const [suggestedTrips, setSuggestedTrips] = useState<ITravel[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [allGeoTagsMap, setAllGeoTagsMap] = useState<IPlace[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [currentGeoTag, setCurrentGeoTag] = useState<IPlace | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allTrips, setAllTrips] = useState<ITravel[]>([]);
  const userRef = window.localStorage.getItem('ref');
  const searchBarRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchValue.trim().length > 0 && !currentGeoTag) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchValue, searchBarRef.current, currentGeoTag]);

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    } 
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllTrips = async () => {
      const qu = query(tripsCollection, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(qu, (querySnapshot) => {
        const fetchedTrips = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setAllTrips(fetchedTrips as ITravel[]);

        const allGeoTags = fetchedTrips.flatMap(trip => trip.geoTags || []);

        const uniqueGeoTagsMap = new Map();
        allGeoTags.forEach(tag => {
          uniqueGeoTagsMap.set(tag.placeID, tag);
        });

        const uniqueGeoTags = Array.from(uniqueGeoTagsMap.values());

        setAllGeoTagsMap(uniqueGeoTags as IPlace[]);
      });

      return () => unsubscribe();
    };
    fetchAllTrips();
  }, []);

  useEffect(() => {
    const setLocalStorage = async () => {
      const queryString = window.location.search;
      const obj = new URLSearchParams(queryString);
      const refStorage = obj.get('ref');
      if (refStorage) {
        window.localStorage.setItem('ref', refStorage);
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    };
    setLocalStorage();
  }, []);

  const isFirestoreUser = !!firestoreUser?.id;

  useEffect(() => {
    const updateFriends = async () => {
      if (
        firestoreUser?.id !== userRef &&
        userRef &&
        firestoreUser?.id &&
        firestoreUser &&
        firestoreUser.friends &&
        firestoreUser.friends_count !== undefined &&
        !firestoreUser.friends.includes(userRef)
      ) {
        try {
          const userQuery = query(usersCollection, where('id', '==', userRef));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const user = userSnapshot.docs[0].data();
            console.log('user', user);

            await updateDoc(doc(db, 'users', userRef), {
              friends: [...user.friends, firestoreUser.id],
              friends_count: user.friends_count + 1,
            });

            await updateDoc(doc(db, 'users', firestoreUser.id), {
              friends: [...firestoreUser.friends, userRef],
              friends_count: firestoreUser.friends_count + 1,
            });
            window.localStorage.removeItem('ref');
            if (!toast.isActive('friend')) {
              toast.success(`You and ${user.username} are friends now!`, { toastId: 'friend' });
            }
          }
        } catch (error) {
          console.error('Error updating friends:', error);
        }
      } else {
        if (userRef && !firestoreUser?.id) {
          setModalIsOpen(true);
        }
      }
    };

    updateFriends();
  }, [firestoreUser, userRef, db]);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (firestoreUser?.avatarUrl) {
        try {
          const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl));
          setAvatar(url);
        } catch (error) {
          setAvatar(defaultUserIcon);
        }
      }
    };

    fetchAvatar();
  }, [firestoreUser, storage]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (firestoreUser?.id) {
        const qu = query(tripsCollection, limit(10));

        const unsubscribe = onSnapshot(qu, (querySnapshot) => {
          const fetchedTrips = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setSuggestedTrips(fetchedTrips as ITravel[]);
        });

        return () => unsubscribe();
      }
    };

    fetchTrips();
  }, [firestoreUser?.id]);

  const canYouDoMap = [
    { text: 'Plan your perfect trip', image: pic1 },
    { text: 'Create a like-minded community', image: pic2 },
    { text: 'Share your experience', image: pic3 },
  ];

  const handleInputFocus = () => {
    if (!isFirestoreUser) {
      setModalIsOpen(true);
    }

    if (searchValue.trim().length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleSearchClick = () => {
    if (!isFirestoreUser) {
      setModalIsOpen(true);
    } else {
      navigate('/search', { state: { searchValue, allTrips} });
    }
  };

  return (
    <>
      <div className={styles.main}>
        <div className={styles.topContent}>
          <Header avatar={avatar ?? defaultUserIcon} isFirestoreUser={isFirestoreUser} />
          <h1 className={styles.mainTitle}>Discover, Share, Inspire</h1>
          <p className={styles.secondTitle}>
            Join the platform and find out what people are saying about their travels!
          </p>
          <div className={styles.searchBarContainer} ref={searchBarRef}>
            <input
              type='text'
              placeholder='Search city, country or place'
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setCurrentGeoTag(null);
              }}
              className={styles.searchInput}
              onFocus={() => handleInputFocus()}
            />
            <button className={styles.searchButton} onClick={() => handleSearchClick()}>
              <img src={searchButton} alt='searchButton' />
              Find out
            </button>
            {isDropdownOpen && (
              <div className={styles.searchResults}>
                {allGeoTagsMap
                  .filter((geotag) => geotag.address.toLowerCase().includes(searchValue.toLowerCase()))
                  .slice(0, 5)
                  .map((geotag) => (
                    <SearchTripsCard
                      geotag={geotag}
                      handleSearchPush={() => {
                        setCurrentGeoTag(geotag); 
                        navigate('/search', { state: { allTrips, currentGeoTag: geotag } })
                      }}
                      key={geotag.placeID}
                    />
                  ))
                }
              </div>
            )}
          </div>
        </div>
        <div className={styles.mainSection}>
          <h1 className={styles.mainTitleSec}>Top posts</h1>

          <div className={styles.sliderContainer}>
            <Swiper
              className={styles.tripWrapper}
              modules={[Autoplay]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              freeMode={true}
              loop={true}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 2,
                },
                1400: {
                  slidesPerView: 3,
                },
              }}
              style={{ boxSizing: 'border-box', width: '100%' }}
            >
              {suggestedTrips.map((trip) => (
                <SwiperSlide
                  key={trip.id}
                  style={{
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    width: 'fit-content',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TravelCard travel={trip} isSwiper={true} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <h1 className={styles.mainTitleSec}>What can you do</h1>
          <div className={styles.canYouDoCard}>
            {canYouDoMap.map((item) => (
              <CanYouDoCard text={item.text} image={item.image} key={item.text} />
            ))}
          </div>
          <div className={styles.journeyContainer}>
            <div className={styles.ellipseContainer}>
              <svg width='100%' height='100%' viewBox='0 0 800 600'>
                <ellipse
                  cx='400'
                  cy='300'
                  rx='280'
                  ry='140'
                  stroke='#9EC87BB2'
                  strokeWidth='1'
                  fill='none'
                  strokeDasharray='40,40'
                />
                <ellipse
                  cx='400'
                  cy='300'
                  rx='350'
                  ry='175'
                  stroke='#C69875'
                  strokeWidth='1'
                  fill='none'
                  strokeDasharray='180,450'
                />
                <ellipse
                  cx='400'
                  cy='300'
                  rx='420'
                  ry='210'
                  stroke='#9EC87BB2'
                  strokeWidth='1'
                  fill='none'
                  strokeDasharray='90,90'
                />
              </svg>
            </div>
            <div className={styles.imagesContainer}>
              <img
                src='/png1.png'
                alt='Зображення 1'
                className={`${styles.circleImg} ${styles.img1}`}
              />
              <img
                src='/png2.png'
                alt='Зображення 2'
                className={`${styles.circleImg} ${styles.img2}`}
              />
              <img
                src='/png3.png'
                alt='Зображення 3'
                className={`${styles.circleImg} ${styles.img3}`}
              />
              <img
                src='/png4.png'
                alt='Зображення 4'
                className={`${styles.circleImg} ${styles.img4}`}
              />
              <img
                src='/png5.png'
                alt='Зображення 5'
                className={`${styles.circleImg} ${styles.img5}`}
              />
            </div>
            <div className={styles.iconElem}>
              <div className={styles.titleElips}>Your Journey Starts Here</div>
              {!firestoreUser?.id && (
                <div className={styles.buttonElem} onClick={() => setModalIsOpen(true)}>
                  Join Us
                </div>
              )}
            </div>
            <SignUpModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} isLogin />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
