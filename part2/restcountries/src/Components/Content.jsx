import React from 'react'
import Country from './Country'

const Content = ({countries, setCountries}) => {
    
    if(countries.length > 10){
        return (
            <div>Too many matches, specify another filter</div>
        )
    } else if(countries.length === 1){
        return (
            <Country country={countries[0]} />
        )
    }
    if(countries.length <= 10 && countries.length > 1){
        return (
            <div>
                {countries.map((country, index) => (
                    <div key={index}>
                        <h2>{country.name.common} <button onClick={() => setCountries([country])}>show</button></h2>
                    </div>
                ))}
            </div>
        )
    }
    return (
        <div>
            <h2>No countries found</h2>
        </div>
  
  )
}

export default Content