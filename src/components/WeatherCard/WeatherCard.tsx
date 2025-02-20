import React, { useEffect } from "react";

import WeatherInput from "components/WeatherInput/WeatherInput";
import WeatherToday from "components/WeatherToday/WeatherToday";
import WeatherNextDays from "components/WeatherNextDays/WeatherNextDays";
import {
  fetchUserLocation,
  fetchCoordinatesByLocation,
} from "services/locationService";
import "components/WeatherCard/WeatherCard.scss";
import { useStore } from "store/store";
import { fetchWeather, fetchNextWeather } from "services/weatherService";
import {
  convertCelsiusFahrenheit,
  defineBackgroundColor,
  formatWeatherProperties,
  shadeColor,
} from "utils/utils";
import { Weather } from "interfaces/Weather";
import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import CustomToast from "components/CustomToast/CustomToast";

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
    isCelsius,
    toggleCelsius,
    updateNextDayWeather,
    isLoading,
    setIsLoading,
    toastMessage,
    setToastMessage,
  } = useStore();

  const success = (position: any) => {
    setUserLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  };

  const error = (error: any) => {
    setUserLocation({
      latitude: 0,
      longitude: 0,
      place: undefined,
    });
    setToastMessage("Você não aceitou a geolocalização");
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  }, []);

  useEffect(() => {
    if (userLocation.latitude) {
      setIsLoading(true);
      fetchUserLocation(userLocation.latitude, userLocation.longitude)
        .then((location: string) => {
          setUserLocation({
            ...userLocation,
            place: location,
          });
        })
        .catch((error) => {
          setToastMessage("Não foi possível encontrar sua cidade");
        });
    }
  }, [userLocation.latitude]);

  useEffect(() => {
    if (userLocation.place) {
      fetchWeather(userLocation.place)
        .then((weather) => {
          const formattedWeather: Weather = formatWeatherProperties(weather);
          setLocationWeather({
            temperature: Math.round(formattedWeather.temperature),
            mood: formattedWeather.mood,
            windSpeed: formattedWeather.windSpeed,
            windDirection: formattedWeather.windDirection,
            humidity: formattedWeather.humidity,
            pressure: formattedWeather.pressure,
            icon: formattedWeather.icon,
          });
          setBackgroundColor(
            defineBackgroundColor(formattedWeather.temperature, isCelsius)
          );
        })
        .catch((error) => {
          setToastMessage("Não foi possível definir o clima da sua cidade");
          setUserLocation({
            latitude: 0,
            longitude: 0,
            place: undefined,
          });
        });
      fetchNextWeather(userLocation.latitude, userLocation.longitude)
        .then((apiData) => {
          apiData.daily.map((weather: any, index: number) => {
            if (index < 2)
              addNextDayWeather({
                temperature: Math.round(weather.temp.day),
                id: index,
              });
          });
        })
        .catch((error) => {
          setToastMessage("Não foi definir o clima dos próximos dias");
        })
        .finally(() => setIsLoading(false));
    }
  }, [userLocation.place]);

  useEffect(() => {
    setBackgroundColor("#dbd3b4");
  }, [userLocation.place === undefined]);

  const handleToggleCelsius = async () => {
    await toggleCelsius(!isCelsius);
    const convertedTemperature = convertCelsiusFahrenheit(
      locationWeather.temperature,
      isCelsius
    );
    setLocationWeather({
      ...locationWeather,
      temperature: convertedTemperature,
    });
    nextDaysWeather.map((nextDay) => {
      const nextDayConvertedTemperature = convertCelsiusFahrenheit(
        nextDay.temperature,
        isCelsius
      );
      updateNextDayWeather(nextDay, nextDayConvertedTemperature);
    });
  };

  const handleInputChange = (location: string) => {
    fetchCoordinatesByLocation(location)
      .then((position) => {
        setUserLocation({
          latitude: position.latitude,
          longitude: position.longitude,
        });
      })
      .catch((error) => {
        setUserLocation({
          latitude: null,
          longitude: null,
        });
        setToastMessage("Não foi possível encontrar sua cidade");
      });
  };

  return (
    <div className="card">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <WeatherInput
            location={userLocation.place}
            handleInputChange={(location: string) =>
              handleInputChange(location)
            }
          />
          <WeatherToday
            weather={locationWeather}
            color={shadeColor(backgroundColor, 1.1)}
            isCelsius={isCelsius}
            toggleCelsius={handleToggleCelsius}
            location={userLocation.place}
          />
          {nextDaysWeather.length > 0 &&
            nextDaysWeather.map((nextWeather, index) => {
              return (
                <WeatherNextDays
                  key={index}
                  weather={nextWeather}
                  day={index}
                  location={userLocation.place}
                  color={
                    index == 0
                      ? backgroundColor
                      : shadeColor(backgroundColor, 1.8)
                  }
                  isCelsius={isCelsius}
                  toggleCelsius={handleToggleCelsius}
                />
              );
            })}
        </>
      )}
      {toastMessage && <CustomToast toastMessage={toastMessage} />}
    </div>
  );
};

export default WeatherCard;
