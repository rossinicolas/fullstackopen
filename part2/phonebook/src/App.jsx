import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import Form from './components/Form'
import Numbers from './components/Numbers'
import personsService from './services/persons'
import Notification from './components/Notification'

const App = () => {
  const [message, setMessage] = useState('')
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    console.log('effect')
    personsService.getAll()
      .then(initialPersons => {
        console.log('promise fulfilled')
        setPersons(initialPersons)
      })
      .catch(error => {
        console.log('error', error)
      })
  }, [])


  const handleOnChangeName = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleOnChangeNumber = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const handleOnChangeFilter = (event) => {
    console.log(event.target.value)
    setFilter(event.target.value)
  }
  const filteredPersons = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  const addName = (event) => {
    event.preventDefault()

    const names = persons.map(person => person.name)
    if (names.includes(newName)) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const person = persons.find(p => p.name === newName)
        const updatedPerson = { ...person, number: newNumber }
        personsService.update(person.id, updatedPerson)
          .then(response => {
            setPersons(persons.map(p => (p.id !== person.id ? p : response)))
            setNewName('')
            setNewNumber('')
            console.log('promise fulfilled')
            console.log('updated person', updatedPerson)
            setMessage(`${updatedPerson.name} was successfully updated`)
            setTimeout(() => {
              setMessage('')
            }, 5000)
            
          })
          .catch(error => {
            console.log('error', error)
            setNewName('')
            setNewNumber('')
            setMessage(`error: ${error.response.data.error}`)
            setTimeout(() => {
              setMessage('')
            }, 5000)
          })
      }
      else {
        console.log('name not updated')
        setNewName('')
        setNewNumber('')
      }


    } else {
      const nameObject = {
        name: newName,
        number: newNumber,
        id: persons.length + 1
      }
      personsService.create(nameObject)
        .then(response => {
          console.log('promise fulfilled')
          setPersons(persons.concat(response))
        
      setNewName('')
      setNewNumber('')
          setMessage(`${nameObject.name} was successfully added`)
          setTimeout(() => {
            setMessage('')
          }, 5000)
        }
      )
        .catch(error => {
          console.log('error', error)
          setMessage(`error: ${error.response.data.error}`)
          setTimeout(() => {
            setMessage('')
          }, 5000)
        })
      
    }

  }

  const deletePerson = (id) => {
    const filteredPerson = persons.filter(person => person.id === id)
    const personName = filteredPerson[0].name
    const personId = filteredPerson[0].id
    if (window.confirm(`Delete ${personName} ?`)) {
      personsService.remove(personId)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          console.log(`${personName} was successfully deleted`)
          setMessage(`${personName} was successfully deleted`)
          setTimeout(() => {
            setMessage('')
          }, 5000)
        })
        .catch(error => {
          console.log('error', error)
          setNewName('')
            setNewNumber('')
            setMessage(`error: ${error.response.data.error}`)
          setTimeout(() => {
            setMessage('')
          }
          , 5000)
        })
    }
  }

  const handleDelete = (id) => {
    deletePerson(id)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter value={filter} onChange={handleOnChangeFilter} />
      <Form
        addName={addName}
        newName={newName}
        onChangeName={handleOnChangeName}
        newNumber={newNumber}
        onChangeNumber={handleOnChangeNumber} />
      <Numbers persons={filteredPersons} deletePerson={handleDelete} />
    </div>
  )
}

export default App