import { Dispatch, FC, SetStateAction, useMemo } from 'react';

import { SortDirection } from '@assets/icons/SortDirection';

import { SortBy } from '../TravelItinerary/TravelItinerary';
import styles from './sort.module.css';

interface Props {
  onSelect: Dispatch<SetStateAction<SortBy>>;
  isReverse: boolean;
  setReverse: () => void;
}

export const Sort: FC<Props> = ({ onSelect, isReverse, setReverse }) =>
  useMemo(() => {
    return (
      <div className={styles.sortContainer}>
        <select
          name='order'
          className={styles.sortby_select}
          onChange={(e) => onSelect(e.target.value as SortBy)}
        >
          {/* <option value='startDate'>Start date</option> */}
          <option value='endDate'>Date</option>
          <option value='alphabetically'>A to Z</option>
          <option value='rate'>Rating</option>
        </select>
        <div onClick={() => setReverse()}>
          <SortDirection isReverse={isReverse} />
        </div>
      </div>
    );
  }, [isReverse, onSelect, setReverse]);
