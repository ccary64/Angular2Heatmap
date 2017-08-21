import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-google-map',
  template: `
    <div id="map"></div>
    <div class="button-container" >
      <div (click)="changeOpacity()" class="radius fab blue">
        <i class="fa fa-plus-circle icon" aria-hidden="true"></i>
      </div>
      <div (click)="changeGradient()" class="heat fab red">
        <i class="fa fa-fire icon"></i>
      </div>
      <div (click)="toggleDraw()" class="draw fab green">
        <i class="fa fa-pencil icon"></i>
      </div>
    </div>
  `,
  styleUrls: ['./google-map.component.css'],
})
export class GoogleMapComponent implements OnInit {
  zoom = 14;
  grid;
  // The size we are sampling on the map
  gridSize = 0.001;
  // API key for google maps
  apiKey = 'AIzaSyCAJ72gPOW5R9r2tnpSW6uxdMMI__Ei2Oc';
  map;
  heatmap;
  google;
  triangle;
  polygon;
  savedCoords = {};
  // Local Storage from Window
  localStorage = window['localStorage'];
  currentShape = {
    overlay: null,
    coords: [],
    top: null,
    bottom: null,
    left: null,
    right: null
  };
  // Style the polygon
  polyOptions = {
    strokeWeight: 2,
    fillOpacity: 0,
    strokeColor: '#FF0000',
    editable: false
  };
  drawingManager;

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

  constructor() {
    // Load the google map api into the head of the index
    window['initMap'] = this.initMap.bind(this);
    const script = document.createElement( 'script' );
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=visualization,drawing,geometry&callback=initMap`;
    document.querySelector('head').appendChild(script);
   }

   // Callback for google maps -- Needs to be cleaned up
  initMap() {
    this.google = window['google'];
    this.map = new this.google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 37.775, lng: -122.434},
      mapTypeId: 'satellite'
    });

    this.heatmap = new this.google.maps.visualization.HeatmapLayer({
      map: this.map
    });

    this.heatmap.set('radius', this.zoomRadius[this.map.getZoom()]);
    this.heatmap.set('maxIntensity', 300000);
    this.heatmap.set('dissipating', true);

    this.map.addListener('zoom_changed', () => {
      this.heatmap.set('radius', this.zoomRadius[this.map.getZoom()]);
    });

    this.drawingManager = new this.google.maps.drawing.DrawingManager({
      drawingMode: this.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: this.polyOptions,
      map: this.map
    });
    this.drawingManager.setMap(this.map);

    // event listener for polygon
    this.google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      this.currentShape.overlay = event.overlay;

      var polygonBounds = this.currentShape.overlay.getPath();
      this.currentShape.coords = [];
      this.currentShape.top = null;
      this.currentShape.bottom = null;
      this.currentShape.left = null;
      this.currentShape.right = null;
      polygonBounds.forEach((xy, i) => {
        // Get bounds for our shape
        this.currentShape.top = (this.currentShape.top == null || xy.lat() >  this.currentShape.top) ?
          xy.lat() : this.currentShape.top;

        this.currentShape.bottom = (this.currentShape.bottom == null || xy.lat() < this.currentShape.bottom) ?
          xy.lat() : this.currentShape.bottom;

        this.currentShape.left = (this.currentShape.left == null || xy.lng() > this.currentShape.left) ?
          xy.lng() : this.currentShape.left;

        this.currentShape.right = (this.currentShape.right == null || xy.lng() < this.currentShape.right) ?
          xy.lng() : this.currentShape.right;

        this.currentShape.coords.push({lat: xy.lat(), long:xy.lng()})
      });
      this.saveCoords(this.currentShape.coords);
      this.grid = this.getGrid();
      this.buildHeatMap();
      this.drawingManager.setMap(null);
    });
  }

  saveCoords(coords) {
    console.log(coords)
    const fetch = window['fetch'];
    const url = 'http://localhost:3000/heatmaps';
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },  
      body: JSON.stringify({
        username: 'myusername',
        coords: coords
      })
    }).then(response => response.json())
  }

  toggleDraw() {
    if (this.currentShape.overlay != null) {
      this.currentShape.overlay.setMap(null);
    }
    this.heatmap.set('data', []);
    this.drawingManager.setMap(this.map);
  }

  turnOnDraw() {
    this.drawingManager.setMap(this.map);
  }

  turnOffDraw() {
    this.drawingManager.setMap(null);
  }

  buildHeatMap() {
    const coords = [];
    this.grid.rows.forEach(rowPoint => {this.heatmap.set('data', coords);
      let storedLat = localStorage.getItem(rowPoint);
      const rowPromises = [];
      storedLat = (storedLat) ? JSON.parse(storedLat) : {};
      this.grid.columns.forEach(columnPoint => {
        // we created a grid and now we check if it is in the polygon
        const inside = this.google.maps.geometry.poly.containsLocation(
          new this.google.maps.LatLng(rowPoint, columnPoint),
          this.currentShape.overlay
        );
        // Check if the values are already in local storage
        if (storedLat[columnPoint] != null && inside) {
          coords.push(this.buildPoint(rowPoint, columnPoint, storedLat[columnPoint]));
        } else if (inside) {
          // If they are not then pull them and put them in a promise
          rowPromises.push(this.getWeight(rowPoint, columnPoint));
        }
      });
      // We are resolving only a row at a time so the user can see it load
      Promise.all(rowPromises)
        .then((weightedData) => {
          weightedData.forEach(data => {
            coords.push(this.buildPoint(data.lat, data.long, data.weight));
            this.heatmap.set('data', coords);
            this.saveToLocalStorage(data.lat, data.long, data.weight, storedLat);
          });
      });
    });
    this.heatmap.set('data', coords);
  }

  buildPoint(lat, long, weight) {
    return {
      location: new this.google.maps.LatLng(lat, long),
      weight: weight
    };
  }

  saveToLocalStorage(lat, long, weight, storedLat) {
    storedLat[long] = weight;
    this.localStorage.setItem(lat, JSON.stringify(storedLat) );
  }

  getWeight(lat, long) {
    return new Promise((resolve) => {
      const fetch = window['fetch'];
      const url = 'https://www.broadbandmap.gov/broadbandmap/demographic/2014/coordinates?';
      const query = `latitude=${lat}&longitude=${long}&format=json`;
      fetch(url + query)
        .then(response => response.json())
        .then(response => resolve({
          weight: response.Results.medianIncome,
          lat: lat,
          long: long
        }));
    });
  }

  toggleHeatmap() {
    this.heatmap.setMap(this.heatmap.getMap() ? null : this.map);
  }

  changeGradient() {
    const gradient = [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ];
    this.heatmap.set('gradient', this.heatmap.get('gradient') ? null : gradient);
  }

  changeOpacity() {
    this.heatmap.set('opacity', this.heatmap.get('opacity') ? null : 0.2);
  }

  getGrid() {
    const google = this.google;
    const columns = [];
    const rows = [];
    let i = this.currentShape.bottom;
    let j = this.currentShape.right;

    for (i; i < this.currentShape.top; i = i + this.gridSize) {
     rows.push(parseFloat(i.toFixed(3)));
    }

    for (j; j < this.currentShape.left; j = j + this.gridSize) {
     columns.push(parseFloat(j.toFixed(3)));
    }

    return {rows: rows, columns: columns};
  }

  ngOnInit() {
  }

}
