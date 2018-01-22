import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ConversationsPage } from './conversations';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ConversationsPage,
  ],
  imports: [
    IonicPageModule.forChild(ConversationsPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    ConversationsPage
  ]
})
export class ConversationsPageModule { }
