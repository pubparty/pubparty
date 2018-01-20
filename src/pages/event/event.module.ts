import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventPage } from './event';
import { IonicImageLoader } from 'ionic-image-loader';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    EventPage,
  ],
  imports: [
    IonicPageModule.forChild(EventPage),
    IonicImageLoader,
    PipesModule
  ],
  exports: [
    EventPage
  ]
})
export class EventPageModule { }
