import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewProfilePage } from './view-profile';
import { IonicImageLoader } from 'ionic-image-loader';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    ViewProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ViewProfilePage),
    IonicImageLoader,
    PipesModule
  ],
  exports: [
    ViewProfilePage
  ]
})
export class ViewProfilePageModule { }
