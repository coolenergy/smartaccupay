import { AfterViewInit, Component, OnInit } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ModeDetectService } from './mode-detect.service';
import { configdata } from 'src/environments/configData';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit, AfterViewInit {
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
	backIcon: string;


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

		var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
		this.mode = modeLocal === 'on' ? 'on' : 'off';
		if (this.mode == 'off') {
			this.backIcon = icon.BACK;
		} else {
			this.backIcon = icon.BACK_WHITE;
		}
		this.subscription = this.modeService.onModeDetect().subscribe(mode => {
			if (mode) {
				this.mode = 'off';
				this.backIcon = icon.BACK;
			} else {
				this.mode = 'on';
				this.backIcon = icon.BACK_WHITE;
			}
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
			if (params.id) {
				that.httpCall.httpPostCall(httproutes.PORTAL_TIMECARD_GET_ONE, { _id: params.id }).subscribe(function (params) {
					if (params.status) {
						that.mapObj = [
							{
								center: [params.data.timecard_breakin_lat, params.data.timecard_breakin_lng],
								time: moment(new Date(params.data.timecard_break_in * 1000)).format('ddd, MMM Do YYYY, h:mm a')
							},
							{
								center: [params.data.timecard_clockin_lat, params.data.timecard_clockin_lng],
								time: moment(new Date(params.data.timecard_clock_in * 1000)).format('ddd, MMM Do YYYY, h:mm a')
							},
							{
								center: [params.data.timecard_clockout_lat, params.data.timecard_clockout_lng],
								time: moment(new Date(params.data.timecard_clock_out * 1000)).format('ddd, MMM Do YYYY, h:mm a')
							},
							{
								center: [params.data.timecard_breakout_lat, params.data.timecard_breakout_lng],
								time: moment(new Date(params.data.timecard_break_out * 1000)).format('ddd, MMM Do YYYY, h:mm a')
							}
						];

						var breakInIndex = 0;
						var breakOutIndex = 0;
						var clockOutIndex = 0;
						var clockin = that.mapObj[1].time;
						var clockinlat = that.mapObj[1].center[0];
						var clockinlng = that.mapObj[1].center[1];
						var clockout = that.mapObj[2].time;
						var clockoutlat = that.mapObj[2].center[0];
						var clockoutlng = that.mapObj[2].center[1];
						var breakin = that.mapObj[0].time;
						var breakinlat = that.mapObj[0].center[0];
						var breakinlng = that.mapObj[0].center[1];
						var breakout = that.mapObj[3].time;
						var breakoutlat = that.mapObj[3].center[0];
						var breakoutlng = that.mapObj[3].center[1];

						map = new mapboxgl.Map({
							container: 'map',
							style: mapStyle,
							center: [clockinlng, clockinlat],
							zoom: 12,
						});
						map.addControl(new mapboxgl.NavigationControl());

						//Make GEO JSON
						geojson = {
							"type": "FeatureCollection",
							"features": []
						};

						//add only lat long
						if (that.mapObj[0].single) {
							geojson.features.push({
								"type": "Feature",
								"geometry": {
									"type": "Point",
									"coordinates": [this.mapObj[0].single[0], this.mapObj[0].single[1]]
								},
								"properties": {
									"id": 0,
									"description": "<div style='margin: 0px 10px;'><center>Location</center></div>",
								}
							});
						}

						//Add Clockin
						geojson.features.push({
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [clockinlng, clockinlat]
							},
							"properties": {
								"id": 1,
								"description": "<div style='margin: 0px 10px;'><center><div style='background-color:green;color:white;padding: 5px 15px;margin:10px 0 5px 0;border-radius: 5px;'><b>ClockIn</b></div>" + clockin + "</center></div>",
							}
						});

						//Check BreakIn
						if (breakinlng != 0 && breakinlat != 0) {
							breakInIndex = 1;
							geojson.features.push({
								"type": "Feature",
								"geometry": {
									"type": "Point",
									"coordinates": [breakinlng, breakinlat]
								},
								"properties": {
									"id": 2,
									"description": "<div style='margin: 0px 10px;'><center><div style='background-color:orange;color:white;padding: 5px 15px;margin:10px 0 5px 0;border-radius: 5px;'><b>BreakIn</b></div>" + breakin + "</center></div>",
								}
							});
							//Check BreakOut
							if (breakoutlng != 0 && breakoutlat != 0) {
								breakOutIndex = 2;
								geojson.features.push({
									"type": "Feature",
									"geometry": {
										"type": "Point",
										"coordinates": [breakoutlng, breakoutlat]
									},
									"properties": {
										"id": 3,
										"description": "<div style='margin: 0px 10px;'><center><div style='background-color:orange;color:white;padding: 5px 15px;margin:10px 0 5px 0;border-radius: 5px;'><b>BreakOut</b></div>" + breakout + "</center></div>",
									}
								});
							}
						}

						//Check clockout clockoutlat
						if (clockout != 0) {
							if (clockoutlng != 0 && clockoutlat != 0) {
								if (clockoutlng != 0 && clockoutlat != 0 && breakoutlng != 0 && breakoutlat != 0 && breakinlng != 0 && breakinlat != 0) {
									clockOutIndex = 3;
								} else if (clockoutlng != 0 && clockoutlat != 0 && breakinlng != 0 && breakinlat != 0) {
									clockOutIndex = 2;
								}
								else {
									clockOutIndex = 1;
								}
							} else {
								clockOutIndex = 0;
							}

							geojson.features.push({
								"type": "Feature",
								"geometry": {
									"type": "Point",
									"coordinates": [clockoutlng, clockoutlat]
								},
								"properties": {
									"id": 4,
									"description": "<div style='margin: 0px 10px;'><center><div style='background-color:red;color:white;padding: 5px 15px;margin:10px 0 5px 0;border-radius: 5px;'><b>ClockOut</b></div>" + clockout + "</center></div>",
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
							if (breakInIndex != 0) {
								coords.push(geojson.features[breakInIndex].geometry.coordinates);
							}
							//Add Break Out Coordi
							if (breakOutIndex != 0) {
								coords.push(geojson.features[breakOutIndex].geometry.coordinates);
							}
							//Add Clock Out Coordi
							if (clockOutIndex != 0) {
								coords.push(geojson.features[clockOutIndex].geometry.coordinates);
							}

							//Add Clock In PIN
							map.loadImage(
								'../../../../assets/img/mapbox-marker-icon-20px-green.png',
								function (error, image) {
									if (error) throw error;
									map.addImage('green', image);
									map.addLayer({
										"id": 'clockin-symbol',
										"source": "markers",
										"type": "symbol",
										"layout": {
											"icon-image": "green",
											"icon-allow-overlap": true,
										},

										"filter": ["==", "id", geojson.features[0].properties.id],
									});
								});

							if (breakInIndex != 0) {
								//Add Break In PIN
								map.loadImage(
									'../../../../assets/img/mapbox-marker-icon-20px-orange.png',
									function (error, image) {
										if (error) throw error;
										map.addImage('orange', image);
										map.addLayer({
											"id": 'breakin-symbol',
											"source": "markers",
											"type": "symbol",
											"layout": {
												"icon-image": "orange",
												"icon-allow-overlap": true,
											},
											"filter": ["==", "id", geojson.features[breakInIndex].properties.id],
										});
									});
							}

							if (breakOutIndex != 0) {
								//Add Break Out PIN
								map.loadImage(
									'../../../../assets/img/mapbox-marker-icon-20px-orange.png',
									function (error, image) {
										if (error) throw error;
										map.addImage('orange1', image);
										map.addLayer({
											"id": 'breakout-symbol',
											"source": "markers",
											"type": "symbol",
											"layout": {
												"icon-image": "orange1",
												"icon-allow-overlap": true,
											},
											"filter": ["==", "id", geojson.features[breakOutIndex].properties.id],
										});
									});
							}
							if (clockOutIndex != 0) {
								//Add Clock Out PIN
								map.loadImage(
									'../../../../assets/img/mapbox-marker-icon-20px-red.png',
									function (error, image) {
										if (error) throw error;
										map.addImage('red', image);
										map.addLayer({
											"id": 'clockout-symbol',
											"source": "markers",
											"type": "symbol",
											"layout": {
												"icon-image": "red",
												"icon-allow-overlap": true,
											},
											"filter": ["==", "id", geojson.features[clockOutIndex].properties.id],
										});
									});
							}
						});

						//Set PIN Click event
						map.on('click', 'clockin-symbol', function (e) {
							var coordinates = e.features[0].geometry.coordinates.slice();
							var description = e.features[0].properties.description;
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
							}
							new mapboxgl.Popup()
								.setLngLat(coordinates)
								.setHTML(description)
								.addTo(map);
						});
						map.on('click', 'clockout-symbol', function (e) {
							var coordinates = e.features[0].geometry.coordinates.slice();
							var description = e.features[0].properties.description;
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
							}
							new mapboxgl.Popup()
								.setLngLat(coordinates)
								.setHTML(description)
								.addTo(map);
						});
						map.on('click', 'breakin-symbol', function (e) {
							var coordinates = e.features[0].geometry.coordinates.slice();
							var description = e.features[0].properties.description;
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
							}
							new mapboxgl.Popup()
								.setLngLat(coordinates)
								.setHTML(description)
								.addTo(map);
						});
						map.on('click', 'breakout-symbol', function (e) {
							var coordinates = e.features[0].geometry.coordinates.slice();
							var description = e.features[0].properties.description;
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
							}
							new mapboxgl.Popup()
								.setLngLat(coordinates)
								.setHTML(description)
								.addTo(map);
						});
					}
				});
			} else {
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
				map.on('click', 'point-symbol', function (e) {
					var coordinates = e.features[0].geometry.coordinates.slice();
					var description = e.features[0].properties.description;
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}
					new mapboxgl.Popup()
						.setLngLat(coordinates)
						.setHTML(description)
						.addTo(map);
				});
				map.addControl(new mapboxgl.NavigationControl());
			}
		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

}
