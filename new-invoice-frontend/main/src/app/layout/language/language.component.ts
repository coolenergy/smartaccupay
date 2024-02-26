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
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { configData } from 'src/environments/configData';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent {

  selectlanguage: string;
  public colors: string[] = [
    'englishColor',
    'spanishColor',
  ];

  //Get Supported language data from configdata
  public languages_new: any[] = configData.LANGUAGE_ARRAY;

  /*
    Constructor
  */
  constructor (public translate: TranslateService) {
    const tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    const locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configData.INITIALLANGUAGE : tmp_locallanguage;
    this.selectlanguage = locallanguage;
  }

  // Here language changes and we store that in localstorage
  public changeLanguage(language_select: any) {
    localStorage.setItem(localstorageconstants.LANGUAGE, language_select);
    this.selectlanguage = language_select;
    this.translate.use(language_select);
  }
}
