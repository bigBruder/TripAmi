import { useContext, useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { onSnapshot, orderBy, query } from 'firebase/firestore';
import { AuthContext } from '~/providers/authContext';
import { IPlace } from '~/routes/AppRoutes/Posts/types';
import { tripsCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';

import searchButton from '@assets/icons/searchButtonHeader.svg';

import SearchTripsCard from '../SearchTripsCard';
import styles from './SearchInputComponent.module.css';

const SearchInputComponent = () => {
  const [searchValue, setSearchValue] = useState('');

  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allTrips, setAllTrips] = useState<ITravel[]>([]);
  const [allGeoTagsMap, setAllGeoTagsMap] = useState<IPlace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGeoTag, setCurrentGeoTag] = useState(null);
  const [filteredTripsLength, setFilteredTripsLength] = useState(0);
  const navigate = useNavigate();

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSearchValue('');
    document.body.style.overflow = 'auto';
  };

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [screenWidth]);

  useEffect(() => {
    if (searchValue.trim().length > 0 && !currentGeoTag) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchValue, searchBarRef.current, currentGeoTag]);

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllTrips = async () => {
      const qu = query(tripsCollection, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(qu, (querySnapshot) => {
        const fetchedTrips = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setAllTrips(fetchedTrips as ITravel[]);

        const allGeoTags = fetchedTrips.flatMap((trip) => trip.geoTags || []);

        const uniqueGeoTagsMap = new Map();
        allGeoTags.forEach((tag) => {
          uniqueGeoTagsMap.set(tag.placeID, tag);
        });

        const uniqueGeoTags = Array.from(uniqueGeoTagsMap.values());

        setAllGeoTagsMap(uniqueGeoTags as IPlace[]);
      });

      return () => unsubscribe();
    };
    fetchAllTrips();
  }, []);

  const handleInputFocus = () => {
    if (searchValue.trim().length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleSearchClick = (e) => {
    if (searchValue.trim().length === 0 && e.key === 'Enter') {
      if (!toast.isActive('search')) {
        toast.error('Please enter a search value or choose place', { toastId: 'search' });
      }
      return;
    }
    if (e.key === 'Enter') {
      navigate('/search', { state: { searchValue, allTrips } });
      setSearchValue('');
      setCurrentGeoTag(null);
      setIsModalOpen(false);
    }
  };

  const handleNavigate = () => {
    navigate('/search', { state: { searchValue, allTrips } });
    setSearchValue('');
    setCurrentGeoTag(null);
    setIsModalOpen(false);
  };

  const fetchFilteredTrips = async (newValue: string) => {
    const filteredTrips = allTrips.filter(
      (trip: ITravel) =>
        (trip.tripName.toLowerCase().includes(newValue.toLowerCase()) ||
          trip.text.toLowerCase().includes(newValue.toLowerCase()) ||
          trip.hashtags.some((hashtag) =>
            hashtag.toLowerCase().includes(newValue.toLowerCase())
          )) &&
        trip.budget.length !== 0 &&
        typeof trip.budget === 'string' &&
        trip.rate >= -1 &&
        trip.people !== undefined
    );

    setFilteredTripsLength(filteredTrips.length);
  };

  console.log(filteredTripsLength, 'filteredTripsLength');
  

  return screenWidth > 530 ? (
    <div className={styles.searchBarContainer} ref={searchBarRef}>
      <input
        type='text'
        placeholder='Search'
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          setCurrentGeoTag(null);
          fetchFilteredTrips(e.target.value);
        }}
        className={styles.searchInput}
        onFocus={() => handleInputFocus()}
        onKeyDown={(e) => handleSearchClick(e)}
      />
      <img src={searchButton} alt='search' className={styles.searchIcon} />
      {isDropdownOpen && (
        <div className={styles.searchResults}>
          {allGeoTagsMap.filter((geotag) =>
            geotag.address.toLowerCase().includes(searchValue.toLowerCase().trim())
          ).length ? (
            allGeoTagsMap
              .filter((geotag) =>
                geotag.address.toLowerCase().includes(searchValue.toLowerCase().trim())
              )
              .map((geotag) => (
                <SearchTripsCard
                  geotag={geotag}
                  handleSearchPush={() => {
                    setCurrentGeoTag(geotag);
                    navigate('/search', { state: { allTrips, currentGeoTag: geotag } });
                    setSearchValue('');
                  }}
                  key={geotag.placeID}
                />
              ))
          ) : (
            <>
              <div className={styles.noResults}>
                No{' '}
                {allGeoTagsMap.filter((geotag) =>
                  geotag.address.toLowerCase().includes(searchValue.toLowerCase())
                ).length || filteredTripsLength > 0
                  ? 'places'
                  : 'places and trips'}{' '}
                found
              </div>
              {filteredTripsLength > 0 && (
                <>
                  <div className={styles.noResults}>
                    But we have other {filteredTripsLength} results that match your search query
                  </div>
                  <div
                    className={`${styles.noResults} ${styles.seeResultsButton}`}
                    onClick={() => handleNavigate()}
                  >
                    See results
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  ) : (
    <>
      <img src={searchButton} alt='search' onClick={() => openModal()} />
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
      >
        <div className={styles.modalSearchContainer}>
          <input
            type='form'
            placeholder='Search'
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setCurrentGeoTag(null);
              fetchFilteredTrips(e.target.value);
            }}
            className={styles.modalSearchInput}
            autoFocus
            onKeyDown={(e) => handleSearchClick(e)}
          />
          {isDropdownOpen && (
            <div className={styles.searchResults}>
              {allGeoTagsMap.filter((geotag) =>
                geotag.address.toLowerCase().includes(searchValue.toLowerCase().trim())
              ).length ? (
                allGeoTagsMap
                  .filter((geotag) =>
                    geotag.address.toLowerCase().includes(searchValue.toLowerCase().trim())
                  )
                  .map((geotag) => (
                    <SearchTripsCard
                      geotag={geotag}
                      handleSearchPush={() => {
                        setCurrentGeoTag(geotag);
                        navigate('/search', { state: { allTrips, currentGeoTag: geotag } });
                        setSearchValue('');
                      }}
                      key={geotag.placeID}
                    />
                  ))
              ) : (
                <>
                  <div className={styles.noResults}>
                    No{' '}
                    {allGeoTagsMap.filter((geotag) =>
                      geotag.address.toLowerCase().includes(searchValue.toLowerCase())
                    ).length || filteredTripsLength > 0
                      ? 'places'
                      : 'places and trips'}{' '}
                    found
                  </div>
                  {filteredTripsLength > 0 && (
                    <>
                      <div className={styles.noResults}>
                        But we have other {filteredTripsLength} results that match your search query
                      </div>
                      <div
                        onClick={() => handleNavigate()}
                        className={`${styles.noResults} ${styles.seeResultsButton}`}
                      >
                        See results
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          <button onClick={closeModal} className={styles.closeButton}>
            Close
          </button>
        </div>
      </ReactModal>
    </>
  );
};

export default SearchInputComponent;
