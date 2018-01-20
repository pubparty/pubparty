import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { EventComponent } from './event/event';
import { EventRequestComponent } from './event-request/event-request';
import { IonicImageLoader } from 'ionic-image-loader';
import { PipesModule } from './../pipes/pipes.module';

@NgModule({
  declarations: [
    EventComponent,
    EventRequestComponent
  ],
  imports: [
    IonicModule,
    IonicImageLoader,
    PipesModule
  ],
  exports: [
    EventComponent,
    EventRequestComponent
  ]
})

export class ComponentsModule { }
