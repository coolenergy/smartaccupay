import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { LanguageApp } from 'src/app/service/utils';

@Component({
  selector: 'app-invoice-card',
  templateUrl: './invoice-card.component.html',
  styleUrls: ['./invoice-card.component.scss']
})
export class InvoiceCardComponent implements OnInit {
  @Input() invoice: any;
  @Output() invoiceUpdateCard: EventEmitter<void> = new EventEmitter<void>();
  subscription!: Subscription;
  mode: any;
  allInvoices = [];
  viewIcon: string = '';
  showInvoiceTable = true;
  dtOptions: DataTables.Settings = {};
  isManagement: boolean = true;
  invoiceCount: any = {
    pending: 0,
    complete: 0
  };
  editIcon!: string;
  gridIcon: string;
  listIcon: string;
  role_to: any;
  role_permission: any;
  approveIcon: string;
  denyIcon: string;
  status: any;
  id: any;
  constructor(public route: ActivatedRoute, private router: Router, private modeService: ModeDetectService, public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {
    this.status = this.route.snapshot.queryParamMap.get('status');
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {

      this.editIcon = icon.EDIT;
      this.approveIcon = icon.APPROVE;
      this.denyIcon = icon.DENY;
      this.viewIcon = icon.VIEW;

    } else {

      this.editIcon = icon.EDIT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
      this.viewIcon = icon.VIEW_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';

        this.editIcon = icon.EDIT;
        this.approveIcon = icon.APPROVE;
        this.denyIcon = icon.DENY;
        this.viewIcon = icon.VIEW;

      } else {
        this.mode = 'on';

        this.editIcon = icon.EDIT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
        this.viewIcon = icon.VIEW_WHITE;

      }
      this.rerenderfunc();
    });
  }

  ngOnInit(): void {
    let that = this;
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    this.role_to = role_permission.UserData.role_name;

  }

  updateInvoice(requestObject) {
    let that = this;
    that.uiSpinner.spin$.next(true);
    that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        // that.rerenderfunc();
        that.invoiceUpdateCard.emit();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  viewInvoice(invoice) {
    this.router.navigate(['/invoice-detail'], { queryParams: { _id: invoice._id } });
  }

  editInvoice(invoice) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoice._id, status: this.status } });
  }

  rerenderfunc() {
    this.showInvoiceTable = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.showInvoiceTable = true;
    }, 100);
  }
}
