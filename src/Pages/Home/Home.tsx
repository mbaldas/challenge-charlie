import React from "react";

import "pages/Home/Home.scss";
import Background from "components/Background/Background";
import WeatherCard from "components/WeatherCard/WeatherCard";

const Home = () => {
  return (
    <>
      <Background>
        <WeatherCard />
      </Background>
    </>
  );
};

export default Home;
