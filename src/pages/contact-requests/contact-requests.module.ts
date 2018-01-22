import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ContactRequestsPage } from './contact-requests';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ContactRequestsPage,
  ],
  imports: [
    IonicPageModule.forChild(ContactRequestsPage),
    TranslateModule.forChild(),
    IonicImageLoader
  ],
  exports: [
    ContactRequestsPage
  ]
})
export class ContactRequestsPageModule { }
