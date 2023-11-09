'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const deleteAllButton = document.querySelector('.button-deleteAll');

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//1. Getting Current Position

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      console.log(`Your current location is ${latitude} and ${longitude}`);

      const coords = [latitude, longitude];

      const map = L.map('map').setView(coords, 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(coords)
        .addTo(map)
        .bindPopup('A pretty CSS popup.<br> Easily customizable.')
        .openPopup();

      map.on('click', function (mapEvent) {
        const { lat, lng } = mapEvent.latlng;
        console.log(`You clicked on ${lat} and ${lng}`);
      });
    },
    function () {
      alert("Mapty won't work without your location");
    }
  );
