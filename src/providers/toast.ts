import { Injectable } from '@angular/core';
import { ToastController, Toast } from 'ionic-angular';
import { ToastConfig } from '../configs/toast-config';
import { TranslateProvider } from './translate';

@Injectable()
export class ToastProvider {
  private toast: Toast;
  constructor(private toastCtrl: ToastController, private translate: TranslateProvider) {
    console.log("Initializing Toast Provider");
  }

  public show(message: string): void {
    if (!this.toast) {
      let options = ToastConfig.options;
      this.toast = this.toastCtrl.create(options);
      this.toast.setMessage(message);
      this.toast.present();
      this.toast.onDidDismiss(() => {
        this.toast = null;
      });
    }
  }

  public showWithDuration(message: string, duration: number): void {
    if (!this.toast) {
      let options = ToastConfig.options;
      this.toast = this.toastCtrl.create(options);
      this.toast.setMessage(message);
      this.toast.setDuration(duration);
      this.toast.present();
      this.toast.onDidDismiss(() => {
        this.toast = null;
      });
    }
  }

  public showError(code: string): void {
    if (!this.toast) {
      let options = ToastConfig.options;
      this.toast = this.toastCtrl.create(options);
      this.toast.setMessage(this.translate.get(code));
      this.toast.setDuration(ToastConfig.duration);
      this.toast.present();
      this.toast.onDidDismiss(() => {
        this.toast = null;
      });
    }
  }

  public hide(): void {
    if (this.toast) {
      this.toast.dismiss();
    }
  }

}
