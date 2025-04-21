
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Filter from './Components/Filter'
import Content from './Components/Content';

function App() {
  const [filter, setFilter] = useState('')
  const [countries, setCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
        
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }
    , [])

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
    if (event.target.value) {
      const filtered = countries.filter(country =>
        country.name.common.toLowerCase().includes(event.target.value.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
    else {
      setFilteredCountries(countries);
    }
  }
  return (
    <>
      <Filter value={filter} onChange={handleFilterChange} />
      <Content countries={filteredCountries} setCountries={setFilteredCountries} />
    </>
  )
}

export default App
