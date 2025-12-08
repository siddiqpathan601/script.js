const API_KEY = "c81c584d5cfed901850be321c7426360";

const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const humEl = document.getElementById("hum");
const windEl = document.getElementById("wind");
const presEl = document.getElementById("pres");
const cityNameEl = document.getElementById("cityName");
const weatherIconEl = document.getElementById("weatherIcon");
const aqiEl = document.getElementById("aqi");

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const refreshBtn = document.getElementById("refreshBtn");

let currentCity = "Hyderabad";

const ICONS = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "🌩️",
  Snow: "❄️",
  Mist: "🌫️",
  Haze: "🌫️",
  Fog: "🌫️"
};

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    if(data.cod !== 200){ 
      alert(data.message); 
      return; 
    }

    const { main, weather, wind, name, coord } = data;

    cityNameEl.textContent = name;
    tempEl.textContent = `${Math.round(main.temp)}°C`;
    descEl.textContent = weather[0].main;
    humEl.textContent = `${main.humidity}%`;
    windEl.textContent = `${wind.speed} km/h`;
    presEl.textContent = `${main.pressure} hPa`;
    weatherIconEl.textContent = ICONS[weather[0].main] || "❓";

    // AQI
    const aqiURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}`;
    const aqiRes = await fetch(aqiURL);
    const aqiData = await aqiRes.json();
    aqiEl.textContent = aqiData.list[0].main.aqi;

  } catch(err) {
    console.error(err);
    alert("Failed to fetch weather data.");
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if(city){ 
    currentCity = city; 
    getWeather(city); 
    cityInput.value = ""; 
  }
});

refreshBtn.addEventListener("click", () => getWeather(currentCity));

getWeather(currentCity);
