import axios from "axios";
const baseUrl = '/api/persons'
const getAll = () => {
    const request = axios.get(baseUrl)
    console.log(request)
    return request.then(response => response.data)
}
const create = newObject => {
        const request = axios.post(baseUrl, newObject)
    return request.then(response => response.data)
   }
const update = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}

const remove = id => {
    console.log(`Attempting to delete person with id: ${id}`);
    const request = axios.delete(`${baseUrl}/${id}`);
    return request
        .then(response => response.data)
        .catch(error => {
            console.error(`Error deleting person with id ${id}:`, error.message);
            throw error;
        });
};

export default { getAll, create, update, remove }

