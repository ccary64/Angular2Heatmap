import { Injectable } from '@angular/core';
import { GoogleMap } from '../classes/GoogleMap';
import { Point } from '../classes/Point';

@Injectable()
export class GoogleMapService {
  googleMap: GoogleMap;
  resolve;
  overlay;
  isDrawing = true;
  polyOptions = {
    strokeWeight: 2,
    fillOpacity: 0,
    strokeColor: '#FF0000',
    editable: false
  };

  buildMap(apiKey) {
    return new Promise(resolve => {
      this.resolve = resolve;
      window['initMap'] = this.initMap.bind(this);
      const script = document.createElement( 'script' );
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization,drawing,geometry&callback=initMap`;
      document.querySelector('head').appendChild(script);
    });
  }

  initMap() {
    const google = window['google'];

    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 37.775, lng: -122.434},
      mapTypeId: 'satellite'
    });

    const heatmap = new google.maps.visualization.HeatmapLayer({
      map
    });

    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: this.polyOptions,
      map
    });
    drawingManager.setMap(map);

    this.googleMap = new GoogleMap(google, map, heatmap, drawingManager);
    this.resolve();
  }

  isInSide(point: Point) {
    return this.googleMap.google.maps.geometry.poly.containsLocation(
      new this.googleMap.google.maps.LatLng(point.lat, point.long),
      this.overlay
    );
  }

  getPath() {
    return this.overlay.getPath();
  }

  addListener(type, callback) {
    this.googleMap.map.addListener(type, callback);
  }

  getHeatMap(key) {
    return this.googleMap.heatmap.get(key);
  }

  setHeatMap(key, value) {
    this.googleMap.heatmap.set(key, value);
  }

  renderHeatMap(coords) {
    if (this.isDrawing === false) {
      this.googleMap.heatmap.set('data', coords);
    }
  }

  setDrawManager(value) {
    this.googleMap.drawingManager.setMap(value);
  }

  createDrawManagerEventListener(type, callback) {
    this.googleMap.google.maps.event.addListener(this.googleMap.drawingManager, type, callback);
  }

  setDrawManagerMap() {
    this.googleMap.drawingManager.setMap(this.googleMap.map);
  }

  buildPoint(point: Point) {
    return {
      location: new this.googleMap.google.maps.LatLng(point.lat, point.long),
      weight: point.weight
    };
  }

  setOverlay(overlay) {
    this.overlay = overlay;
  }

  clearOverlay() {
    this.overlay.setMap(null);
  }

  getZoom() {
    return this.googleMap.map.getZoom();
  }

  setDrawing(value: boolean) {
    this.isDrawing = value;
  }

  getIsDrawing() {
    return this.isDrawing;
  }
}
