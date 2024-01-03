import {useParams} from "react-router-dom";
import styles from "./place.module.css";
import Header from "~/components/profile/Header";
import {useEffect, useMemo, useRef, useState} from "react";
import axios from "axios";
import {IPlace} from "~/routes/AppRoutes/Posts/types";
import {PageTitle} from "~/components/PageTitle";
import Skeleton from "react-loading-skeleton";
import {PlaceCommentField} from "~/routes/AppRoutes/Place/components/PlaceCommentField";
import {Comment} from "~/components/Comment";
import {IPlaceComment} from "~/types/comments";
import {onSnapshot, orderBy, query, where} from "@firebase/firestore";
import {placesCommentsCollection} from "~/types/firestoreCollections";

const MAX_LENGTH = 700;

const Place = () => {
  const {id} = useParams();
  const [placeData, setPlaceData] = useState<IPlace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const truncatedText = useRef('');
  const remainingText = useRef('');
  const [comments, setComments] = useState<IPlaceComment[] | null>(null);

  useEffect(() => {
    const q = query(
      placesCommentsCollection,
      where('placeId', '==', id),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));

      setComments(fetchedDocs as IPlaceComment[]);
    });

    return () => {
      unsubscribe();
    }
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
          const {data}: {data?: {data: IPlace}} = await axios.get('https://us-central1-tripami-3e954.cloudfunctions.net/getGoogleMapsDetails?placeId=' + id);

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

  return (
    <div className={styles.mainContainer}>
      <Header/>

        <div className={styles.main}>
          <PageTitle title={'Place'} />

          {!isLoading ? (
            <>
              {placeData?.imageUrl ? (
                <div className={styles.post}>
                  <div className={styles.container}>
                    <div className={styles.postContainer}>
                      <img src={placeData.imageUrl || ''} alt={'place image'} className={styles.postIMage}/>

                      {placeData.articleText ? (
                        <div className={styles.textContainer}>
                          {isExpanded ? (
                            <div>
                              <div dangerouslySetInnerHTML={{__html: placeData.articleText}}/>
                              <button onClick={handleSeeMoreClick}>See less</button>
                            </div>
                          ) : (
                            <div>
                              <div dangerouslySetInnerHTML={{__html: truncatedText.current}}/>
                              {placeData.articleText.length > MAX_LENGTH && (
                                <button onClick={handleSeeMoreClick}>See more</button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {id && (
                    <PlaceCommentField placeId={id}/>
                  )}

                  {comments?.map(comment => <Comment key={comment.id} comment={comment} />)}
                </div>
              ) : (
                <h2 className={styles.empty}>There is no information about this place</h2>
              )}
            </>
          ) : <Skeleton className={styles.loader}/>}
        </div>
    </div>
  );
};

export default Place;
