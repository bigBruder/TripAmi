import React, { Dispatch, FC, SetStateAction } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';

import place_icon from '../../assets/icons/place_icon.svg';
import styles from './PlaceAutocomplete.module.css';

interface PlaceAutocompleteProps {
  // searchOptions: google.maps.places.AutocompleteOptions;
  location: string | null;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  onSelectPlace: (address: string, placeId: string) => void;
  placeholder?: string;
  selectedGeoTags: { address: string; placeID: string }[];
}

const PlaceAutocomplete: FC<PlaceAutocompleteProps> = ({
  // searchOptions,
  location,
  setLocation,
  onSelectPlace,
  placeholder = 'Venice, Italy.',
  selectedGeoTags,
}) => {
  return (
    <PlacesAutocomplete
      // searchOptions={searchOptions}
      value={location}
      onChange={(value) => setLocation(value)}
      onSelect={onSelectPlace}
      language='en'
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
        const tags = selectedGeoTags.map((tag) => tag.placeID);
        const suggestionsFiltered = suggestions.filter(
          (suggestion) => !tags.includes(suggestion.placeId)
        );

        return (
          <div
            className={`${styles.inputContainer} ${suggestions.length ? styles.inputContainer : undefined}`}
          >
            <img src={place_icon} alt='place_icon' className={styles.place_icon} />
            <input
              {...getInputProps({
                placeholder: placeholder,
                className: styles.input,
              })}
            />
            <div className={suggestions.length ? styles.dropdown : undefined}>
              {/* {loading && <div>Loading...</div>} */}
              {suggestionsFiltered.map((suggestion) => {
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    key={suggestion}
                    {...getSuggestionItemProps(suggestion, {
                      className: styles.dropdownItem,
                      style,
                    })}
                  >
                    <p style={{ lineHeight: '22px' }}>{suggestion.description}</p>
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
