import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IPlace } from '~/routes/AppRoutes/Posts/types';
import { ITravel } from '~/types/travel';

import styles from './SearchTripsCard.module.css';

interface CardProps {
  geotag: IPlace;
  handleSearchPush: () => void;
}

const SearchTripsCard: React.FC<CardProps> = ({ geotag, handleSearchPush }) => {
  const [photo, setPhoto] = useState<string>('/photoNotFound.jpg');
  useEffect(() => {
    if (geotag.photo) {
      setPhoto(geotag.photo);
    }
  }, [geotag.photo]);

  return (
    <div className={styles.searchTripsContainer} onClick={() => handleSearchPush()}>
      <div className={styles.searchPhotoContainer}>
        <img src={photo} alt='tripPhoto' className={styles.searchPhoto} />
      </div>
      <div className={styles.searchTripInfo}>
        <h3 className={styles.searchTripName}>{geotag.address.split(',')[0]}</h3>
      </div>
    </div>
  );
};

export default SearchTripsCard;
