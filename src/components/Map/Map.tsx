import {FC, useEffect, useMemo, useState} from "react"
import {ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "react-simple-maps"
import GeoJson from '@assets/geoJson/countries-110m.json';
import useMapContext from "~/components/EditMap/store";
import styles from './map.module.css';
import Plus from '@assets/icons/map/plus.svg';
import Minus from '@assets/icons/map/minus.svg';
import {getDocs, query, where} from "@firebase/firestore";
import {tripsCollection} from "~/types/firestoreCollections";
import {ITravel} from "~/types/travel";
import { geocodeByPlaceId } from "react-places-autocomplete";

interface Props {
  onClick?: (value: string) => void;
  selectedTripId?: string | null;
  userId?: string,
}

interface IPosition {
  coordinates: [number, number],
  zoom: number,
}

interface IPin {
  lat:number, 
  lng:number, 
  color: string, 
  place_id:string,
}

const Map: FC<Props> = ({onClick, selectedTripId, userId}) => {
  const {trips} = useMapContext();
  const [position, setPosition] = useState<IPosition>({ coordinates: [0, 0], zoom: 1 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [usersTrips, setUsersTrips] = useState<ITravel[]>();
  const [citiesToDisplay, setCitiesToDisplay] = useState<IPin[]>();
  const [placesToDisplay, setPlacesToDisplay] = useState<IPin[]>();

  useEffect(() => {
    (async () => {
      if (userId) {
        const q = query(tripsCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const fetchedTrips = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUsersTrips(fetchedTrips as ITravel[]);
      }
    })();
  }, [userId]);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  const handleMoveEnd = (positionValue: IPosition) => {
    setPosition(positionValue);
  }

  useEffect(() => {
    const tripsToDisplay = userId ? usersTrips : trips;
    if (!tripsToDisplay) return;
    const citiesPlacesId = tripsToDisplay.flatMap(trip => trip.cities?.map(city => ({ place_id: city.placeID, color: trip.location ? trip.location.color : trip.pinColor })) || []);
    console.log(citiesPlacesId);
    (async () => {
      const citiesGeoCode: IPin[] = [];
      await Promise.all(citiesPlacesId.map(async (city) => {
        if (!city) return;
        const geocode = await geocodeByPlaceId(city.place_id);
        const randomOffset = Math.random() * 0.001 - 0.0005;
        citiesGeoCode.push({
          lng: geocode[0].geometry.location.lng() + randomOffset, 
          lat: geocode[0].geometry.location.lat() + randomOffset, 
          place_id: city.place_id, 
          color: city.color,
        });
      }));
      setCitiesToDisplay(citiesGeoCode);
    })();
  }, [trips, userId, usersTrips]);

  useEffect(() => {
    const tripsToDisplay = userId ? usersTrips : trips;
    if (!tripsToDisplay) return;
    const tagsPlaceId = tripsToDisplay.flatMap(trip => trip.geoTags?.map(tag => ({ place_id: tag.placeID, color: trip.location?.color || trip.pinColor })) || []);
    (async () => {
      const tagsGeoCode: IPin[] = [];
      await Promise.all(tagsPlaceId.map(async (tag) => {
        if (!tag) return;
        const geocode = await geocodeByPlaceId(tag.place_id);
        const randomOffset = Math.random() * 0.001 - 0.0005;
        tagsGeoCode.push({
          lng: geocode[0].geometry.location.lng() + randomOffset, 
          lat: geocode[0].geometry.location.lat() + randomOffset, 
          place_id: tag.place_id, 
          color: tag.color,
        });
      }));
      setPlacesToDisplay(tagsGeoCode);
    })();
  }, [trips, userId, usersTrips]);

  const selectedTripsList = useMemo(() => {
    if (userId) {
      return usersTrips;
    } else {
      return trips;
    }
  }, [trips, userId, usersTrips]);

  return (
    <div style={{position: 'relative'}}>
      <ComposableMap>
        <ZoomableGroup
          translateExtent={[[0, 0], [900, 600]]}
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          onMove={({ zoom }) => setScaleFactor(zoom)}
          style={{width: '100%', height: '100%'}}
        >
          <Geographies geography={GeoJson}>
            {({geographies}) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} fill={'grey'}   
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                }}/>
              ))
            }
          </Geographies>

          {
            citiesToDisplay?.map(city => (
              <Marker
                key={`${city.place_id}${city.lng}${city.lat}`}
                onClick={() => onClick?.(city.place_id)}
                coordinates={[city.lng, city.lat]}
              >
                <g transform={`translate(${-10 / scaleFactor}, ${-26 / scaleFactor})`} className={styles.marker}>
                  <svg width={20 / scaleFactor} height={30 / scaleFactor} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 1.00146e-08C5.89206 -0.00010539 3.86926 0.831759 2.37124 2.31479C0.873231 3.79782 0.0210794 5.81216 0 7.92C0 13.4 7.05 19.5 7.35 19.76C7.53113 19.9149 7.76165 20.0001 8 20.0001C8.23835 20.0001 8.46887 19.9149 8.65 19.76C9 19.5 16 13.4 16 7.92C15.9789 5.81216 15.1268 3.79782 13.6288 2.31479C12.1307 0.831759 10.1079 -0.00010539 8 1.00146e-08ZM8 11C7.30777 11 6.63108 10.7947 6.0555 10.4101C5.47993 10.0256 5.03133 9.47893 4.76642 8.83939C4.50151 8.19985 4.4322 7.49612 4.56725 6.81718C4.7023 6.13825 5.03564 5.51461 5.52513 5.02513C6.01461 4.53564 6.63825 4.2023 7.31718 4.06725C7.99612 3.9322 8.69985 4.00152 9.33939 4.26642C9.97893 4.53133 10.5256 4.97993 10.9101 5.5555C11.2947 6.13108 11.5 6.80777 11.5 7.5C11.5 8.42826 11.1313 9.3185 10.4749 9.97487C9.8185 10.6313 8.92826 11 8 11Z"
                      fill={city.color || "#1400FF"}/>
                  </svg>
                </g>
              </Marker>
            ))
          }

          {
            placesToDisplay?.map(place => (
              <Marker
                key={`${place.place_id}${place.lng}${place.lat}`}
                onClick={() => onClick?.(place.place_id)}
                coordinates={[place.lng, place.lat]}
              >
                <g transform={`translate(${-10 / scaleFactor}, ${-26 / scaleFactor})`} className={styles.marker}>
                  <svg width={20 / scaleFactor} height={30 / scaleFactor} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 1.00146e-08C5.89206 -0.00010539 3.86926 0.831759 2.37124 2.31479C0.873231 3.79782 0.0210794 5.81216 0 7.92C0 13.4 7.05 19.5 7.35 19.76C7.53113 19.9149 7.76165 20.0001 8 20.0001C8.23835 20.0001 8.46887 19.9149 8.65 19.76C9 19.5 16 13.4 16 7.92C15.9789 5.81216 15.1268 3.79782 13.6288 2.31479C12.1307 0.831759 10.1079 -0.00010539 8 1.00146e-08ZM8 11C7.30777 11 6.63108 10.7947 6.0555 10.4101C5.47993 10.0256 5.03133 9.47893 4.76642 8.83939C4.50151 8.19985 4.4322 7.49612 4.56725 6.81718C4.7023 6.13825 5.03564 5.51461 5.52513 5.02513C6.01461 4.53564 6.63825 4.2023 7.31718 4.06725C7.99612 3.9322 8.69985 4.00152 9.33939 4.26642C9.97893 4.53133 10.5256 4.97993 10.9101 5.5555C11.2947 6.13108 11.5 6.80777 11.5 7.5C11.5 8.42826 11.1313 9.3185 10.4749 9.97487C9.8185 10.6313 8.92826 11 8 11Z"
                      fill={place.color || "#1400FF"}/>
                  </svg>
                </g>
              </Marker>
            ))
          }

          {/* {selectedTripsList?.map(trip => (
            trip?.location?.latitude ? (
              <Marker
                key={trip.id}
                onClick={() => onClick?.(trip.id)}
                coordinates={[trip.location.longitude, trip.location.latitude]}
              >
                <g transform={`translate(${-10 / scaleFactor}, ${-26 / scaleFactor})`} className={selectedTripId === trip.id && styles.marker}>
                  <svg width={20 / scaleFactor} height={30 / scaleFactor} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 1.00146e-08C5.89206 -0.00010539 3.86926 0.831759 2.37124 2.31479C0.873231 3.79782 0.0210794 5.81216 0 7.92C0 13.4 7.05 19.5 7.35 19.76C7.53113 19.9149 7.76165 20.0001 8 20.0001C8.23835 20.0001 8.46887 19.9149 8.65 19.76C9 19.5 16 13.4 16 7.92C15.9789 5.81216 15.1268 3.79782 13.6288 2.31479C12.1307 0.831759 10.1079 -0.00010539 8 1.00146e-08ZM8 11C7.30777 11 6.63108 10.7947 6.0555 10.4101C5.47993 10.0256 5.03133 9.47893 4.76642 8.83939C4.50151 8.19985 4.4322 7.49612 4.56725 6.81718C4.7023 6.13825 5.03564 5.51461 5.52513 5.02513C6.01461 4.53564 6.63825 4.2023 7.31718 4.06725C7.99612 3.9322 8.69985 4.00152 9.33939 4.26642C9.97893 4.53133 10.5256 4.97993 10.9101 5.5555C11.2947 6.13108 11.5 6.80777 11.5 7.5C11.5 8.42826 11.1313 9.3185 10.4749 9.97487C9.8185 10.6313 8.92826 11 8 11Z"
                      fill={trip.location.color || "#1400FF"}/>
                  </svg>
                </g>
              </Marker>
            ) : null
          ))} */}


        </ZoomableGroup>
      </ComposableMap>

      <div className={styles.buttonsContainer}>
        <div className={styles.button} onClick={handleZoomIn}>
          <img src={Plus} alt={'Plus zoom icon'}/>
        </div>
        <div className={styles.button} onClick={handleZoomOut}>
          <img src={Minus} alt={'Minus zoom icon'}/>
        </div>
      </div>
    </div>
  );
};

export default Map;
