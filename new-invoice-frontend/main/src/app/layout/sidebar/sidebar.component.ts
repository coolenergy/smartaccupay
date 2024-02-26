import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, ElementRef, OnInit, Renderer2, HostListener, OnDestroy, } from '@angular/core';
import { AuthService } from 'src/app/core/service/auth.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { RolePermission } from 'src/consts/common.model';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  public sidebarItems!: any;
  public userrole: any;
  public role_permission!: RolePermission;
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  companyName?: string;
  companyLogo?: string;
  companyCode?: string;
  headerHeight = 60;
  currentRoute?: string;
  routerObj;
  constructor (
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router
  ) {
    this.routerObj = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
    this.userrole = localStorage.getItem(localstorageconstants.USERROLE) ? localStorage.getItem(localstorageconstants.USERROLE) : 1;
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
    let index = 0;
    this.sidebarItems = [];
    if (this.role_permission.dashboard.View == true) {
      const reqObj = {
        path: WEB_ROUTES.DASHBOARD,
        title: 'Dashboard',
        iconType: 'material-icons-two-tone',
        icon: 'dashboard',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);
    }
    if (this.role_permission.vendor.View == true) {
      const reqObj = {
        path: WEB_ROUTES.VENDOR,
        title: 'Vendors',
        iconType: 'material-icons-two-tone',
        icon: 'local_shipping',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);
    }
    if (this.role_permission.clientJob.View == true) {
      const reqObj = {
        path: WEB_ROUTES.CLIENT,
        title: 'Client/Job Names',
        iconType: 'material-icons-two-tone',
        icon: 'account_circle',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);
    }
    if (this.role_permission.invoice.View == true) {
      const reqObj = {
        path: 'invoice',
        title: 'Invoices',
        iconType: 'material-icons-two-tone',
        icon: 'receipt',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);
    }
    if (this.role_permission.documents.View == true) {
      const reqObj = {
        path: WEB_ROUTES.SIDEMENU_DOCUMENTS,
        title: 'Documents',
        iconType: 'material-icons-two-tone',
        icon: 'folder',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);
    }
    if (this.role_permission.reports.View == true) {
      const reqObj = {
        path: WEB_ROUTES.SIDEMENU_REPORTS,
        title: 'Reports',
        iconType: 'material-icons-two-tone',
        icon: 'event_note',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);
    }
    if (this.role_permission.users.View == true) {
      const reqObj = {
        path: WEB_ROUTES.SIDEMENU_USER,
        title: 'Users',
        iconType: 'material-icons-two-tone',
        icon: 'people',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);

    }

    if (this.role_permission.settings.View == true) {
      const reqObj = {
        path: WEB_ROUTES.SIDEMENU_SETTINGS,
        title: 'Settings',
        iconType: 'material-icons-two-tone',
        icon: 'settings',
        class: '',
        groupTitle: false,
        badge: '',
        badgeClass: '',
        submenu: [],
      };
      this.sidebarItems.splice(index++, 0, reqObj);
    }



  }
  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }
  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const activeClass = parentElement?.classList.contains('active');

      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }
  ngOnInit() {
    const user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.companyName = user_data.companydata.companyname;
    this.companyLogo = user_data.companydata.companylogo;
    this.companyCode = user_data.companydata.companycode;
    if (this.authService.currentUserValue) {
      // this.sidebarItems = ROUTES.filter((sidebarItem) => sidebarItem);
    }
    this.initLeftSidebar();
    this.bodyTag = this.document.body;


  }
  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }
  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1170) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }
  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
}
