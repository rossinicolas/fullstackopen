import React from 'react'

const Person = ({ person, deletePerson }) => {
    return (
        <li key={person.id}>
            {person.name} {person.number} <button onClick={()=>deletePerson(person.id)}> delete</button>
        </li>
    )
}

export default Person