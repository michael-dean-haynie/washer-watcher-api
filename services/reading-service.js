'use strict';

class ReadingService {
  // sorting maintained upon insert by timestamp, desc
  #readings = [];
  #subscribers = [];

  get readings() {
    return this.#readings;
  }

  deleteReadings() {
    this.#readings = [];
    this.#publishFullUpdate();
  }

  insertReadings(readings){
    this.#applyTimestamps(readings, Date.now());
    readings.forEach((reading) => this.readings.push(reading));
    this.#sortReadings();
    this.#publishIncrementalUpdate();
  }

  #applyTimestamp(reading, requestDate){
    reading.timestamp = new Date(requestDate - reading.msOffset).toISOString();
    delete reading.msOffset;
  }

  #applyTimestamps(readings, requestDate) {
    readings.map(reading => this.#applyTimestamp(reading, requestDate));
  }

  subscribe(action) {
    this.#subscribers.push({ action });
    const newSub = this.#subscribers[this.#subscribers.length -1];
    this.#publishFullUpdate([newSub]);
  }


  // sorts readings by timestamp asc
  #sortReadings() {
    this.#readings.sort((r1, r2) => {
      return (r1.timestamp < r2.timestamp) ? -1 : ((r1.timestamp < r2.timestamp) ? 1 : 0);
    });
  }

  #publishIncrementalUpdate(subscribers) {
    const subs = subscribers || this.#subscribers;
    subs.forEach(subscriber => {
      let firstNewReadingIndex = 0;
      if (subscriber.lastTimestamp) {
        console.log('subscriber.lastTimestamp', subscriber.lastTimestamp)
        firstNewReadingIndex = this.readings
          .map(reading => reading.timestamp)
          .lastIndexOf(subscriber.lastTimestamp) + 1;
      }

      const newReadings = this.readings.slice(firstNewReadingIndex);
      if (newReadings.length) {
        subscriber.action({
          updateType: 'incremental',
          readings: newReadings
        });

        subscriber.lastTimestamp = newReadings[newReadings.length - 1].timestamp;
      }
    });
  }

  #publishFullUpdate(subscribers) {
    const subs = subscribers || this.#subscribers;
    subs.forEach(subscriber => {
      subscriber.action({
        updateType: 'full',
        readings: this.readings
      });

      const readingsLength = this.readings.length;
      subscriber.lastTimestamp = readingsLength
        ? this.readings[readingsLength - 1].timestamp
        : 0;
    });
  }

}

module.exports = ReadingService;