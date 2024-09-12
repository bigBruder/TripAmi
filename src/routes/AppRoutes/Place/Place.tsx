import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import axios, { all } from 'axios';
import cn from 'classnames';
import {
  average,
  collectionGroup,
  deleteDoc,
  doc,
  documentId,
  getAggregateFromServer,
  getDocs,
  onSnapshot,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import Lottie from 'lottie-react';
import { CreateReviewModal } from '~/components/CreateReviewModal/CreateReviewModal';
import CustomModal from '~/components/CustomModal';
import Footer from '~/components/Footer';
import HeaderNew from '~/components/HeaderNew';
import ItineraryModal from '~/components/ItineraryModal';
import PhotoModal from '~/components/PhotoModal';
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
import { APIProvider, Marker } from '@vis.gl/react-google-maps';
import { Map as MapCart } from '@vis.gl/react-google-maps';

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
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [photoForModal, setPhotoForModal] = useState<string>(
    placeData?.imageUrl || '/place_imagenot.svg'
  );
  const [isItinerary, setIsItinerary] = useState(false);
  const [allGeoTagsMap, setAllGeoTagsMap] = useState<IPlace[]>([]);
  const [placeForItinerary, setPlaceForItinerary] = useState<IPlace | null>(null);

  const [avatar, setAvatar] = useState<string>('');

  const truncatedText = useRef('');
  const remainingText = useRef('');

  useEffect(() => {
    const place = allGeoTagsMap.find((tag) => tag.placeID === id);

    if (place) {
      setPlaceForItinerary(place);
    }
  }, [placeData, allGeoTagsMap]);

  useEffect(() => {
    const fetchAllTrips = async () => {
      const qu = query(tripsCollection, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(qu, (querySnapshot) => {
        const fetchedTrips = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        const allGeoTags = fetchedTrips.flatMap((trip) => trip.geoTags || []);

        const uniqueGeoTagsMap = new Map();

        allGeoTags.forEach((tag) => {
          uniqueGeoTagsMap.set(tag.placeID, tag);
        });

        const uniqueGeoTags = Array.from(uniqueGeoTagsMap.values());

        setAllGeoTagsMap(uniqueGeoTags as IPlace[]);
      });

      return () => unsubscribe();
    };
    fetchAllTrips();
  }, [id]);

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

  const fetchReviews = async () => {
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
      console.log('[ERROR getting reviews data] => ', err);
    }
  };

  useEffect(() => {
    fetchReviews();
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

  const itineraryHandle = async () => {
    if (!firestoreUser?.itinerary) {
      try {
        await updateDoc(doc(db, 'users', firestoreUser?.id), {
          itinerary: [],
        });
      } catch (e) {
        console.error(e);
        console.log('Error updating document: ', e);
      }
    }
  };

  const toggleModal = () => {
    setIsItinerary(!isItinerary);
  };

  return (
    <>
      <div className={styles.mainContainer}>
        <HeaderNew avatar={avatar} />

        <div className={styles.main}>
          <div className={styles.container}>
            {geocode?.name === undefined ? (
              <Skeleton height={50} />
            ) : (
              <div className={styles.importContainer}>
                <h1 className={`${styles.title} ${styles.titleMain}`}>
                  {geocode?.address.split(',').slice(0, 2).join(',')}
                </h1>
                <button
                  onClick={() => {
                    itineraryHandle();
                    toggleModal();
                  }}
                  className={styles.importButton}
                >
                  Import
                </button>
              </div>
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
                        onClick={() => {
                          setPhotoForModal(placeData.imageUrl);
                          setIsPhotoOpen(true);
                        }}
                      />
                    </div>
                  )}
                  {id && geocode?.types && (
                    <APIProvider apiKey='AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8'>
                      <div className={styles.mapContainer}>
                        <MapCart
                          center={geocode}
                          {...mapOptions}
                          zoom={geocode.types.includes('locality') ? 10 : 17}
                        >
                          <Marker position={geocode} />
                        </MapCart>
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
                {isReview
                  ? (myReview?.text ? 'Change' : 'Add') + ' review'
                  : (myReview?.advice ? 'Change' : 'Add') + ' advice'}
              </button>
            </div>
            <div className={styles.commentsMap}>
              {activeTab === 0 ? (
                <PlaceReviews reviews={reviews} myReview={myReview} fetchReviews={fetchReviews} />
              ) : (
                <PlaceAdvices reviews={reviews} myReview={myReview} fetchReviews={fetchReviews} />
              )}
            </div>
          </div>
        </div>
        {isItinerary && (
          <ItineraryModal closeModal={toggleModal} selectedItinerary={placeForItinerary} />
        )}
        {id && (
          <CustomModal isOpen={isAddReviewOpen} onCloseModal={() => setIsAddReviewOpen(false)}>
            <CreateReviewModal
              closeModal={() => setIsAddReviewOpen(false)}
              placeId={id}
              placeName={geocode?.name}
              startReview={myReview}
              isReview={isReview}
              isAdvice={isAdvice}
              fetchReviews={fetchReviews}
            />
          </CustomModal>
        )}

        <PhotoModal
          photoForModal={photoForModal}
          setIsPhotoOpen={setIsPhotoOpen}
          isPhotoOpen={isPhotoOpen}
        />
      </div>
      <Footer />
    </>
  );
};

export default Place;
