const axios = require('axios');

const API_KEY = '4265d5837a1aec563dd48dadd458bd71'; 
const city = 'Santiago';

async function testWeatherAPI() {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`;

  try {
    const response = await axios.get(url);
    console.log('Datos del clima:', response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.error('Ciudad no encontrada.');
      } else if (error.response.status === 401) {
        console.error('API Key inválida.');
      } else {
        console.error('Error en la respuesta:', error.response.status, error.response.data);
      }
    } else if (error.request) {
      console.error('No hubo respuesta del servidor.');
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }
  }
}

testWeatherAPI();