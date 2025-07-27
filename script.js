// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const forecastSection = document.getElementById('forecastSection');
const errorMessage = document.getElementById('errorMessage');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');

// Weather display elements
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const currentTempElement = document.getElementById('currentTemp');
const weatherIconElement = document.getElementById('weatherIcon');
const weatherDescElement = document.getElementById('weatherDesc');
const feelsLikeElement = document.getElementById('feelsLike');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('windSpeed');
const pressureElement = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecastContainer');

// API Key - Replace with your actual OpenWeatherMap API key
const apiKey = '5a903db8137b00c298450af87dfb49b7';
let currentUnit = 'metric'; // Default to Celsius

// Event Listeners
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather();
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'metric') {
        currentUnit = 'metric';
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        // Refresh data with new unit
        if (cityInput.value) fetchWeather();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial';
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        // Refresh data with new unit
        if (cityInput.value) fetchWeather();
    }
});

// Fetch Weather Data
async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    try {
        // Current Weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${apiKey}`;
        const currentResponse = await fetch(currentWeatherUrl);

        if (!currentResponse.ok) {
            showError();
            return;
        }

        const currentData = await currentResponse.json();

        // Forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${apiKey}`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        displayWeather(currentData, forecastData);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError();
    }
}

// Display Weather Data
function displayWeather(currentData, forecastData) {
    // Hide error message if shown
    errorMessage.classList.add('d-none');

    // Set current weather data
    locationElement.textContent = `${currentData.name}, ${currentData.sys.country}`;

    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const temp = Math.round(currentData.main.temp);
    currentTempElement.textContent = `${temp}°${currentUnit === 'metric' ? 'C' : 'F'}`;

    const weather = currentData.weather[0];
    weatherIconElement.innerHTML = getWeatherIcon(weather.id, weather.icon);
    weatherDescElement.textContent = weather.description;

    const feelsLike = Math.round(currentData.main.feels_like);
    feelsLikeElement.textContent = `${feelsLike}°${currentUnit === 'metric' ? 'C' : 'F'}`;

    humidityElement.textContent = `${currentData.main.humidity}%`;

    const windSpeed = currentUnit === 'metric' 
        ? `${Math.round(currentData.wind.speed * 3.6)} km/h` 
        : `${Math.round(currentData.wind.speed)} mph`;
    windSpeedElement.textContent = windSpeed;

    pressureElement.textContent = `${currentData.main.pressure} hPa`;

    // Show weather display
    weatherDisplay.classList.remove('d-none');

    // Set forecast data
    displayForecast(forecastData);
}

// Display Forecast Data
function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';

    // Get daily forecasts (every 24 hours)
    const dailyForecasts = [];
    for (let i = 0; i < forecastData.list.length; i += 8) {
        dailyForecasts.push(forecastData.list[i]);
    }

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const weather = forecast.weather[0];

        const forecastCard = document.createElement('div');
        forecastCard.className = 'col text-center';
        forecastCard.innerHTML = `
            <div class="bg-light p-3 rounded">
                <p class="font-weight-bold">${day}</p>
                <div class="my-3 display-4">${getWeatherIcon(weather.id, weather.icon)}</div>
                <div>
                    <span class="font-weight-bold">${temp}°${currentUnit === 'metric' ? 'C' : 'F'}</span>
                </div>
                <p class="text-muted">${weather.description}</p>
            </div>
        `;

        forecastContainer.appendChild(forecastCard);
    });

    forecastSection.classList.remove('d-none');
}

// Show Error Message
function showError() {
    weatherDisplay.classList.add('d-none');
    forecastSection.classList.add('d-none');
    errorMessage.classList.remove('d-none');
}

// Get Weather Icon
function getWeatherIcon(weatherId, iconCode) {
    // Day or night icon
    const isDay = iconCode.includes('d');

    // Group 2xx: Thunderstorm
    if (weatherId >= 200 && weatherId < 300) {
        return '<i class="fas fa-bolt"></i>';
    }
    // Group 3xx: Drizzle
    else if (weatherId >= 300 && weatherId < 400) {
        return '<i class="fas fa-cloud-rain"></i>';
    }
    // Group 5xx: Rain
    else if (weatherId >= 500 && weatherId < 600) {
        if (weatherId < 504 || weatherId === 511) {
            return '<i class="fas fa-cloud-rain"></i>';
        } else {
            return '<i class="fas fa-cloud-showers-heavy"></i>';
        }
    }
    // Group 6xx: Snow
    else if (weatherId >= 600 && weatherId < 700) {
        return '<i class="far fa-snowflake"></i>';
    }
    // Group 7xx: Atmosphere
    else if (weatherId >= 700 && weatherId < 800) {
        return '<i class="fas fa-smog"></i>';
    }
    // Group 800: Clear
    else if (weatherId === 800) {
        return isDay ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    // Group 80x: Clouds
    else if (weatherId > 800 && weatherId < 900) {
        if (weatherId === 801) {
            return isDay ? '<i class="fas fa-cloud-sun"></i>' : '<i class="fas fa-cloud-moon"></i>';
        } else {
            return '<i class="fas fa-cloud"></i>';
        }
    }
    // Group 90x: Extreme
    else if (weatherId >= 900 && weatherId < 910) {
        return '<i class="fas fa-exclamation-triangle"></i>';
    }
    // Default
    else {
        return '<i class="fas fa-cloud"></i>';
    }
}

// Initialize with a default city
window.addEventListener('load', () => {
    cityInput.value = 'Bengaluru';
    fetchWeather();
});
