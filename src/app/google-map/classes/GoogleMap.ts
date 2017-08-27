export class GoogleMap {
  map: any;
  heatmap: any;
  google: any;
  drawingManager: any;
  constructor(google, map, heatmap, drawingManager) {
    this.google = google;
    this.map = map;
    this.heatmap = heatmap;
    this.drawingManager = drawingManager;
  }
};
