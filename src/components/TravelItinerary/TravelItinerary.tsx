import styles from './travelItinerary.module.css';
import {useContext, useEffect, useMemo, useState} from "react";
import {AuthContext} from "~/providers/authContext";
import {getDocs, onSnapshot, orderBy, query, where} from "@firebase/firestore";
import {postsCollection, tripsCollection} from "~/types/firestoreCollections";
import {ITravel} from "~/types/travel";
import TravelCard from "~/components/TravelCard/TravelCard";
import useTravelsContext from "~/components/TravelItinerary/store";
import 'swiper/css';
import {IPost} from "~/types/post";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {useWindowDimensions} from "~/hooks/useWindowDimensions";
import SortDirectionIcon from '@assets/icons/sort_direction.svg';

export const TravelItinerary = () => {
  const {firestoreUser} = useContext(AuthContext);
  const {travels, setTravels} = useTravelsContext();
  const [suggestedPosts, setSuggestedPosts] = useState<IPost[] | null>(null);
  const [isSuggestedPostsLoading, setIsSuggestedPostsLoading] = useState(false);
  const {width} = useWindowDimensions();
  const [sortBy, setSortBy] = useState('date');
  const [SordDirection, setSortDirection] = useState('desc');
  const [isReverse, setIsReverse] = useState(false);

  useEffect(() => {
    if (firestoreUser?.id) {
      let q;

      switch (sortBy) {
        case 'date':
          q = query(
            tripsCollection, 
            where('userId', '==', firestoreUser?.id),
            orderBy('startDate', !isReverse ? 'desc' : 'asc'),
          );
          break;
        case 'alphabetically':
          q = query(
            tripsCollection, 
            where('userId', '==', firestoreUser?.id),
            orderBy('tripName', !isReverse ? 'desc' : 'asc'),
          );
          break;
        case 'rate':
          q = query(
            tripsCollection, 
            where('userId', '==', firestoreUser?.id),
            orderBy('rate', !isReverse ? 'desc' : 'asc'),
          );
          break;
      }
      // const q = query(
      //   tripsCollection, 
      //   where('userId', '==', firestoreUser?.id),
      //   orderBy('createAt', 'desc'),
      // );
      const unsub = onSnapshot(q, (querySnapshot) => {
        const fetchedTravel = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTravels(fetchedTravel as ITravel[]);
      });

      (async () => {
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
        } catch (err) {
          console.log(err);
          // @ts-ignore
          alert(firebaseErrors[err.code]);
        } finally {
          setIsSuggestedPostsLoading(false);
        }
      })();

      return () => {
        unsub();
      }
    }
  }, [firestoreUser?.id, isReverse, setTravels, sortBy]);

 console.log(sortBy, 'sortBy');

  return (
    <div className={styles.container}>
      <p className={styles.title}>{firestoreUser?.username}`s travels</p>


      <div className={styles.sortContainer}>
        <select name="order" className={styles.sortby_select} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Newest</option>
          <option value="alphabetically">Alphabetically</option>
          <option value="rate">Rating</option>
        </select>
        <img 
          src={SortDirectionIcon} 
          alt="sort direction icon" 
          className={styles.sort_directionIcon}
          onClick={() => setIsReverse(!isReverse)}
        />
      </div>

      <div className={styles.travelsContainer}>
        {travels.map(travel => <TravelCard key={travel.id} travel={travel} />)}
      </div>
    </div>
  );
}
