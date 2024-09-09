import React from 'react';

import { PlaceReviewType } from '~/types/placeReviews';

import { PlaceReview } from '../PlaceReview/PlaceReview';
import styles from './PlaceAdvices.module.css';

interface PlaceAdvicesProps {
  reviews: PlaceReviewType[];
  myReview: PlaceReviewType;
  fetchReviews: () => void;
}

const PlaceAdvices: React.FC<PlaceAdvicesProps> = ({ reviews, myReview, fetchReviews }) => {
  const isAdvice = true;
  const isMyReviewExist = myReview?.advice ? true : false;
  return (
    <div className={styles.placeReviewsContainer}>
      <div className={styles.reviews}>
        {reviews.map((review) => {
          if (review.advice) {
            return (
              <PlaceReview
                key={review.id}
                review={review}
                mainTitle={review.advice}
                isAdvice={isAdvice}
                myReview={myReview}
                isMyReviewExist={isMyReviewExist}
                fetchReviews={fetchReviews}
              />
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default PlaceAdvices;
