import { Component, Input, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { HttpCall } from 'src/app/services/httpcall.service';

@Component({
  selector: 'app-custompdfviewer',
  templateUrl: './custompdfviewer.component.html',
  styleUrls: ['./custompdfviewer.component.scss']
})
export class CustompdfviewerComponent {
  @Input() pdf_url!: string;

  constructor (public route: ActivatedRoute, public httpCall: HttpCall, public spinner: UiSpinnerService,
    public translate: TranslateService, public dialog: MatDialog) {
  }

  print() {
    fetch(this.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
      /*--- set the blog type to final pdf ---*/
      const file = new Blob([resp], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(file);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      //iframe.contentWindow.print();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.focus();
          iframe.contentWindow!.print();
        });
      };
    });
  }

  download() {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = this.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }
}
