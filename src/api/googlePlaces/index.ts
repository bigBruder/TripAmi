import axios from "axios";

export const getAutocomplete = async (input: string) => {
  try {
    const {data} = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=country|locality&key=AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8`);

    return data;
  } catch (err) {
    console.log('[ERROR getting autocomplete] => ', err);
  }
};
