import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PartyRequestsPage } from './party-requests';
import { ComponentsModule } from './../../components/components.module';

@NgModule({
  declarations: [
    PartyRequestsPage,
  ],
  imports: [
    IonicPageModule.forChild(PartyRequestsPage),
    ComponentsModule
  ],
  exports: [
    PartyRequestsPage
  ]
})
export class PartyRequestsPageModule {}
