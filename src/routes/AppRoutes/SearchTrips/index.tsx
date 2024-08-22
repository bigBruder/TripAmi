import HeaderNew from '~/components/HeaderNew';
import styles from './SearchTrips.module.css';
import React, { useState } from 'react';
import Footer from '~/components/Footer';
import { DateRangePicker } from 'rsuite';
import { toast } from 'react-toastify';
import Rating from '~/components/Rating';

const SearchTrips = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rating, setRating] = useState(-1);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(5000);

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

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), maxValue - 1);
    setMinValue(value);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), minValue + 1);
    setMaxValue(value);
  };

  const trackStyle = {
    left: `${(minValue / 5000) * 100}%`,
    right: `${100 - (maxValue / 5000) * 100}%`,
  };

  return (
    <>
      <div className={styles.main}>
        <HeaderNew />
        <div className={styles.mainContainer}>
          <div className={styles.filtersCintainer}>
            <h3 className={styles.filterTitle}>Vienna: 43 results found</h3>
            <p>Filters</p>
            <div className={styles.filterOptions}>
              <div className={styles.dates}>
                <p>Dates</p>
                <DateRangePicker
                  editable={false}
                  value={[parseDate(startDate), parseDate(endDate)]}
                  onChange={handleDateChange}
                  size='sm'
                  appearance='subtle'
                  placeholder='Chose dates'
                  showOneCalendar
                  style={{
                    width: '90%',
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
                <p>Rating</p>
                <Rating setSelectedStars={setRating} selectedStars={rating} />
              </div>
              <div className={styles.price}>
                <p>Price</p>
                <div className={styles.rangeContainer}>
                  <div className={styles.budgetDisplay}>
                    ${minValue} - ${maxValue}+
                  </div>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={minValue}
                      onChange={handleMinChange}
                      className={styles.rangeSlider}
                    />
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={maxValue}
                      onChange={handleMaxChange}
                      className={styles.rangeSlider}
                    />
                    <div className={styles.rangeTrack} style={trackStyle} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.resultsContainer}>
            <h3 className={styles.filterTitle}>Vienna: 43 results found</h3>

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