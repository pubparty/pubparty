import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ViewContactsPage } from './view-contacts';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ViewContactsPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewContactsPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    ViewContactsPage
  ]
})
export class ViewContactsPageModule { }
