import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Location } from '../../models';

declare var google;

@IonicPage()
@Component({
  selector: 'page-set-map',
  templateUrl: 'set-map.html',
})
export class SetMapPage {
  @ViewChild('map') mapElement: ElementRef;
  private map: any;
  private zoom: number = 14;
  private title: string;
  private lat: number;
  private lng: number;
  private geolocationOptions = { timeout: 10000, enableHighAccuracy: true };
  private searchPlace: string;
  private searchResults: any;
  private autoCompleteService = new google.maps.places.AutocompleteService();
  private placesService = new google.maps.places.PlacesService(document.createElement('div'));
  private geocoderService = new google.maps.Geocoder();
  private location: Location;

  constructor(public navCtrl: NavController, public navParams: NavParams, private geolocation: Geolocation, private viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    this.geolocation.getCurrentPosition(this.geolocationOptions).then(position => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: this.zoom
      };
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    }).catch(error => {
      console.log("Error: " + error.code);
      console.log("Error: " + error.message);
    });
  }

  private done(): void {
    this.viewCtrl.dismiss(this.location);
  }

  queryChanged(event) {
    this.updateSearch();
  }

  private updateSearch(): void {
    this.getQueryPredictions(this.searchPlace).then(result => {
      this.searchResults = result;
    }).catch(error => {
      this.searchResults = [];
    });
  }

  private setQuery(result: any): void {
    this.searchPlace = '';
    this.searchResults = [];
    var infowindow = new google.maps.InfoWindow();
    let place = result.description;
    let placeId = result.place_id;
    this.getLocation(placeId).then(location => {
      this.location = new Location(place, location.lat(), location.lng());
      let latLng = new google.maps.LatLng(location.lat(), location.lng());
      let marker = new google.maps.Marker({
        position: latLng,
        title: "'" + place + "'"
      });
      let mapOptions = {
        center: latLng,
        zoom: this.zoom
      };
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      marker.setMap(this.map);
      marker.addListener('click', function() {
        infowindow.setContent('<div><strong>' + place + '</strong>');
        infowindow.open(this.map, this);
      });
    });
  }

  private getLocation(placeId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.geocoderService.geocode({ 'placeId': placeId }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          let result = results[0];
          console.log(JSON.stringify(result));
          resolve(result.geometry.location);
        } else {
          console.log("ERROR GEOCODER");
          reject(status);
        }
      });
    });
  }

  private getQueryPredictions(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let self = this;
      let request = {
        location: new google.maps.LatLng(56.105364, 10.118408),
        radius: 50000,
        input: query
      };
      this.autoCompleteService.getQueryPredictions(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          self.searchResults = [];
          results.forEach(function(result) {
            self.searchResults.push(result);
          });
          resolve(self.searchResults);
        } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          reject(status);
        } else {
          reject(status);
        }
      });
    });
  }
}
