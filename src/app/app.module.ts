import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { GoogleMapComponent } from './google-map/components/google-map.component';
import { GoogleButtonsComponent} from './google-map/components/google-buttons.component';
import { ButtonCircleComponent } from './buttons/components/button-circle.component';
import { GoogleMapService } from './google-map/services/google-map.service';




@NgModule({
  declarations: [
    AppComponent,
    GoogleMapComponent,
    GoogleButtonsComponent,
    ButtonCircleComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [GoogleMapService],
  bootstrap: [AppComponent]
})
export class AppModule { }
