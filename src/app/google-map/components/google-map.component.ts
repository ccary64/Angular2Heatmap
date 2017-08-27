import { Component, OnInit, Input } from '@angular/core';
import { GoogleMapService } from '../services/google-map.service';
import { Bounds } from '../classes/Bounds';
import { MapConfig } from '../classes/MapConfig';
import { Shape } from '../classes/Shape';
import { Point } from '../classes/Point';

@Component({
  selector: 'app-google-map',
  template: `
    <div id="map"></div>
    <app-google-buttons></app-google-buttons>
  `,
  styleUrls: ['../css/google-map.component.css'],
})
export class GoogleMapComponent implements OnInit {
  mapConfig: MapConfig;
  currentShape: Shape;

  localStorage = window['localStorage'];

  // This is so as we zoom in and out, we compensate for the radius size
  zoomRadius = {
    20: 1280,
    19: 640,
    18: 320,
    17: 160,
    16: 80,
    15: 40,
    14: 20,
    13: 10,
    12: 5,
    11: 2.5,
    10: 1.75,
    9: 0.75
  };

  constructor(private googleMapService: GoogleMapService) {
  }

  ngOnInit(): void {
    // Load the Api key to render the map
    this.mapConfig = new MapConfig();
    // Build map with google service
    this.googleMapService.buildMap(this.mapConfig.apiKey)
    .then(() => {
      // Once the google map is rendered, we can config our viz layers
      this.initHeatMap();
      this.initDrawingManager();
    });
  }

  initHeatMap() {
    this.googleMapService.setHeatMap('radius', 10);
    this.googleMapService.setHeatMap('maxIntensity', 300000);
    this.googleMapService.setHeatMap('dissipating', true);
    // Event listener when zoom is changed to fix the heat map radius
    this.googleMapService.addListener('zoom_changed', () => {
      this.googleMapService.setHeatMap('radius', this.zoomRadius[this.googleMapService.getZoom()]);
    });
  }

  initDrawingManager() {
    // Event listener when shape is drawn on the map
    this.googleMapService.createDrawManagerEventListener('overlaycomplete', (event) => {
      this.googleMapService.setDrawing(false);
      this.googleMapService.setOverlay(event.overlay);
      this.googleMapService.setDrawManager(null);
      // Get the coordinates from Google APIconsole
      const polygonBounds = this.googleMapService.getPath();
      // Grab the top, bottom, left and right limits of our shape as well as the coordinates
      const currentShape = new Shape();
      currentShape.getBounds(polygonBounds)
        .then(() => {
          // save the coordinates to our backend
          currentShape.saveCords();
          this.buildHeatMap(currentShape);
      });
    });
  }

  buildHeatMap(polygon: Shape) {
    // create a grid based on our grid size for the heatmap
    const grid = new Bounds(polygon, this.mapConfig.gridSize);
    const coords = [];
    grid.rows.forEach(rowPoint => {
      // We stored the previusly viewed points by latitude
      let storedLat = localStorage.getItem(rowPoint.toString());
      const rowPromises = [];
      storedLat = (storedLat) ? JSON.parse(storedLat) : {};
      grid.columns.forEach(columnPoint => {
        const point = new Point(rowPoint, columnPoint, null);

        // we created a grid and now we check if it is in the polygon
        const inside = this.googleMapService.isInSide(point);

        // Check if the values are already in local storage
        if (storedLat[columnPoint] != null && inside && !this.googleMapService.getIsDrawing()) {
          point.weight = parseFloat(storedLat[point.long]);
          coords.push(this.googleMapService.buildPoint(point));
        } else if (inside && !this.googleMapService.getIsDrawing()) {
          // If they are not then pull them and put them in a promise
          rowPromises.push(point.getWeight());
        }
      });
      // We are resolving only a row at a time so the user can see it load
      Promise.all(rowPromises)
        .then((weightedPoints: Array<Point>) => {
          weightedPoints.forEach(dataPoint => {
              coords.push(this.googleMapService.buildPoint(dataPoint));
              this.saveToLocalStorage(dataPoint, storedLat);
          });
          // If we are using api we want to load by row so that they see it load rather then wait
          this.googleMapService.renderHeatMap(coords);
      });
    });
    // If we are using local storage we want to render when all of them are loaded
    this.googleMapService.renderHeatMap(coords);
  }

  saveToLocalStorage(point: Point, storedLat) {
    storedLat[point.long] = point.weight;
    this.localStorage.setItem(point.lat.toString(), JSON.stringify(storedLat) );
  }
}
