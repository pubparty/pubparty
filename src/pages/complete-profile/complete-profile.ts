import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { User } from '../../models';
import { AuthProvider, LoadingProvider, DatabaseProvider, StorageProvider } from '../../providers';
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from '@ionic-native/camera';

@IonicPage()
@Component({
  selector: 'page-complete-profile',
  templateUrl: 'complete-profile.html',
})
export class CompleteProfilePage {
  private profileForm: FormGroup;
  private user: User;
  private userNameValidator: ValidatorFn = Validators.compose([
    Validators.pattern('^[0-z.]{4,20}$'),
    Validators.required
  ]);
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
  private uniqueUserName: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private formBuilder: FormBuilder,
    private auth: AuthProvider,
    private database: DatabaseProvider,
    private loading: LoadingProvider,
    private storage: StorageProvider,
    private keyboard: Keyboard,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController) {
    this.profileForm = this.formBuilder.group({
      userName: ['', this.userNameValidator],
      firstName: ['', this.requiredValidator],
      lastName: ['', this.requiredValidator],
      email: ['', this.emailValidator],
      number: ['', this.numberValidator],
      about: ['', this.requiredValidator]
    });
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.keyboard.close();
      if (this.profileForm.valid)
        this.completeProfile();
    }
  }

  onInputUsername(userName: string) {
    if (this.profileForm.controls.userName.valid && !this.profileForm.controls.userName.hasError('required')) {
      this.database.getUserByUserName(userName.toLowerCase()).take(1).subscribe(users => {
        this.uniqueUserName = true;
        if (users && users.length > 0) {
          this.uniqueUserName = false;
        }
      });
    }
  }

  ionViewWillLeave() {
    this.database.exists('users/' + this.user.userId).then(exists => {
      if (!exists) {
        this.storage.deleteProfilePic(this.user.userId, this.user.profilePic).then(() => {
        });
      }
    });
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      let userId, firstName, lastName, profilePic, email;

      userId = user.uid;

      let providerData = user.providerData[0];
      if (providerData) {
        if (providerData.displayName) {
          if (providerData.displayName.indexOf(' ') > -1) {
            firstName = providerData.displayName.substr(0, providerData.displayName.indexOf(' '));
            lastName = providerData.displayName.substr(providerData.displayName.indexOf(' ') + 1, providerData.displayName.length);
          }
        } else {
          firstName = providerData.displayName;
          lastName = '';
        }
        email = providerData.email;
        if (providerData.photoURL) {
          profilePic = providerData.photoURL;
        } else {
          profilePic = 'assets/images/profile.png';
        }
      } else {
        if (user.displayName) {
          if (user.displayName.indexOf(' ') > -1) {
            firstName = user.displayName.substr(0, user.displayName.indexOf(' '));
            lastName = user.displayName.substr(user.displayName.indexOf(' ') + 1, user.displayName.length);
          }
        } else {
          firstName = user.displayName;
          lastName = '';
        }
        email = user.email;
        if (user.photoURL) {
          profilePic = user.photoURL;
        } else {
          profilePic = 'assets/images/profile.png';
        }
      }
      //Create user object based on User model.
      this.user = new User(userId, '', firstName, lastName, profilePic, email, '', '', null, '', null, null);

      this.profileForm.setValue({
        userName: '',
        firstName: firstName,
        lastName: lastName,
        email: email,
        number: '',
        about: ''
      });
    });
  }

  private completeProfile(): void {
    this.loading.show();
    this.user.userName = this.profileForm.value['userName'].toLowerCase();
    this.user.firstName = this.profileForm.value['firstName'];
    this.user.lastName = this.profileForm.value['lastName'];
    this.user.number = this.profileForm.value['number'];
    this.user.about = this.profileForm.value['about'];
    this.database.setUser(this.user).then(() => {
      this.loading.hide();
      this.navCtrl.setRoot('LoaderPage');
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
            this.storage.uploadProfilePic(this.user.userId, this.camera.PictureSourceType.CAMERA).then(profilePic => {
              this.storage.deleteProfilePic(this.user.userId, this.user.profilePic).then(() => {
                this.user.profilePic = profilePic;
              });
            });
          }
        },
        {
          text: 'Choose from Gallery',
          handler: () => {
            this.storage.uploadProfilePic(this.user.userId, this.camera.PictureSourceType.PHOTOLIBRARY).then(profilePic => {
              this.storage.deleteProfilePic(this.user.userId, this.user.profilePic).then(() => {
                this.user.profilePic = profilePic;
              });
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
