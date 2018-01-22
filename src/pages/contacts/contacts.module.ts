import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactsPage } from './contacts';
import { PipesModule } from './../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ContactsPage,
  ],
  imports: [
    IonicPageModule.forChild(ContactsPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    ContactsPage
  ]
})
export class ContactsPageModule { }
