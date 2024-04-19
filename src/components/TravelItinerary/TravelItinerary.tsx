import { FC, useContext, useEffect, useState } from 'react';

import TravelCard from '~/components/TravelCard/TravelCard';
import useTravelsContext from '~/components/TravelItinerary/store';
import { AuthContext } from '~/providers/authContext';
import { tripsCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';

import { onSnapshot, orderBy, query, where } from '@firebase/firestore';

import { Sort } from '../Sort/Sort';
import styles from './travelItinerary.module.css';

import 'swiper/css';

export type SortBy = 'endDate' | 'rate' | 'tripName';

interface Props {
  isFavourites?: boolean;
}

const buildQuery = (
  sortBy: SortBy,
  isReverse: boolean,
  firestoreUser: IUser,
  field: string,
  isFavourites: boolean
) => {
  let additionalQuery;

  switch (sortBy) {
    case 'tripName':
      additionalQuery = orderBy('tripName', !isReverse ? 'desc' : 'asc');
      break;
    case 'rate':
      additionalQuery = orderBy('rate', !isReverse ? 'desc' : 'asc');
      break;
    default:
      additionalQuery = orderBy('endDate', !isReverse ? 'desc' : 'asc');
  }

  return query(
    tripsCollection,
    where(field, isFavourites ? 'array-contains' : '==', firestoreUser?.id),
    additionalQuery
  );
};

export const TravelItinerary: FC<Props> = ({ isFavourites = false }) => {
  const { firestoreUser } = useContext(AuthContext);
  // const { travels, setTravels } = useTravelsContext();
  const [travels, setTravels] = useState<ITravel[]>([]);
  const [wishlist, setWishlist] = useState<ITravel[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('endDate');
  const [isReverse, setIsReverse] = useState(false);

  useEffect(() => {
    const q = query(
      tripsCollection,
      where('usersSaved', 'array-contains', firestoreUser?.id),
      orderBy(sortBy, !isReverse ? 'desc' : 'asc')
    );
    const unsub = onSnapshot(q, (querySnapshot: { docs: any[] }) => {
      const fetchedTravel = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setWishlist(fetchedTravel as ITravel[]);
    });
  }, [firestoreUser?.id]);

  useEffect(() => {
    if (isFavourites) return;
    const fetchData = async () => {
      if (firestoreUser?.id) {
        const q = query(
          tripsCollection,
          where('userId', '==', firestoreUser?.id),
          orderBy(sortBy, !isReverse ? 'desc' : 'asc')
        );

        const unsub = onSnapshot(q, (querySnapshot: { docs: any[] }) => {
          const fetchedTravel = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setTravels(fetchedTravel as ITravel[]);
        });

        return () => {
          unsub();
        };
      }
    };

    fetchData();
  }, [isFavourites, sortBy, isReverse, firestoreUser?.id]);

  if (isFavourites) {
    return (
      <div className={styles.container}>
        {wishlist && wishlist.length > 0 ? (
          <>
            <p className={styles.title}>Travels you saved</p>
            <div className={styles.travelsContainer}>
              <div style={{ alignSelf: 'flex-start' }}>
                <Sort
                  onSelect={setSortBy}
                  isReverse={isReverse}
                  setReverse={() => setIsReverse((prevState) => !prevState)}
                />
              </div>
              {wishlist.map((travel) => (
                <TravelCard key={travel.id} travel={travel} />
              ))}
            </div>
          </>
        ) : (
          <p className={styles.title}>You have no saved travels</p>
        )}
      </div>
    );
  }

  if (!isFavourites) {
    return (
      <div className={styles.container}>
        {travels && travels.length > 0 ? (
          <>
            <p className={styles.title}>{firestoreUser?.username}'s travels</p>
            <div className={styles.travelsContainer}>
              <div style={{ alignSelf: 'flex-start' }}>
                <Sort
                  onSelect={setSortBy}
                  isReverse={isReverse}
                  setReverse={() => setIsReverse((prevState) => !prevState)}
                />
              </div>
              {travels.map((travel) => (
                <TravelCard key={travel.id} travel={travel} />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyContainer}>
            <p className={styles.title}>No travels yet</p>
            <p className={styles.text}>
              Hmm... {firestoreUser?.username} hasn&apos;t posted anything yet. Start sharing your
              experience with other participants!
            </p>
          </div>
        )}
      </div>
    );
  }
};
