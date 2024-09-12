import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import cn from 'classnames';
import { getDownloadURL, ref } from 'firebase/storage';
import { DateRangePicker } from 'rsuite';
import arrow from '~/assets/icons/arrowItinerary.svg';
import budget_icon from '~/assets/icons/budget-icon.svg';
import default_user from '~/assets/icons/defaultUserIcon.svg';
import plus from '~/assets/icons/plus.svg';
import Footer from '~/components/Footer';
import HeaderNew from '~/components/HeaderNew';
import Rating from '~/components/Rating';
import TravelCard from '~/components/TravelCard/TravelCard';
import { storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { ITravel } from '~/types/travel';

import { IPlace } from '../Posts/types';
import styles from './SearchTrips.module.css';
import no_trips_search from '/no_trips_search.svg';

const filterTrips = (
  allTrips: ITravel[],
  startDate: string,
  endDate: string,
  rating: number,
  minValue: string,
  maxValue: string,
  statusTrip: string,
  travelersCount: string,
  searchValue: string,
  currentGeoTag: IPlace
) => {
  const minBudget = minValue === '' ? 0 : parseFloat(minValue);
  const maxBudget = maxValue.toString() === '5000' ? Infinity : parseFloat(maxValue);

  return allTrips.filter((trip: ITravel) => {
    let matchesSearchOrGeo = true;

    if (searchValue) {
      matchesSearchOrGeo = false;
      matchesSearchOrGeo =
        trip.tripName.toLowerCase().includes(searchValue.toLowerCase()) ||
        trip.text.toLowerCase().includes(searchValue.toLowerCase());
    }

    if (currentGeoTag) {
      matchesSearchOrGeo = false;
      const places = trip.geoTags.map((geoTag) => geoTag.placeID);
      matchesSearchOrGeo = places.includes(currentGeoTag.placeID);
    }

    const matchesDate =
      (startDate === '' || new Date(trip.startDate) >= new Date(startDate)) &&
      (endDate === '' || new Date(trip.endDate) <= new Date(endDate));

    const matchesRating = rating === -1 || trip.rate >= rating;

    let matchesBudget = false;
    if (typeof trip.budget === 'string') {
      const tripBudget = parseFloat(trip.budget.replace(/,/g, ''));
      matchesBudget = tripBudget >= minBudget && tripBudget <= maxBudget;
    }

    const matchesStatus = statusTrip === '' || trip.stage === statusTrip;

    const matchesTravelers = travelersCount === '' || trip.people === travelersCount;

    return (
      matchesRating &&
      matchesDate &&
      matchesBudget &&
      matchesStatus &&
      matchesTravelers &&
      matchesSearchOrGeo
    );
  });
};

const SearchTrips = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rating, setRating] = useState(-1);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('5000');
  const maxLimit = 5000;
  const [statusTrip, setStatusTrip] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 3;
  const statuses = ['Current', 'Finished'];
  const [travelersCount, setTravelersCount] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const travelersMap = ['Solo trip', '2-5', '5-8', '8+'];
  const { firestoreUser } = useContext(AuthContext);

  const [avatar, setAvatar] = useState(default_user);
  const [hideOptions, setHideOptions] = useState(false);
  const [showHideOptions, setShowHideOptions] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState<ITravel[]>([]);

  const location = useLocation();
  const { allTrips, currentGeoTag, searchValue } = location.state;

  useEffect(() => {
    const newFilteredTrips = filterTrips(
      allTrips,
      startDate,
      endDate,
      rating,
      minValue,
      maxValue,
      statusTrip,
      travelersCount,
      searchValue,
      currentGeoTag
    );
    setFilteredTrips(newFilteredTrips);
    setCurrentPage(1);
  }, [
    allTrips,
    startDate,
    endDate,
    rating,
    minValue,
    maxValue,
    statusTrip,
    travelersCount,
    currentGeoTag,
    searchValue,
  ]);

  useEffect(() => {
    if (firestoreUser?.avatarUrl) {
      (async () => {
        const avatarLink = await getDownloadURL(ref(storage, firestoreUser?.avatarUrl || ''));
        setAvatar(avatarLink);
      })();
    }
  }, [firestoreUser?.avatarUrl]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSearch(false);
      } else {
        setIsSearch(true);
      }

      if (window.innerWidth < 1059) {
        setShowHideOptions(true);
        setHideOptions(true);
      } else {
        setShowHideOptions(false);
        setHideOptions(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    let startDate = dates[0] as Date;
    let endDate = dates[1] as Date;
    const currentDate = new Date();

    if (currentDate < startDate || currentDate < endDate) {
      toast('Please select a valid date');
      return;
    }
    const startDateString = formatDate(startDate);
    const endDateString = formatDate(endDate);

    setStartDate(startDateString);
    setEndDate(endDateString);
  };

  const parseDate = (dateString: string) => {
    const [month, day, year] = dateString.split('/');
    return new Date(+year, +month - 1, +day);
  };

  const handleMinChange = (e) => {
    setMinValue(e.target.value);
  };

  const handleMaxChange = (e) => {
    setMaxValue(e.target.value);
  };

  const validateMinValue = () => {
    if (Number(minValue) >= 0 && Number(minValue) < Number(maxValue)) {
      setMinValue(minValue);
    } else {
      setMinValue('');
    }
  };

  const validateMaxValue = () => {
    if (Number(maxValue) > Number(minValue) && Number(maxValue) <= maxLimit) {
      setMaxValue(maxValue);
    } else {
      setMaxValue(maxLimit);
    }
  };

  const handleMinSliderChange = (e) => {
    const value = Math.min(
      Number(e.target.value),
      maxValue === '' ? maxLimit : Number(maxValue) - 1
    );
    setMinValue(value);
  };

  const handleMaxSliderChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue === '' ? 0 : Number(minValue) + 1);
    setMaxValue(Math.min(value, maxLimit));
  };

  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);

  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push('...');
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers.map((number, index) => {
      if (number === '...') {
        return (
          <span key={index} className={styles.ellipsis}>
            ...
          </span>
        );
      }
      return (
        <button
          key={index}
          onClick={() => paginate(number)}
          className={currentPage === number ? styles.active : ''}
        >
          {number}
        </button>
      );
    });
  };

  const toggleOptions = () => {
    setHideOptions(!hideOptions);
  };

  const handleSetStatusTrip = (status: string) => {
    if (statusTrip === status) {
      setStatusTrip('');
    } else {
      setStatusTrip(status);
    }
  };

  const handleSetCountTravelers = (count: string) => {
    if (travelersCount === count) {
      setTravelersCount('');
    } else {
      setTravelersCount(count);
    }
  };

  const handleRangeReset = () => {
    setMinValue('');
    setMaxValue('5000');
  };

  const handleResetAllFilters = () => {
    setStartDate('');
    setEndDate('');
    setRating(-1);
    setMinValue('');
    setMaxValue('5000');
    setStatusTrip('');
    setTravelersCount('');
  };

  return (
    <div className={styles.mainContainerFull}>
      <div className={styles.main}>
        <HeaderNew avatar={avatar} />
        <div className={styles.mainContainer}>
          <div className={styles.filtersContainer}>
            <h3 className={styles.filterTitle}>
              {searchValue
                ? `${searchValue}:`
                : currentGeoTag
                  ? `${currentGeoTag.address.split(',')[0]}:`
                  : ''}{' '}
              {filteredTrips.length} results found
            </h3>
            <div className={styles.filtersTitleToggle}>
              <p>Filters</p>
              {showHideOptions && (
                <img
                  src={arrow}
                  alt='arrow'
                  onClick={toggleOptions}
                  className={styles.buttonToggle}
                  style={{
                    transform: hideOptions ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              )}
            </div>
            {!hideOptions && (
              <div className={styles.filterOptions}>
                <div className={styles.dates}>
                  <p className={styles.titlesFilter}>Dates:</p>
                  <DateRangePicker
                    editable={false}
                    key={`${startDate}-${endDate}`}
                    value={[parseDate(startDate), parseDate(endDate)]}
                    onChange={handleDateChange}
                    size='sm'
                    appearance='subtle'
                    placeholder='Chose dates'
                    showOneCalendar
                    style={{
                      borderRadius: '12px',
                      textAlign: 'right',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    format='MM-dd-yyyy'
                  />
                </div>
                <div className={styles.rating}>
                  <p className={styles.titlesFilter}>Rating:</p>
                  <Rating setSelectedStars={setRating} selectedStars={rating} />
                </div>
                <div className={styles.price}>
                  <p className={styles.titlesFilter}>Budget:</p>
                  <div className={styles.inputsContainer}>
                    <img className={styles.budgetIcon} src={budget_icon} alt='budget_icon' />
                    <div className={styles.inputGroup}>
                      <input
                        id='minInput'
                        type='number'
                        value={minValue}
                        onChange={handleMinChange}
                        onBlur={validateMinValue}
                        placeholder='0'
                        min='0'
                        max={maxLimit}
                      />
                    </div>
                    <div>-</div>
                    <div className={styles.inputGroup}>
                      <input
                        id='maxInput'
                        type='number'
                        value={maxValue}
                        onChange={handleMaxChange}
                        onBlur={validateMaxValue}
                        placeholder='5000'
                        min='0'
                        max={maxLimit}
                      />
                    </div>
                    <img
                      src={plus}
                      alt='plus'
                      className={styles.deleteRange}
                      onClick={() => handleRangeReset()}
                    />
                  </div>
                </div>
                <div className={styles.rangeContainer}>
                  <div className={styles.sliderTrack}></div>
                  <div
                    className={styles.rangeSelected}
                    style={{
                      left: `${(+minValue / maxLimit) * 100}%`,
                      right: `${100 - (+maxValue / maxLimit) * 100}%`,
                    }}
                  ></div>
                  <input
                    type='range'
                    min='0'
                    max={maxLimit}
                    value={minValue || 0}
                    onChange={handleMinSliderChange}
                    className={`${styles.rangeSlider} ${styles.rangeMin}`}
                  />
                  <input
                    type='range'
                    min='0'
                    max={maxLimit}
                    value={maxValue || maxLimit}
                    onChange={handleMaxSliderChange}
                    className={`${styles.rangeSlider} ${styles.rangeMax}`}
                  />
                </div>

                <div className={styles.statusContainer}>
                  <p className={styles.titlesFilter}>Status:</p>
                  <div className={styles.statuses}>
                    {statuses.map((status) => (
                      <div
                        key={status}
                        onClick={() => handleSetStatusTrip(status)}
                        className={cn([styles.status], {
                          [styles.isStatusActive]: statusTrip === status,
                        })}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.travelersContainer}>
                  <p className={styles.titlesFilter}>Travelers:</p>
                  <div className={styles.statuses}>
                    {travelersMap.map((status) => (
                      <div
                        key={status}
                        onClick={() => handleSetCountTravelers(status)}
                        className={cn([styles.status], {
                          [styles.isStatusActive]: travelersCount === status,
                        })}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.resetButton} onClick={() => handleResetAllFilters()}>
                  Reset filters
                </div>
              </div>
            )}
          </div>
          <div className={styles.resultsContainer}>
            {filteredTrips.length === 0 ? (
              <>
                <h3 className={styles.filterTitle}>No Related user&apos;s trips</h3>
                <img src={no_trips_search} alt='no_trips_search' className={styles.noTripsImage} />
              </>
            ) : (
              <>
                <h3 className={styles.filterTitle}>Related user&apos;s trips</h3>
                <div className={styles.tripsContainer}>
                  {currentTrips.map((trip: ITravel) => (
                    <TravelCard travel={trip} isSearch={isSearch} key={trip.id} />
                  ))}
                </div>
                <div className={styles.pagination}>{renderPagination()}</div>
              </>
            )}
          </div>
          {filteredTrips.length === 0 && (
            <div className={styles.resultsContainer}>
              <h3 className={styles.filterTitle}>Trips you may like</h3>
              <div className={styles.tripsContainer}>
                {allTrips
                  .sort((item1: ITravel, item2: ITravel) => {
                    console.log(item1.createdAt, item2.createdAt);
                    return (
                      new Date(item2.startDate).getTime() - new Date(item1.startDate).getTime()
                    );
                  })
                  .slice(0, 5)
                  .map((trip: ITravel) => (
                    <TravelCard travel={trip} isSearch={isSearch} key={trip.id} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
};

export default SearchTrips;
