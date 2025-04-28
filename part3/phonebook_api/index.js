require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

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
}

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((err) => {
    console.log('error connecting to MongoDB:', err.message);
  });
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  }
);

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

const Person = mongoose.model('Person', personSchema);

    app.get('/', (req, res) => {
        res.send('<h1>Phonebook API</h1>');
        }
    );

    app.get('/api/persons', (req, res) => {
      Person.find({})
        .then(persons => {
          res.json(persons);
        })
        
        }
    );

    app.get('/info', (req, res) => {
        const date = new Date();
        const personCount = persons.length;
        res.send(`
            <div>
                <p>Phonebook has info for ${personCount} people</p>
                <p>${date}</p>
            </div>
        `);
        }
    );

    app.get('/api/persons/:id', (req, res) => {
        const id = req.params.id;
        const person = persons.find(p => p.id === id);
        if (person) {
            res.json(person);
        } else {
            res.status(404).send({ error: 'Person not found' });
        }
    }
    );

    app.delete('/api/persons/:id', (req, res) => {
        const id = req.params.id;
        Person.findByIdAndDelete(id)
        .then(() => {
            console.log(`Deleted person with id: ${id}`);
            res.status(204).end();
        }).catch(err=>next(err));
        
    }
    );
    
    app.post('/api/persons', (request, response) => {
      const body = request.body

      if (body.name === undefined && body.number === undefined) {
        return response.status(400).json({ error: 'name and number missing' })
      }
      
      const person = new Person({
        name: body.name,
        number: body.number,
      })
    
      person.save().then(savedPerson => {
        response.json(savedPerson)
      }).catch(err=>next(err));
       
    }
    );

    app.use(errorHandler);  
  
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}
);