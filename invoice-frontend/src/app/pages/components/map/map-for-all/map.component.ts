import { AfterViewInit, Component, OnInit } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, localstorageconstants } from 'src/app/consts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../mode-detect.service';
import { configdata } from 'src/environments/configData';


@Component({
	selector: 'app-map-for-all',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})

export class MapForAllComponent implements OnInit, AfterViewInit {
	map: mapboxgl.Map;
	subscription: Subscription;
	styleLight = 'mapbox://styles/mapbox/streets-v11';
	darkMode = 'mapbox://sprites/mapbox/dark-v10';
	lat = configdata.FLORIDA_LAT;
	lng = configdata.FLORIDA_LNG;
	newLat: any;
	newLan: any;
	center: any;
	timecarID: any;
	mapObj = [];
	mode;
	isBackHide: Boolean = false;

	constructor(private modeService: ModeDetectService, public httpCall: HttpCall, public route: ActivatedRoute,
		private location: Location) {

		var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
		this.mode = modeLocal === 'on' ? 'on' : 'off';
		this.subscription = this.modeService.onModeDetect().subscribe(mode => {
			if (mode) {
				this.mode = 'off';
			} else {
				this.mode = 'on';
			}
			this.ngAfterViewInit();
		});
	}

	ngOnInit(): void {
		let that = this;
		this.route.queryParams.subscribe((params: any) => {
			if (params.backHide == "true") {
				this.isBackHide = false;
			} else {
				this.isBackHide = true;
			}
			if (params.id) {
				that.getOneAndOpenModal(params.id);
			} else {
				that.mapObj.push({ single: [params.user_lng, params.user_lat] });
			}
		});
	}

	back(): void {
		this.location.back();
	}

	getOneAndOpenModal(id) {
		let that = this;
	}

	ngAfterViewInit() {
		let that = this;
		var map;
		var geojson;
		var coords = [];

		var mapStyle = this.mode === 'on' ? this.darkMode : this.styleLight;
		mapboxgl.accessToken = configdata.MAPBOXAPIKEY;

		this.route.queryParams.subscribe((params: any) => {
			map = new mapboxgl.Map({
				container: 'map',
				style: mapStyle,
				center: [params.user_lng, params.user_lat],
				zoom: 12,
			});
			geojson = {
				"type": "FeatureCollection",
				"features": []
			};
			if (params.user_lng !== 0 && params.user_lat !== 0) {
				geojson.features.push({
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [params.user_lng, params.user_lat]
					},
					"properties": {
						"id": 0,
						"description": "<div style='margin: 0px 10px;'><center><div class='address' style='background-color:#023E8A;color:white;padding: 5px 15px;margin:10px 0 5px 0;border-radius: 5px;'><b>" + params.street + "</b></div> " + params.address + " </center></div>",
					}
				});
			}

			//Load Map
			map.on('load', function (e) {
				map.addSource('markers', {
					"type": "geojson",
					"data": geojson
				});
				//Add Clock In Coordi
				coords.push(geojson.features[0].geometry.coordinates);
				//Add Break In Coordi
				map.loadImage(
					'../../../../assets/img/mapbox-marker-icon-20px-green.png',
					function (error, image) {
						if (error) throw error;
						map.addImage('green', image);
						map.addLayer({
							"id": 'point-symbol',
							"source": "markers",
							"type": "symbol",
							"layout": {
								"icon-image": "green",
								"icon-allow-overlap": true,
							},

							"filter": ["==", "id", geojson.features[0].properties.id],
						});
					});
			});
			/*map.on('click', 'point-symbol', function (e) {
				var coordinates = e.features[0].geometry.coordinates.slice();
				var description = e.features[0].properties.description;
				while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
					coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
				}
				new mapboxgl.Popup()
					.setLngLat(coordinates)
					.setHTML(description)
					.addTo(map);
			});*/
			map.addControl(new mapboxgl.NavigationControl());

		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

}

