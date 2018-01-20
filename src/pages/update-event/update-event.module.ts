import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateEventPage } from './update-event';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    UpdateEventPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateEventPage),
    IonicImageLoader
  ],
  exports: [
    UpdateEventPage
  ]
})
export class UpdateEventPageModule { }
