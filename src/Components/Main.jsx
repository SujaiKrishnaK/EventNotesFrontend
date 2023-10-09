import React, { useEffect } from 'react'
import axios from "axios";
const Main = () => {
    useEffect(() => {
        axios.post('http://localhost:4200/', {
            latitude: '39.31',
            longitude: '-74.5'
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    },[])


    return <h1>Hello World!</h1>
}

export default Main;