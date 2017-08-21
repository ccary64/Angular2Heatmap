import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>{{ title }}</h1>
    <app-google-map></app-google-map>
  </div>
  `,
  styleUrls: ['app.component.css'],
})
export class AppComponent {
  title = 'Google Heat Maps';
}
