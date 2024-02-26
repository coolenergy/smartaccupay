import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../settings.service';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RelationshipFormComponent } from './relationship-list/relationship-form/relationship-form.component';
import { LanguageFormComponent } from './language-list/language-form/language-form.component';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import * as fs from 'file-saver';
import * as XLSX from 'xlsx';
import { ImportEmployeeSettingsComponent } from './import-employee-settings/import-employee-settings.component';
import { ExistListingComponent } from './exist-listing/exist-listing.component';
import { DocumentTypeFormComponent } from './document-type-list/document-type-form/document-type-form.component';
import { DepartmentFormComponent } from './department-list/department-form/department-form.component';
import { JobTitleFormComponent } from './job-title-list/job-title-form/job-title-form.component';
import { JobTypeFormComponent } from './job-type-list/job-type-form/job-type-form.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { configData } from 'src/environments/configData';
import { CommonService } from 'src/app/services/common.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-employeesettings',
  templateUrl: './employeesettings.component.html',
  styleUrls: ['./employeesettings.component.scss'],
})
export class EmployeesettingsComponent {
  AllDocument: any;
  AllDepartment: any;
  AllJobTitle: any;
  AllJobType: any;
  AllRelationship: any;
  AllLanguage: any;
  exitData!: any[];

  currrent_tab: any = 'document';

  tab_Array: any = [
    'document',
    'department',
    'jobtitle',
    'jobtype',
    'relationship',
    'language',
  ];
  showDocType = true;
  showDepartmentType = true;
  showJobtitle = true;
  showJobtype = true;
  showrelationship = true;
  showlanguage = true;
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;

  constructor (
    private router: Router,
    public translate: TranslateService,
    public SettingsServices: SettingsService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService,
    public commonService: CommonService,
  ) { }

  ngOnInit() {
    this.getDataDocumentType();
    this.getDataDepartment();
    this.getDataJobTitle();
    this.getDataJobType();
    this.getDataRelationship();
    this.getDataLanguage();
  }

  onTabChanged($event: { index: string | number; }) {
    this.currrent_tab = this.tab_Array[$event.index];
  }

  add() {
    if (this.currrent_tab == 'document') {
      const dialogRef = this.dialog.open(DocumentTypeFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.showDocType = false;
        setTimeout(() => {
          this.showDocType = true;
        }, 100);
      });
    } else if (this.currrent_tab == 'department') {
      const dialogRef = this.dialog.open(DepartmentFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.showDepartmentType = false;
        setTimeout(() => {
          this.showDepartmentType = true;
        }, 100);
      });
    } else if (this.currrent_tab == 'jobtitle') {
      const dialogRef = this.dialog.open(JobTitleFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.showJobtitle = false;
        setTimeout(() => {
          this.showJobtitle = true;
        }, 100);
      });
    } else if (this.currrent_tab == 'jobtype') {
      const dialogRef = this.dialog.open(JobTypeFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.showJobtype = false;
        setTimeout(() => {
          this.showJobtype = true;
        }, 100);
      });
    } else if (this.currrent_tab == 'relationship') {
      const dialogRef = this.dialog.open(RelationshipFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.showrelationship = false;
        setTimeout(() => {
          this.showrelationship = true;
        }, 100);
      });
    } else if (this.currrent_tab == 'language') {
      const dialogRef = this.dialog.open(LanguageFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.showlanguage = false;
        setTimeout(() => {
          this.showlanguage = true;
        }, 100);
      });
    }
  }

  edit(Document: any) {
    if (this.currrent_tab == 'document') {
      const dialogRef = this.dialog.open(DocumentTypeFormComponent, {
        width: '350px',
        data: Document,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDocumentType();
      });
    }
  }

  editDepartment(Department: any) {
    if (this.currrent_tab == 'department') {
      const dialogRef = this.dialog.open(DepartmentFormComponent, {
        width: '350px',
        data: Department,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDepartment();
      });
    }
  }

  editJobtitle(JobTitle: any) {
    if (this.currrent_tab == 'jobtitle') {
      const dialogRef = this.dialog.open(JobTitleFormComponent, {
        width: '350px',
        data: JobTitle,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobTitle();
      });
    }
  }

  editJobtype(JobType: any) {
    if (this.currrent_tab == 'jobtype') {
      const dialogRef = this.dialog.open(JobTypeFormComponent, {
        width: '350px',
        data: JobType,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobType();
      });
    }
  }

  editRelationship(Relationship: any) {
    if (this.currrent_tab == 'relationship') {
      const dialogRef = this.dialog.open(RelationshipFormComponent, {
        width: '350px',
        data: Relationship,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataRelationship();
      });
    }
  }

  editLanguage(Language: any) {
    if (this.currrent_tab == 'language') {
      const dialogRef = this.dialog.open(LanguageFormComponent, {
        width: '350px',
        data: Language,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataLanguage();
      });
    }
  }

  async getDataDocumentType() {
    const data = await this.SettingsServices.getDocumentType();
    if (data.status) {
      this.AllDocument = data.data;
    }
  }

  async getDataDepartment() {
    const data = await this.SettingsServices.getDepartment();
    if (data.status) {
      this.AllDepartment = data.data;
    }
  }

  async getDataJobTitle() {
    const data = await this.SettingsServices.getJobTitle();
    if (data.status) {
      this.AllJobTitle = data.data;
    }
  }

  async getDataJobType() {
    const data = await this.SettingsServices.getJobType();
    if (data.status) {
      this.AllJobType = data.data;
    }
  }

  async getDataRelationship() {
    const data = await this.SettingsServices.getRelationship();
    if (data.status) {
      this.AllRelationship = data.data;
    }
  }

  async getDataLanguage() {
    const data = await this.SettingsServices.getLanguage();
    if (data.status) {
      this.AllLanguage = data.data;
    }
  }

  async deleteDocumentType(Document: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.DOCUMENT'),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteDocumentType(
            Document._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataDocumentType();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteDepartment(Department: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.DEPARTMENT'),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteDepartments(
            Department._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataDepartment();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteJobType(JobType: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.JOBTYPE'),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteJobType(JobType._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataJobType();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteJobTitle(JobTitle: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.JOBTITLE'),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteJobTitle(JobTitle._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataJobTitle();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteRelationship(Relationship: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.RELATIONSHIP'),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteRelationship(
            Relationship._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataRelationship();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteLanguage(Language: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.LANGUAGE'),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteLanguage(Language._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataLanguage();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  onFileChange(ev: any) {
    let that = this;
    let workBook: any;
    let jsonData = null;
    let header: any;
    const reader = new FileReader();
    const file = ev.target.files[0];
    setTimeout(() => {
      ev.target.value = null;
    }, 200);
    reader.onload = async (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header = data.shift();
        return initial;
      }, {});
      let that = this;
      let apiurl = '';
      let keys_OLD;
      if (that.currrent_tab == 'document') {
        apiurl = httpversion.PORTAL_V1 + httproutes.SETTINGS_CHECK_IMPORT__DOCUMENT_TYPE;
        keys_OLD = configData.EXCEL_HEADER.DOCUMENT_TYPE;
      } else if (that.currrent_tab == 'department') {
        apiurl = httpversion.PORTAL_V1 + httproutes.SETTINGS_CHECK_IMPORT_DEPARTMENTS;
        keys_OLD = configData.EXCEL_HEADER.DEPARTMENT;
      } else if (that.currrent_tab == 'jobtitle') {
        apiurl = httpversion.PORTAL_V1 + httproutes.SETTINGS_CHECK_IMPORT_JOB_TITLE;
        keys_OLD = configData.EXCEL_HEADER.JOB_TITLE;
      } else if (that.currrent_tab == 'jobtype') {
        apiurl = httpversion.PORTAL_V1 + httproutes.SETTINGS_CHECK_IMPORT_JOB_TYPE;
        keys_OLD = configData.EXCEL_HEADER.JOB_TYPE;
      } else if (that.currrent_tab == 'relationship') {
        apiurl = httpversion.PORTAL_V1 + httproutes.SETTINGS_CHECK_IMPORT_RELATIONSHIP;
        keys_OLD = configData.EXCEL_HEADER.RELATIONSHIP;
      } else if (that.currrent_tab == 'language') {
        apiurl = httpversion.PORTAL_V1 + httproutes.SETTINGS_CHECK_IMPORT_LANGUAGE;
        keys_OLD = configData.EXCEL_HEADER.LANGUAGE;
      }
      if (JSON.stringify(keys_OLD?.sort()) != JSON.stringify(header.sort())) {
        showNotification(that.snackBar, this.translate.instant('COMMON.IMPORT.INVALID_EXCEL'), 'error');
        return;
      } else {
        const formData_profle = new FormData();
        formData_profle.append('file', file);

        that.uiSpinner.spin$.next(true);
        const data = await this.commonService.postRequestAPI(apiurl, formData_profle);
        if (data.status) {
          that.uiSpinner.spin$.next(false);
          that.exitData = data;
          const dialogRef = that.dialog.open(ExistListingComponent, {
            width: '750px',
            // height: '500px', 
            data: { data: that.exitData, tab: that.currrent_tab },
            disableClose: true,
          });

          dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
              if (result.module) {
                if (result.module == 'document') {
                  that.showDocType = false;
                  setTimeout(() => {
                    that.showDocType = true;
                  }, 100);
                } else if (result.module == 'department') {
                  that.showDepartmentType = false;
                  setTimeout(() => {
                    that.showDepartmentType = true;
                  }, 100);
                } else if (result.module == 'jobtitle') {
                  that.showJobtitle = false;
                  setTimeout(() => {
                    that.showJobtitle = true;
                  }, 100);
                } else if (result.module == 'jobtype') {
                  that.showJobtype = false;
                  setTimeout(() => {
                    that.showJobtype = true;
                  }, 100);
                } else if (result.module == 'relationship') {
                  that.showrelationship = false;
                  setTimeout(() => {
                    that.showrelationship = true;
                  }, 100);
                } else if (result.module == 'language') {
                  that.showlanguage = false;
                  setTimeout(() => {
                    that.showlanguage = true;
                  }, 100);
                }
              }
            }
          });
        } else {
          that.uiSpinner.spin$.next(false);
          showNotification(that.snackBar, data.message, 'error');

        }
      }
    };
    reader.readAsBinaryString(file);
  }

  refresh() {
    let that = this;
    if (that.currrent_tab == 'document') {
      that.showDocType = false;
      setTimeout(() => {
        that.showDocType = true;
      }, 100);
    } else if (that.currrent_tab == 'department') {
      that.showDepartmentType = false;
      setTimeout(() => {
        that.showDepartmentType = true;
      }, 100);
    } else if (that.currrent_tab == 'jobtitle') {
      that.showJobtitle = false;
      setTimeout(() => {
        that.showJobtitle = true;
      }, 100);
    } else if (that.currrent_tab == 'jobtype') {
      that.showJobtype = false;
      setTimeout(() => {
        that.showJobtype = true;
      }, 100);
    } else if (that.currrent_tab == 'relationship') {
      that.showrelationship = false;
      setTimeout(() => {
        that.showrelationship = true;
      }, 100);
    } else if (that.currrent_tab == 'language') {
      that.showlanguage = false;
      setTimeout(() => {
        that.showlanguage = true;
      }, 100);
    }
  }


  downloadImport() {
    if (this.currrent_tab == 'document') {
      const dialogRef = this.dialog.open(ImportEmployeeSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => { });
    } else if (this.currrent_tab == 'department') {
      const dialogRef = this.dialog.open(ImportEmployeeSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => { });
    } else if (this.currrent_tab == 'jobtitle') {
      const dialogRef = this.dialog.open(ImportEmployeeSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => { });
    } else if (this.currrent_tab == 'jobtype') {
      const dialogRef = this.dialog.open(ImportEmployeeSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => { });
    } else if (this.currrent_tab == 'relationship') {
      const dialogRef = this.dialog.open(ImportEmployeeSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => { });
    } else if (this.currrent_tab == 'language') {
      const dialogRef = this.dialog.open(ImportEmployeeSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => { });
    }
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }
}
