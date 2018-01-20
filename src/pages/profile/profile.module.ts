import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProfilePage } from './profile';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePage),
    TranslateModule.forChild(),
    IonicImageLoader
  ],
})
export class ProfilePageModule { }
