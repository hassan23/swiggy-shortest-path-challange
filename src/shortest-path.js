/***
 * Return the distance between two geo locations locations
 */
getHaversineDistance = (firstLocation, secondLocation) => {
  const earthRadius = 6371; // km

  const diffLat = ((secondLocation.lat - firstLocation.lat) * Math.PI) / 180;
  const diffLng = ((secondLocation.lng - firstLocation.lng) * Math.PI) / 180;

  const arc =
    Math.cos((firstLocation.lat * Math.PI) / 180) *
      Math.cos((secondLocation.lat * Math.PI) / 180) *
      Math.sin(diffLng / 2) *
      Math.sin(diffLng / 2) +
    Math.sin(diffLat / 2) * Math.sin(diffLat / 2);
  const line = 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));

  const distance = earthRadius * line;

  return Math.round(distance);
};

/**
 * Retruns true if the location is visited
 * @param {String} location
 * @param {Array} visited
 */
const isVisited = (location, visited) =>
  visited.filter(loc => loc.id === location).length;

/**
 * return true if the location is not visited or
 * is a customer location whose order is picked from the resturant.
 * @param {*} resturant
 * @param {*} locId
 * @param {*} vistedLocations
 */
const isNotVisitedOrCustomerWhoseOrderPicked = (
  resturant,
  locId,
  vistedLocations
) =>
  (!resturant && !isVisited(locId, vistedLocations)) ||
  (resturant && isVisited(resturant, vistedLocations));

/**
 * Return next optimal Location and its index
 * @param {Object} currentLocation
 * @param {Array} locations
 * @param {Array} visited
 */
const getNextOptimalLocation = (currentLocation, locations, visited) => {
  let minTimeTravel = Infinity;
  let indexToRemove = -1;
  locations.forEach((loc, i) => {
    if (
      isNotVisitedOrCustomerWhoseOrderPicked(loc.orderFrom, loc.id, visited)
    ) {
      const timeBetweenLocations =
        (getHaversineDistance(currentLocation, loc) * 60) / 20; // considring the speed as 20Km per hour and converting them to minuts
      const travelTimeVsWait =
        timeBetweenLocations < loc.waitTime
          ? loc.waitTime
          : timeBetweenLocations;
      if (travelTimeVsWait < minTimeTravel) {
        minTimeTravel = travelTimeVsWait;
        currentLocation = loc;
        indexToRemove = i;
      }
    }
  });
  return [indexToRemove, currentLocation];
};

/**
 * -- Every Location is an Object containing latitude and longitude and an ID
 * -- Resturants(R1,R2) and Cusotomer(C1,C2) Object contains a key called waitTime represents
 *    how long the dilevery Boy has to wait at that location which obviously is ZERO for customers(C1,C2)
 * -- The customer Object has another key called orderFrom represents the particular resturant making the
 *    order for particular customer.
 * -- WaitTime is in minutes and the time to react from one location to other is also in Minutes
 *
 * @param {Object} Aman
 * @param {Object} C1
 * @param {Object} C2
 * @param {Object} R1
 * @param {Object} R2
 */
function shortestPath(Aman, C1, C2, R1, R2) {
  let locations = [R1, R2, C1, C2];
  const visited = [];
  let currentLocation = Aman;
  while (locations.length) {
    const [removeVisited, nextLocation] = getNextOptimalLocation(
      currentLocation,
      locations,
      visited
    );
    currentLocation = nextLocation;

    // removing the visited location
    locations = [
      ...locations.slice(0, removeVisited),
      ...locations.slice(removeVisited + 1)
    ];
    visited.push(currentLocation);
  }
  return [Aman.id, ...visited.map(i => i.id)];
}

/*********************************/
///////////  TESTS ////////////////
/*********************************/

const Aman = { lat: 39.9526, lng: -75.1652, id: 'Aman' };
const R1 = { id: 'R1', lat: 0.7128, lng: -74.006, waitTime: 50 };
const R2 = { id: 'R2', lat: 35.0522, lng: -110.2437, waitTime: 1000000 };
const C1 = {
  id: 'C1',
  lat: 0.7128,
  lng: -7.006,
  waitTime: 0,
  orderFrom: 'R1'
};
const C2 = {
  id: 'C2',
  lat: 35.0522,
  lng: -110.2437,
  waitTime: 0,
  orderFrom: 'R2'
};

console.log(shortestPath(Aman, C1, C2, R1, R2));
