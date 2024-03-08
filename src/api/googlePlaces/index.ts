import axios from "axios";

export const getAutocomplete = async (input: string) => {
  try {
    const {data} = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=country|locality&key=${process.env.GOOGLE_MAP_API_KEY}`);

    return data;
  } catch (err) {
    console.log('[ERROR getting autocomplete] => ', err);
  }
};
