import React, { useContext, useEffect, useState } from 'react';

import { onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { AuthContext } from '~/providers/authContext';
import { tripsCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';

import { Sort } from '../Sort/Sort';
import TravelCard from '../TravelCard/TravelCard';
import styles from './SavedUserTrips.module.css';
import no_trips_search from '/no_trips_search.svg';

interface SavedUserTripsProps {
  trips: ITravel[];
}

const getQuery = (sortBy: SortBy, isReverse: boolean, firestoreUser: IUser) => {
  switch (sortBy) {
    case 'alphabetically':
      return query(
        tripsCollection,
        where('userId', '==', firestoreUser?.id),
        orderBy('tripName', !isReverse ? 'desc' : 'asc')
      );
    case 'rate':
      return query(
        tripsCollection,
        where('userId', '==', firestoreUser?.id),
        orderBy('rate', !isReverse ? 'desc' : 'asc')
      );
    default:
      return query(
        tripsCollection,
        where('userId', '==', firestoreUser?.id),
        orderBy('endDate', !isReverse ? 'desc' : 'asc')
      );
  }
};

type SortBy = 'endDate' | 'rate' | 'alphabetically';

const sortTrips = (trips: ITravel[], sortBy: SortBy, isReverse: boolean) => {
  let sortedTrips = [...trips];

  switch (sortBy) {
    case 'alphabetically':
      sortedTrips.sort((a, b) => a.tripName.localeCompare(b.tripName) * (isReverse ? -1 : 1));
      break;
    case 'rate':
      sortedTrips.sort((a, b) => (a.rate - b.rate) * (isReverse ? -1 : 1));
      break;
    default:
      sortedTrips.sort(
        (a, b) =>
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime() * (isReverse ? -1 : 1)
      );
  }

  return sortedTrips;
};

const SavedUserTrips: React.FC<SavedUserTripsProps> = ({ trips }) => {
  const [sortBy, setSortBy] = useState<SortBy>('endDate');
  const [isReverse, setIsReverse] = useState(false);
  const [sortedTrips, setSortedTrips] = useState<ITravel[]>([]);

  useEffect(() => {
    const sorted = sortTrips(trips, sortBy, isReverse);
    setSortedTrips(sorted);
  }, [trips, sortBy, isReverse]);

  return trips.length ? (
    <>
      <div style={{ alignSelf: 'flex-start', width: '100%' }}>
        <Sort
          onSelect={setSortBy}
          isReverse={isReverse}
          setReverse={() => setIsReverse((prevState) => !prevState)}
        />
      </div>
      <div className={styles.container}>
        {sortedTrips.map((trip) => (
          <TravelCard key={trip.id} travel={trip} isPlace />
        ))}
      </div>
    </>
  ) : (
    <div className={styles.emptyContainer}>
      <p className={styles.emptyState}>Hmm...&#32;You&#160;haven&apos;t saved anything yet.</p>
      <img src={no_trips_search} alt='no_trips_search' />
    </div>
  );
};

export default SavedUserTrips;
