import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, ModalController, AlertController, ActionSheetController, App } from 'ionic-angular';
import { AlertProvider, DatabaseMessageProvider, ToastProvider, NetworkProvider, TranslateProvider, UsersApi, AuthProvider, GroupsApi, StorageMessageProvider } from '../../providers';
import { User, Group } from '../../models';
import { ToastConfig } from '../../configs/toast-config';
import { Subscription } from 'rxjs/Subscription';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Camera } from '@ionic-native/camera';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-view-group',
  templateUrl: 'view-group.html',
})
export class ViewGroupPage {
  private user: User;
  private group: Group;
  private userSubscription: Subscription;
  private groupSubscription: Subscription;
  private popup: Promise<any>;

  constructor(public navParams: NavParams,
    public viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private alert: AlertProvider,
    private database: DatabaseMessageProvider,
    private toast: ToastProvider,
    private network: NetworkProvider,
    private translate: TranslateProvider,
    private usersApi: UsersApi,
    private auth: AuthProvider,
    private groupsApi: GroupsApi,
    private photoViewer: PhotoViewer,
    private actionSheetCtrl: ActionSheetController,
    private storage: StorageMessageProvider,
    private camera: Camera,
    private app: App) {
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      if (!this.groupSubscription) {
        //Subscribe to group.
        this.groupSubscription = this.groupsApi.subscriptions.get(this.navParams.get('groupId')).subscribe((group: Group) => {
          this.group = group;
          //Order group members randomly.
          if (this.group.members)
            this.group.members.sort(() => .5 - Math.random());
        });
      }

      //Subscribe to user.
      if (!this.userSubscription) {
        this.userSubscription = this.usersApi.subscriptions.get(user.uid).subscribe((user: User) => {
          this.user = user;
        });
      }

      //Initialize.
      this.group = this.groupsApi.getGroup(this.navParams.get('groupId'));
      if (this.group.members)
        this.group.members.sort(() => .5 - Math.random());
      this.user = this.usersApi.getUser(user.uid);
    });
  }

  //Pass back the data to process on the chat.ts - viewGroup modal.onDidDismiss.
  private back(data?): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    if (this.groupSubscription)
      this.groupSubscription.unsubscribe();
    this.viewCtrl.dismiss(data);
  }

  //Change group name.
  private setName(): void {
    this.popup = this.alertCtrl.create({
      title: this.translate.get('CHANGE_GROUP_NAME'),
      message: this.translate.get('CHANGE_GROUP_NAME_TEXT'),
      inputs: [
        {
          name: 'name',
          placeholder: this.translate.get('GROUP_NAME'),
          value: this.group.name
        }
      ],
      buttons: [
        {
          text: this.translate.get('CANCEL'),
          handler: data => { }
        },
        {
          text: this.translate.get('SAVE'),
          handler: data => {
            let name = data["name"];
            // Check if entered group name is different from the current group name.
            if (this.group.name != name) {
              this.database.getGroupById(this.group.groupId).update({
                name: name
              }).then(() => {
                this.toast.showWithDuration(this.translate.get('GROUP_NAME_UPDATED'), ToastConfig.duration);
              });
            }
          }
        }
      ]
    }).present();
  }

  //Change group picture.
  private setGroupPic(): void {
    this.actionSheetCtrl.create({
      title: this.translate.get('SET_GROUP_PICTURE'),
      buttons: [
        {
          text: this.translate.get('TAKE_A_PHOTO'),
          role: 'destructive',
          handler: () => {
            this.storage.uploadGroupPic(this.group.groupId, this.camera.PictureSourceType.CAMERA).then(groupPic => {
              //Delete existing group pic.
              this.storage.deleteGroupPic(this.group.groupId, this.group.image);
              this.database.getGroupById(this.group.groupId).update({
                image: groupPic
              }).then(() => {
                this.toast.showWithDuration(this.translate.get('GROUP_IMAGE_UPDATED'), ToastConfig.duration);
              });
            });
          }
        },
        {
          text: this.translate.get('CHOOSE_FROM_GALLERY'),
          handler: () => {
            this.storage.uploadGroupPic(this.group.groupId, this.camera.PictureSourceType.PHOTOLIBRARY).then(groupPic => {
              this.storage.deleteGroupPic(this.group.groupId, this.group.image);
              this.database.getGroupById(this.group.groupId).update({
                image: groupPic
              }).then(() => {
                this.toast.showWithDuration(this.translate.get('GROUP_IMAGE_UPDATED'), ToastConfig.duration);
              });
            });
          }
        },
        {
          text: this.translate.get('CANCEL'),
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    }).present();
  }

  //View profile of the member.
  private viewProfile(userId: string): void {
    if (userId != this.user.userId) {
      let modal = this.modalCtrl.create('ViewProfilePage', { userId: userId });
      modal.present();
      modal.onDidDismiss((userId: string) => {
        //The user opted to send a message to the user.
        if (userId) {
          if (this.user.conversations && this.user.conversations[userId]) {
            this.back({ conversationId: this.user.conversations[userId].conversationId, members: [this.user.userId, userId] });
          } else {
            this.back({ members: [this.user.userId, userId] });
          }
        }
      });
    }
  }

  //Load the image if it is not default photo, otherwise ask to set a group photo.
  private viewPhoto(url: string): void {
    if (url != 'assets/images/group.png') {
      this.photoViewer.show(this.group.image);
    }
    else {
      this.setGroupPic();
    }
  }

  //Leave the group.
  private leaveGroup(): void {
    this.alert.showConfirm(this.translate.get('CONFIRM_LEAVE_GROUP'), this.translate.get('CONFIRM_LEAVE_GROUP_MESSAGE'), this.translate.get('CANCEL'), this.translate.get('LEAVE')).then(confirm => {
      if (confirm) {
        this.database.removeUserFromGroup(this.group.groupId, this.user.userId).then(() => {
          this.toast.showWithDuration(this.translate.get('GROUP_LEFT'), ToastConfig.duration);
          //Pass down a null value so chat.ts modal.onDidDismiss will pop the chat window.
          this.back({ groupId: null });
        });
      }
    });
  }

  //Delete group.
  private deleteGroup(): void {
    this.alert.showConfirm(this.translate.get('CONFIRM_DELETE_GROUP'), this.translate.get('CONFIRM_DELETE_GROUP_MESSAGE'), this.translate.get('CANCEL'), this.translate.get('DELETE')).then(confirm => {
      if (confirm) {
        let groupId = this.group.groupId;
        let image = this.group.image;
        this.database.removeUserFromGroup(groupId, this.user.userId).then(() => {
          //Delete group from database.
          this.database.deleteGroup(groupId).then(() => {
            //Delete group pic.
            this.storage.deleteGroupPic(groupId, image);
            //Pass down a null value so chat.ts modal.onDidDismiss will pop the chat window.
            this.back({ groupId: null });
            this.toast.showWithDuration(this.translate.get('GROUP_DELETED'), ToastConfig.duration);
          });
        });
      }
    });
  }

  private viewAll(): void {
    let modal = this.modalCtrl.create('ViewMembersPage', { userId: this.user.userId, groupId: this.group.groupId });
    modal.present();
    modal.onDidDismiss((userId: string) => {
      if (userId) {
        //Check if there's an existing conversation with the user, and load the conversation.
        if (this.user.conversations && this.user.conversations[userId]) {
          this.back({ conversationId: this.user.conversations[userId].conversationId, members: [this.user.userId, userId] });
        } else {
          this.back({ members: [this.user.userId, userId] });
        }
      }
    });
  }

  private contactsInGroup(): boolean {
    if (this.user.contacts && this.group.members) {
      for (let i = 0; i < this.user.contacts.length; i++) {
        let contact = this.user.contacts[i];
        if (this.group.members.indexOf(contact) == -1) {
          return false;
        }
      }
    }
    return true;
  }

  private addMembers(): void {
    let modal = this.modalCtrl.create('AddMembersPage', { groupId: this.group.groupId });
    modal.present();
  }
}
