import React, { useEffect } from "react";

import WeatherInput from "components/WeatherInput/WeatherInput";
import WeatherToday from "components/WeatherToday/WeatherToday";
import WeatherNextDays from "components/WeatherNextDays/WeatherNextDays";
import fetchUserLocation from "services/locationService";
import "components/WeatherCard/WeatherCard.scss";
import { useStore } from "store/store";
import { FormattedLocation } from "interfaces/FormattedLocation";
import { fetchWeather, fetchNextWeather } from "services/weatherService";
import { formatWeatherProperties, shadeColor } from "utils/utils";
import { Weather } from "interfaces/Weather";

const WeatherCard = () => {
  const {
    userLocation,
    setUserLocation,
    locationWeather,
    setLocationWeather,
    nextDaysWeather,
    addNextDayWeather,
    setBackgroundColor,
    backgroundColor,
  } = useStore();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

  useEffect(() => {
    if (userLocation.latitude) {
      fetchUserLocation(userLocation.latitude, userLocation.longitude).then(
        (formattedLocation: FormattedLocation) => {
          setUserLocation({
            ...userLocation,
            place: `${formattedLocation.city}, ${formattedLocation.state}, ${formattedLocation.country}`,
          });
        }
      );
    }
  }, [userLocation.latitude]);

  useEffect(() => {
    if (userLocation.place) {
      fetchWeather(userLocation.place.split(" ")[0]).then((weather) => {
        const formattedWeather: Weather = formatWeatherProperties(weather);
        setLocationWeather({
          temperature: formattedWeather.temperature,
          mood: formattedWeather.mood,
          windSpeed: formattedWeather.windSpeed,
          windDirection: formattedWeather.windDirection,
          humidity: formattedWeather.humidity,
          pressure: formattedWeather.pressure,
        });
      });
      fetchNextWeather(userLocation.latitude, userLocation.longitude).then(
        (apiData) => {
          apiData.daily.map((weather, index) => {
            if (index < 2) addNextDayWeather({ temperature: weather.temp.day });
          });
        }
      );
    }
  }, [userLocation.place]);

  useEffect(() => {
    if (locationWeather.temperature) {
      if (locationWeather.temperature < 15) {
        setBackgroundColor("#0080cd");
      }
      if (locationWeather.temperature > 35) {
        setBackgroundColor("#cc3923");
      }
      setBackgroundColor("#faca04");
    }
  }, [locationWeather.temperature]);

  return (
    <div className="card">
      <WeatherInput location={userLocation.place} />
      <WeatherToday
        weather={locationWeather}
        color={shadeColor(backgroundColor, 1.1)}
      />
      {nextDaysWeather.length > 0 &&
        nextDaysWeather.map((nextWeather, index) => {
          return (
            <WeatherNextDays
              weather={nextWeather}
              day={index}
              color={
                index == 0 ? backgroundColor : shadeColor(backgroundColor, 1.8)
              }
            />
          );
        })}
    </div>
  );
};

export default WeatherCard;
