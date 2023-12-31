import React, {FC} from "react"
import {ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "react-simple-maps"
import GeoJson from '@assets/geoJson/countries-110m.json';
import useMapContext from "~/components/EditMap/store";
import styles from './map.module.css';

interface Props {
  onClick?: (value: string) => void;
  selectedTripId?: string | null;
}

const Map: FC<Props> = ({onClick, selectedTripId}) => {
  const {trips} = useMapContext();

  return (
    <ComposableMap>
      <ZoomableGroup>
        <Geographies geography={GeoJson}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} />
            ))
          }
        </Geographies>
        {trips?.map(trip => (
          trip?.location?.latitude ? (
            <Marker
              key={trip.id}
              onClick={() => onClick?.(trip.id)}
              coordinates={[trip.location.longitude, trip.location.latitude]}
            >
              <g transform="translate(-10, -26)"  className={selectedTripId === trip.id && styles.marker}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{cursor: 'pointer'}} width="20" height="30" viewBox="0 0 30 20" fill="none">
                  <path
                    d="M4.63281 12.7937C4.63281 7.01441 9.19373 2.30273 14.8525 2.30273C20.5113 2.30273 25.0723 7.01441 25.0723 12.7937C25.0723 15.5837 24.2851 18.5801 22.8928 21.1683C21.503 23.753 19.473 25.9991 16.9315 27.1989C16.2807 27.5064 15.571 27.6658 14.8525 27.6658C14.134 27.6658 13.4243 27.5064 12.7736 27.1989C10.2321 25.9991 8.20213 23.7542 6.81224 21.1683C5.42002 18.5801 4.63281 15.5837 4.63281 12.7937ZM14.8525 4.07227C10.19 4.07227 6.38477 7.96169 6.38477 12.7937C6.38477 15.2675 7.08905 17.9749 8.35162 20.3236C9.61537 22.6748 11.4024 24.5988 13.514 25.5957C13.9328 25.7938 14.3895 25.8965 14.852 25.8965C15.3144 25.8965 15.7711 25.7938 16.1899 25.5957C18.3027 24.5988 20.0897 22.6748 21.3535 20.3236C22.616 17.9761 23.3203 15.2675 23.3203 12.7937C23.3203 7.96169 19.5151 4.07227 14.8525 4.07227ZM14.8525 9.9707C14.5074 9.9707 14.1657 10.0394 13.8469 10.1727C13.528 10.3061 13.2383 10.5017 12.9943 10.7481C12.7503 10.9946 12.5567 11.2872 12.4246 11.6092C12.2926 11.9313 12.2246 12.2764 12.2246 12.625C12.2246 12.9736 12.2926 13.3187 12.4246 13.6408C12.5567 13.9628 12.7503 14.2554 12.9943 14.5019C13.2383 14.7483 13.528 14.9439 13.8469 15.0773C14.1657 15.2106 14.5074 15.2793 14.8525 15.2793C15.5495 15.2793 16.2179 14.9996 16.7108 14.5019C17.2036 14.0041 17.4805 13.329 17.4805 12.625C17.4805 11.921 17.2036 11.2459 16.7108 10.7481C16.2179 10.2504 15.5495 9.9707 14.8525 9.9707ZM10.4727 12.625C10.4727 11.4517 10.9341 10.3265 11.7555 9.49688C12.5769 8.66725 13.6909 8.20117 14.8525 8.20117C16.0142 8.20117 17.1282 8.66725 17.9496 9.49688C18.771 10.3265 19.2324 11.4517 19.2324 12.625C19.2324 13.7983 18.771 14.9235 17.9496 15.7531C17.1282 16.5827 16.0142 17.0488 14.8525 17.0488C13.6909 17.0488 12.5769 16.5827 11.7555 15.7531C10.9341 14.9235 10.4727 13.7983 10.4727 12.625Z"
                    fill={trip.location.color || "#1400FF"}
                  />
                </svg>
              </g>
            </Marker>
          ) : null
        ))}
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default Map;
