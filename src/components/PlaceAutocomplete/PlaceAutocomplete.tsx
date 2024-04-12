import { Dispatch, FC, SetStateAction } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';

import styles from './PlaceAutocomplete.module.css';

interface PlaceAutocompleteProps {
  searchOptions: google.maps.places.AutocompleteOptions;
  location: string | null;
  setLocation: Dispatch<SetStateAction<string | null>>;
  onSelectPlace: (address: string, placeId: string) => void;
  placeholder?: string;
}

const PlaceAutocomplete: FC<PlaceAutocompleteProps> = ({
  searchOptions,
  location,
  setLocation,
  onSelectPlace,
  placeholder = 'Venice, Italy.',
}) => {
  return (
    <PlacesAutocomplete
      searchOptions={searchOptions}
      value={location}
      onChange={(value) => setLocation(value)}
      onSelect={onSelectPlace}
      language='en'
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
        return (
          <div className={suggestions.length ? styles.inputContainer : undefined}>
            <input
              {...getInputProps({
                placeholder: placeholder,
                className: styles.input,
              })}
            />
            <div className={suggestions.length ? styles.dropdown : undefined}>
              {loading && <div>Loading...</div>}
              {suggestions.map((suggestion) => {
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
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
