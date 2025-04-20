import React from 'react'
import Person from './Person'

const Numbers = ({ persons,deletePerson }) => (
    <div>
        <h2>Numbers</h2>
        <ul>
            {persons.map((person) => (
                <Person key={person.id} person={person}  deletePerson={deletePerson}/>
                ))}
        </ul>
    </div>

)

export default Numbers