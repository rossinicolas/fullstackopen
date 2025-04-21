import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Country = ({country}) => {
    const weatherApiKey = import.meta.env.VITE_REACT_APP_API_KEY
    console.log(weatherApiKey)
    console.log(country.capital)
    const weatherApiUrl = `http://api.weatherstack.com/current?access_key=${weatherApiKey}&query=${country.capital}`
    const [weather, setWeather] = useState([])

    useEffect(() => {
        axios
            .get(weatherApiUrl)
            .then(response => {
                console.log('Weather data:', response.data);
                setWeather(response.data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }
    , [weatherApiUrl])
    console.log(country)

  return (
    <div>
                <h1>{country.name.common}</h1>
                <p>Capital: {country.capital}</p>
                <p>Area: {country.area}</p>
                <h2>Languages</h2>
                <ul>
                    {Object.values(country.languages).map((language, index) => (
                        <li key={index}>{language}</li>
                    ))}
                </ul>
                <img src={country.flags.png} alt="flag" />
                {weather.current && (
                    <div>
                        <h2>Weather in {country.capital}</h2>
                        <p>Temperature: {weather.current.temperature}°C</p>
                        <p>Weather: {weather.current.weather_descriptions[0]}</p>
                        <img src={weather.current.weather_icons[0]} alt="weather icon" />
                    </div>
                )}
                {weather.error && (
                    <div>
                        <p>Error fetching weather data: {weather.error.info}</p>
                    </div>
                )}
            </div>
  )
}

export default Country