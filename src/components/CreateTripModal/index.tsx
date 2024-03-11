import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
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
import {toast, ToastContainer} from "react-toastify";
import Plus from '~/assets/icons/plus.svg';
import ReactPlayer from "react-player";

const fileTypes = ["JPEG", "PNG", "JPG", "MP4"];

interface Props {
  closeModal: () => void;
  isEdit?: boolean;
  data?: {
    isPublic: boolean;
    rating: number;
    locationName: string;
    description: string;
    geoTags: {address: string, placeID: string}[];
    when: string;
    imageUrls: {url: string, type: string}[];
  };
}

const CreatePostModal: React.FC<Props> = ({ closeModal, isEdit, data }) => {
  const {firestoreUser, updateFirestoreUser} = useContext(AuthContext);
  const [tickIsChecked, setTickIsChecked] = useState(data?.isPublic || false);
  const [file, setFile] = useState<File[]>([]);
  const [rating, setRating] = useState(data?.rating || 0);
  const [location, setLocation] = useState(data?.locationName || null);
  const [selectedDate, setSelectedDate] = useState<string>(data?.when || moment().format('yyyy-MM-D'));
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState(data?.description || '');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(data?.locationName || null);
  const [isMaxError, setIsMaxError] = useState(false);
  const [geoTags, setGeoTags] = useState('');
  const [selectedGeoTags, setSelectedGeoTags] = useState<{address: string, placeID: string}[]>(data?.geoTags || []);
  const [isAddingPlace, setIsAddingPlace] = useState(false); 

  useEffect(() => {
    if (isMaxError) {
      notify('The maximum number of media is 5');

      setIsMaxError(false);
    }
  }, [isMaxError]);

  const notify = (textValue: string) => toast.error(textValue);

  const handleChange = (fileList: FileList) => {
    setFile(prevState => {
      if (prevState && Object.values(fileList).length + prevState?.length > 5 || Object.values(fileList).length > 5) {
        setIsMaxError(true);
        return prevState;
      }
      if (prevState) {
        return [...prevState, ...Object.values(fileList)];
      } else {
        return Object.values(fileList);
      }
    });
  };

  const handleOnSave = useCallback(async () => {
    try {
      if (selectedLocation && file) {
        const geocode = await geocodeByPlaceId(selectedLocation);

        setIsLoading(true);

        const uploadedImages: {url: string, type: string}[] = [];

        for (let i = 0; i < file.length; i++) {
          const storageRef = ref(storage, `trips/${firestoreUser?.id}/${location + uuidv4()}`);
          const uploadResult = await uploadBytes(storageRef, file[i]);
          uploadedImages.push({url: uploadResult.ref.fullPath, type: file[i].type});
        }

        await addDoc(tripsCollection, {
          userId: firestoreUser?.id,
          imageUrl: uploadedImages,
          rate: rating,
          when: selectedDate,
          public: tickIsChecked,
          geoTags: selectedGeoTags,
          location: {
            name: location,
            longitude: geocode[0].geometry.location.lng(),
            latitude: geocode[0].geometry.location.lat(),
            color: randomColor(),
          },
          text,
        });

        updateFirestoreUser({
          tripCount: firestoreUser?.tripCount ? firestoreUser?.tripCount + 1 : 1,
        });

        closeModal();
      } else {
        notify('Upload at least one media and insert a location');
      }
    } catch (err) {
      console.log('[ERROR saving the trip] => ', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, file, firestoreUser?.id, firestoreUser?.tripCount, rating, selectedDate, tickIsChecked, selectedGeoTags, location, text, updateFirestoreUser]);

  const onSelectPlace = useCallback((address: string, placeID: string) => {
    setLocation(address);
    setSelectedLocation(placeID);
  }, []);

  const onSelectGeoTag = useCallback((address: string, placeID: string) => {
    setSelectedGeoTags(prevState => [...prevState, {address, placeID}]);
    setGeoTags('');
    setIsAddingPlace(false);
  }, []);

  const handleRemoveGeoTag = useCallback((placeId: string) => {
    setSelectedGeoTags(prevState => prevState.filter(item => item.placeID !== placeId));
  }, []);

  const Slider = useMemo(() => {
    return (
      <>
      {data?.imageUrls?.length ? (
        <>
          {data?.imageUrls?.map((item) => {
            return (
              <React.Fragment key={item.url}>
                {item.type.includes('image') ? (
                  <img src={item.url} alt={'trip image'} className={styles.image} />
                ) : (
                  <div>
                    <ReactPlayer
                      playing
                      stopOnUnmount={false}
                      loop
                      url={item.url}
                      width='100%'
                      height='100%'
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </>
      ) : (
        <>
          {file?.map((item) => {
            return (
              <React.Fragment key={URL.createObjectURL(item)}>
                {item.type.includes('image') ? (
                  <img src={URL.createObjectURL(item)} alt={'trip image'} className={styles.image} />
                ) : (
                  <div>
                    <ReactPlayer
                      playing
                      stopOnUnmount={false}
                      loop
                      url={URL.createObjectURL(item)}
                      width='100%'
                      height='100%'
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </>
      )}
    </>
    );
  }, [file])

  const handleOpenAddGeocode = (e: React.MouseEventHandler<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      setIsAddingPlace(prevState => !prevState);
    }
  }

  return (
    <div className={styles.outer_container}>
      <form>
        <div className={styles.topContainer}>
          {/* <p>Where’d you go?</p> */}
          <p>Country:</p>
          <PlacesAutocomplete
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

            <div className={styles.geocodes_top}>
              {/* <p>Tag Your Favorite Places on this Trip: </p> */}
              <p>Tag Your Places: </p>
              <button 
                className={styles.button}
                onClick={handleOpenAddGeocode}
              >Add Place</button>
            </div>
          {
            isAddingPlace && (
          <PlacesAutocomplete
            value={geoTags}
            onChange={(value) => setGeoTags(value)}
            onSelect={onSelectGeoTag}
          >
            {({getInputProps, suggestions, getSuggestionItemProps, loading}) => {
              return (
                <div className={suggestions.length ? styles.inputContainer : undefined}>
                  <input
                    id={'213'}
                    {...getInputProps({
                      placeholder: 'Museum of Dreamers, Viale Angelico, Rome, Metropolitan City of Rome Capital, Italy',
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
            )
          }
          
          <div className={styles.selectedTagsContainer}>
            {selectedGeoTags.length ? (
              <>
                {selectedGeoTags.map(geoTag => (
                  <div className={styles.geoTagContainer} key={geoTag.placeID}>
                    <p>{geoTag.address}</p>
                    <img src={Plus} className={styles.crossIcon} onClick={() => handleRemoveGeoTag(geoTag.placeID)} />
                  </div>
                ))}
              </>
            ) : null}
          </div>
         

          <p>When?</p>
          <input value={selectedDate} onChange={e => setSelectedDate(e.target.value)} type="date"
                 className={styles.input}/>
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
          
          <FileUploader
            multiple={true}
            handleChange={handleChange}
            name="file"
            types={fileTypes}
            hoverTitle={' '}
          >
            <div className={styles.uploadContainer}>
              {/* <p>Image and Video </p> */}
              <p className={styles.dragText}>Drag and drop image/video or click on </p>
              <button className={styles.buttonUpload}>Upload</button>
            </div>
          </FileUploader>
        </div>

        <div className={styles.startWrapper}>
          <div className={styles.startContainer}>
            <p>Public:</p>
            <Checkbox
              checked={tickIsChecked}
              icon={<img src={Tick} style={{width: 24}} alt=""/>}
              onChange={(value: boolean) => {
                setTickIsChecked(value);
              }}
              borderColor="#55BEF5"
              borderRadius={0}
              size={24}
            />
          </div>
          <div className={styles.startContainer}>
            <p>Rating:</p>
            <Rating setSelectedStars={setRating} selectedStars={rating}/>
          </div>
          
        </div>

        {Slider}
      </form>
      <div className={styles.container}>
        <div className={styles.bottomRow}>
          <button className={styles.button} onClick={async () => {
            await handleOnSave();
          }}>
            {isEdit ? 'Save' : 'Post'}
          </button>
          <button className={`${styles.button} ${styles['button-gray']}`} onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>

      <ToastContainer closeOnClick autoClose={3000} limit={1} pauseOnHover={false} />
      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default CreatePostModal;
