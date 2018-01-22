import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ViewGroupPage } from './view-group';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ViewGroupPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewGroupPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    ViewGroupPage
  ]
})
export class ViewGroupPageModule { }
