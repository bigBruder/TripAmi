import React from 'react';

import { PlaceReviewType } from '~/types/placeReviews';

import { PlaceReview } from '../PlaceReview/PlaceReview';

interface PlaceReviewsProps {
  reviews: PlaceReviewType[];
  myReview: PlaceReviewType;
  fetchReviews: () => void;
}

const PlaceReviews: React.FC<PlaceReviewsProps> = ({ reviews, myReview, fetchReviews }) => {
  const isMyReviewExist = myReview?.text ? true : false;
  return (
    <>
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
    </>
  );
};

export default PlaceReviews;
