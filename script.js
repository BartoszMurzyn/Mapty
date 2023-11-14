'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const deleteAllButton = document.querySelector('.button-deleteAll');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Workout {
  id = (Date.now() + '').slice(-10);
  date = new Date();
  constructor(coords, distance, duration) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
  _workoutDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDay()}`;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this._calcPace();
    this._workoutDescription();
  }
  _calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this._workoutDescription();
    this._calcSpeed();
  }

  _calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Application {
  map;
  mapEvent;
  workouts = [];
  markers = [];
  constructor() {
    this._getLocalStorage();
    console.log(this.workouts);
    this._getPosition();
    inputType.addEventListener('change', this._toggleElevationField);
    form.addEventListener('submit', this._newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));
    deleteAllButton.addEventListener('click', this.reset);
    containerWorkouts.addEventListener('click', this._deleteWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._editWorkout.bind(this));
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Mapty won't work without your location");
        }
      );
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    console.log(`Your current location is ${latitude} and ${longitude}`);

    const coords = [latitude, longitude];

    this.map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.workouts.forEach(workout => this._renderWorkoutMarker(workout));
    this.map.on('click', this._showForm.bind(this));
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _showForm(mapE) {
    this.mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.mapEvent.latlng;
    let workout;

    console.log(type);

    //check if data is valid

    //if running, new run object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('All data have to be numbers and positive');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //if cycling, new cycle object
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      )
        return alert('All data have to be numbers and positive');

      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }
    this.workouts.push(workout);
    this._renderWorkoutMarker(workout);

    this._renderWorkout(workout);
    this._hideForm();

    this._setLocalStorage();
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <div class = 'buttons'>
    <button class = 'btn-delete'> Delete</button>
    <button class = 'btn-edit'> Edit</button>
    </div>
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴🏼'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details">

      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }
    if (workout.type === 'cycling') {
      html += `<div class="workout__details">

      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
    deleteAllButton.classList.remove('btn-hidden');
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _renderWorkoutMarker(workout) {
    // console.log(`You clicked on ${lat} and ${lng}`);
    const marker = L.marker(workout.coords)
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 150,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup();

    this.markers.push(marker);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  _moveToWorkout(e) {
    const workoutElement = e.target.closest('.workout');
    console.log(workoutElement);
    if (!workoutElement) return;
    const workout = this.workouts.find(
      workout => workout.id === workoutElement.dataset.id
    );

    this.map.setView(workout.coords, 13, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.workouts));
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;

    this._restoreClasses(data);
    this.workouts = data;
    this.workouts.forEach(workout => this._renderWorkout(workout));
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  _deleteWorkout(e) {
    //deleting workout
    this.workoutElement = e.target.closest('.workout');
    const workoutID = e.target.closest('.workout').dataset.id;
    if (e.target.classList.contains('btn-delete')) {
      console.log('About to delete', workoutID);
      const workoutToDelete = this.workouts.find(work => work.id === workoutID);
      const indexDeleteWorkout = this.workouts.indexOf(workoutToDelete);

      this.workoutElement.remove();
      localStorage.removeItem(`${workoutToDelete.id}`);
      this.workouts.splice(indexDeleteWorkout, 1);
      this._setLocalStorage();

      //deleting workouts marker

      this._deleteWorkoutMarker(indexDeleteWorkout);
    }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _deleteWorkoutMarker(workoutIndex) {
    this.markers.forEach((value, index) => {
      if (index === workoutIndex) {
        console.log('This marker');
        this.map.removeLayer(value);
      }
    });
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _restoreClasses(data) {
    data.forEach((workout, index) => {
      data[index] =
        workout.type === 'running'
          ? new Running(
              workout.coords,
              workout.distance,
              workout.duration,
              workout.cadence
            )
          : new Cycling(
              workout.coords,
              workout.distance,
              workout.duration,
              workout.elevationGain
            );
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _editWorkout(e) {
    if (!this.workoutElement) return;
    if (e.target.classList.contains('btn-edit')) {
      this.workoutElement = e.target.closest('.workout');
      const workoutID = e.target.closest('.workout').dataset.id;
      console.log(workoutID);
      const workoutToEdit = this.workouts.find(work => work.id === workoutID);

      form.classList.toggle('hidden');

      workoutToEdit.distance = +inputDistance.value;
      workoutToEdit.duration = +inputDuration.value;
      workoutToEdit.cadence = +inputCadence.value;
      workoutToEdit.elevationGain = +inputElevation.value;
      workoutToEdit.type = inputType.value;
      this.coords = workoutToEdit.coords;

      const editedWorkouts = this.workouts.filter(
        value => value.distance !== 0 || value.duration !== 0
      );
      this.workouts = editedWorkouts;

      this.workoutElement.remove();
      this._deleteWorkoutMarker();
      console.log('You will edit this workout');
    }
  }
}

const app = new Application();
