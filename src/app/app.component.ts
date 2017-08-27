import { Component, Inject, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <h1>{{ title }}</h1>
    <div>
      <app-google-map></app-google-map>
    </div>
  </div>
  `,
  styleUrls: ['app.component.css'],
})
export class AppComponent {
  title = 'Google Heat Maps';
}
