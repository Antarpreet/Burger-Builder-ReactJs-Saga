import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-burger-builder-ddd6a.firebaseio.com/'
});

export default instance;