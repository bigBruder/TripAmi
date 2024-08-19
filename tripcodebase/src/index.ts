/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import {onRequest} from 'firebase-functions/v2/https';
import {logger} from 'firebase-functions';

export const getPhoto = onRequest(async (request, response): Promise<void> => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  try {
    logger.info('Request:', request);
    const placeId = request.query.id;
    logger.info('Place ID:', placeId);

    const placeDetailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8`
    );

    if (!placeDetailsResponse.ok) {
      throw new Error(`HTTP error! status: ${placeDetailsResponse.status}`);
    }

    const placeDetails = await placeDetailsResponse.json();
    logger.info('Place details response JSON:', placeDetails);

    if (!placeDetails.result) {
      logger.error('No result found in place details response:', placeDetails);
      response.json({photoUrl: '/plug_place.jpg'});
      return;
    }

    logger.info('Place details:', placeDetails.result);

    const photos = placeDetails.result.photos;
    if (!photos || photos.length === 0) {
      logger.warn('No photos available for this place.');
      response.json({photoUrl: '/plug_place.jpg'});
      return;
    }

    const photoReference = photos[0].photo_reference;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8`;

    response.json({photoUrl});
  } catch (error) {
    logger.error('Error fetching place details:', error);
    response.json({photoUrl: '/plug_place.jpg'});
  }
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
