import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { WEB_ROUTES } from 'src/consts/routes';
import { UserService } from '../user.service';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Component({
  selector: 'app-user-history',
  templateUrl: './user-history.component.html',
  styleUrls: ['./user-history.component.scss']
})
export class UserHistoryComponent implements OnInit {
  start = 0;
  userHistory: any;
  historyLoading = true;

  constructor (private router: Router, public userTableService: UserService, private commonService: CommonService,) {

  }

  ngOnInit() {
    this.getUserHistory();
  }

  async getUserHistory() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.USER_HISTORY, { start: this.start });
    if (data.status) {
      if (this.start == 0) {
        this.userHistory = data.data;
      } else {
        this.userHistory = this.userHistory.concat(data.data);
      }
      this.historyLoading = false;
    }
  }

  onScroll() {
    this.start++;
    this.getUserHistory();
  }

  back() {
    this.router.navigate([WEB_ROUTES.USER]);
  }

  setHeightStyles() {
    const styles = {
      height: '770px',
      "overflow-y": "scroll",
    };
    return styles;
  }
}
