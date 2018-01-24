import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { User } from '../../models';
import { AuthProvider, LoadingProvider, DatabaseProvider, StorageProvider, ToastProvider, TranslateProvider } from '../../providers';
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from '@ionic-native/camera';
import { ToastConfig } from '../../configs/toast-config';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-update-profile',
  templateUrl: 'update-profile.html',
})
export class UpdateProfilePage {
  private profileForm: FormGroup;
  private user: User;
  private subscription: Subscription;
  private requiredValidator: ValidatorFn = Validators.compose([
    Validators.required
  ]);
  private emailValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.email
  ]);
  private numberValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.pattern('^[ ]*([0-9][ ]*){10}$')
  ]);

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private formBuilder: FormBuilder,
    private auth: AuthProvider,
    private database: DatabaseProvider,
    private loading: LoadingProvider,
    private storage: StorageProvider,
    private keyboard: Keyboard,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController,
    private toast: ToastProvider,
    private translate: TranslateProvider,
    private viewCtrl: ViewController) {
    this.profileForm = this.formBuilder.group({
      userName: [''],
      firstName: ['', this.requiredValidator],
      lastName: ['', this.requiredValidator],
      email: ['', this.emailValidator],
      number: ['', this.numberValidator],
      about: ['', this.requiredValidator]
    });
    this.profileForm.get('userName').disable();
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.keyboard.close();
      if (this.profileForm.valid)
        this.updateProfile();
    }
  }

  ionViewWillLeave() {
    this.database.exists('users/' + this.user.userId).then(exists => {
      if (!exists) {
        this.storage.deleteProfilePic(this.user.userId, this.user.profilePic).then(() => {
        });
      }
    });

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      this.subscription = this.database.getUserById(user.uid).subscribe((user: User) => {
        this.user = user;
        this.profileForm.setValue({
          userName: this.user.userName,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          number: this.user.number,
          about: this.user.about
        });
      });
    });
  }

  private updateProfile(): void {
    this.loading.show();
    this.user.firstName = this.profileForm.value['firstName'];
    this.user.lastName = this.profileForm.value['lastName'];
    this.user.email = this.profileForm.value['email'];
    this.user.number = this.profileForm.value['number'];
    this.user.about = this.profileForm.value['about'];
    this.database.setUser(this.user).then(() => {
      this.toast.showWithDuration(this.translate.get('PROFILE_UPDATED_MESSAGE'), ToastConfig.duration);
      this.loading.hide();
      this.viewCtrl.dismiss();
    });
  }

  private setProfilePic(): void {
    this.actionSheetCtrl.create({
      title: 'Set Profile Picture',
      buttons: [
        {
          text: 'Take a Photo',
          role: 'destructive',
          handler: () => {
            this.storage.uploadProfilePic(this.user.userId, this.camera.PictureSourceType.CAMERA)
            .then(profilePic => {
              this.user.profilePic = profilePic;
              // this.storage.deleteProfilePic(this.user.userId, this.user.profilePic).then(() => {
                
              // });
            });
          }
        },
        {
          text: 'Choose from Gallery',
          handler: () => {
            this.storage.uploadProfilePic(this.user.userId, this.camera.PictureSourceType.PHOTOLIBRARY).then(profilePic => {
              this.user.profilePic = profilePic;
              // this.storage.deleteProfilePic(this.user.userId, this.user.profilePic).then(() => {
                
              // });
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
