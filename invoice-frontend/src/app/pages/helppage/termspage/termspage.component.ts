/*
 *
 * Rovuk A/P
 *
 * This component is used for display Terms & Condition.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { localstorageconstants } from 'src/app/consts';
import { ModeDetectService } from '../../components/map/mode-detect.service';

@Component({
  selector: 'app-termspage',
  templateUrl: './termspage.component.html',
  styleUrls: ['./termspage.component.scss']
})
export class TermspageComponent implements OnInit {
  subscription: Subscription;
  mode: any;

  constructor (private modeService: ModeDetectService,) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {

    } else {

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
      } else {
        this.mode = 'on';
      }
    });
  }

  ngOnInit(): void { }

}
