import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import cn from 'classnames';
import {
  average,
  collectionGroup,
  deleteDoc,
  documentId,
  getAggregateFromServer,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import Lottie from 'lottie-react';
import { CreateReviewModal } from '~/components/CreateReviewModal/CreateReviewModal';
import CustomModal from '~/components/CustomModal';
import HeaderNew from '~/components/HeaderNew';
import PlaceAdvices from '~/components/PlaceAdvices';
import PlaceReviews from '~/components/PlaceReviews';
import Rating from '~/components/Rating';
import TravelCard from '~/components/TravelCard/TravelCard';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { IPlace } from '~/routes/AppRoutes/Posts/types';
import { placesCollection, reviewsCollection, tripsCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';

import AnimationData from '@assets/animations/loader.json';
import { query, where } from '@firebase/firestore';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

import styles from './place.module.css';

const MAX_LENGTH = 700;

const mapOptions = {
  defaultZoom: 15,
  mapId: '9bc3b1605395203e',
  zoomControl: false,
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  gestureHandling: 'none',
  keyboardShortcuts: false,
  clickableIcons: false,
};

const Place = () => {
  const { id } = useParams();
  const { firestoreUser } = useContext(AuthContext);

  const [placeData, setPlaceData] = useState<IPlace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [geocode, setGeocode] = useState<any>(null);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [myReview, setMyReview] = useState<any>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(-1);
  const [suggestedTrips, setSuggestedTrips] = useState<ITravel[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isReview, setIsReview] = useState(true);
  const [isAdvice, setIsAdvice] = useState(false);
  const tabs = ['Reviews', 'Advices'];

  const [avatar, setAvatar] = useState<string>('');

  const truncatedText = useRef('');
  const remainingText = useRef('');
  console.log(suggestedTrips, 'suggestedTrips');

  useEffect(() => {
    const placeId = id;

    if (placeId) {
      const q = query(tripsCollection, where('placeIDs', 'array-contains', placeId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedDocs = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setSuggestedTrips(fetchedDocs.slice(0, 3));
      });

      return () => {
        unsubscribe();
      };
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        if (firestoreUser?.id) {
          const q = query(
            reviewsCollection,
            where('placeId', '==', id),
            where('authorId', '==', firestoreUser?.id)
          );
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedDocs = querySnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            setMyReview(fetchedDocs[0]);
          });

          return () => {
            unsubscribe();
          };
        }
      } catch (err) {
        console.log('[ERROR getting geocode data] => ', err);
      }
    })();
  }, [firestoreUser?.id, id]);

  useEffect(() => {
    (async () => {
      try {
        if (firestoreUser?.id) {
          const q = query(reviewsCollection, where('placeId', '==', id));
          const querySnapshot = await getDocs(q);
          const fetchedDocs = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          setReviews(fetchedDocs);
        }
      } catch (err) {
        console.log('[ERROR getting geocode data] => ', err);
      }
    })();
  }, [firestoreUser?.id, id, isReview, isAdvice]);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const q = query(placesCollection, where('placeId', '==', id));
          const querySnapshot = await getDocs(q);
          const fetchedDocs = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          setGeocode(fetchedDocs[0]);
        } catch (err) {
          console.log('[ERROR getting geocode data] => ', err);
        }
      })();
    }
  }, [id]);

  const handleSeeMoreClick = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    (async () => {
      const q = query(reviewsCollection, where('placeId', '==', id));
      const snapshot = await getAggregateFromServer(q, { averageRating: average('rate') });
      setAverageRating(snapshot._data.averageRating.doubleValue);
    })();
  }, [id]);

  useMemo(() => {
    if (placeData?.articleText) {
      const cutText = placeData.articleText.slice(0, MAX_LENGTH);

      truncatedText.current = placeData.articleText.length > MAX_LENGTH ? cutText + '...' : cutText;
      remainingText.current = placeData.articleText.slice(MAX_LENGTH);
    }
  }, [placeData?.articleText]);

  const handleSetActiveTab = (index: number) => {
    if (index === 0) {
      setIsReview(true);
      setIsAdvice(false);
      setActiveTab(index);
    }

    if (index === 1) {
      setIsReview(false);
      setIsAdvice(true);
      setActiveTab(index);
    }
  };

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          const q = query(placesCollection, where('placeId', '==', id));
          const querySnapshot = await getDocs(q);
          // @ts-ignore
          const fetchedDocs: { articleText: string; imageUrl: string; id: string }[] =
            querySnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
          if (!fetchedDocs[0].articleText && !fetchedDocs[0].imageUrl) {
            console.log('working with request to the server');
            const { data }: { data?: { data: IPlace } } = await axios.get(
              'https://getgooglemapsdetails-dp6fh5oj2q-uc.a.run.app/helloWorld?placeId=' + id
            );
            if (data?.data) {
              setPlaceData(data.data);
            }
            await updateDoc(querySnapshot.docs[0].ref, {
              ...fetchedDocs[0],
              articleText: data?.data?.articleText,
              imageUrl: data?.data?.imageUrl,
            });
          } else {
            console.log('working without request to the server');
            setPlaceData({
              imageUrl: fetchedDocs[0].imageUrl,
              articleText: fetchedDocs[0].articleText,
            });
          }
          setIsLoading(true);
        } catch (err) {
          console.log('[ERROR getting data about place] => ', err);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [id]);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (firestoreUser?.avatarUrl) {
        const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl));
        setAvatar(url);
      }
    };
    fetchUserAvatar();
  }, [firestoreUser?.avatarUrl]);

  const handleDeleteReview = async () => {
    try {
      const q = query(
        reviewsCollection,
        where('authorId', '==', firestoreUser?.id),
        where('placeId', '==', id)
      );

      const querySnapshot = await getDocs(q);
      await deleteDoc(querySnapshot.docs[0].ref);
    } catch (err) {
      console.log('[ERROR deleting review] => ', err);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <HeaderNew avatar={avatar} />

      <div className={styles.main}>
        <div className={styles.container}>
          {geocode?.name === undefined ? (
            <Skeleton height={50} />
          ) : (
            <h1 className={styles.title}>{geocode?.address}</h1>
          )}
          <div className={styles.postContainer}>
            {isLoading ? (
              <Lottie animationData={AnimationData} />
            ) : placeData?.imageUrl || placeData?.articleText ? (
              <div className={styles.mapContainerImage}>
                {placeData.imageUrl && (
                  <div className={styles.postImageMain}>
                    <img
                      src={placeData.imageUrl || '/place_imagenot.svg'}
                      alt={'place image'}
                      className={styles.postIMage}
                    />
                  </div>
                )}
                {id && geocode?.types && (
                  <APIProvider apiKey='AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8'>
                    <div className={styles.mapContainer}>
                      <Map
                        center={geocode}
                        {...mapOptions}
                        zoom={geocode.types.includes('locality') ? 10 : 17}
                      />
                    </div>
                  </APIProvider>
                )}
              </div>
            ) : (
              <h2 className={styles.empty}>There is no information about this place</h2>
            )}
          </div>
          <div className={styles.titleAndRating}>
            <h2>Place Overview</h2>
            <Rating selectedStars={averageRating} />
          </div>
          {placeData && placeData.articleText ? (
            <div className={styles.textContainer}>
              {isExpanded ? (
                <div>
                  <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{ __html: placeData.articleText }}
                  />
                  <button onClick={handleSeeMoreClick} className={styles.seeMoreButton}>
                    See less
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{ __html: truncatedText.current }}
                  />
                  {placeData.articleText.length > MAX_LENGTH && (
                    <button onClick={handleSeeMoreClick} className={styles.seeMoreButton}>
                      See more
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
        {suggestedTrips.length > 0 && (
          <div className={styles.suggestedTripsContainer}>
            <h2 className={styles.title} style={{ marginBottom: '37px' }}>
              Related user&rsquo;s trips
            </h2>
            <div className={styles.suggestedTrips}>
              {suggestedTrips.map((trip) => (
                <TravelCard key={trip.id} travel={trip} isPlace={true} />
              ))}
            </div>
          </div>
        )}

        <div className={styles.containerComments}>
          <div className={styles.tabsContainer}>
            {tabs.map((tab, index) => (
              <h2
                onClick={() => handleSetActiveTab(index)}
                key={index}
                className={cn([styles.tab], { [styles.activeTab]: activeTab === index })}
              >
                {tab}
              </h2>
            ))}
          </div>
          <div className={styles.addReviewButtonContainer}>
            <button className={styles.addReviewButton} onClick={() => setIsAddReviewOpen(true)}>
              Add {isReview ? 'review' : 'advice'}
            </button>
          </div>
          <div className={styles.commentsMap}>
            {activeTab === 0 ? (
              <PlaceReviews reviews={reviews} />
            ) : (
              <PlaceAdvices reviews={reviews} />
            )}
          </div>
        </div>
      </div>
      {id && (
        <CustomModal isOpen={isAddReviewOpen} onCloseModal={() => setIsAddReviewOpen(false)}>
          <CreateReviewModal
            closeModal={() => setIsAddReviewOpen(false)}
            placeId={id}
            placeName={geocode?.name}
            startReview={myReview}
            isReview={isReview}
            isAdvice={isAdvice}
          />
        </CustomModal>
      )}
    </div>
  );
};

export default Place;
