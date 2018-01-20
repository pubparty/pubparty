import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitePeoplePage } from './invite-people';
import { IonicImageLoader } from 'ionic-image-loader';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    InvitePeoplePage,
  ],
  imports: [
    IonicPageModule.forChild(InvitePeoplePage),
    IonicImageLoader,
    PipesModule
  ],
  exports: [
    InvitePeoplePage
  ]
})
export class InvitePeoplePageModule { }
