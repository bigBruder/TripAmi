export interface ITravel {
  id: string;
  userId: string;
  imageUrl: string;
  rate: number;
  when: string;
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
