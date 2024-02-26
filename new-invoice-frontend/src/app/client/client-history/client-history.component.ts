import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { ClientService } from '../client.service';

@Component({
  selector: 'app-client-history',
  templateUrl: './client-history.component.html',
  styleUrls: ['./client-history.component.scss'],
})
export class ClientHistoryComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  start = 0;
  clientHistory: any;
  historyLoading = true;

  constructor (
    private router: Router,
    public commonService: CommonService
  ) {
    super();
  }

  ngOnInit() {
    this.getClientHistory();
  }

  async getClientHistory() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_GET_HISTORY, { start: this.start });
    if (data.status) {
      if (this.start == 0) {
        this.clientHistory = data.data;
      } else {
        this.clientHistory = this.clientHistory.concat(data.data);
      }
      this.historyLoading = false;
    }
  }

  onScroll() {
    this.start++;
    this.getClientHistory();
  }

  back() {
    this.router.navigate([WEB_ROUTES.CLIENT]);
  }

  setHeightStyles() {
    const styles = {
      height: '770px',
      'overflow-y': 'scroll',
    };
    return styles;
  }
}
