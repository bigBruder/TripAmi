import styles from './googleMaps.module.css';
import MapOrange from '@assets/icons/MapOrange.svg';
import Build from '@assets/icons/build.svg';
import {useMemo} from "react";
import {GoogleMap} from "@react-google-maps/api";

const GoogleMaps = () => {
  const center = useMemo(() => ({ lat: 18.52043, lng: 73.856743 }), []);

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <p className={styles.title}>Build a travel itinerary <img src={MapOrange} /></p>
        <p className={styles.title}>Build a travel itinerary based on other people's reviews</p>
      </div>
      <div className={styles.subtitle}>
        <p className={styles.title}>Build a route based on user reviews <img src={Build} /></p>
      </div>

      <div className={styles.mapsWrapper}>
        <GoogleMap
          mapContainerClassName={styles.mapContainer}
          center={center}
          zoom={2}
        />
      </div>
    </div>
  );
};

export default GoogleMaps;
