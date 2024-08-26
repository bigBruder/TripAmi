import HeaderNew from '~/components/HeaderNew';
import styles from './SearchTrips.module.css';
import React, { useEffect, useState } from 'react';
import Footer from '~/components/Footer';
import { DateRangePicker } from 'rsuite';
import { toast } from 'react-toastify';
import Rating from '~/components/Rating';
import cn from 'classnames';

import budget_icon from '~/assets/icons/budget-icon.svg';
import { useLocation } from 'react-router-dom';
import TravelCard from '~/components/TravelCard/TravelCard';
import { ITravel } from '~/types/travel';

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

  const location = useLocation();
  const { allTrips, currentGeoTag, searchValue } = location.state;

  console.log('allTrips', allTrips);
  console.log('currentGeoTag', currentGeoTag);
  console.log('searchValue', searchValue);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSearch(false);
      } else {
        setIsSearch(true);
      }
    }
    handleResize();

    window.addEventListener('resize', () => {
      if (window.innerWidth < 768) {
        setIsSearch(false);
      } else {
        setIsSearch(true);
      }
    });
    return () => {
      window.removeEventListener('resize', () => {
        if (window.innerWidth < 768) {
          setIsSearch(false);
        } else {
          setIsSearch(true);
        }
      });
    };
  }, [window.innerWidth]);


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
    const value = e.target.value;
    if (value === '' || (Number(value) >= 0 && Number(value) < Number(maxValue))) {
      setMinValue(value);
    }
  };

  const handleMaxChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) > Number(minValue) && Number(value) <= maxLimit)) {
      setMaxValue(value);
    }
  };

  const handleMinSliderChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue === '' ? maxLimit : Number(maxValue) - 1);
    setMinValue(value);
  };

  const handleMaxSliderChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue === '' ? 0 : Number(minValue) + 1);
    setMaxValue(Math.min(value, maxLimit));
  };

  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = allTrips.slice(indexOfFirstTrip, indexOfLastTrip);

  const totalPages = Math.ceil(allTrips.length / tripsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      // Якщо сторінок 5 або менше, показуємо всі
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Показуємо першу сторінку
      pageNumbers.push(1);

      // Крапочки перед поточним блоком сторінок, якщо потрібно
      if (currentPage > 3) {
        pageNumbers.push('...');
      }

      // Блок сторінок, що залежить від поточної сторінки
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Крапочки після поточного блоку сторінок, якщо потрібно
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }

      // Показуємо останню сторінку
      pageNumbers.push(totalPages);
    }

    return pageNumbers.map((number, index) => {
      if (number === '...') {
        return <span key={index} className={styles.ellipsis}>...</span>;
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

  return (
    <>
      <div className={styles.main}>
        <HeaderNew />
        <div className={styles.mainContainer}>
          <div className={styles.filtersContainer}>
            <h3 className={styles.filterTitle}>Vienna: 43 results found</h3>
            <p>Filters</p>
            <div className={styles.filterOptions}>
              <div className={styles.dates}>
                <p>Dates:</p>
                <DateRangePicker
                  editable={false}
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
                <p>Rating:</p>
                <Rating setSelectedStars={setRating} selectedStars={rating} />
              </div>
              <div className={styles.price}>
                <p>Budget:</p>
                <div className={styles.inputsContainer}>
                  <img className={styles.budgetIcon} src={budget_icon} alt="budget_icon" />
                  <div className={styles.inputGroup}>
                    <input
                      id="minInput"
                      type="number"
                      value={minValue}
                      onChange={handleMinChange}
                      placeholder="0"
                      min="0"
                      max={maxLimit}
                    />
                  </div>
                  <div>
                    -
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      id="maxInput"
                      type="number"
                      value={maxValue}
                      onChange={handleMaxChange}
                      placeholder="5000"
                      min="0"
                      max={maxLimit}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.rangeContainer}>
                <div className={styles.sliderTrack}></div>
                <div
                  className={styles.rangeSelected}
                  style={{ left: `${(+minValue / maxLimit) * 100}%`, right: `${100 - (+maxValue / maxLimit) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max={maxLimit}
                  value={minValue || 0}
                  onChange={handleMinSliderChange}
                  className={`${styles.rangeSlider} ${styles.rangeMin}`}
                />
                <input
                  type="range"
                  min="0"
                  max={maxLimit}
                  value={maxValue || maxLimit}
                  onChange={handleMaxSliderChange}
                  className={`${styles.rangeSlider} ${styles.rangeMax}`}
                />
              </div>

              <div className={styles.statusContainer}>
                <p>Status:</p>
                <div className={styles.statuses}>
                  {statuses.map((status) =>
                    <div
                      onClick={() => setStatusTrip(status)}
                      className={cn([styles.status], { [styles.isStatusActive]: statusTrip === status })}
                    >
                      {status}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.travelersContainer}>
                <p>Travelers:</p>
                <div className={styles.statuses}>
                  {travelersMap.map((status) =>
                    <div
                      onClick={() => setTravelersCount(status)}
                      className={cn([styles.status], { [styles.isStatusActive]: travelersCount === status })}
                    >
                      {status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.resultsContainer}>
            <h3 className={styles.filterTitle}>Related user's trips</h3>
            <div className={styles.tripsContainer}>
              {currentTrips.map((trip: ITravel) => (
                <TravelCard
                  travel={trip}
                  isSearch={isSearch}
                  key={trip.id}
                />
              ))}
            </div>
            <div className={styles.pagination}>
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <Footer />

      </div>
    </>
  );
}

export default SearchTrips;