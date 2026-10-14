import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Videos from "./Videos";
import { fetchFromAPI } from "./helpers/fetchFromAPI";
import { useParams } from "react-router-dom";
const SearchFeed = () => {
  const [videos, setVideous] = useState([]);
  const { searchTerm } = useParams();
  useEffect(() => {
    fetchFromAPI(`search?part=snippet&q=${searchTerm}`).then((data) =>
      setVideous(data.items)
    );
  }, [searchTerm]);

  return (
    <Box p={2} sx={{ overflowY: "auto", height: "100vh", flex: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={2} sx={{ color: "white" }}>
        Search results for: <span className='text-[#ff6e40]'> { searchTerm}</span>
        <Videos videos={videos} />
      </Typography>
    </Box>
  );
};

export default SearchFeed;
