import { useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { geocodeByPlaceId } from 'react-places-autocomplete';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import { collectionGroup, documentId, getDocs } from 'firebase/firestore';
import Lottie from 'lottie-react';
import { Comment } from '~/components/Comment';
import { PageTitle } from '~/components/PageTitle';
import { PlaceReview } from '~/components/PlaceReview/PlaceReview';
import Header from '~/components/profile/Header';
import { db } from '~/firebase';
import { PlaceCommentField } from '~/routes/AppRoutes/Place/components/PlaceCommentField';
import { IPlace } from '~/routes/AppRoutes/Posts/types';
import { IPlaceComment } from '~/types/comments';
import { placesCommentsCollection, tripsCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';

import AnimationData from '@assets/animations/loader.json';
import { onSnapshot, orderBy, query, where } from '@firebase/firestore';
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
  // styles: [
  //   {
  //     featureType: 'poi',
  //     stylers: [{ visibility: 'off' }],
  //   },
  // ],
  clickableIcons: false,
};

const Place = () => {
  const { id } = useParams();
  const [placeData, setPlaceData] = useState<IPlace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const truncatedText = useRef('');
  const remainingText = useRef('');
  const [comments, setComments] = useState<IPlaceComment[] | null>(null);
  const [reviews, setReviews] = useState<ITravel[]>([]);
  const [geocode, setGeocode] = useState<any>(null);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          // eslint-disable-next-line no-undef
          const geocode: google.maps.GeocoderResult[] = await geocodeByPlaceId(id);
          const position = {
            lat: geocode[0].geometry.location.lat(),
            lng: geocode[0].geometry.location.lng(),
            types: geocode[0].types,
            name: geocode[0].formatted_address,
          };
          console.log(geocode);
          setGeocode(position);
        } catch (err) {
          console.log('[ERROR getting geocode data] => ', err);
        }
      })();
    }
  }, [id]);

  // useEffect(() => {
  //   const q = query(
  //     placesCommentsCollection,
  //     where('placeId', '==', id),
  //     orderBy('createdAt', 'desc')
  //   );
  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     const fetchedDocs = querySnapshot.docs.map((doc) => ({
  //       ...doc.data(),
  //       id: doc.id,
  //     }));

  //     setComments(fetchedDocs as IPlaceComment[]);
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [id]);

  const handleSeeMoreClick = () => {
    setIsExpanded(!isExpanded);
  };

  useMemo(() => {
    if (placeData?.articleText) {
      const cutText = placeData.articleText.slice(0, MAX_LENGTH);

      truncatedText.current = placeData.articleText.length > MAX_LENGTH ? cutText + '...' : cutText;
      remainingText.current = placeData.articleText.slice(MAX_LENGTH);
    }
  }, [placeData?.articleText]);

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          setIsLoading(true);
          const { data }: { data?: { data: IPlace } } = await axios.get(
            'https://getgooglemapsdetails-dp6fh5oj2q-uc.a.run.app/helloWorld?placeId=' + id
          );
          if (data?.data) {
            setPlaceData(data.data);
          }
        } catch (err) {
          console.log('[ERROR getting data about place] => ', err);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [id]);

  useEffect(() => {
    const queryCities = query(collectionGroup(db, 'cities'), where('placeID', '==', id));
    const queryPlaces = query(collectionGroup(db, 'places'), where('placeID', '==', id));
    try {
      (async () => {
        const queryCitiesSnapshot = await getDocs(queryCities);
        const queryPlacesSnapshot = await getDocs(queryPlaces);
        const tripsId: string[] = [];
        queryPlacesSnapshot.docs.map((document) => {
          if (document.ref.parent && document.ref.parent.parent) {
            tripsId.push(document.ref?.parent?.parent?.id);
          }
        });
        queryCitiesSnapshot.docs.map((document) => {
          if (document.ref.parent && document.ref.parent.parent) {
            tripsId.push(document.ref?.parent?.parent?.id);
          }
        });
        const tripQuery = query(tripsCollection, where(documentId(), 'in', tripsId));
        const tripQuerySnapshot = await getDocs(tripQuery);
        const trips = tripQuerySnapshot.docs.map((document) => ({
          ...document.data(),
          id: document.id,
        }));

        trips.length > 0 ? setReviews(trips as ITravel[]) : setReviews([]);
      })();
    } catch (err) {
      console.log('[ERROR getting data about place] => ', err);
    }
  }, [id]);

  console.log(geocode);

  return (
    <div className={styles.mainContainer}>
      <Header />

      <div className={styles.main}>
        <PageTitle title={'Place'} />

        <div className={styles.post}>
          <div className={styles.container}>
            {geocode?.name === undefined ? (
              <Skeleton height={50} />
            ) : (
              <h1 className={styles.title}>{geocode?.name}</h1>
            )}
            <div className={styles.postContainer}>
              {isLoading ? (
                <Lottie animationData={AnimationData} />
              ) : placeData?.imageUrl || placeData?.articleText ? (
                <>
                  {placeData.imageUrl && (
                    <img
                      src={placeData.imageUrl || ''}
                      alt={'place image'}
                      className={styles.postIMage}
                    />
                  )}
                  {id && geocode?.types && (
                    <APIProvider apiKey='AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8'>
                      <div style={{ height: '200px', width: '300px' }}>
                        <Map
                          center={geocode}
                          {...mapOptions}
                          zoom={geocode.types.includes('locality') ? 10 : 17}
                        />
                      </div>
                    </APIProvider>
                  )}
                </>
              ) : (
                <h2 className={styles.empty}>There is no information about this place</h2>
              )}
            </div>
            {placeData && placeData.articleText ? (
              <div className={styles.textContainer}>
                {isExpanded ? (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: placeData.articleText }} />
                    <button onClick={handleSeeMoreClick}>See less</button>
                  </div>
                ) : (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: truncatedText.current }} />
                    {placeData.articleText.length > MAX_LENGTH && (
                      <button onClick={handleSeeMoreClick}>See more</button>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {reviews && reviews?.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className={styles.review}>
                <PlaceReview trip={review} />
              </div>
            ))
          ) : (
            <h2 className={styles.empty}>There are no reviews for this place</h2>
          )}

          {/* {isLoading ? null : (
            <>
              {id && <PlaceCommentField placeId={id} />}
              {comments?.map((comment) => <Comment key={comment.id} comment={comment} />)}
            </>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Place;
