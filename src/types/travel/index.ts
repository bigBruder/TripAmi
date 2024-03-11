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
  tripName: string;
  dayDescription?: {date: string, description: string}[]
  comments_count: number;
}
