const mainContainer = document.getElementById("content");
const cityNameInput = document.getElementById("city-input");

let cityData = {};
let weatherData = {};
let recentSearchesData = [];

let errorColor = false;

function getCity(city) {
  var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + ",US&appid=05d022c22c687fddb635d7cf8a4c9afb";

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          if (!jQuery.isEmptyObject(data)) {
            cityNameInput.value = "";

            if (errorColor) {
              errorColor = false;
              cityNameInput.style.borderColor = "#808080";
            }
            cityData = data;
            getWeatherData(data[0].lat, data[0].lon);
            saveRecentSearches(data[0].name + ", " + data[0].state);
          } else {
            let instance = tippy(cityNameInput);
            instance.setProps({
              arrow: true,
              placement: "bottom",
              content: "Invalid City!",
              trigger: "none",
              theme: "error",
            });
            instance.show();
            if (!errorColor) {
              cityNameInput.style.borderColor = "#d44d35";
              errorColor = true;
            }
          }
        });
      } else {
        alert("Invalid city!");
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeatherAPI");
    });
}

function getWeatherData(lat, lon) {
  const apiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=minutely,hourly&units=imperial&appid=05d022c22c687fddb635d7cf8a4c9afb";

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          weatherData = data;
          displayCurrentResults();
        });
      } else {
        alert("Error: Can't find weather");
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeatherAPI");
    });
}

function buttonClick(event) {
  const target = event.target;

  if (target.matches("#city-search")) {
    const city = cityNameInput.value.trim();
    if (city) {
      getCity(city);
    }
  }

  if (target.matches(".recent-btn")) {
    const getClickedCity = target.innerHTML;

    getCity(getClickedCity);
  }
}

function saveRecentSearches(city) {
  if (!recentSearchesData.includes(city)) {
    if (recentSearchesData.length >= 5) {
      recentSearchesData.splice(0, 1);
    }
    recentSearchesData.push(city);
    localStorage.setItem("recentSearches", JSON.stringify(recentSearchesData));
    displayRecentButtons();
  }
}

function loadRecentSearches() {
  if (!localStorage.length) {
    return;
  }

  recentSearchesData = JSON.parse(localStorage.getItem("recentSearches"));

  displayRecentButtons();
}

function displayRecentButtons() {
  let reversedData = [...recentSearchesData];
  reversedData.reverse();

  const recentSearchesCont = document.getElementById("recent-searches");

  if (recentSearchesCont) {
    recentSearchesCont.innerHTML = "";
  }

  if (recentSearchesData) {
    recentSearchesCont.className = "recent-searches";
  }

  for (i = 0; i < recentSearchesData.length; i++) {
    const button = document.createElement("button");
    let buttonText = reversedData[i];
    button.type = "submit";
    button.className = "recent-btn";
    button.textContent = buttonText;
    recentSearchesCont.appendChild(button);
  }
}

function displayCurrentResults() {
  $(".results-container").removeClass("hide");
  $(".welcome-screen").addClass("hide");

  const getCityName = document.getElementById("card-title");
  const date = moment.unix(weatherData.current.dt).format("MM/DD/YYYY");

  getCityName.textContent = "Viewing weather for " + cityData[0].name + ", " + cityData[0].state + " (" + date + ")";

  const currentIcon = document.getElementById("current-icon");

  if (currentIcon) {
    currentIcon.innerHTML = "";
  }

  const weatherIconId = weatherData.current.weather[0].icon;

  const img = document.createElement("img");
  img.src = "https://openweathermap.org/img/w/" + weatherIconId + ".png";
  currentIcon.appendChild(img);

  const p = document.createElement("p");
  p.textContent = weatherData.current.weather[0].main;
  currentIcon.appendChild(p);

  const currentForecast = document.getElementById("current-body");

  if (currentForecast) {
    currentForecast.innerHTML = "";
  }

  const currentTemp = document.createElement("h5");
  currentTemp.textContent =
    "H:" +
    Math.round(weatherData.daily[0].feels_like.day) +
    "?? L:" +
    Math.round(weatherData.daily[0].feels_like.night) +
    "??";
  currentForecast.appendChild(currentTemp);

  const currentWind = document.createElement("h5");
  currentWind.textContent = "Wind: " + Math.round(10 * weatherData.current.wind_speed) / 10 + " MPH";
  currentForecast.appendChild(currentWind);

  const currentHumidity = document.createElement("h5");
  currentHumidity.textContent = "Humidity: " + weatherData.current.humidity + "%";
  currentForecast.appendChild(currentHumidity);

  const currentIndex = document.createElement("h5");
  let index = weatherData.current.uvi;
  if (index <= 3) {
    currentIndex.innerHTML = "UV Index: <span class='badge bg-success'>" + index + "</span>";
  } else if (index <= 6) {
    currentIndex.innerHTML = "UV Index: <span class='badge bg-warning'>" + index + "</span>";
  } else {
    currentIndex.innerHTML = "UV Index: <span class='badge bg-danger'>" + index + "</span>";
  }
  currentForecast.appendChild(currentIndex);
  displayFutureForecast();
}

function displayFutureForecast() {
  for (i = 1; i <= 5; i++) {
    const header = document.getElementById("forecast-header-" + i);
    const date = moment.unix(weatherData.daily[i].dt).format("MM/DD/YYYY");
    header.textContent = date;

    const icon = document.getElementById("forecast-icon-" + i);

    if (icon) {
      icon.innerHTML = "";
    }

    const weatherIconId = weatherData.daily[i].weather[0].icon;

    const img = document.createElement("img");
    img.src = "https://openweathermap.org/img/w/" + weatherIconId + ".png";
    icon.appendChild(img);

    const p = document.createElement("p");
    p.textContent = weatherData.daily[i].weather[0].main;
    icon.appendChild(p);

    const body = document.getElementById("forecast-body-" + i);

    if (body) {
      body.innerHTML = "";
    }

    const temp = document.createElement("h5");
    temp.className = "card-text";
    temp.textContent =
      "H:" +
      Math.round(weatherData.daily[i].feels_like.day) +
      "?? L:" +
      Math.round(weatherData.daily[i].feels_like.night) +
      "??";
    body.appendChild(temp);

    const wind = document.createElement("h5");
    wind.className = "card-text";
    wind.textContent = "Wind: " + Math.round(10 * weatherData.daily[i].wind_speed) / 10 + "MPH";
    body.appendChild(wind);

    const humidity = document.createElement("h5");
    humidity.className = "card-text";
    humidity.textContent = "Humidity: " + weatherData.daily[i].humidity + "%";
    body.appendChild(humidity);
  }
}

loadRecentSearches();

mainContainer.addEventListener("click", buttonClick);
