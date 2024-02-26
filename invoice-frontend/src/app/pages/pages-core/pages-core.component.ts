import { Component, OnInit, HostListener } from '@angular/core';
import { LayoutService } from '../../shared/services/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from 'src/app/consts';


@Component({
  selector: 'app-pages-core',
  templateUrl: './pages-core.component.html',
  styleUrls: ['./pages-core.component.scss']
})

export class PagesCoreComponent implements OnInit {
  setNavLayout: any;
  themeLayout: any;
  setDefaultNavbar: any;
  setToggleNavbar: any;
  setToggleStatus: any;
  setVerticalNavbarEffect: any;
  setDeviceType: any;
  setHeaderColorTheme: any;
  setLeftHeaderColorTheme: any;
  setNavbarColorTheme: any;
  setActiveNavColorTheme: any;
  setHeaderHeight: any;
  setFooterHeight: any;
  setCollapsedLeftHeader: any;

  constructor(private layoutService: LayoutService, public translate: TranslateService) {

    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;

    localStorage.setItem(localstorageconstants.LANGUAGE, locallanguage);
    this.translate.use(locallanguage);
  }

  ngOnInit() {
    this.layoutService.checkWindowWidth(window.innerWidth);

    this.layoutService.navLayoutCast.subscribe(
      navlayout => (this.setNavLayout = navlayout)
    );

    this.layoutService.dfNavbarCast.subscribe(
      dfNavbar => (this.setDefaultNavbar = dfNavbar)
    );

    this.layoutService.toggleNavbarCast.subscribe(
      tNavbar => (this.setToggleNavbar = tNavbar)
    );

    this.layoutService.tStatusCast.subscribe(
      tStatus => (this.setToggleStatus = tStatus)
    );

    this.layoutService.nvEffectCast.subscribe(
      nvEffect => (this.setVerticalNavbarEffect = nvEffect)
    );

    this.layoutService.headerThemeCast.subscribe(
      headerTheme => (this.setHeaderColorTheme = headerTheme)
    );

    this.layoutService.leftHeaderThemeCast.subscribe(
      leftHeaderTheme => (this.setLeftHeaderColorTheme = leftHeaderTheme)
    );

    this.layoutService.navbarThemeCast.subscribe(
      navbarTheme => (this.setNavbarColorTheme = navbarTheme)
    );

    this.layoutService.activeNavThemeCast.subscribe(
      activeNavTheme => (this.setActiveNavColorTheme = activeNavTheme)
    );

    this.layoutService.themeLayoutCast.subscribe(
      themeLayout => (this.themeLayout = themeLayout)
    );

    this.layoutService.collapsedLeftHeaderCast.subscribe(
      collapsedLeftHeader => (this.setCollapsedLeftHeader = collapsedLeftHeader)
    );

    this.layoutService.deviceTypeCast.subscribe(
      appDeviceType => (this.setDeviceType = appDeviceType)
    );

    this.setHeaderHeight = this.layoutService.headerHeight;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.layoutService.getVerticalNavbarOnWindowResize(event.target.innerWidth);
  }
  changeTheToggleStatus() {
    this.layoutService.getToggleStatus();
  }
}
