import axios from "axios";

export const fetchFromAPI = async (url) => {
  if (!import.meta.env.VITE_RAPIDAPI_KEY) return { items: [] };
  const { data } = await axios.get(`https://youtube-v31.p.rapidapi.com/${url}`, {
    params: { maxResults: "10" },
    headers: {
      "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "youtube-v31.p.rapidapi.com",
    },
  });
  return data;
};
