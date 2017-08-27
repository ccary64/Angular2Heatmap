export class Point {
  lat: number;
  long: number;
  weight: number;
  constructor (lat, long, weight) {
    this.lat = lat;
    this.long = long;
    this.weight = weight;
  }

  getWeight() {
    return new Promise((resolve) => {
      const fetch = window['fetch'];
      const url = 'https://www.broadbandmap.gov/broadbandmap/demographic/2014/coordinates?';
      const query = `latitude=${this.lat}&longitude=${this.long}&format=json`;
      fetch(url + query)
        .then(response => response.json())
        .then(response => {
          this.weight = response.Results.medianIncome;
          resolve(this);
        });
    });
  }
}
