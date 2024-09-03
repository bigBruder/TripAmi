import React from 'react';

import { PlaceReviewType } from '~/types/placeReviews';

import { PlaceReview } from '../PlaceReview/PlaceReview';
import styles from './PlaceReviews.module.css';

interface PlaceReviewsProps {
  reviews: PlaceReviewType[];
}

const PlaceReviews: React.FC<PlaceReviewsProps> = ({ reviews }) => {
  return (
    <div className={styles.placeReviewsContainer}>
      <div className={styles.reviews}>
        {reviews.map((review) => (
          <PlaceReview key={review.id} review={review} mainTitle={review.text} />
        ))}
      </div>
    </div>
  );
};

export default PlaceReviews;
