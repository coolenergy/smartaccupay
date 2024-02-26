/*
 *
 * Rovuk A/P
 *
 * This class is the Language selection class and user can change language of the portal.
 * Language option is hide for Rovuk A/P. May be introduce in future.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */


import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { icon, localstorageconstants } from 'src/app/consts';
import { configdata } from 'src/environments/configData';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent {

  selectlanguage: string;
  public colors: string[] = [
    'yellow',
    'green',
    'blue',
    'pink'
  ];

  //Get Supported language data from configdata
  public languages_new: any[] = configdata.LANGUAGE_ARRAY;
  languageIcon = icon.LANGUAGELIGHT_ICON;
  /*
    Constructor
  */
  constructor(public translate: TranslateService) {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.selectlanguage = locallanguage;
  }

  // Here language changes and we store that in localstorage
  public changeLanguage(lanuage_select: any) {
    localStorage.setItem(localstorageconstants.LANGUAGE, lanuage_select);
    this.selectlanguage = lanuage_select;
    this.translate.use(lanuage_select);
  }
}
