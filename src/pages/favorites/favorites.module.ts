import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FavoritesPage } from './favorites';
import { PipesModule } from './../../pipes/pipes.module';
import { ComponentsModule } from './../../components/components.module';

@NgModule({
  declarations: [
    FavoritesPage,
  ],
  imports: [
    IonicPageModule.forChild(FavoritesPage),
    PipesModule,
    ComponentsModule
  ],
  exports: [
    FavoritesPage
  ]
})
export class FavoritesPageModule { }
