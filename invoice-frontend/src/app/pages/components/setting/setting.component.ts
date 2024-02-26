import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { icon } from 'src/app/consts';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false, showError: true }
  }]
})

export class SettingComponent implements OnInit {
  firstFormGroup: any;
  secondFormGroup: any;
  companyinfo = icon.COMPANY_INFO;
  companyinfo_white = icon.COMPANY_INFO_WHITE;
  roleIcon = icon.ROLE;
  roleicon_white = icon.ROLE_WHITE;
  smtp = icon.SMTP;
  smtp_white = icon.SMTP_WHITE;
  website_plugin = icon.WEBSITE_PLUGIN;
  website_plugin_white = icon.WEBSITE_PLUGIN_WHITE;
  other_settings = icon.OTHER_SETTINGS;
  other_settings_white = icon.OTHER_SETTINGS_WHITE;
  userIcon_white = icon.USERLIGHT_ICON;
  userIcon = icon.USER;
  integrationIcon = icon.INTEGRATION;
  integration_whiteIcon = icon.INTEGRATION_WHITE;
  usageIcon = icon.USAGE;
  usage_whiteIcon = icon.USAGE_WHITE;
  costcode = icon.COSTCODE;
  costcode_white = icon.COSTCODE_WHITE;
  security_settings = icon.SECURITY_SETTINGS;
  security_settings_white = icon.SECURITY_SETTINGS_WHITE;
  Document_view = icon.DAILY_REPORT;
  Document_view_white = icon.DAILY_REPORT_WHITE;
  MAILBOX_BLACK = icon.MAILBOX_BLACK;
  MAILBOX_WHILE = icon.MAILBOX_WHILE;
  step_index: number = 0;

  constructor(private router: Router) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.step_index = Number(
        this.router.getCurrentNavigation().extras.state.value
      );
      // this.tab_array = this.tab_array[this.step_index];
    }
  }

  ngOnInit(): void { }

  routefun() {
    this.router.navigate(['/settings']);
  }

  selectionChange(event) {
    let that = this;
    that.step_index = event.selectedIndex;
  }

}
