import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewRequestsPage } from './view-requests';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ViewRequestsPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewRequestsPage),
    IonicImageLoader
  ],
  exports: [
    ViewRequestsPage
  ]
})
export class ViewRequestsPageModule { }
