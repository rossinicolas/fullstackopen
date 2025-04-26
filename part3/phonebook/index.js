const express = require('express');
const app = express();

const morgan = require('morgan');
// Middleware para capturar el body de la solicitud
// y agregarlo a los logs de morgan
morgan.token('body', (req) => JSON.stringify(req.body));

app.use(express.json());

// Configuración de morgan con nuevo formato personalizado
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));



let persons = [
      {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": "2"
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
      },
      {
        "name": "John Doe",
        "number": "123-456789",
        "id": "5"
      },
      {
        "name": "Jane Smith",
        "number": "987-654321",
        "id": "6"
      },
      {
        "name": "Alice Johnson",
        "number": "555-1234",
        "id": "7"
      },
      {
        "name": "Bob Brown",
        "number": "555-5678",
        "id": "8"
      },
      {
        "name": "Charlie Davis",
        "number": "555-8765",
        "id": "9"
      },
      {
        "name": "Diana Prince",
        "number": "555-4321",
        "id": "10"
      }
    ]

    app.get('/', (req, res) => {
        res.send('<h1>Phonebook API</h1>');
        }
    );

    app.get('/api/persons', (req, res) => {
        res.json(persons);
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
        persons = persons.filter(p => p.id !== id);
        res.status(204).end();
    }
    );
    
    app.post('/api/persons', (req, res) => {
        const { name, number } = req.body;
        if (!name || !number) {
            return res.status(400).json({ error: 'Name and number are required' });
        }
        if (persons.some(p => p.name === name)) {
            return res.status(400).json({ error: 'Name already exists' });
        }
        const id = (Math.random() * 1000).toString();
        const newPerson = { name, number, id };
        persons.push(newPerson);
        res.status(201).json(newPerson);
    }
    );
  
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}
);