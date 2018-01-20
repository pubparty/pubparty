import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Location } from '../../models';

declare var google;

@IonicPage()
@Component({
  selector: 'page-view-map',
  templateUrl: 'view-map.html',
})
export class ViewMapPage {
  @ViewChild('map') mapElement: ElementRef;
  private map: any;
  private zoom: number = 14;
  private location: Location;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    var infowindow = new google.maps.InfoWindow();
    this.location = this.navParams.get('location');
    let latLng = new google.maps.LatLng(this.location.lat, this.location.lng);
    let mapOptions = {
      center: latLng,
      zoom: this.zoom
    };
    let marker = new google.maps.Marker({
      position: latLng,
      title: this.location.title
    });
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    marker.setMap(this.map);
    let title = this.location.title;
    let self = this;
    marker.addListener('click', function() {
      infowindow.setContent('<div><strong>' + title + '</strong>');
      infowindow.open(this.map, this);
    });
  }

}
