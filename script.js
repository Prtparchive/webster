const apiKey = "67fda4d2f06625419d86d76d23c85d84";
let isCelsius = true;

async function getWeather(event) {
  event.preventDefault();
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;

  try {
    showLoading(true);
    hideError();

    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    ]);

    if (!currentRes.ok || !forecastRes.ok) throw new Error('City not found');

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    updateCurrentWeather(currentData);
    updateForecast(forecastData.list);

  } catch (error) {
    showError(error.message);
  } finally {
    showLoading(false);
  }
}

function updateCurrentWeather(data) {
  window.currentWeatherData = {
    temp: data.main.temp,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    weather: data.weather
  };

  document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temp').textContent = `Temp: ${convertTemp(data.main.temp)}`;
  document.getElementById('desc').textContent = data.weather[0].description;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('wind').textContent = `Wind: ${data.wind.speed} m/s`;
  document.getElementById('feelsLike').textContent = `Feels like: ${convertTemp(data.main.feels_like)}`;
  document.getElementById('aiSuggestion').textContent = getSuggestion(data);

  const iconCode = data.weather[0].icon;
  document.getElementById('weatherIcon').innerHTML = 
    `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
          alt="${data.weather[0].description}">`;
}

function updateForecast(forecastList) {
  const container = document.getElementById('forecastContainer');
  container.innerHTML = '';

  for (let i = 0; i < forecastList.length; i += 8) {
    const day = forecastList[i];
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <h4>${new Date(day.dt_txt).toLocaleDateString('en', { weekday: 'short' })}</h4>
      <p>${convertTemp(day.main.temp)}</p>
      <p>${day.weather[0].main}</p>
    `;
    container.appendChild(card);
  }
}

function convertTemp(temp) {
  return isCelsius ? `${Math.round(temp)}°C` : `${Math.round(temp * 9/5 + 32)}°F`;
}

function getSuggestion(data) {
  const temp = data.main.temp;
  const weather = data.weather[0].main.toLowerCase();

  if (weather.includes('rain')) return 'Bring an umbrella!';
  if (temp > 30) return 'Stay hydrated!';
  if (temp < 10) return 'Wear warm clothes!';
  return 'Enjoy the weather!';
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function hideError() {
  document.getElementById('errorMessage').style.display = 'none';
}

function toggleUnit() {
  isCelsius = !isCelsius;
  const city = document.getElementById('cityInput').value.trim();
  if (city) getWeather(new Event('submit'));
}

window.handleUserQuestion = function() {
  try {
    const question = document.getElementById('userQuestion').value.trim().toLowerCase();
    const responseEl = document.getElementById('aiResponse');

    if (!question) {
      responseEl.textContent = "Please enter a question!";
      return;
    }

    if (!window.currentWeatherData) {
      responseEl.textContent = "Please get current weather first!";
      return;
    }

    const answer = generateAIResponse(question);
    responseEl.textContent = answer;

  } catch (error) {
    console.error('AI Error:', error);
    document.getElementById('aiResponse').textContent = "Sorry, I'm having trouble answering that.";
  }
};

function generateAIResponse(question) {
  const { temp, humidity, wind, weather } = window.currentWeatherData;
  const weatherCondition = weather[0].main.toLowerCase();
  const tempC = isCelsius ? temp : (temp - 32) * 5/9;

  const responses = {
    umbrella: weatherCondition.includes('rain') ? "Yes, you'll need an umbrella today ☔" : "No umbrella needed right now 🌞",
    jacket: tempC < 15 ? "Yes, bring a jacket 🧥" : "No jacket needed today 👕",
    sunscreen: tempC > 25 ? "Yes, UV index is likely high ☀️" : "Probably not needed right now",
    humid: humidity > 70 ? `Yes, it's quite humid (${humidity}%) 💦` : `No, humidity is comfortable (${humidity}%) 🌬️`,
    wind: wind > 5 ? `Yes, wind speed is ${wind} m/s 💨` : `No, wind is calm (${wind} m/s) 🍃`,
    travel: weatherCondition.includes('rain') ? "Weather may affect travel today due to rain 🌧️" : "No weather disruptions expected for travel 🧳",
    picnic: weatherCondition.includes('rain') ? "Not ideal for picnic today 🌧️" : "Great day for a picnic 🍱",
    cold: tempC < 10 ? "Yes, it's quite cold outside 🥶" : "Not too cold right now 🙂",
    hot: tempC > 30 ? "Yes, it's very hot today 🔥" : "Temperature is moderate now 🌤️",
    bike: weatherCondition.includes('rain') ? "Might be slippery, avoid biking 🚳" : "Perfect weather for biking 🚴",
    jog: weatherCondition.includes('rain') ? "Rain might interrupt your jog 🏃‍♂️" : "Good conditions for jogging 🏃",
    allergy: humidity > 70 ? "Allergy risk may be high due to humidity 🌾" : "Allergy risk is likely low today 🙂",
    clothes: tempC < 10 ? "Wear warm clothes 🧥" : tempC > 30 ? "Wear light clothes 👕" : "Dress comfortably 🙂",
    walk: weatherCondition.includes('rain') ? "May not be best to go for a walk now ☔" : "Nice weather for a stroll 🚶",
    cloud: weatherCondition.includes('cloud') ? "Yes, it's cloudy today ☁️" : "Skies are mostly clear ☀️",
    sunny: weatherCondition.includes('clear') ? "Yes, it's sunny outside ☀️" : "Not very sunny right now 🌥️",
    storm: weatherCondition.includes('storm') ? "Stormy weather alert ⚠️" : "No storm expected currently 🙂",
    sports: weatherCondition.includes('rain') ? "Outdoor sports might be disrupted 🌧️" : "Go enjoy your game! ⚽🏏",
    food: tempC < 15 ? "Great time for something warm like soup 🍲" : tempC > 30 ? "Cool drinks would be perfect 🥤" : "Anything goes today! 🍽️"
  };

  const keywords = Object.keys(responses);
  for (const key of keywords) {
    if (question.includes(key)) return responses[key];
  }

  return "I'm here to help! Try asking about clothes, travel, health, or outdoor activities.";
}
