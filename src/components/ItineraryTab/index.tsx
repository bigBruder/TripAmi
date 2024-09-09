import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { geocodeByPlaceId } from 'react-places-autocomplete';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from 'axios';
import cn from 'classnames';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '~/firebase';
import { AuthContext } from '~/providers/authContext';

import addedPlaceButtonGeo from '@assets/icons/addedPlaceButtonGeo.svg';
import arrow from '@assets/icons/arrowItinerary.svg';
import dotsItinerary from '@assets/icons/dotsItinerary.svg';
import geo_filled from '@assets/icons/geo_filled.svg';
import place_icon from '@assets/icons/place_icon.svg';

import AddFolderModal from '../AddFolderModal';
import DeleteFolderModal from '../DeleteFolderModal';
import PlaceAutocomplete from '../PlaceAutocomplete/PlaceAutocomplete';
import styles from './ItineraryTab.module.css';
import addFolder from '/addFolder.svg';
import empty_itinerary from '/empty_itinerary.svg';

enum WindowWidth {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
}

const ItineraryTab = () => {
  const { firestoreUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [folder, setFolder] = useState(
    firestoreUser?.itinerary?.length
      ? firestoreUser.itinerary[0]
      : { places: [], name: 'Add itinerary first', createdAt: new Date() }
  );
  const [chosenPlaces, setChosenPlaces] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isDotsOpen, setIsDotsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(WindowWidth.Large);
  const [loadItinerary, setLoadItinerary] = useState(false);
  const [geoTags, setGeoTags] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownDotsRef = useRef(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      const itineraries = await getDoc(doc(db, 'users', firestoreUser?.id)).then(
        (data) => data.data()?.itinerary
      );
      if (itineraries.length) {
        setFolder(itineraries[0]);
      } else {
        setTimeout(() => {
          setFolder({ places: [], name: 'Add itinerary first', createdAt: new Date() });
        }, 100);
      }
    };
    fetchItinerary();
  }, [firestoreUser?.itinerary.length]);

  useEffect(() => {
    if (!firestoreUser?.itinerary) {
      setLoadItinerary(true);
    } else {
      setLoadItinerary(false);
    }
  }, [firestoreUser, firestoreUser?.itinerary?.length, firestoreUser?.itinerary]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setWindowWidth(WindowWidth.Small);
      } else if (window.innerWidth <= 940) {
        setWindowWidth(WindowWidth.Medium);
      } else {
        setWindowWidth(WindowWidth.Large);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [window.innerWidth]);

  useEffect(() => {
    const itineraryHandle = async () => {
      if (!firestoreUser?.itinerary) {
        try {
          await updateDoc(doc(db, 'users', firestoreUser?.id), {
            itinerary: [],
          });
        } catch (e) {
          console.error(e);
          console.log('Error updating document: ', e);
        }
      }
    };
    itineraryHandle();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDocumentClick = (event: MouseEvent) => {
    if (dropdownDotsRef.current && !dropdownDotsRef.current.contains(event.target)) {
      setIsDotsOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsDotsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value);
  };

  const filteredPlacesFunc = () => {
    if (!folder) return { places: [] };
    if (!searchTitle) return folder;

    const placesWithName = folder.places.filter((place) => place.address);

    return {
      ...folder,
      places: placesWithName.filter((place) =>
        place.address.split(',')[0].toLowerCase().includes(searchTitle.toLowerCase())
      ),
    };
  };

  const filteredPlaces = filteredPlacesFunc();

  const checkForHave = (place) => {
    return chosenPlaces.some((chosenPlace) => chosenPlace.placeID === place.placeID);
  };

  const handlePlaceClick = (geoTag) => {
    if (checkForHave(geoTag)) {
      setChosenPlaces(chosenPlaces.filter((place) => place.placeID !== geoTag.placeID));
    } else {
      setChosenPlaces([...chosenPlaces, geoTag]);
    }
  };

  const handleDeletePlaces = async () => {
    const chosenPlaceIds = chosenPlaces.map((place) => place.placeID);
    const newPlaces = folder.places.filter((place) => !chosenPlaceIds.includes(place.placeID));

    const newItinerary = firestoreUser?.itinerary.map((item) => {
      if (item.id === folder.id) {
        return { ...item, places: newPlaces };
      }
      return item;
    });

    try {
      setChosenPlaces([]);
      await updateDoc(doc(db, 'users', firestoreUser?.id), {
        itinerary: newItinerary,
      });
      setFolder({ ...folder, places: newPlaces });
      console.log('Document successfully updated');
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  useEffect(() => {
    if (chosenPlaces?.length === filteredPlaces.places?.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [chosenPlaces, filteredPlaces.places]);

  const handleSelectAllPlaces = () => {
    if (chosenPlaces?.length === filteredPlaces.places?.length) {
      setChosenPlaces([]);
      setIsAllSelected(false);
    } else {
      setIsAllSelected(true);
      setChosenPlaces(filteredPlaces.places);
    }
  };

  const handleOnEdit = () => {
    setIsEditing(true);
    setEditedText(folder?.name);
  };

  const handleSaveEditName = async () => {
    setIsEditing(false);
    const newItinerary = firestoreUser?.itinerary.map((item) => {
      if (item.id === folder.id) {
        return { ...item, name: editedText };
      }
      return item;
    });

    try {
      await updateDoc(doc(db, 'users', firestoreUser?.id), {
        itinerary: newItinerary,
      });
      setFolder({ ...folder, name: editedText });
      setIsEditing(false);
      if (folder?.name !== editedText && !toast.isActive('successEdit')) {
        toast.success('Folder name changed successfully', { toastId: 'successEdit' });
      }
      console.log('Document successfully updated');
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  const handleDeleteFolder = async () => {
    setIsDeleteFolderOpen(false);
    const newItinerary = firestoreUser?.itinerary.filter((item) => item.id !== folder.id);

    try {
      await updateDoc(doc(db, 'users', firestoreUser?.id), {
        itinerary: newItinerary,
      });
      const itineraries = await getDoc(doc(db, 'users', firestoreUser?.id)).then(
        (data) => data.data()?.itinerary
      );
      if (!itineraries.length) {
        setFolder({ places: [], name: 'Add itinerary first', createdAt: new Date() });
      } else {
        setFolder(itineraries[itineraries.length - 1]);
      }
      if (!toast.isActive('successDelete')) {
        toast.success('Folder deleted successfully', { toastId: 'successDelete' });
      }
      console.log('Document successfully updated');
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  const handleMakeTrip = () => {
    navigate('/trip/create', { state: { data: { geoTags: chosenPlaces } } });
    window.scrollTo(0, 0);
  };

  const onSelectGeoTag = useCallback(
    (address: string, placeID: string) => {
      (async () => {
        if (!folder.places.map((tag) => tag.address).includes(address)) {
          const coordinates = await geocodeByPlaceId(placeID);
          const photoRes = await axios.get(
            `https://us-central1-tripami-3e954.cloudfunctions.net/getPhoto?id=${placeID}`
          );
          const photo = await photoRes.data.photoUrl;

          const newItinerary = firestoreUser?.itinerary.map((item) => {
            if (item.id === folder.id) {
              return {
                ...item,
                places: [
                  ...item.places,
                  {
                    address,
                    placeID,
                    lat: coordinates[0].geometry.location.lat(),
                    lng: coordinates[0].geometry.location.lng(),
                    types: coordinates[0].types,
                    name: coordinates[0].formatted_address,
                    photo: photo,
                  },
                ],
              };
            }
            return item;
          });
          try {
            await updateDoc(doc(db, 'users', firestoreUser?.id), {
              itinerary: newItinerary,
            });
            setFolder({
              ...folder,
              places: [
                ...folder.places,
                {
                  address,
                  placeID,
                  lat: coordinates[0].geometry.location.lat(),
                  lng: coordinates[0].geometry.location.lng(),
                  types: coordinates[0].types,
                  name: coordinates[0].formatted_address,
                  photo: photo,
                },
              ],
            });
            console.log('Document successfully updated');
          } catch {
            console.error('Error updating document: ', e);
          }
          setGeoTags('');
        } else {
          toast('You have already added this tag');
        }
      })();
    },
    [folder, firestoreUser?.itinerary]
  );

  return (
    <div className={styles.container}>
      <div className={styles.functionsContainer}>
        <div className={styles.searchContainer}>
          <img src={place_icon} alt='place_icon' className={styles.iconPlace} />
          <input
            type='text'
            value={searchTitle}
            onChange={handleSearch}
            className={styles.inputSearch}
            placeholder='Enter a place name'
          />
        </div>
        <div className={styles.dropdownContainer} ref={dropdownRef}>
          <div className={styles.dropdownHeader} onClick={toggleDropdown}>
            <span className={styles.dropdownSelector}>
              Itinerary:{' '}
              <span className={styles.selectedOption}>
                <span className={styles.chosenItem}>{folder?.name}</span>
              </span>
            </span>
            <img src={arrow} className={isOpen ? styles.arrowUp : styles.arrowDown} />
          </div>
          {isOpen && (
            <div className={styles.dropdownList}>
              {firestoreUser?.itinerary?.length
                ? firestoreUser?.itinerary.map((item, index) => (
                  <div
                    key={index}
                    className={cn(styles.dropdownItem, {
                      [styles.chosenItem]: folder?.name === item?.name,
                    })}
                    onClick={() => {
                      setFolder(item);
                      setChosenPlaces([]);
                      setIsOpen(false);
                    }}
                  >
                    {item?.name || ''}
                  </div>
                ))
                : 'No itineraries'}
            </div>
          )}
        </div>
        <div className={styles.addFolder}>
          <img
            src={addFolder}
            alt='addFolder'
            className={styles.addFolderIcon}
            onClick={() => setIsAddFolderOpen(true)}
          />
        </div>
      </div>
      <div className={styles.placeAutocomplete}>
        <PlaceAutocomplete
          location={geoTags}
          setLocation={setGeoTags}
          onSelectPlace={onSelectGeoTag}
          placeholder='Ex. Beaches,Cities,Restaurants'
          selectedGeoTags={folder.places}
        />
      </div>
      <div className={styles.folderInfo}>
        {folder?.name === 'Add itinerary first' &&
          !firestoreUser?.itinerary.length &&
          !loadItinerary ? (
          <div className={styles.emptyItineraryContainer}>
            <span className={styles.emptyItineraryTitle}>
              Start building your itinerary. Create a folder and add the desired destinations there
            </span>
            <img
              src={empty_itinerary}
              alt='empty_itinerary'
              className={styles.emptyItineraryImage}
            />
          </div>
        ) : (
          <>
            <span className={styles.folderDate}>
              {folder?.createdAt
                ? (folder.createdAt.toDate
                  ? folder.createdAt.toDate()
                  : folder.createdAt
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
                : new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
            </span>
            {isEditing ? (
              <>
                <div className={styles.editingFolder}>
                  <input
                    type='text'
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className={styles.editingFolderInput}
                    autoFocus
                  />
                  {windowWidth === WindowWidth.Large && (
                    <>
                      <button className={styles.saveEditButton} onClick={handleSaveEditName}>
                        Save
                      </button>
                      <button
                        className={styles.cancelEditButton}
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.folderName}>{folder?.name}</div>
            )}
            <div className={styles.folderFuncContainer}>
              <img
                src={dotsItinerary}
                alt='dotsItinerary'
                onClick={() => setIsDotsOpen(!isDotsOpen)}
                className={styles.dotsFunc}
              />
              {isDotsOpen && (
                <div className={styles.dropdownDots} ref={dropdownDotsRef}>
                  <div
                    className={styles.dropdownItemDots}
                    onClick={() => {
                      handleOnEdit();
                      setIsDotsOpen(false);
                    }}
                  >
                    Rename folder
                  </div>
                  <div
                    className={cn(styles.deleteDots, styles.dropdownItemDots)}
                    onClick={() => {
                      setIsDeleteFolderOpen(true);
                      setIsDotsOpen(false);
                    }}
                  >
                    Delete folder
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {isEditing && windowWidth !== WindowWidth.Large && (
        <div className={styles.smallEditing}>
          <button className={styles.saveEditButton} onClick={handleSaveEditName}>
            Save
          </button>
          <button className={styles.cancelEditButton} onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      )}
      {!!filteredPlaces.places?.length && (
        <div className={styles.mainButtonsContainer}>
          <button
            className={styles.deleteSelectedButton}
            disabled={chosenPlaces?.length === 0}
            onClick={handleDeletePlaces}
          >
            <span className={styles.deleteSelectedButtonText}>
              Delete{' '}
              <span className={styles.deleteSelectedButtonCount}>{chosenPlaces?.length || 0}</span>
              {chosenPlaces?.length > 1 ? ' places' : ' place'}
            </span>
          </button>
          <button
            className={styles.makeTripButton}
            disabled={chosenPlaces?.length === 0}
            onClick={handleMakeTrip}
          >
            Make a Trip
          </button>
        </div>
      )}
      {!!filteredPlaces.places?.length && (
        <div className={styles.selectAllConttainer}>
          <span className={styles.selectAllTitle}>Select all</span>
          <div
            className={cn([styles.addPhotoButtonGeoSelect], {
              [styles.addedPhotoButtonGeo]: isAllSelected,
            })}
            onClick={() => handleSelectAllPlaces()}
          >
            <img
              src={addedPlaceButtonGeo}
              alt='addPhotoButtonGeo'
              className={cn([styles.addPlaceButtonGeo], {
                [styles.addedPlaceButtonGeo]: isAllSelected,
              })}
            />
          </div>
        </div>
      )}
      <div className={styles.itineraryContent}>
        {filteredPlaces.places?.length ? (
          filteredPlaces.places.map((geoTag) => (
            <div className={styles.geoTagContainerWithImage} key={geoTag.placeID}>
              <div className={styles.geoPhotoContainer}>
                <img src={geoTag.photo} alt='geoTagPhoto' className={styles.geoPhoto} />
                <div
                  className={cn([styles.addPhotoButtonGeo], {
                    [styles.addedPhotoButtonGeo]: checkForHave(geoTag),
                  })}
                  onClick={() => handlePlaceClick(geoTag)}
                >
                  <img
                    src={addedPlaceButtonGeo}
                    alt='addPhotoButtonGeo'
                    className={cn([styles.addPlaceButtonGeo], {
                      [styles.addedPlaceButtonGeo]: checkForHave(geoTag),
                    })}
                  />
                </div>
              </div>
              <div
                className={cn(styles.geoTagContainer, styles.geoTagContainerImagePlus)}
                onClick={() => {
                  navigate('/place/' + geoTag.placeID);
                  window.scrollTo(0, 0);
                }}
              >
                <img src={geo_filled} alt='geotagFilled' className={styles.iconGeoFilled} />
                <p className={styles.geotagTitle}>{geoTag?.address?.split(',')[0]}</p>
              </div>
              <div
                className={cn(styles.geoTagContainer, styles.geoTagContainerImagePlus)}
                onClick={() => {
                  navigate('/place/' + geoTag.placeID);
                  window.scrollTo(0, 0);
                }}
              >
                <p className={styles.geotagTitleNav}>Reviews/ Advice</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noGeoTagContainer}>
            <p className={styles.noGeoTagText}>
              {folder?.name === 'Add itinerary first' ? '' : 'No geotags in this folder'}
            </p>
          </div>
        )}
      </div>
      {isAddFolderOpen && (
        <AddFolderModal setIsAddFolderOpen={setIsAddFolderOpen} setFolder={setFolder} />
      )}
      {isDeleteFolderOpen && (
        <DeleteFolderModal
          setIsDeleteFolderOpen={setIsDeleteFolderOpen}
          handleDeleteFolder={handleDeleteFolder}
        />
      )}
    </div>
  );
};

export default ItineraryTab;
