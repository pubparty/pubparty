import { Injectable } from '@angular/core';
import { LoadingController, Loading } from 'ionic-angular';
import { LoadingConfig } from '../configs/loading-config';

@Injectable()
export class LoadingProvider {
  private loading: Loading;

  constructor(private loadingCtrl: LoadingController) {
    console.log("Initializing Loading Provider");
  }

  public show(): void {
    if (!this.loading) {
      let options = LoadingConfig.options;
      this.loading = this.loadingCtrl.create(options);
      this.loading.present();
    }
  }

  public hide(): void {
    if (this.loading) {
      this.loading.dismiss();
      this.loading = null;
    }
  }

}
