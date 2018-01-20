import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddEventPage } from './add-event';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    AddEventPage,
  ],
  imports: [
    IonicPageModule.forChild(AddEventPage),
    IonicImageLoader
  ],
  exports: [
    AddEventPage
  ]
})
export class AddEventPageModule { }
