import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WEB_ROUTES } from 'src/consts/routes';
import { SettingsService } from '../settings.service';
import { CompanyModel } from 'src/consts/common.model';
import { icon } from 'src/consts/icon';

export interface SettingModule {
  title: string;
  icon: string;
  click: () => void;
}

@Component({
  selector: 'app-allsettings',
  templateUrl: './allsettings.component.html',
  styleUrls: ['./allsettings.component.scss'],
})
export class AllsettingsComponent {
  settingsList: Array<SettingModule> = [
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOXES'),
      icon: 'fas fa-inbox bg-red sell-icon',
      click: this.openMailboxListing,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE'),
      icon: 'fas fa-user bg-pink sell-icon',
      click: this.openEmployeeSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.ROLE'),
      icon: 'fas fa-sliders-h bg-purple sell-icon',
      click: this.openRolesSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.ALERTS'),
      icon: 'fas fa-bell bg-indigo sell-icon',
      click: this.openAlertsSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.SMTP'),
      icon: 'fas fa-envelope bg-blue sell-icon',
      click: this.openSMTPSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.INTEGRATION'),
      icon: 'fas fa-puzzle-piece bg-cyan sell-icon',
      click: this.openIntegrations,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.USAGE'),
      icon: 'fas fa-database bg-teal sell-icon',
      click: this.openUsage,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS'),
      icon: 'fas fa-cog bg-green sell-icon',
      click: this.openOtherSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.SECURITY'),
      icon: 'fas fa-lock bg-yellow sell-icon',
      click: this.openSecurity,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.COST_CODE'),
      icon: 'fas fa-dollar-sign bg-orange sell-icon',
      click: this.openCostcode,
    },
  ];
  companyData: CompanyModel = {
    _id: '',
    companyname: '',
    companyemail: '',
    companystatus: '',
    companylogo: icon.INVOICE_LOGO,
    companylanguage: '',
    companycode: '',
    companytype: '',
    companydivision: '',
    companysize: '',
    companyphone: '',
    companyphone2: '',
    companywebsite: '',
    companyaddress: '',
    companyaddresscity: '',
    companyaddressstate: '',
    companyaddresszip: '',
    companyactivesince: '',
  };
  // variablesCompnayTypes_data: any = [];
  // variablesCSIDivisions: any = [];
  // variablesCompnaySizes_data: any = [];
  getOne_CompanyType_id = ' ';
  getOne_Nigp_id = ' ';
  getOne_Company_Size_id = ' ';
  companyTypeName = ' ';
  companySizeName = ' ';
  NigpCode = ' ';
  loadData = false;

  constructor (
    private router: Router,
    public translate: TranslateService,
    public SettingsServices: SettingsService
  ) {
    this.getOneCompany();
    //constructor
  }

  async getOneCompany() {
    const data = await this.SettingsServices.getCompanyInfo();
    this.companyData = data.data;
    this.getOne_CompanyType_id = this.companyData.companytype;
    this.getOne_Nigp_id = this.companyData.companydivision;
    this.getOne_Company_Size_id = this.companyData.companysize;
    this.getCompanyType();
    this.getCompanyNigp();
    this.getCompanySize();
    this.loadData = true;
  }

  async getCompanyType() {
    const data = await this.SettingsServices.getCompanyType();
    if (data.status) {
      const companyTypes = data.data;
      if (companyTypes.length > 0) {
        for (let i = 0; i < companyTypes.length; i++) {
          if (companyTypes[i]._id == this.getOne_CompanyType_id) {
            this.companyTypeName = companyTypes[i].name;
          }
        }
      }
    }
  }

  async getCompanyNigp() {
    const data = await this.SettingsServices.getCompanyNigp();
    if (data.status) {
      const csiDivisions = data.data;
      if (csiDivisions.length > 0) {
        for (let i = 0; i < csiDivisions.length; i++) {
          if (csiDivisions[i]._id == this.getOne_Nigp_id) {
            this.NigpCode = csiDivisions[i].name;
          }
        }
      }
    }
  }

  async getCompanySize() {
    const data = await this.SettingsServices.getCompanySize();
    if (data.status) {
      const companySizes = data.data;
      if (companySizes.length > 0) {
        for (let i = 0; i < companySizes.length; i++) {
          if (companySizes[i]._id == this.getOne_Company_Size_id) {
            this.companySizeName = companySizes[i].name;
          }
        }
      }
    }
  }

  openMailboxListing() {
    this.router.navigate([WEB_ROUTES.MAILBOX_SETTING]);
  }

  openEmployeeSettings() {
    this.router.navigate([WEB_ROUTES.EMPLOYEE_SETTING]);
  }

  openRolesSettings() {
    this.router.navigate([WEB_ROUTES.ROLE_SETTING]);
  }

  openAlertsSettings() {
    this.router.navigate([WEB_ROUTES.ALERT_SETTING]);
  }

  openSMTPSettings() {
    this.router.navigate([WEB_ROUTES.SMTP_SETTING]);
  }

  openIntegrations() {
    this.router.navigate([WEB_ROUTES.INTEGRATION_SETTING]);
  }

  openUsage() {
    this.router.navigate([WEB_ROUTES.USAGE_SETTING]);
  }

  openOtherSettings() {
    this.router.navigate([WEB_ROUTES.OTHER_SETTING]);
  }

  openSecurity() {
    this.router.navigate([WEB_ROUTES.SECURITY_SETTING]);
  }

  openCostcode() {
    this.router.navigate([WEB_ROUTES.COSTCODE_SETTING]);
  }

  openDocumentView() {
    this.router.navigate([WEB_ROUTES.DOCUMENT_VIEW_SETTING]);
  }

  editPress() {
    this.router.navigate([WEB_ROUTES.COMPANY_INFO_FORM_SETTING]);
  }
}
