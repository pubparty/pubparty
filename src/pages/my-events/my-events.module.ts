import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyEventsPage } from './my-events';
import { IonicImageLoader } from 'ionic-image-loader';
import { ComponentsModule } from './../../components/components.module';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    MyEventsPage,
  ],
  imports: [
    IonicPageModule.forChild(MyEventsPage),
    IonicImageLoader,
    ComponentsModule,
    PipesModule
  ],
})
export class MyEventsPageModule { }
