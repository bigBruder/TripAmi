import {collection} from "@firebase/firestore";
import {db} from "~/firebase";

export const usersCollection = collection(db, "users");
export const postsCollection = collection(db, "posts");
export const tripsCollection = collection(db, "trips");

export const commentsCollection = collection(db, "comments");
export const placesCommentsCollection = collection(db, "places_comments");
export const friendsRequestsCollection = collection(db, "friends_requests");
