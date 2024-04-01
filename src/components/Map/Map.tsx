import { FC, useCallback, useEffect, useState } from 'react';
import { geocodeByPlaceId } from 'react-places-autocomplete';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

import useMapContext from '~/components/EditMap/store';
import { tripsCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';

import GeoJson from '@assets/geoJson/countries-110m.json';
import Minus from '@assets/icons/map/minus.svg';
import Plus from '@assets/icons/map/plus.svg';
import { getDocs, query, where } from '@firebase/firestore';

import styles from './map.module.css';

interface Props {
  onClick?: (value: string) => void;
  selectedTripId?: string | null;
  userId?: string;
}

interface IPosition {
  coordinates: [number, number];
  zoom: number;
}

interface IPin {
  name: string;
  lat: number;
  lng: number;
  color: string;
  place_id: string;
}

const Map: FC<Props> = ({ userId }) => {
  const { trips } = useMapContext();
  const [position, setPosition] = useState<IPosition>({ coordinates: [0, 0], zoom: 1 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [usersTrips, setUsersTrips] = useState<ITravel[]>();
  const [citiesToDisplay, setCitiesToDisplay] = useState<IPin[]>();
  const [placesToDisplay, setPlacesToDisplay] = useState<IPin[]>();
  const [selectedMarkerAddress, setSelectedMarkerAddress] = useState<{
    address: string;
    placeId: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTrips = async () => {
      console.log('userId => ', userId);
      const q = query(tripsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedTrips = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log('fetchedTrips => ', fetchedTrips);
      setUsersTrips(fetchedTrips as ITravel[]);
    };
    fetchUserTrips();
  }, [userId]);

  const handleZoomIn = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 2, 4) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 2, 1) }));
  }, []);

  const handleMoveEnd = useCallback((positionValue: IPosition) => {
    setPosition(positionValue);
  }, []);

  useEffect(() => {
    const fetchCitiesToDisplay = async () => {
      const tripsToDisplay = userId ? usersTrips : trips;
      console.log('tripsToDisplay => ', tripsToDisplay);
      if (!tripsToDisplay) return;
      const citiesPlacesId = tripsToDisplay.flatMap(
        (trip) =>
          trip.cities?.map((city) => ({
            place_id: city.placeID,
            color: trip.pinColor,
            name: city.address,
          })) || []
      );
      const citiesGeoCode: IPin[] = [];
      await Promise.all(
        citiesPlacesId.map(async (city) => {
          if (!city) return;
          const geocode = await geocodeByPlaceId(city.place_id);
          const randomOffset = Math.random() * 0.001 - 0.0005;
          citiesGeoCode.push({
            name: city.name,
            lng: geocode[0].geometry.location.lng() + randomOffset,
            lat: geocode[0].geometry.location.lat() + randomOffset,
            place_id: city.place_id,
            color: city.color,
          });
        })
      );
      setCitiesToDisplay(citiesGeoCode);
    };
    fetchCitiesToDisplay();
  }, [trips, userId, usersTrips]);

  useEffect(() => {
    const fetchPlacesToDisplay = async () => {
      const tripsToDisplay = userId ? usersTrips : trips;
      if (!tripsToDisplay) return;
      const tagsPlaceId = tripsToDisplay.flatMap(
        (trip) =>
          trip.geoTags?.map((tag) => ({
            place_id: tag.placeID,
            color: trip.pinColor,
            name: tag.address,
          })) || []
      );
      const tagsGeoCode: IPin[] = [];
      await Promise.all(
        tagsPlaceId.map(async (tag) => {
          if (!tag) return;
          const geocode = await geocodeByPlaceId(tag.place_id);
          const randomOffset = Math.random() * 0.001 - 0.0005;
          tagsGeoCode.push({
            name: tag.name,
            lng: geocode[0].geometry.location.lng() + randomOffset,
            lat: geocode[0].geometry.location.lat() + randomOffset,
            place_id: tag.place_id,
            color: tag.color,
          });
        })
      );
      setPlacesToDisplay(tagsGeoCode);
    };
    fetchPlacesToDisplay();
  }, [trips, userId, usersTrips]);

  const handleSelectMarker = useCallback((address: string, placeId: string) => {
    setSelectedMarkerAddress({ address, placeId });
  }, []);

  const handleSelectPlace = useCallback(() => {
    navigate(`/place/${selectedMarkerAddress?.placeId}`);
  }, [navigate, selectedMarkerAddress]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setSelectedMarkerAddress(null);
    }, 3000);
    return () => clearTimeout(timerId);
  }, [selectedMarkerAddress]);

  return (
    <div style={{ position: 'relative' }}>
      {selectedMarkerAddress && (
        <div className={styles.selectedMarkerAddress} onClick={() => handleSelectPlace()}>
          {selectedMarkerAddress.address}
        </div>
      )}

      <ComposableMap>
        <ZoomableGroup
          translateExtent={[
            [0, 0],
            [900, 600],
          ]}
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          onMove={({ zoom }) => setScaleFactor(zoom)}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={GeoJson}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={'grey'}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {citiesToDisplay?.map((city) => (
            <Marker
              key={`${city.place_id}${city.lng}${city.lat}`}
              coordinates={[city.lng, city.lat]}
              onClick={() => handleSelectMarker(city.name, city.place_id)}
              cursor={'pointer'}
            >
              <g
                transform={`translate(${-10 / scaleFactor}, ${-26 / scaleFactor})`}
                className={styles.marker}
              >
                {/* <svg
                  width={20 / scaleFactor}
                  height={30 / scaleFactor}
                  viewBox='0 0 16 20'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M8 1.00146e-08C5.89206 -0.00010539 3.86926 0.831759 2.37124 2.31479C0.873231 3.79782 0.0210794 5.81216 0 7.92C0 13.4 7.05 19.5 7.35 19.76C7.53113 19.9149 7.76165 20.0001 8 20.0001C8.23835 20.0001 8.46887 19.9149 8.65 19.76C9 19.5 16 13.4 16 7.92C15.9789 5.81216 15.1268 3.79782 13.6288 2.31479C12.1307 0.831759 10.1079 -0.00010539 8 1.00146e-08ZM8 11C7.30777 11 6.63108 10.7947 6.0555 10.4101C5.47993 10.0256 5.03133 9.47893 4.76642 8.83939C4.50151 8.19985 4.4322 7.49612 4.56725 6.81718C4.7023 6.13825 5.03564 5.51461 5.52513 5.02513C6.01461 4.53564 6.63825 4.2023 7.31718 4.06725C7.99612 3.9322 8.69985 4.00152 9.33939 4.26642C9.97893 4.53133 10.5256 4.97993 10.9101 5.5555C11.2947 6.13108 11.5 6.80777 11.5 7.5C11.5 8.42826 11.1313 9.3185 10.4749 9.97487C9.8185 10.6313 8.92826 11 8 11Z'
                    fill={
                      selectedMarkerAddress?.address === city.name ? 'red' : city.color || '#1400FF'
                    }
                  /> */}
                {/* </svg> */}\{' '}
                <svg
                  width={30 / scaleFactor}
                  height={50 / scaleFactor}
                  viewBox='0 0 48 48'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    width={20 / scaleFactor}
                    height={30 / scaleFactor}
                    d='M24,1.32c-9.92,0-18,7.8-18,17.38A16.83,16.83,0,0,0,9.57,29.09l12.84,16.8a2,2,0,0,0,3.18,0l12.84-16.8A16.84,16.84,0,0,0,42,18.7C42,9.12,33.92,1.32,24,1.32Z'
                    fill={
                      selectedMarkerAddress?.address === city.name ? 'red' : city.color || '#1400FF'
                    }
                  />
                  <path d='M25.37,12.13a7,7,0,1,0,5.5,5.5A7,7,0,0,0,25.37,12.13Z' fill='white' />
                </svg>
              </g>
            </Marker>
          ))}

          {placesToDisplay?.map((place) => (
            <Marker
              key={`${place.place_id}${place.lng}${place.lat}`}
              onClick={() => handleSelectMarker(place.name, place.place_id)}
              coordinates={[place.lng, place.lat]}
              cursor={'pointer'}
            >
              <g
                transform={`translate(${-10 / scaleFactor}, ${-26 / scaleFactor})`}
                className={styles.marker}
              >
                {/* <svg
                  width={20 / scaleFactor}
                  height={30 / scaleFactor}
                  viewBox='0 0 16 20'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M8 1.00146e-08C5.89206 -0.00010539 3.86926 0.831759 2.37124 2.31479C0.873231 3.79782 0.0210794 5.81216 0 7.92C0 13.4 7.05 19.5 7.35 19.76C7.53113 19.9149 7.76165 20.0001 8 20.0001C8.23835 20.0001 8.46887 19.9149 8.65 19.76C9 19.5 16 13.4 16 7.92C15.9789 5.81216 15.1268 3.79782 13.6288 2.31479C12.1307 0.831759 10.1079 -0.00010539 8 1.00146e-08ZM8 11C7.30777 11 6.63108 10.7947 6.0555 10.4101C5.47993 10.0256 5.03133 9.47893 4.76642 8.83939C4.50151 8.19985 4.4322 7.49612 4.56725 6.81718C4.7023 6.13825 5.03564 5.51461 5.52513 5.02513C6.01461 4.53564 6.63825 4.2023 7.31718 4.06725C7.99612 3.9322 8.69985 4.00152 9.33939 4.26642C9.97893 4.53133 10.5256 4.97993 10.9101 5.5555C11.2947 6.13108 11.5 6.80777 11.5 7.5C11.5 8.42826 11.1313 9.3185 10.4749 9.97487C9.8185 10.6313 8.92826 11 8 11Z'
                    fill={
                      selectedMarkerAddress?.address === place.name
                        ? 'red'
                        : place.color || '#1400FF'
                    }
                  />
                </svg> */}

                <svg
                  width={30 / scaleFactor}
                  height={50 / scaleFactor}
                  viewBox='0 0 48 48'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M24,1.32c-9.92,0-18,7.8-18,17.38A16.83,16.83,0,0,0,9.57,29.09l12.84,16.8a2,2,0,0,0,3.18,0l12.84-16.8A16.84,16.84,0,0,0,42,18.7C42,9.12,33.92,1.32,24,1.32Z'
                    fill={
                      selectedMarkerAddress?.address === place.name
                        ? 'red'
                        : place.color || '#1400FF'
                    }
                  />
                  <path d='M25.37,12.13a7,7,0,1,0,5.5,5.5A7,7,0,0,0,25.37,12.13Z' fill='white' />
                </svg>
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      <div className={styles.buttonsContainer}>
        <div className={styles.button} onClick={handleZoomIn}>
          <img src={Plus} alt={'Plus zoom icon'} />
        </div>
        <div className={styles.button} onClick={handleZoomOut}>
          <img src={Minus} alt={'Minus zoom icon'} />
        </div>
      </div>
    </div>
  );
};

export default Map;
