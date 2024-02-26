import { Direction } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { InConfiguration } from 'src/app/core/models/config.interface';
import { DirectionService } from 'src/app/core/service/direction.service';
import { ConfigService } from 'src/app/config/config.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: [],
})
export class MainLayoutComponent {
  direction!: Direction;
  public config!: InConfiguration;
  constructor(
    private directoryService: DirectionService,
    private configService: ConfigService
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
  }
}
