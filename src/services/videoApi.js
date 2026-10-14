import axios from "axios";

// Prefer the git-ignored local helper (src/components/helpers/fetchFromAPI.js)
// when it exists; otherwise read the RapidAPI key from VITE_RAPIDAPI_KEY.
const localHelper = Object.values(
  import.meta.glob("../components/helpers/fetchFromAPI.js", { eager: true })
)[0];

const fetchWithEnvKey = async (url) => {
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

export const fetchFromAPI = localHelper?.fetchFromAPI ?? fetchWithEnvKey;
