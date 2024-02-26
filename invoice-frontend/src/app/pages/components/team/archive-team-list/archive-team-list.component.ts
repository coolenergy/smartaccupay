import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { httproutes, icon } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-archive-team-list',
  templateUrl: './archive-team-list.component.html',
  styleUrls: ['./archive-team-list.component.scss']
})
export class ArchiveTeamListComponent implements OnInit {
  teamArray: any = [];
  backIcon: string;
  subscription: Subscription;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  teamIcon: string;
  isEmpty: boolean = false;

  constructor(public spinner: UiSpinnerService, private modeService: ModeDetectService, public translate: TranslateService, public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private location: Location) {
    let that = this;
    that.spinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.TEAM_AECHIVE).subscribe(function (params) {

      that.spinner.spin$.next(false);
      if (params.status) {
        that.teamArray = params.data;
        if (that.teamArray.length == 0) {
          that.isEmpty = true;
        }
      }
    });


    var modeLocal = localStorage.getItem('darkmood');
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
      this.teamIcon = icon.ARCHIVE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.teamIcon = icon.ARCHIVE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
        this.teamIcon = icon.ARCHIVE;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
        this.teamIcon = icon.ARCHIVE_WHITE;
      }
    });

    // this.uiSpinner.spin$.next(true);
    this.translate.stream(['']).subscribe((textarray) => {
      // this.copyDataFromProject = this.translate.instant('Copy_Data_From_Project');
      // this.yesButton = this.translate.instant('Compnay_Equipment_Delete_Yes');
      // this.noButton = this.translate.instant('Compnay_Equipment_Delete_No');
    });
  }



  ngOnInit(): void { }

  back() {
    this.location.back();
  }
}
