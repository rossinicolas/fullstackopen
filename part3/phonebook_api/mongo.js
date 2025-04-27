const mongoose = require('mongoose');

if(process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}
const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0.wbd92s5.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.set('strictQuery', false);
mongoose.connect(url)
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
const Person = mongoose.model('Person', personSchema);
const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
});
if(process.argv.length === 5) {
  person.save()
    .then(() => {
      console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
      mongoose.connection.close();
    })
    .catch((err) => {
      console.log('error saving person:', err.message);
    });
}
else if(process.argv.length === 3) {
  Person.find({})
    .then(result => {
      console.log('phonebook:');
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    })
    .catch((err) => {
      console.log('error fetching persons:', err.message);
    });
}
