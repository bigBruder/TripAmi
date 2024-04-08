import { useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
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

import styles from './place.module.css';

const MAX_LENGTH = 700;

const Place = () => {
  const { id } = useParams();
  const [placeData, setPlaceData] = useState<IPlace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const truncatedText = useRef('');
  const remainingText = useRef('');
  const [comments, setComments] = useState<IPlaceComment[] | null>(null);
  const [reviews, setReviews] = useState<ITravel | null>(null);

  useEffect(() => {
    const q = query(
      placesCommentsCollection,
      where('placeId', '==', id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setComments(fetchedDocs as IPlaceComment[]);
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

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
    const q = query(collectionGroup(db, 'cities'), where('placeID', '==', id));
    (async () => {
      const querySnapshot = await getDocs(q);
      const tripsId: string[] = [];
      const subcollectionsId = querySnapshot.docs.map((document) => {
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

      setReviews(trips);
    })();
  }, []);

  return (
    <div className={styles.mainContainer}>
      <Header />

      <div className={styles.main}>
        <PageTitle title={'Place'} />

        <div className={styles.post}>
          <div className={styles.container}>
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

                  {placeData.articleText ? (
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
                </>
              ) : (
                <h2 className={styles.empty}>There is no information about this place</h2>
              )}
            </div>
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
