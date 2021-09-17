'use strict';

class ReadingService {
  // sorting maintained upon insert by timestamp, desc
  #readings = [];

  get readings() {
    return this.#readings;
  }

  insertReading(reading) {
    this.readings.push(reading);
    this.#sortReadings();
  }

  insertReadings(readings){
    this.#applyTimestamps(readings, Date.now());
    readings.forEach(this.insertReading, this);
  }

  #applyTimestamp(reading, requestDate){
    reading.timestamp = new Date(requestDate - reading.msOffset).toISOString();
    delete reading.msOffset;
  }

  #applyTimestamps(readings, requestDate) {
    readings.map(reading => this.#applyTimestamp(reading, requestDate));
  }


  // sorts readings by timestamp desc
  #sortReadings() {
    this.#readings.sort((r1, r2) => {
      return (r1.timestamp > r2.timestamp) ? -1 : ((r1.timestamp < r2.timestamp) ? 1 : 0);
    });
  }



}

module.exports = ReadingService;