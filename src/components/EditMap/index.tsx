import styles from './EditMap.module.css';
import map from "@assets/icons/map.svg";
import ImageMarker from "react-image-marker";
import {FC, useCallback, useContext, useEffect, useState} from "react";
import randomColor from "randomcolor";
import {ICustomMarker} from "~/components/EditMap/types";
import CustomMarker from "~/components/EditMap/CustomMarker";
import useMapContext from "~/components/EditMap/store";
import Bin from '@assets/icons/BinIcon.svg';
import {doc, updateDoc} from "@firebase/firestore";
import {db} from "~/firebase";
import {AuthContext} from "~/providers/authContext";
import {LoadingScreen} from "~/components/LoadingScreen";
import Map from "~/components/Map/Map";

interface Props {
  handleClose: React.Dispatch<React.SetStateAction<number>>;
}

const EditMap: FC<Props> = ({ handleClose }) => {
  const [selectedMarker, setSelectedMarker] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);

  // const handleSave = useCallback(() => {
  //   if (selectedMarker) {
  //     const filteredMarkers = markers.filter(marker => marker.top !== selectedMarker?.top && marker.left !== selectedMarker?.left);
  //     const filteredNewMarkers = newMarkers.filter(marker => marker.top !== selectedMarker?.top && marker.left !== selectedMarker?.left);
  //
  //     setMarkers(filteredMarkers);
  //     setNewMarkers(filteredNewMarkers);
  //     setSelectedMarker(null);
  //   }
  // }, [markers, selectedMarker]);

  const handleDeleteMarker = useCallback(async () => {
    if (selectedMarker) {
      try {
        setIsLoading(true);
        await updateDoc(doc(db, 'trips', selectedMarker), {
          location: {
            latitude: null,
            longitude: null,
            color: null,
          },
        });
      } catch (e) {
        console.error('[ERROR deleting marker] => ', e);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedMarker]);

  // useEffect(() => {
  //   setInitialMarkers(markers);
  //
  //   return () => {
  //     setNewMarkers([]);
  //   }
  // }, []);

  return (
    <div className={styles.container}>
      <div className={styles.centerContainer}>
        
        <div className={styles.mapContainer}>
        <div className={styles.buttonsWrapper}>
          <p className={styles.title}>Edit Map</p>

          <div className={styles.buttonsContainer}>
            {
              selectedMarker && (
                <button
                  onClick={handleDeleteMarker}
                  className={`${styles.button} ${!selectedMarker && styles.disabled}`}
                >
                  Delete
                </button>
              )
            }
            
            <button
              onClick={() => handleClose(0)}
              className={`${styles.button} ${!selectedMarker && styles.disabled}`}
            >
              X
            </button>
            {/*<div className={styles.smallButtonsContainer}>*/}
            {/*  <button className={`${styles.button}`}>Save</button>*/}
            {/*  <button*/}
            {/*    className={`${styles.button} ${styles.cancel}`}*/}
            {/*    onClick={() => {*/}
            {/*      setNewMarkers([]);*/}
            {/*      // setMarkers(initialMarkers);*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    Cancel*/}
            {/*  </button>*/}
            {/*</div>*/}
          </div>
        </div>
          <Map onClick={setSelectedMarker} selectedTripId={selectedMarker} />
        </div>
      </div>

      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default EditMap;
