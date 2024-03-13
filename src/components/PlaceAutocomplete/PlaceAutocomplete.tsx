import { Dispatch, FC, SetStateAction } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import styles from './PlaceAutocomplete.module.css';

interface PlaceAutocompleteProps {
    searchOptions: google.maps.places.AutocompleteOptions;
    location: string | null;
    setLocation: Dispatch<SetStateAction<string | null>> | SetStateAction<string>;
    onSelectPlace: (address: string, placeId: string) => void;
  }

const PlaceAutocomplete: FC<PlaceAutocompleteProps> = ({searchOptions, location, setLocation, onSelectPlace}) => {
  return (
    <PlacesAutocomplete
      searchOptions={searchOptions}
      value={location}
      onChange={(value) => setLocation(value)}
      onSelect={onSelectPlace}
    >
      {({getInputProps, suggestions, getSuggestionItemProps, loading}) => {
        return (
          <div className={suggestions.length ? styles.inputContainer : undefined}>
            <input
              {...getInputProps({
                placeholder: 'Venice, Italy.',
                className: styles.input,
              })}
            />
            <div className={suggestions.length ? styles.dropdown : undefined}>
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const style = suggestion.active
                  ? {backgroundColor: '#fafafa', cursor: 'pointer'}
                  : {backgroundColor: '#ffffff', cursor: 'pointer'};
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className: styles.dropdownItem,
                      style,
                    })}
                  >
                    <p>{suggestion.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </PlacesAutocomplete>
  );
};

export default PlaceAutocomplete;