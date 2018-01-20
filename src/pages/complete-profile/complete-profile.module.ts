import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CompleteProfilePage } from './complete-profile';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    CompleteProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(CompleteProfilePage),
    TranslateModule.forChild(),
    IonicImageLoader
  ],
  exports: [
    CompleteProfilePage
  ]
})
export class CompleteProfileModule { }
