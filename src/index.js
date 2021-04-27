import './css/base.scss';


import User from './user.js';
import dataHandler from './dataHandler.js';
import domUpdates from './domUpdates.js';

let welcome = document.querySelector('#welcome');
let dateInput = document.querySelector('#dateInput');
let durationInput = document.querySelector('#durationInput');
let guestAmount = document.querySelector('#travelersAmountInput');
let destinationSelection = document.querySelector('#destinationSelection');
let checkPriceBtn = document.querySelector('#checkPrice');
let bookTripBtn = document.querySelector('#bookTrip');



let user, allTrips, allDestinations, today;

window.onload = onStartup();

checkPriceBtn.addEventListener('click', checkPrice);
bookTripBtn.addEventListener('click', bookTrip);

function onStartup() {
  setMinDate();
  dataHandler.getAllDestinations().then(result => {
    allDestinations = result
    domUpdates.populateDestinationSelect(allDestinations);
  });
  dataHandler.getSingleTraveler(30) //have to pass in argument based on login in iteration3
    .then(result => {
      user = new User(result);
    })
    .then(() => dataHandler.getAllTrips())
    .then(result => {
      allTrips = result
      user.returnUsersTrips(result, allDestinations);
      user.returnTotalSpent(today.split('-')[0], allDestinations);
    })
}

function setMinDate() {
  let currentTime = new Date();
  today = currentTime.toISOString().substring(0, 10);
  dateInput.setAttribute("min", today);
}

function checkPrice() {
  let date = dateInput.value.split('-').join('/')
  if (dateInput.value && durationInput.value && guestAmount.value && destinationSelection.value) {
    event.preventDefault();
    let specificLocation = allDestinations.destinations.find(destination => destination.id === Number(destinationSelection.value))
    let totalBeforeFee = ((guestAmount.value * specificLocation.estimatedFlightCostPerPerson) +
      (durationInput.value * specificLocation.estimatedLodgingCostPerDay))
    let totalAfterFee = totalBeforeFee + (totalBeforeFee * .1)
    domUpdates.displayTripCost(totalAfterFee)
  }
}

function bookTrip() {
  let date = dateInput.value.split('-').join('/')
  if (dateInput.value && durationInput.value && guestAmount.value && destinationSelection.value) {
    event.preventDefault();
    postNewTrip(date)
  }
}

function postNewTrip(date) {
  fetch("http://localhost:3001/api/v1/trips", {
      method: 'POST',
      body: JSON.stringify({
        "id": allTrips.trips.length + 1,
        "userID": user.id,
        "destinationID": Number(destinationSelection.value),
        "travelers": guestAmount.value,
        "date": date,
        "duration": durationInput.value,
        "status": "pending",
        "suggestedActivities": []
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      user.trips.push(data)
      allTrips.trips.push(data);
    })
    .then(alert("Trip has been booked and is currently pending."))
    .catch(err => console.log(`POST Error: ${err.message}`))
  dataHandler.getAllTrips().then(result => {
    user.returnUsersTrips(result, allDestinations);
    user.returnTotalSpent(today.split('-')[0], allDestinations);
  });
}
