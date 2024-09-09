import React from 'react';

import { PlaceReviewType } from '~/types/placeReviews';

import { PlaceReview } from '../PlaceReview/PlaceReview';
import styles from './PlaceReviews.module.css';

interface PlaceReviewsProps {
  reviews: PlaceReviewType[];
  myReview: PlaceReviewType;
  fetchReviews: () => void;
}

const PlaceReviews: React.FC<PlaceReviewsProps> = ({ reviews, myReview, fetchReviews }) => {
  const isMyReviewExist = myReview?.text ? true : false;
  return (
    <div className={styles.placeReviewsContainer}>
      <div className={styles.reviews}>
        {reviews.map((review) => {
          if (review?.text) {
            return (
              <PlaceReview
                key={review.id}
                review={review}
                mainTitle={review.text}
                isMyReviewExist={isMyReviewExist}
                myReview={myReview}
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

export default PlaceReviews;
