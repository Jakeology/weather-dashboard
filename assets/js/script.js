var searchButton = document.getElementById("city-search");
var cityNameInput = document.getElementById("city-input");

var cityData = {};
var weatherData = {};
var recentSearchesData = [];

function getCity(city) {
  var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + ",US&appid=05d022c22c687fddb635d7cf8a4c9afb";

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          cityData = data;
          getWeatherData(data[0].lat, data[0].lon);
          saveRecentSearches(data[0].name + ", " + data[0].state);
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
  var apiUrl =
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

function searchHandler(event) {
  event.preventDefault();
  // get value from input element
  var city = cityNameInput.value.trim();

  if (city) {
    getCity(city);
    cityNameInput.value = "";
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

var loadRecentSearches = function () {
    if (!localStorage.length) {
      return;
    }
  
    recentSearchesData = JSON.parse(localStorage.getItem("recentSearches"));
    displayRecentButtons();
  };

function displayRecentButtons() {
  var reversedData = [...recentSearchesData];
  reversedData.reverse();

  var recentSearchesCont = document.getElementById("recent-searches");
  if (recentSearchesCont) {
    recentSearchesCont.innerHTML = "";
  }
  for (var i = 0; i < recentSearchesData.length; i++) {
    var button = document.createElement("button");
    var buttonText = reversedData[i];
    button.type = "submit";
    button.className = "recent-btn";
    button.textContent = buttonText;
    recentSearchesCont.appendChild(button);
  }
}

function displayCurrentResults() {
  $(".results-container").removeClass("hide");

  var getCityName = document.getElementById("card-title");
  var date = moment.unix(weatherData.current.dt).format("MM/DD/YYYY");

  getCityName.textContent = "Viewing weather for " + cityData[0].name + ", " + cityData[0].state + " " + date;

  var currentIcon = document.getElementById("current-icon");

  if (currentIcon) {
    currentIcon.innerHTML = "";
  }

  var weatherIconId = weatherData.current.weather[0].icon;

  var img = document.createElement("img");
  img.src = "http://openweathermap.org/img/w/" + weatherIconId + ".png";
  currentIcon.appendChild(img);

  var currentForecast = document.getElementById("current-body");

  if (currentForecast) {
    currentForecast.innerHTML = "";
  }

  var currentTemp = document.createElement("h5");
  currentTemp.textContent =
    "H:" +
    Math.round(weatherData.daily[0].feels_like.day) +
    "° L:" +
    Math.round(weatherData.daily[0].feels_like.night) +
    "°";
  currentForecast.appendChild(currentTemp);

  var currentWind = document.createElement("h5");
  currentWind.textContent = "Wind: " + Math.round(10 * weatherData.current.wind_speed) / 10 + " MPH";
  currentForecast.appendChild(currentWind);

  var currentHumidity = document.createElement("h5");
  currentHumidity.textContent = "Humidity: " + weatherData.current.humidity + "%";
  currentForecast.appendChild(currentHumidity);

  var currentIndex = document.createElement("h5");
  var index = weatherData.current.uvi;
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
  for (var i = 1; i <= 5; i++) {
    var header = document.getElementById("forecast-header-" + i);
    var date = moment.unix(weatherData.daily[i].dt).format("MM/DD/YYYY");
    header.textContent = date;

    var icon = document.getElementById("forecast-icon-" + i);

    if (icon) {
      icon.innerHTML = "";
    }

    var weatherIconId = weatherData.daily[i].weather[0].icon;

    var img = document.createElement("img");
    img.src = "http://openweathermap.org/img/w/" + weatherIconId + ".png";
    icon.appendChild(img);

    var p = document.createElement("p");
    p.textContent = weatherData.daily[i].weather[0].main;
    icon.appendChild(p);

    var body = document.getElementById("forecast-body-" + i);

    if (body) {
      body.innerHTML = "";
    }

    var temp = document.createElement("h5");
    temp.className = "card-text";
    temp.textContent =
      "H:" +
      Math.round(weatherData.daily[i].feels_like.day) +
      "° L:" +
      Math.round(weatherData.daily[i].feels_like.night) +
      "°";
    body.appendChild(temp);

    var wind = document.createElement("h5");
    wind.className = "card-text";
    wind.textContent = "Wind: " + Math.round(10 * weatherData.daily[i].wind_speed) / 10 + "MPH";
    body.appendChild(wind);

    var humidity = document.createElement("h5");
    humidity.className = "card-text";
    humidity.textContent = "Humidity: " + weatherData.daily[i].humidity + "%";
    body.appendChild(humidity);
  }
}

loadRecentSearches();

searchButton.addEventListener("click", searchHandler);
