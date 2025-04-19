import React from 'react'
import Part from './Part'

const Content = ({parts}) => {
  return (
    <div>
      {parts.map((part) => (
        <div key={part.id}>
            <Part part={part} />
        </div>
      ))}
    </div>
  )
}

export default Content