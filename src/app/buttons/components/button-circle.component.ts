import { Component, OnInit, Input } from '@angular/core';
import { Button } from '../classes/Button';

@Component({
  selector: 'app-button-circle',
  template: `
      <div (click)="settings.onClick()" class="{{settings.type}} {{settings.color}} fab">
        <i class="fa {{settings.icon}} icon" aria-hidden="true"></i>
      </div>
  `,
  styleUrls: ['../css/button-circle.component.css'],
})
export class ButtonCircleComponent implements OnInit {

  @Input() settings: Button;

  ngOnInit(): void {
  }
}
