import React, {useCallback, useContext, useEffect, useState} from 'react';
import styles from './createTripModal.module.css';
// @ts-ignore
import Checkbox from 'react-custom-checkbox';
import Tick from "../../assets/icons/tick.svg";
import Rating from "~/components/Rating";
import {FileUploader} from "react-drag-drop-files";
import {addDoc} from "@firebase/firestore";
import {tripsCollection} from "~/types/firestoreCollections";
import {ref, uploadBytes} from "@firebase/storage";
import {storage} from "~/firebase";
import {v4 as uuidv4} from "uuid";
import {AuthContext} from "~/providers/authContext";
import {LoadingScreen} from "~/components/LoadingScreen";
import moment from "moment";
import PlacesAutocomplete, {geocodeByPlaceId} from 'react-places-autocomplete';
import randomColor from "randomcolor";
import classNames from 'classnames';

const fileTypes = ["JPEG", "PNG", "GIF", "JPG"];

interface Props {
  closeModal: () => void;
}

const CreatePostModal: React.FC<Props> = ({ closeModal }) => {
  const {firestoreUser} = useContext(AuthContext);
  const [tickIsChecked, setTickIsChecked] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('yyyy-MM-DD'));
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isPlaceEmpty, setIsPlaceEmpty] = useState(true);

  const handleChange = (file: File) => {
    setFile(file);
  };

  useEffect(() => {
    if (location.length === 0) {
      setIsPlaceEmpty(true);
    } else {
      setIsPlaceEmpty(false);
    }
  }, [location]);

  const handleOnSave = useCallback(async () => {
    console.log(location);
    if (location.length === 0) {
      setIsPlaceEmpty(true);
    } else {
      try {
      if (selectedLocation && file) {
        const geocode = await geocodeByPlaceId(selectedLocation);

        setIsLoading(true);
        const storageRef = ref(storage, `trips/${firestoreUser?.id}/${location + uuidv4()}`);
        const uploadResult = await uploadBytes(storageRef, file);

        console.log("save is working");

        await addDoc(tripsCollection, {
          userId: firestoreUser?.id,
          imageUrl: uploadResult.ref.fullPath,
          rate: rating,
          when: selectedDate,
          public: tickIsChecked,
          location: {
            name: location,
            longitude: geocode[0].geometry.location.lng(),
            latitude: geocode[0].geometry.location.lat(),
            color: randomColor(),
          },
          text,
        });
      }
    } catch (err) {
      console.log('[ERROR saving the trip] => ', err);
    } finally {
      setIsLoading(false);
      closeModal();
    }
  }
  }, [firestoreUser, rating, file, selectedDate, tickIsChecked, selectedLocation]);

  const onSelectPlace = useCallback((address: string, placeID: string) => {
    setLocation(address);
    setSelectedLocation(placeID);
    console.log('address: ', address, 'placeId: ', placeID);
  }, []);

  return (
    <div className={styles.outer_container}>
      <form>
        <div className={styles.topContainer}>
          <p>Where’d you go?</p>

          <PlacesAutocomplete
            
            value={location}
            onChange={(value) => setLocation(value)}
            onSelect={onSelectPlace}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) =>  {
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
          {/* {isPlaceEmpty && <p className={styles.empty}>The input has not to be empty</p>} */}
          {/* {autocomplete?.map(item => <p>{item.description}</p>)} */}
          <p>When?</p>
            <input value={selectedDate} onChange={e => setSelectedDate(e.target.value)} type="date" className={styles.input} />
        </div>
        
        <div>
          <textarea
            className={`${styles.input} ${styles.textArea}`}
            placeholder={'Description'}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        <div className={styles.startContainer}>
          <p>Public</p>
          <Checkbox
            checked={tickIsChecked}
            icon={<img src={Tick} style={{ width: 24 }} alt="" />}
            onChange={(value: boolean) => {
              setTickIsChecked(value);
            }}
            borderColor={tickIsChecked ? "#55BEF5" : "#F6F6F6"}
            borderRadius={0}
            size={24}
          />
        </div>
        <div className={styles.startContainer}>
          <p>Rating</p>
          <Rating setSelectedStars={setRating} selectedStars={rating} />
        </div>
        <div className={styles.startContainer}>
          <p>Image and Video </p>
          <FileUploader
            multiple={false}
            handleChange={handleChange}
            name="file"
            types={fileTypes}
            classes={`${styles.uploadOuterContainer}`}
            hoverTitle={' '}
            onDraggingStateChange={(state: boolean) => setIsDragging(state)}
          >
            <div className={styles.uploadContainer}>
              <p className={styles.dragText}>Drag and drop image or</p>
              <button className={styles.buttonUpload}>Upload</button>
            </div>
          </FileUploader>
        </div>
        {file && <p>{file.name}</p>}
      </form>
      <p></p>
      <div className={styles.container}>
        <div className={styles.bottomRow}>
          <button 
            className={classNames(styles.button, {
              [styles.button_unActive]: isPlaceEmpty
            })}
            onClick={async () => {
              await handleOnSave();
            }}
          >
            Post
          </button>
          <button className={`${styles.button} ${styles['button-gray']}`} onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>

      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default CreatePostModal;
