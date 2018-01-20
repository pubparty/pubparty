import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { IonicImageLoader } from 'ionic-image-loader';
import { ComponentsModule } from './../../components/components.module';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    IonicImageLoader,
    ComponentsModule,
    PipesModule
  ],
})
export class HomePageModule { }
