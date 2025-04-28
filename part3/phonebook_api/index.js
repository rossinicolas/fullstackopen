require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Person = require('./models/person');
const app = express();

// Middleware para capturar el body de la solicitud
// y agregarlo a los logs de morgan
morgan.token('body', (req) => JSON.stringify(req.body));

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

// Configuración de morgan con nuevo formato personalizado
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};


app.get('/', (req, res) => {
  res.send('<h1>Phonebook API</h1>');
}
);

app.get('/api/persons', (req, res,next) => {
  Person.find({})
    .then(persons => {
      res.json(persons);
    }).catch(err => next(err));

}
);

app.get('/info', (req, res,next) => {
  Person.countDocuments({}).then(personCount => {
    const date = new Date();
    res.send(`
            <div>
                <p>Phonebook has info for ${personCount} people</p>
                <p>${date}</p>
            </div>
        `);
  }).catch(err => next(err));
}
);

app.get('/api/persons/:id', (req, res,next) => {
  const id = req.params.id;
  Person.findById(id).then(person => {
    if (!person) {
      return res.status(404).send({ error: 'Person not found' });
    }
    res.json(person);
  }).catch(err => next(err));
});


app.delete('/api/persons/:id', (req, res,next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then(() => {
      console.log(`Deleted person with id: ${id}`);
      res.status(204).end();
    }).catch(err => next(err));

}
);

app.post('/api/persons', (request, response,next) => {
  const body = request.body;

  if (body.name === undefined && body.number === undefined) {
    return response.status(400).json({ error: 'name and number missing' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(err => next(err));

}
);

app.put('/api/persons/:id', (req, res,next) => {
  const id = req.params.id;
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      if (!updatedPerson) {
        return res.status(404).send({ error: 'Person not found' });
      }
      res.json(updatedPerson);
    }).catch(err => next(err));
}
);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}
);