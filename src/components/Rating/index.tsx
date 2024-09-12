import React, { FC, useState } from 'react';

import cn from 'classnames';

import Star from '../RatingStar';
import styles from './rating.module.css';

interface Props {
  totalStars?: number;
  selectedStars?: number;
  setSelectedStars?: React.Dispatch<React.SetStateAction<number>>;
  disabled?: boolean;
  isCard?: boolean;
}

const Rating: FC<Props> = ({
  totalStars = 5,
  selectedStars = 0,
  setSelectedStars = () => { },
  disabled,
  isCard,
}) => {
  return (
    <div className={cn([styles.container], { [styles.pointer]: isCard })}>
      {[...Array(totalStars)].map((n, i) => (
        <Star
          key={i}
          disabled={disabled}
          selected={selectedStars >= i}
          selectedStar={selectedStars}
          onSelect={setSelectedStars}
          i={i}
          isCard={isCard}
        />
      ))}
    </div>
  );
};

export default Rating;
