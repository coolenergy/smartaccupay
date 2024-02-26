import { Component, OnInit, HostListener } from "@angular/core";
import { LayoutService } from "../../shared/services/layout.service";
import { TranslateService } from "@ngx-translate/core";
import { configdata } from "src/environments/configData";
import { localstorageconstants } from "src/app/consts";
// import { localstorageconstants } from 'src/app/consts';

@Component({
  selector: "app-form-core",
  templateUrl: "./form-core.component.html",
  styleUrls: ["./form-core.component.scss"],
})
export class FormCoreComponent implements OnInit {
  setNavLayout: string;
  themeLayout: string;
  setDefaultNavbar: string;
  setToggleNavbar: string;
  setToggleStatus: boolean = false;
  setVerticalNavbarEffect: string;
  setDeviceType: string;
  setHeaderColorTheme: string;
  setLeftHeaderColorTheme: string;
  setNavbarColorTheme: string;
  setActiveNavColorTheme: string;
  setHeaderHeight: number;
  setFooterHeight: number;
  setCollapsedLeftHeader: boolean;
  showHeader: boolean = false;

  constructor(
    private layoutService: LayoutService,
    public translate: TranslateService
  ) {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage =
      tmp_locallanguage == "" ||
        tmp_locallanguage == undefined ||
        tmp_locallanguage == null
        ? configdata.fst_load_lang
        : tmp_locallanguage;

    localStorage.setItem(localstorageconstants.LANGUAGE, locallanguage);
    this.translate.use(locallanguage);

    var tmp_local_mode = localStorage.getItem(localstorageconstants.DARKMODE);
    var localmode =
      tmp_local_mode == "" ||
        tmp_local_mode == undefined ||
        tmp_local_mode == null
        ? configdata.tmp_localmode
        : tmp_local_mode;
    var body = document.getElementsByTagName("body")[0];
    // this.usertype = sessionStorage.getItem(localstorageconstants.USERTYPE) ? sessionStorage.getItem(localstorageconstants.USERTYPE) : "portal";
    if (localmode === "on") {
      body.classList.add("darkMode");
      this.layoutService.getLeftHeaderThemeOnChange("theme2");
      this.layoutService.getHeaderThemeOnChange("theme2");
      this.layoutService.getAsidebarThemeOnChange("theme2");
    } else {
      localStorage.setItem("darkmode", "off");
      body.classList.remove("darkMode");
      this.layoutService.getLeftHeaderThemeOnChange("theme1");
      this.layoutService.getHeaderThemeOnChange("theme1");
      this.layoutService.getAsidebarThemeOnChange("theme1");
    }
  }

  ngOnInit() {
    this.layoutService.checkWindowWidth(window.innerWidth);

    this.layoutService.navLayoutCast.subscribe(
      (navlayout) => (this.setNavLayout = navlayout)
    );

    this.layoutService.dfNavbarCast.subscribe(
      (dfNavbar) => (this.setDefaultNavbar = dfNavbar)
    );

    this.layoutService.toggleNavbarCast.subscribe(
      (tNavbar) => (this.setToggleNavbar = tNavbar)
    );

    /* this.layoutService.tStatusCast.subscribe(
      tStatus => (this.setToggleStatus = tStatus)
    ); */

    this.layoutService.nvEffectCast.subscribe(
      (nvEffect) => (this.setVerticalNavbarEffect = nvEffect)
    );

    this.layoutService.headerThemeCast.subscribe(
      (headerTheme) => (this.setHeaderColorTheme = headerTheme)
    );

    this.layoutService.leftHeaderThemeCast.subscribe(
      (leftHeaderTheme) => (this.setLeftHeaderColorTheme = leftHeaderTheme)
    );

    this.layoutService.navbarThemeCast.subscribe(
      (navbarTheme) => (this.setNavbarColorTheme = navbarTheme)
    );

    this.layoutService.activeNavThemeCast.subscribe(
      (activeNavTheme) => (this.setActiveNavColorTheme = activeNavTheme)
    );

    this.layoutService.themeLayoutCast.subscribe(
      (themeLayout) => (this.themeLayout = themeLayout)
    );

    this.layoutService.collapsedLeftHeaderCast.subscribe(
      (collapsedLeftHeader) =>
        (this.setCollapsedLeftHeader = collapsedLeftHeader)
    );

    this.layoutService.deviceTypeCast.subscribe(
      (appDeviceType) => (this.setDeviceType = appDeviceType)
    );

    this.setHeaderHeight = this.layoutService.headerHeight;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.layoutService.getVerticalNavbarOnWindowResize(event.target.innerWidth);
  }
  changeTheToggleStatus() {
    this.layoutService.getToggleStatus();
  }
}
