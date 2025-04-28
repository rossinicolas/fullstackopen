import React from 'react'

const Form = ({ addName, newName, onChangeName, newNumber, onChangeNumber }) => {
    return (
        <div>
            <h2>Add a new</h2>
            <form onSubmit={addName} >
                <div>
                    name: <input value={newName} onChange={onChangeName} />
                    <div>number: <input value={newNumber} onChange={onChangeNumber} /></div>
                </div>
                <div>
                    <button type="submit">add</button>
                </div>
            </form></div>
    )
}

export default Form 