import { Direction } from '@angular/cdk/bidi';
import { Component, Inject, Renderer2 } from '@angular/core';
import { InConfiguration } from 'src/app/core/models/config.interface';
import { DirectionService } from 'src/app/core/service/direction.service';
import { ConfigService } from 'src/app/config/config.service';
import { DOCUMENT } from '@angular/common';
import { localstorageconstants } from 'src/consts/localstorageconstants';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: [],
})
export class AuthLayoutComponent {
  direction!: Direction;
  public config!: InConfiguration;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private directoryService: DirectionService,
    private configService: ConfigService,
    private renderer: Renderer2
  ) {
    this.config = this.configService.configData;
    this.directoryService.currentData.subscribe((currentData) => {
      if (currentData) {
        this.direction = currentData === 'ltr' ? 'ltr' : 'rtl';
      } else {
        if (localStorage.getItem('isRtl')) {
          if (localStorage.getItem('isRtl') === 'true') {
            this.direction = 'rtl';
          } else if (localStorage.getItem('isRtl') === 'false') {
            this.direction = 'ltr';
          }
        } else {
          if (this.config) {
            if (this.config.layout.rtl === true) {
              this.direction = 'rtl';
              localStorage.setItem('isRtl', 'true');
            } else {
              this.direction = 'ltr';
              localStorage.setItem('isRtl', 'false');
            }
          }
        }
      }
    });

    // set theme on startup
    if (localStorage.getItem(localstorageconstants.DARKMODE)) {
      this.renderer.removeClass(this.document.body, this.config.layout.variant);
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem(localstorageconstants.DARKMODE) as string
      );
    } else {
      this.renderer.addClass(this.document.body, this.config.layout.variant);
    }
  }
}
