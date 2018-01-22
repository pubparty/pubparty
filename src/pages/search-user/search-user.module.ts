import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SearchUserPage } from './search-user';
import { PipesModule } from './../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    SearchUserPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchUserPage),
    TranslateModule.forChild(),
    PipesModule,
    IonicImageLoader
  ],
  exports: [
    SearchUserPage
  ]
})
export class SearchUserPageModule { }
