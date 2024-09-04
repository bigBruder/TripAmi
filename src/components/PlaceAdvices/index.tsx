import React from 'react';

import { PlaceReviewType } from '~/types/placeReviews';

import { PlaceReview } from '../PlaceReview/PlaceReview';
import styles from './PlaceAdvices.module.css';

interface PlaceAdvicesProps {
  reviews: PlaceReviewType[];
}

const PlaceAdvices: React.FC<PlaceAdvicesProps> = ({ reviews }) => {
  return (
    <div className={styles.placeReviewsContainer}>
      <div className={styles.reviews}>
        {reviews.map((review) => {
          if (review.advice) {
            return <PlaceReview key={review.id} review={review} mainTitle={review.advice} />;
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default PlaceAdvices;
