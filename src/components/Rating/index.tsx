import React, { useState } from 'react';
import Star from '../RatingStar';
import styles from './rating.module.css';

const Rating = ({ totalStars = 5 }) => {
  const [selectedStars, setSelectedStars] = useState(0);

  return (
    <div className={styles.container}>
      {[...Array(totalStars)].map((n, i) => (
        <Star
          key={i}
          selected={selectedStars >= i}
          onSelect={() => {
            setSelectedStars(i);
            console.log('JERE');
          }}
        />
      ))}
    </div>
  );
};

export default Rating;
