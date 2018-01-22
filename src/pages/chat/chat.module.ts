import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from './../../pipes/pipes.module';
import { ChatPage } from './chat';
import { ElasticModule } from 'ng-elastic';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    TranslateModule.forChild(),
    PipesModule,
    ElasticModule,
    IonicImageLoader
  ],
  exports: [
    ChatPage
  ]
})
export class ChatPageModule { }
