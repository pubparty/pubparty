import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Location, Event } from '../../models';
import { StorageProvider, AuthProvider, DatabaseProvider, ToastProvider } from '../../providers';
import { Camera } from '@ionic-native/camera';
import { Keyboard } from '@ionic-native/keyboard';
import * as firebase from 'firebase';
import { ToastConfig } from '../../configs/toast-config';

@IonicPage()
@Component({
  selector: 'page-update-event',
  templateUrl: 'update-event.html',
})
export class UpdateEventPage {
  private eventForm: FormGroup;
  private location: Location;
  private images: string[];
  private requiredValidator: ValidatorFn = Validators.compose([
    Validators.required
  ]);
  private userId: string;
  private event: Event;

  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder,
    private modalCtrl: ModalController, private actionSheetCtrl: ActionSheetController, private storage: StorageProvider, private camera: Camera, private auth: AuthProvider, private keyboard: Keyboard, private database: DatabaseProvider, private toast: ToastProvider) {
    let localISOString = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();
    this.eventForm = this.formBuilder.group({
      title: ['', this.requiredValidator],
      description: ['', this.requiredValidator],
      rules: ['', this.requiredValidator],
      date: [localISOString, this.requiredValidator],
      direction: ['', this.requiredValidator],
      notes: ['']
    });
  }

  ionViewDidLoad() {
    this.event = this.navParams.get('event');
    this.images = this.event.images;
    this.location = this.event.location;
    let localISOString = new Date(new Date(this.event.date).getTime() - (new Date(this.event.date).getTimezoneOffset() * 60000)).toISOString();

    this.auth.getUser().then((user: firebase.User) => {
      this.userId = user.uid;
      this.eventForm = this.formBuilder.group({
        title: [this.event.title, this.requiredValidator],
        description: [this.event.description, this.requiredValidator],
        rules: [this.event.rules, this.requiredValidator],
        date: [localISOString, this.requiredValidator],
        direction: [this.event.description, this.requiredValidator],
        notes: [this.event.notes]
      });
    });
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.keyboard.close();
      if (this.eventForm.valid && this.images.length > 0 && this.location)
        this.done();
    }
  }

  private done(): void {
    let title = this.eventForm.value['title'];
    let description = this.eventForm.value['description'];
    let rules = this.eventForm.value['rules'];
    let date = this.eventForm.value['date'];
    let direction = this.eventForm.value['direction'];
    let notes = this.eventForm.value['notes'];
    let localISOString = new Date(new Date(date).getTime() + (new Date(date).getTimezoneOffset() * 60000)).toString();
    // let event = new Event('', this.userId, title, this.images, description, rules, date, this.location, direction, notes, [this.userId]);
    this.event.title = title;
    this.event.description = description;
    this.event.rules = rules;
    this.event.date = localISOString;
    this.event.direction = direction;
    this.event.notes = notes;
    this.event.images = this.images;
    this.event.location = this.location;
    this.database.setEvent(this.event).then(() => {
      this.toast.showWithDuration('Event has been successfully updated.', ToastConfig.duration);
      this.navCtrl.pop();
    });
  }

  private setLocation(): void {
    let modal = this.modalCtrl.create('SetMapPage');
    modal.present();
    modal.onDidDismiss(location => {
      this.location = location;
    });
  }

  private getLocationImage(): string {
    return 'https://maps.googleapis.com/maps/api/staticmap?center=' + this.location.lat + ',' + this.location.lng + '&zoom=17&size=400x400&markers=' + this.location.lat + ',' + this.location.lng + '&key=AIzaSyBVqbZ2Mh5xyYyj_mXPWCd9v4xFgkhvlTw';
  }

  private addPhoto(): void {
    this.actionSheetCtrl.create({
      title: 'Add Photo',
      buttons: [
        {
          text: 'Take a Photo',
          role: 'destructive',
          handler: () => {
            this.storage.uploadEventPic(this.userId, this.camera.PictureSourceType.CAMERA).then(eventPic => {
              this.images.push(eventPic);
            });
          }
        },
        {
          text: 'Choose from Gallery',
          handler: () => {
            this.storage.uploadEventPic(this.userId, this.camera.PictureSourceType.PHOTOLIBRARY).then(eventPic => {
              this.images.push(eventPic);
            });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    }).present();
  }
}
