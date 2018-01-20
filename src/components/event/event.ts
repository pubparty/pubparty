import { Component, Input } from '@angular/core';
import { UsersApi, DatabaseProvider, ToastProvider } from '../../providers';
import { Event, User } from '../../models';
import { NavController, App, Modal, ModalController } from 'ionic-angular';
import { ToastConfig } from '../../configs/toast-config';

@Component({
  selector: 'event',
  templateUrl: 'event.html'
})
export class EventComponent {
  @Input('data') event: Event;
  private modal: Modal;
  constructor(private usersApi: UsersApi, private navCtrl: NavController, private app: App, private modalCtrl: ModalController, private database: DatabaseProvider, private toast: ToastProvider) {

  }

  private removeFromFavorites(eventId: string): void {
    let userId = this.usersApi.getCurrentUser().userId;
    this.database.getUserById(userId).take(1).subscribe((user: User) => {
      let favorites = user.favorites;
      favorites.splice(favorites.indexOf(eventId), 1);
      this.database.getUserById(userId).update({
        favorites: favorites
      }).then(() => {
        this.toast.showWithDuration('Event removed from favorites.', ToastConfig.duration);
      });
    });
  }

  private addToFavorites(eventId: string): void {
    let userId = this.usersApi.getCurrentUser().userId;
    this.database.getUserById(userId).take(1).subscribe((user: User) => {
      let favorites = user.favorites;
      if (!favorites) {
        favorites = [];
      }
      favorites.push(eventId);
      this.database.getUserById(userId).update({
        favorites: favorites
      }).then(() => {
        this.toast.showWithDuration('Event added to favorites.', ToastConfig.duration);
      });
    });
  }

  private viewProfile(userId: string): void {
    if (userId != this.usersApi.getCurrentUser().userId) {
      let modal = this.modalCtrl.create('ViewProfilePage', { userId: userId });
      modal.present();
      modal.onDidDismiss((eventId: string) => {
        if (eventId) {
          this.app.getRootNav().push('EventPage', { eventId: eventId });
        }
      });
    }
  }
}
