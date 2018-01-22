import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ViewMembersPage } from './view-members';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ViewMembersPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewMembersPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    ViewMembersPage
  ]
})
export class ViewMembersPageModule { }
