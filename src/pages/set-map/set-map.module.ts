import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SetMapPage } from './set-map';

@NgModule({
  declarations: [
    SetMapPage,
  ],
  imports: [
    IonicPageModule.forChild(SetMapPage),
  ],
  exports: [
    SetMapPage
  ]
})
export class SetMapPageModule {}
