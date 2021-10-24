var app = angular.module("app", []);
const appid = "b19ce34eca8fe179295d1c07059e607e";
app.controller("WeatherController", [
  "$scope",
  "$http",
  function ($scope, $http) {
    $http.get("data/weather.json").success(function ({ query }) {
      $scope.currentWeather = query.results.channel;
      $scope.forecast = query.results.channel.item.forecast;
    });
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
              var ctx = document.getElementById("myChart").getContext("2d");

              var myChart = new Chart(ctx, {
                type: "bar",
                data: {
                  labels: newValue.map((day) => day.date),
                  datasets: [
                    {
                      label: "High",
                      backgroundColor: "rgba(255, 159, 64, 0.2)",
                      barThickness: "10",
                      borderColor: "rgb(255, 159, 64)",
                      borderWidth: 1,
                      data: newValue.map((day) => day.high),
                    },
                    {
                      label: "Low",
                      barThickness: "10",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgb(54, 162, 235)",
                      borderWidth: 1,
                      data: newValue.map((day) => day.low),
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
                          const dayFound = newValue.filter(
                            (day) => day.date === tooltipItems[0].label
                          )[0];

                          return `${dayFound.day}\n${dayFound.text}`;
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
