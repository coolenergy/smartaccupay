import { Component, OnInit, Input, HostListener } from '@angular/core';
import { LayoutService } from '../../shared/services/layout.service';

@Component({
  selector: 'app-content-section',
  templateUrl: './content-section.component.html',
  styleUrls: ['./content-section.component.scss']
})

export class ContentSectionComponent implements OnInit {
  screenTitle = 'Page Title';
  contentHeight: number;
  @Input() navLayout: string;
  @Input() defaultNavbar: string;
  @Input() toggleNavbar: string;
  @Input() toggleStatus: boolean;
  @Input() navbarEffect: string;
  @Input() deviceType: string;
  @Input() headerColorTheme: string;
  @Input() navbarColorTheme: string;
  @Input() activeNavColorTheme: string;
  @Input() showHeader: boolean = true;

  selectlanguage: string;
  constructor(private layoutService: LayoutService) { }

  ngOnInit() {
    if (this.showHeader) {
      this.layoutService.contentHeightCast.subscribe(setCtHeight => this.contentHeight = setCtHeight);
    } else {
      this.layoutService.contentHeightCast.subscribe(setCtHeight => this.contentHeight = setCtHeight + this.layoutService.headerHeight);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResizeHeight(event: any) {
    if (this.showHeader) {
      this.contentHeight = window.innerHeight - this.layoutService.headerHeight;
    } else {
      this.contentHeight = window.innerHeight;
    }
  }
}
