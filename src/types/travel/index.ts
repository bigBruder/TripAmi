export interface ITravel {
  id: string;
  userId: string;
  imageUrl: {url: string; type: string}[];
  rate: number;
  when: string;
  geoTags: {
    placeID: string;
    address: string;
  }[];
  public: boolean;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    color: string;
  };
  text: string;
  comments_count: number;
}
