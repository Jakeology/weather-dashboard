var searchButton = document.getElementById("city-search");
var cityNameInput = document.getElementById("city-input");

function getCity(city) {
  var apiUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" + city + ",US&appid=05d022c22c687fddb635d7cf8a4c9afb";

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          getWeatherData(data[0].lat, data[0].lon);
          //TODO REMOVE CONSOLE LOG
          console.log(data);
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
          console.log(data);
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

searchButton.addEventListener("click", searchHandler);
