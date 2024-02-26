import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  // Commaon Settings for Horizontal and Vertical Navigation
  public navLayout = 'vertical';  // Value Should be 'horizontal' or 'vertical'
  public toggleStatus = true;     // Value Should be 'true' or 'false'
  public themeLayout = 'wide'; // value Should be 'wide', 'box'
  public headerHeight = 50;
  public asidebarHeight = window.innerHeight;
  public contentHeight = window.innerHeight - this.headerHeight;

  public defaultNavbar: string = "expended";    // Value Should be 'expended', 'collapsed', 'offcanvas', 'compact'
  public toggleNavbar: string = "expended";     // Value Should be 'expended', 'collapsed', 'offcanvas', 'compact'
  public navBarEffect: string = "shrink";     // Value Should be 'shrink', 'push', 'overlay'
  public deviceType: string = "desktop";       // Value should be mobile, tablet, desktop

  public headerColorTheme = 'theme1';
  public leftHeaderColorTheme = 'theme1';
  public navbarColorTheme = 'theme1';
  public activeNavColorTheme = 'theme1';

  // Setting Only for Vertical
  public collapsedLeftHeader = true;  // valshould be true, false
  public toggleOnHover = true;

  public defaultVerticalMenu = ['offcanvas', 'collapsed', 'expanded'];
  public onToggleVerticalMenu = ['expanded', 'expanded', 'collapsed'];
  public navBarMenuEffect = ['overlay', 'push', 'shrink'];
  public defaultDeviceType = ['mobile', 'tablet', 'desktop'];

  private setNavLayout = new BehaviorSubject<string>(this.navLayout);
  navLayoutCast = this.setNavLayout.asObservable();

  private setCollapsedLeftHeader = new BehaviorSubject<boolean>(this.collapsedLeftHeader);
  collapsedLeftHeaderCast = this.setCollapsedLeftHeader.asObservable();

  private tStatus = new BehaviorSubject<boolean>(this.toggleStatus);
  tStatusCast = this.tStatus.asObservable();

  private dfNavbar = new BehaviorSubject<string>(this.defaultNavbar);
  dfNavbarCast = this.dfNavbar.asObservable();

  private tNavbar = new BehaviorSubject<string>(this.toggleNavbar);
  toggleNavbarCast = this.tNavbar.asObservable();

  private nvEffect = new BehaviorSubject<string>(this.navBarEffect);
  nvEffectCast = this.nvEffect.asObservable();

  private setCtHeight = new BehaviorSubject<any>(this.contentHeight);
  contentHeightCast = this.setCtHeight.asObservable();

  private setAsidebarHeight = new BehaviorSubject<any>(this.asidebarHeight);
  setAsidebarHeightCast = this.setAsidebarHeight.asObservable();

  private setHeaderTheme = new BehaviorSubject<string>(this.headerColorTheme);
  headerThemeCast = this.setHeaderTheme.asObservable();

  private setLeftHeaderTheme = new BehaviorSubject<string>(this.leftHeaderColorTheme);
  leftHeaderThemeCast = this.setLeftHeaderTheme.asObservable();

  private setNavbarTheme = new BehaviorSubject<string>(this.navbarColorTheme);
  navbarThemeCast = this.setNavbarTheme.asObservable();

  private SetActiveNavTheme = new BehaviorSubject<string>(this.activeNavColorTheme);
  activeNavThemeCast = this.SetActiveNavTheme.asObservable();

  private SetThemeLayout = new BehaviorSubject<string>(this.themeLayout);
  themeLayoutCast = this.SetThemeLayout.asObservable();

  private appDeviceType = new BehaviorSubject<string>(this.deviceType);
  deviceTypeCast = this.appDeviceType.asObservable();


  constructor() {
  }
  getToggleStatus() {
    this.toggleStatus = !this.toggleStatus;
    this.tStatus.next(this.toggleStatus);
  }
  getDefaultNavbar(defaultNavbar: string) {
    this.dfNavbar.next(defaultNavbar);
  }
  getToggleNavbar(toggleNavbar: string) {
    this.tNavbar.next(toggleNavbar);
  }
  getNavBarEffect(navbarEffect: string) {
    this.nvEffect.next(navbarEffect);
  }
  getDeviceType(dt: string) {
    this.appDeviceType.next(dt);
  }
  getThemeLayout(tl: string) {
    this.SetThemeLayout.next(tl);
  }
  getCollapsedLeftHeader(clh: boolean) {
    this.setCollapsedLeftHeader.next(clh);
  }
  getNavLayout(nl: string) {
    this.setNavLayout.next(nl);
  }
  getLeftHeaderThemeOnChange(themeName: string) {
    this.setLeftHeaderTheme.next(themeName);
  }
  getHeaderThemeOnChange(themeName: string) {
    this.setHeaderTheme.next(themeName);
  }
  getAsidebarThemeOnChange(themeName: string) {
    this.setNavbarTheme.next(themeName);
  }

  // This function called from page Core component load and resize
  checkWindowWidth(windowWidth: number) {
    if (this.navLayout === 'vertical') {
      if (windowWidth >= 768 && windowWidth <= 1024) {
        this.defaultNavbar = this.defaultVerticalMenu[1];
        this.toggleNavbar = this.onToggleVerticalMenu[1];
        this.navBarEffect = this.navBarMenuEffect[1];
        this.deviceType = this.defaultDeviceType[1];
      } else if (windowWidth < 768) {
        this.defaultNavbar = this.defaultVerticalMenu[0];
        this.toggleNavbar = this.onToggleVerticalMenu[0];
        this.navBarEffect = this.navBarMenuEffect[0];
        this.deviceType = this.defaultDeviceType[0];
      } else {
        this.defaultNavbar = this.defaultVerticalMenu[2];
        this.toggleNavbar = this.onToggleVerticalMenu[2];
        this.navBarEffect = this.navBarMenuEffect[2];
        this.deviceType = this.defaultDeviceType[2];
      }
    } else if (this.navLayout === 'horizontal') {
      if (windowWidth >= 768 && windowWidth <= 1024) {
        this.deviceType = this.defaultDeviceType[1];
      } else if (windowWidth < 768) {
        this.deviceType = this.defaultDeviceType[0];
      } else {
        this.deviceType = this.defaultDeviceType[2];
      }
    }
    this.getDefaultNavbar(this.defaultNavbar);
    this.getToggleNavbar(this.toggleNavbar);
    this.getNavBarEffect(this.navBarEffect);
    this.getDeviceType(this.deviceType);
  }

  getVerticalNavbarOnWindowResize(windowWidth: number) {
    this.checkWindowWidth(windowWidth);
  }

}
