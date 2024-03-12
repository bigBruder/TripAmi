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
import {toast, ToastContainer} from "react-toastify";
import Plus from '~/assets/icons/plus.svg';
import ReactPlayer from "react-player";
import PlaceAutocomplete from '../PlaceAutocomplete/PlaceAutocomplete';

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
    when?: string;
    imageUrls: {url: string, type: string}[];
  };
}

const CreatePostModal: React.FC<Props> = ({ closeModal, isEdit, data }) => {
  const {firestoreUser, updateFirestoreUser} = useContext(AuthContext);
  const [tickIsChecked, setTickIsChecked] = useState(data?.isPublic || false);
  const [file, setFile] = useState<File[] >([]);
  const [rating, setRating] = useState(data?.rating || 0);
  const [location, setLocation] = useState(data?.locationName || null);
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState<string>(data?.when || moment().format('yyyy-MM-D'));
  const [endDate, setEndDate] = useState<string>(data?.when || moment().format('yyyy-MM-D'));
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState(data?.description || '');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(data?.locationName || null);
  const [isMaxError, setIsMaxError] = useState(false);
  const [geoTags, setGeoTags] = useState('');
  const [selectedGeoTags, setSelectedGeoTags] = useState<{address: string, placeID: string}[]>(data?.geoTags || []);
  const [selectedCities, setSelectedCities] = useState<{address: string, placeID: string}[]>(data?.geoTags || []);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [tripName, setTripName] = useState('');
  const [daysDescription, setDaysDescription] = useState<{date: string, description:string}[]>([]);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [imagesDescription, setImagesDescription] = useState<{name: string, value:string}[]>([]);

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

        const uploadedImages: {url: string, type: string, description: string}[] = [];

        for (let i = 0; i < file.length; i++) {
          const storageRef = ref(storage, `trips/${firestoreUser?.id}/${location + uuidv4()}`);
          const uploadResult = await uploadBytes(storageRef, file[i]);
          console.log(file[i].name);
          console.log(imagesDescription.map(image => image.name));
          
          uploadedImages.push({
            url: uploadResult.ref.fullPath, 
            type: file[i].type, 
            description: imagesDescription.find(image => image.name === file[i].name)?.value || ''
          });
        }

        await addDoc(tripsCollection, {
          userId: firestoreUser?.id,
          imageUrl: uploadedImages,
          rate: rating,
          startDate: startDate,
          endDate: endDate,
          public: tickIsChecked,
          geoTags: selectedGeoTags,
          cities: selectedCities,
          tripName: tripName,
          location: {
            name: location,
            longitude: geocode[0].geometry.location.lng(),
            latitude: geocode[0].geometry.location.lat(),
            color: randomColor(),
          },
          dayDescription: daysDescription,
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
  }, [selectedLocation, file, firestoreUser?.id, firestoreUser?.tripCount, rating, startDate, tickIsChecked, selectedGeoTags, location, text, updateFirestoreUser]);

  const onSelectPlace = useCallback((address: string, placeID: string) => {
    setLocation(address);
    setSelectedLocation(placeID);
  }, []);

  const onSelectGeoTag = useCallback((address: string, placeID: string) => {
    if(!selectedGeoTags.map(tag => tag.address).includes(address)) {
      setSelectedGeoTags(prevState => [...prevState, {address, placeID}]);
      setGeoTags('');
      setIsAddingPlace(false);
    } else {
      notify('You have already added this tag');
    }

    setIsAddingPlace(false);
  }, [selectedGeoTags]);

  const handleRemoveGeoTag = useCallback((placeId: string) => {
    setSelectedGeoTags(prevState => prevState.filter(item => item.placeID !== placeId));
  }, []);

  const handleRemovePhoto = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, photoName: string) => {
    event.preventDefault();

    setFile(prevState => prevState.filter(media => media.name !== photoName));
    setImagesDescription(prevState => prevState.filter(image => image.name !== photoName))
  }

  const handleChangeImageDescription = (event) => {
    event.preventDefault();

    const {name, value} = event.target;

    if(imagesDescription.find(image => image.name === name)) {
      setImagesDescription(prevState => prevState.map(obj => obj.name === name ? {...obj, value: value} : obj))
    } else {
      setImagesDescription(prevState => [...prevState, {name: name, value: value}])
    }
  }



  const handleOpenAddGeocode = (e: React.MouseEventHandler<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      setIsAddingPlace(prevState => !prevState);
    }
  }

  const handleAddDayDescription = (event:  React.MouseEventHandler<HTMLButtonElement>) => {
    event.preventDefault();

    setDaysDescription(prevState => [...prevState, {date: '', description: ''}]);
  }

  const handleRemoveDayDescription = (indexToRemove: number) => {
    setDaysDescription(prevDescriptions => prevDescriptions.filter((day, idx) => idx !== indexToRemove))
  }

  const handleDayDateDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>, indexToChange: number, type: string) => {
   setDaysDescription(prevState => prevState.map((prevDay, index) => {
    if (index === indexToChange) {
      return {...prevDay, [type]: event.target.value}
    } else {
      return prevDay;
    }
   }))
  }

  const handleRemoveCity = useCallback((placeId: string) => {
    setSelectedCities(prevState => prevState.filter(item => item.placeID !== placeId));
  }, []);

  const handleOpenAddCity = (event: React.MouseEventHandler<HTMLButtonElement>) => {
    event.preventDefault();
    setIsAddCityOpen(prevState => !prevState);
  }

  const onSelectCity = useCallback((address: string, placeID: string) => {
    console.log(selectedCities);
    if(!selectedCities.map(city => city.address.toString()).includes(address)) {
      setSelectedCities(prevState => [...prevState, {address, placeID}]);
      setCity('');
    } else {
      notify('You have already added this city')
    }
    
    setIsAddCityOpen(false);
    // setIsAddingPlace(false);
  }, [selectedCities]);

  return (
    <div className={styles.outer_container}>
      <form>
        <div className={styles.topContainer}>
          {/* <p>Where’d you go?</p> */}
          <p>Trip name:</p>
          <input 
            placeholder='Amazing trip' 
            className={styles.input} 
            onChange={e => setTripName(e.target.value)}
          />

          <p>Where’d you go?</p>
          <div  className={styles.autocomplete}>
            <PlaceAutocomplete 
            searchOptions={{ types: ['country'] }}
            location={location}
            setLocation={setLocation}
            onSelectPlace={onSelectPlace}
            />
          </div>
          

          <div className={styles.geocodes_top}>
              {/* <p>Tag Your Favorite Places on this Trip: </p> */}
              <p>Do you wanna add city? (You can add multiply cities)</p>
              <button 
                className={styles.button}
                onClick={handleOpenAddCity}
              >+</button>
            </div>

            {
              isAddCityOpen && (
                <div  className={styles.autocomplete}>
                  <PlaceAutocomplete 
                    searchOptions={{ types: ['locality'] }}
                    location={city}
                    setLocation={setCity}
                    onSelectPlace={onSelectCity}
                  />
                </div>
                
              )
            }
          

          <div className={styles.selectedTagsContainer}>
            {selectedCities.length ? (
              <>
                {selectedCities.map(selectedCity => (
                  <div className={styles.geoTagContainer} key={selectedCity.placeID}>
                    <p>{selectedCity.address.split(",")[0]}</p>
                    <img src={Plus} className={styles.crossIcon} onClick={() => handleRemoveCity(selectedCity.placeID)} />
                  </div>
                ))}
              </>
            ) : null}
          </div>

            <div className={styles.geocodes_top}>
              <p>Tag Your Places: </p>
              <button 
                className={styles.button}
                onClick={handleOpenAddGeocode}
              >+</button>
            </div>
          {
          isAddingPlace && (
          <div className={styles.autocomplete}>
            <PlacesAutocomplete
              searchOptions={{ types: ["establishment"] }}
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
                            key={suggestion.id}
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
          </div>
            )
          }
          
          <div className={styles.selectedTagsContainer}>
            {selectedGeoTags.length ? (
              <>
                {selectedGeoTags.map(geoTag => (
                  <div className={styles.geoTagContainer} key={geoTag.placeID}>
                    <p>{geoTag.address.split(',')[0]}</p>
                    <img src={Plus} className={styles.crossIcon} onClick={() => handleRemoveGeoTag(geoTag.placeID)} />
                  </div>
                ))}
              </>
            ) : null}
          </div>
         

        <div className={styles.datesContainer}>
          <div className={styles.dateContainer}>
            <p>Start Date:</p>
            <input 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              type="date"
              className={styles.dateInput}
            />
          </div>
         
          <div className={styles.dateContainer}>
            <p>End Date:</p>
            <input 
              id="end_date"
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              type="date"
              className={styles.dateInput}
              min={startDate}
              lang="fr-CA"
            />
          </div>
        </div>
          

        </div>

          <div>
              <textarea
                className={`${styles.input} ${styles.textArea}`}
                placeholder={'Description'}
                value={text}
                onChange={e => setText(e.target.value)}
              />
          </div>

        <div className={styles.dayDescriptionNav}>
          <p>Do you wanna description some day?</p>
          <button 
                className={styles.button}
                onClick={handleAddDayDescription}
          >
            Add day description
          </button>
        </div>

        {
          daysDescription && Array.from(Array(daysDescription.length).keys()).map((day, idx) => (
            <div className={styles.dayDescriptionContainer} key={day}>
            <input 
              value={daysDescription[idx].date} 
              onChange={e => handleDayDateDescriptionChange(e, idx, 'date')}
              type="date"
              className={styles.input}
            />
            <div className={styles.dayDescriptionContainer}>
                <textarea
                  className={`${styles.input} ${styles.textArea}`}
                  placeholder={'Description'}
                  value={daysDescription[idx].description} 
                  onChange={e => handleDayDateDescriptionChange(e, idx, 'description')}
                />
            </div>
            <img src={Plus} className={styles.crossIcon} onClick={() => {handleRemoveDayDescription(idx)}} />
          </div>
          ))
        }
                
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

        <div className={styles.imagesDescriptions}>
          {/* {Slider} */}

          {file?.map(item => {
              return (
                <div key={item.name} className={styles.uploadedImagesContainer}>
                  {item.type.includes('image') ? (
                      <div className={styles.imageContainer}>
                        <img src={URL.createObjectURL(item)} alt={'trip image'} className={styles.image} />
                        <input 
                          placeholder='Describe the photo'
                          value={imagesDescription.find(image => image.name === item.name)?.value || ''}
                          className={styles.input} 
                          onChange={handleChangeImageDescription}
                          name={item.name}
                        />
                        <button onClick={(e) => handleRemovePhoto(e, item.name)} className={styles.removePhotoButton}>X</button>
                      </div>
                  ) : (
                    <div className={styles.imageContainer}>
                      <ReactPlayer
                        playing
                        stopOnUnmount={false}
                        loop
                        url={URL.createObjectURL(item)}
                        width='100%'
                        height='100%'
                      />
                        <input 
                          placeholder='Describe the photo'
                          value={imagesDescription.find(image => image.name === item.name)?.value || ''}
                          className={styles.input} 
                          onChange={handleChangeImageDescription}
                          name={item.name}
                        />
                      <button onClick={(e) => handleRemovePhoto(e, item.name)} className={styles.removePhotoButton}>X</button>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
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
