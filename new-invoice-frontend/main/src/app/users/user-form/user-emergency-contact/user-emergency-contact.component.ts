import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { HttpCall } from 'src/app/services/httpcall.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder } from '@angular/forms';
import { UserService } from '../../user.service';
import { EmergencyContact } from '../../user.model';
import { WEB_ROUTES } from 'src/consts/routes';
import { MMDDYYYY, formatPhoneNumber, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';
import { TableElement } from 'src/app/shared/TableElement';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { RolePermission } from 'src/consts/common.model';

@Component({
  selector: 'app-user-emergency-contact',
  templateUrl: './user-emergency-contact.component.html',
  styleUrls: ['./user-emergency-contact.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class UserEmergencyContactComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = [
    'name',
    'relationship',
    'email',
    'phone',
    'address',
    // 'validate',
    'actions',
  ];
  userService?: UserService;
  dataSource!: EmergencyContactDataSource;
  selection = new SelectionModel<EmergencyContact>(true, []);
  advanceTable?: EmergencyContact;
  id: any;
  role_permission!: RolePermission;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  constructor (
    public httpClient: HttpClient, private httpCall: HttpCall, public dialog: MatDialog, private snackBar: MatSnackBar,
    private router: Router, public userTableService: UserService, public translate: TranslateService,
    private fb: UntypedFormBuilder, public route: ActivatedRoute, private commonService: CommonService,) {
    super();
    this.id = this.route.snapshot.queryParamMap.get("_id");
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
  }

  ngOnInit() {
    this.loadData();
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  refresh() {
    this.loadData();
  }

  public loadData() {
    this.userService = new UserService(this.httpCall);
    this.dataSource = new EmergencyContactDataSource(
      this.userService,
      this.paginator,
      this.sort,
      this.id
    );
    this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(
      () => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      }
    );
  }

  // context menu
  onContextMenu(event: MouseEvent, item: EmergencyContact) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  addNewEmergencyContact() {
    this.router.navigate([WEB_ROUTES.USER_EMERGENCY_CONTACT_FORM], { queryParams: { user_id: this.id } });
  }

  editEmergencyContact(contact: EmergencyContact) {
    this.router.navigate([WEB_ROUTES.USER_EMERGENCY_CONTACT_FORM], { queryParams: { _id: contact._id, user_id: this.id } });
  }

  deleteEmergencyContact(contact: EmergencyContact) {
    swalWithBootstrapTwoButtons
      .fire({
        title: this.translate.instant('EMERGENCY_CONTACT.CONFIRMATION_DIALOG.DELETE'),
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: "No",
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_EMERGENCY_CONTACT, { _id: contact._id });
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            const foundIndex = this.userService?.emergencyDataChange.value.findIndex(
              (x) => x._id === contact._id
            );
            console.log('foundIndex: ', foundIndex);
            // for delete we use splice in order to remove single object from DataService
            if (foundIndex != null && this.userService) {
              console.log("find");
              this.userService.emergencyDataChange.value.splice(foundIndex, 1);
              this.refreshTable();
            }
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  temp_MMDDYYYY(epoch: number) {
    return MMDDYYYY(epoch);
  }

  tmpFormatPhone(phone: string) {
    return formatPhoneNumber(phone);
  }

  exportExcel() {
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x) => ({
        'Name': x.emergency_contact_name || '',
        'Relation': x.relationship_name || '',
        'Email': x.emergency_contact_email || '',
        'Phone': formatPhoneNumber(x.emergency_contact_phone) || '',
        'Address': `${x.emergency_contact_street1 === '' ? '' : x.emergency_contact_street1 + ","} 
        ${x.emergency_contact_city === "" ? "" : x.emergency_contact_city + ","} 
        ${x.emergency_contact_state === "" ? "" : x.emergency_contact_state}`,
        'Last Validation Date': x.is_validated ? this.temp_MMDDYYYY(Number(x.validated_at.toString())) : '',
      }));
    TableExportUtil.exportToExcel(exportData, 'excel');
  }
}

// This class is used for datatable sorting and searching
export class EmergencyContactDataSource extends DataSource<EmergencyContact> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: EmergencyContact[] = [];
  renderedData: EmergencyContact[] = [];
  constructor (
    public userService: UserService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public id: string,
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<EmergencyContact[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.userService.emergencyDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.userService.getEmergencyContactForTable(this.id);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.userService.emergencyData
          .slice()
          .filter((advanceTable: EmergencyContact) => {
            const searchStr = (
              advanceTable.emergency_contact_name +
              advanceTable.relationship_name +
              advanceTable.emergency_contact_email +
              advanceTable.emergency_contact_phone +
              advanceTable.emergency_contact_street1 +
              advanceTable.emergency_contact_street2 +
              advanceTable.emergency_contact_city
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this.paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() {
    //disconnect
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: EmergencyContact[]): EmergencyContact[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case '_id':
          [propertyA, propertyB] = [a._id, b._id];
          break;
        case 'emergency_contact_name':
          [propertyA, propertyB] = [a.emergency_contact_name, b.emergency_contact_name];
          break;
        case 'relationship_name':
          [propertyA, propertyB] = [a.relationship_name, b.relationship_name];
          break;
        case 'emergency_contact_email':
          [propertyA, propertyB] = [a.emergency_contact_email, b.emergency_contact_email];
          break;
        case 'emergency_contact_phone':
          [propertyA, propertyB] = [a.emergency_contact_phone, b.emergency_contact_phone];
          break;
        case 'emergency_contact_street1':
          [propertyA, propertyB] = [a.emergency_contact_street1, b.emergency_contact_street1];
          break;
        case 'validated_at':
          [propertyA, propertyB] = [a.validated_at, b.validated_at];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
