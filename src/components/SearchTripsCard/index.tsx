import styles from './SearchTripsCard.module.css';
import React, { useEffect, useState } from 'react';
import { IPlace } from '~/routes/AppRoutes/Posts/types';

interface CardProps {
  geotag: IPlace;
  setCurrentGeoTag: (geoTag: IPlace) => void;
  setSearchValue: (value: string) => void;
  setIsDropdownOpen: (value: boolean) => void;
}

const SearchTripsCard: React.FC<CardProps> = ({ geotag, setCurrentGeoTag, setSearchValue, setIsDropdownOpen }) => {
  const [photo, setPhoto] = useState<string>('/photoNotFound.jpg');

  useEffect(() => {
    if (geotag.photo) {
      setPhoto(geotag.photo);
    }
  }, [geotag.photo]);
  return (
    <div className={styles.searchTripsContainer}
      onClick={() => {
        setSearchValue(geotag.address.split(',')[0]);
        setCurrentGeoTag(geotag)
        setIsDropdownOpen(false);
      }}>
      <div className={styles.searchPhotoContainer}>
        <img src={photo} alt="tripPhoto" className={styles.searchPhoto} />
      </div>
      <div className={styles.searchTripInfo}>
        <h3 className={styles.searchTripName}>{geotag.address.split(',')[0]}</h3>
      </div>
    </div>
  );
}

export default SearchTripsCard;