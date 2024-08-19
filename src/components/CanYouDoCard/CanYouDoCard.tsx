import React, { useEffect } from 'react';

import styles from './CanYouDoCard.module.css';

interface ICanYouDoCardProps {
  text: string;
  image: string;
}

const CanYouDoCard: React.FC<ICanYouDoCardProps> = ({ text, image }) => {
  return (
    <div className={styles.container} style={{ backgroundImage: `url(${image})` }}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}>{text}</h1>
      </div>
    </div>
  );
};
export default CanYouDoCard;
