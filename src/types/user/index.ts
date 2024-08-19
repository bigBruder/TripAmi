import { ICustomMarker } from '~/components/EditMap/types';

interface IPlace {
  address: string;
  placeID: string;
  lat: number;
  lng: number;
  types: string;
  name: string;
  photo: string;
}

export interface Itinerary {
  id: string;
  name: string;
  places: IPlace[];
  createdAt: Date;
}
export interface IUser {
  id?: string;
  email?: string;
  whereToNext?: string;
  username?: string;
  createdAt?: string;
  friends_count?: number;
  friends?: string[];
  primaryLocation?: {
    country: null | string;
    city: null | string;
  };
  avatarUrl?: string | null;
  firebaseUid?: string;
  postsCount?: number;
  tripCount?: number;
  friends_request_limit?: number;
  markers?: ICustomMarker[];
  itinerary: Itinerary[];
  accessToken?: string;
  userFromFacebook?: boolean;
}
