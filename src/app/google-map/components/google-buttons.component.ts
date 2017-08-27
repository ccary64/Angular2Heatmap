import { Component, OnInit, Input, Output } from '@angular/core';
import { GoogleMapService } from '../services/google-map.service';
import { Point } from '../classes/Point';
import { Shape } from '../classes/Shape';
import { Button } from '../../buttons/classes/Button';

@Component({
  selector: 'app-google-buttons',
  template: `
    <div class="button-container" *ngFor="let button of buttons" >
      <app-button-circle [settings]="button"></app-button-circle>
    </div>
  `,
  styleUrls: ['../css/google-buttons.component.css'],
})
export class GoogleButtonsComponent implements OnInit {

  opacityButton: Button = {
    type: 'radius',
    color: 'blue',
    icon: 'fa-plus-circle',
    onClick: this.changeOpacity.bind(this)
  };

  gradiantButton: Button = {
    type: 'heat',
    color: 'red',
    icon: 'fa-fire',
    onClick: this.changeGradient.bind(this)
  };

  drawButton: Button = {
    type: 'draw',
    color: 'green',
    icon: 'fa-pencil',
    onClick:  this.toggleDraw.bind(this)
  };

  buttons = [
    this.opacityButton,
    this.gradiantButton,
    this.drawButton
  ];

  gradient = [
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

  constructor(private googleMapService: GoogleMapService) {
  }

  ngOnInit(): void {
  }

  changeOpacity() {
    this.googleMapService.setHeatMap('opacity', this.googleMapService.getHeatMap('opacity') ? null : 0.2);
  }

  toggleDraw() {
    this.googleMapService.setDrawing(true);
    this.googleMapService.clearOverlay();
    this.googleMapService.setHeatMap('data', []);
    this.googleMapService.setDrawManagerMap();
  }

  changeGradient() {
    this.googleMapService.setHeatMap('gradient', this.googleMapService.getHeatMap('gradient') ? null : this.gradient);
  }

}
