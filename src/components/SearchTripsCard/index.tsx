import { ITravel } from '~/types/travel';
import styles from './SearchTripsCard.module.css';
import React, { useEffect, useState } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '~/firebase';
import { useNavigate } from 'react-router-dom';

interface CardProps {
  trip: ITravel;
}

const SearchTripsCard: React.FC<CardProps> = ({ trip }) => {
  const [photo, setPhoto] = useState<string>('/photoNotFound.jpg');
  const navigate = useNavigate();

  useEffect(() => {
    if (trip.imageUrl.length > 0) {
      if (trip.imageUrl[0].type.includes('video')) {
        const findPhoto = trip.imageUrl.find((image) => image.type.includes('image'));
        if (findPhoto) {
          getDownloadURL(ref(storage, findPhoto.url))
            .then((url) => {
              setPhoto(url);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } else {
        const url = getDownloadURL(ref(storage, trip.imageUrl[0].url));
        url
          .then((url) => {
            setPhoto(url);
          })
          .catch((error) => {
            console.log('error', error);
          });
      }
    }
  }, [trip.imageUrl]);
  return (
    <div className={styles.searchTripsContainer} onClick={() => navigate('/trip/' + trip.id)}>
      <div className={styles.searchPhotoContainer}>
        <img src={photo} alt="tripPhoto" className={styles.searchPhoto} />
      </div>
      <div className={styles.searchTripInfo}>
        <h3 className={styles.searchTripName}>{trip.tripName}</h3>
      </div>
    </div>
  );
}

export default SearchTripsCard;