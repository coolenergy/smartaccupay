import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { configData } from 'src/environments/configData';

@Component({
  selector: 'app-unknown-document-type',
  templateUrl: './unknown-document-type.component.html',
  styleUrls: ['./unknown-document-type.component.scss']
})
export class UnknownDocumentTypeComponent extends UnsubscribeOnDestroyAdapter {
  pdf_url!: string;
  id: any;
  documentList: any = configData.DOCUMENT_TYPE_LIST;

  constructor (private router: Router, private commonService: CommonService, public route: ActivatedRoute, public uiSpinner: UiSpinnerService,
    private snackBar: MatSnackBar, public translate: TranslateService,) {
    super();
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.getOneOtherDocument();
  }

  async getOneOtherDocument() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_OTHER_DOCUMENT, { _id: this.id });
    if (data.status) {
      this.pdf_url = data.data.pdf_url;
    }
  }

  onDocumentTypeSelect(event: any) {
    if (event.value == configData.DOCUMENT_TYPES.invoice) {
      this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { document_id: this.id } });
    } else {
      this.router.navigate([WEB_ROUTES.INVOICE_VIEW_DOCUMENT], { queryParams: { document_id: this.id, document: event.value, from: 'document' } });
    }
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_DOCUMENTS], { state: { value: 4 } });
  }
}
