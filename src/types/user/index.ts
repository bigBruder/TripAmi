import {ICustomMarker} from "~/components/EditMap/types";

export interface IUser {
  id?: string;
  email?: string;
  username?: string;
  createdAt?: string;
  friends_count?: number;
  friends?: string[];
  primaryLocation?: {
    country: null | string,
    city: null | string,
  };
  avatarUrl?: string | null;
  firebaseUid?: string;
  postsCount?: number;
  friends_request_limit?: number;
  markers?: ICustomMarker[];
}
