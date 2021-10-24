var app = angular.module("app", []);
const appid = "b19ce34eca8fe179295d1c07059e607e";
app.controller("WeatherController", [
  "$scope",
  "$http",
  function ($scope, $http) {
    $scope.pincode = "10012";

    $scope.getWeather = function () {
      $http
        .get(
          `http://api.openweathermap.org/geo/1.0/zip?zip=${$scope.pincode}&appid=${appid}`
        )
        .then(function ({ data }) {
          $scope.getweathererror = null;
          $scope.location = data;
          return $http.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lon}&units=metric&appid=${appid}`
          );
        })
        .then(({ data }) => {
          $scope.tempMax = data.main.temp_max;
          $scope.tempMin = data.main.temp_min;
          $scope.temp = data.main.temp;
          $scope.humidityVal = `${data.main.humidity} %`;
          $scope.pressureVal = `${data.main.pressure} hPa`;
          $scope.condition = data.weather[0].main;
          $scope.windspeedVal = `${data.wind.speed} m/s`;

          return $http.get(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&units=metric&exclude=minutely,hourly,alerts&appid=${appid}`
          );
        })
        .then(({ data }) => {
          $scope.date = moment
            .unix(data.current.dt)
            .tz(data.timezone)
            .format("dddd, LL");
          $scope.sunrise = moment
            .unix(data.current.sunrise)
            .tz(data.timezone)
            .format("LT");
          $scope.sunset = moment
            .unix(data.current.sunset)
            .tz(data.timezone)
            .format("LT");

          // For forecast graph

          const labels = [];
          const maxTemps = [];
          const minTemps = [];
          const dayData = [];
          for (let i of data.daily) {
            const dateLabel = moment.unix(i.dt).tz(data.timezone).format("LL");
            const day = moment.unix(i.dt).tz(data.timezone).format("dddd");
            labels.push(dateLabel);
            maxTemps.push(i.temp.max);
            minTemps.push(i.temp.min);
            dayData.push({
              date: dateLabel,
              condition: i.weather[0],
              day: day,
            });
          }

          $scope.forecast = {
            labels,
            maxTemps,
            minTemps,
            dayData,
          };
        })
        .catch((error) => {
          $scope.getweathererror = error.data.message;
        });
    };

    $scope.getWeather();
  },
]);

app.directive("forecastGraph", [
  function () {
    return {
      restrict: "E",
      scope: {
        forecast: "=",
      },
      template: '<canvas id="myChart"></canvas>',
      link: function (scope, element, attrs) {
        scope.$watchCollection(
          "forecast",
          function (newValue, oldValue) {
            if (newValue) {
              // cleanup charts for reinitialisation
              if (Chart.instances) {
                for (let i in Chart.instances) {
                  Chart.instances[i].destroy();
                }
              }
              var ctx = document.getElementById("myChart").getContext("2d");
              var myChart = new Chart(ctx, {
                type: "bar",
                data: {
                  labels: newValue.labels,
                  datasets: [
                    {
                      label: "High",
                      backgroundColor: "rgba(255, 159, 64, 0.2)",
                      barThickness: "10",
                      borderColor: "rgb(255, 159, 64)",
                      borderWidth: 1,
                      data: newValue.maxTemps,
                    },
                    {
                      label: "Low",
                      barThickness: "10",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgb(54, 162, 235)",
                      borderWidth: 1,
                      data: newValue.minTemps,
                    },
                  ],
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        footer: function (tooltipItems) {
                          const dayFound = newValue.dayData.filter(
                            (day) => day.date === tooltipItems[0].label
                          )[0];
                          return `${dayFound.day}\n${dayFound.condition.main}`;
                        },
                      },
                    },
                  },
                },
              });
            }
          },
          true
        );
      },
    };
  },
]);
