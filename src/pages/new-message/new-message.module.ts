import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NewMessagePage } from './new-message';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    NewMessagePage,
  ],
  imports: [
    IonicPageModule.forChild(NewMessagePage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    NewMessagePage
  ]
})
export class NewMessagePageModule { }
