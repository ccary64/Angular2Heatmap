import { Point } from './Point';

export class Shape {
  top: number;
  bottom: number;
  left: number;
  right: number;
  cords: Array<Point> = [];

  getBounds(polygonBounds) {
    return new Promise(resolve => {
      polygonBounds.forEach((xy, i) => {
        const point = new Point(xy.lat(), xy.lng(), null);
        // Get the most northern point in our heatmap
        this.top = (this.top == null || point.lat > this.top) ?
          point.lat : this.top;
        // Get the most Southern point in our heatmap
        this.bottom = (this.bottom == null || point.lat < this.bottom) ?
          point.lat : this.bottom;
        // Get the most westerly point in our heatmap
        this.left = (this.left == null || point.long > this.left) ?
          point.long : this.left;
        // Get the most easterly point in our heatmap
        this.right = (this.right == null || point.long < this.right) ?
          point.long : this.right;
        // Save the coordinates as an ordered list so we can recreate them
        this.cords.push(point);
      });
      resolve();
    });
  }

  saveCords() {
    const fetch = window['fetch'];
    const url = 'http://localhost:3000/heatmaps';
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'myusername',
        coords: this.cords
      })
    });
  }
};
