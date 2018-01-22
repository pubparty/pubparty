import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { GroupsPage } from './groups';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    GroupsPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupsPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    GroupsPage
  ]
})
export class GroupsPageModule { }
