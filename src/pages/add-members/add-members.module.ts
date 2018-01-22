import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { AddMembersPage } from './add-members';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    AddMembersPage,
  ],
  imports: [
    IonicPageModule.forChild(AddMembersPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    AddMembersPage
  ]
})
export class AddMembersPageModule { }
