import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxGalleryImage, NgxGalleryAnimation, NgxGalleryImageSize } from 'ngx-gallery-9';
import { commonNewtworkAttachmentViewer } from 'src/app/service/utils';
@Component({
  selector: 'app-customimageviewer',
  templateUrl: './customimageviewer.component.html',
  styleUrls: ['./customimageviewer.component.scss']
})
export class CustomimageviewerComponent implements OnInit {
  gallery: any[] = [];
  tmpgallery: any[];
  indexNo: any;
  galleryOptions: any;
  galleryImages: NgxGalleryImage[] = [];
  @ViewChild('gallery') customgallery: any;

  constructor (private location: Location, public domS: DomSanitizer, public route: ActivatedRoute, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.tmpgallery = data.imageList;
    this.indexNo = data.openIndex;
    this.galleryImages = commonNewtworkAttachmentViewer(this.tmpgallery);
  }

  print(image: any, index: any) {
    fetch(this.tmpgallery[index]).then(resp => resp.arrayBuffer()).then(resp => {
      /*--- set the blog type to final pdf ---*/
      var extension = this.tmpgallery[index].substring(this.tmpgallery[index].lastIndexOf('.') + 1);
      const file = new Blob([resp], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(file);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow!.print();
    });
  }

  download(image: any, index: any) {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body ---*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = this.tmpgallery[index];
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }

  ngOnInit(): void {
    this.galleryOptions = [
      {
        width: '800px',
        height: '600px',
        imageArrowsAutoHide: false,
        imageAutoPlay: false,
        //imageAutoPlayInterval: 5000,
        thumbnails: false,
        preview: true,
        thumbnailsColumns: 4,
        imagePercent: 50,
        previewFullscreen: true,
        previewForceFullscreen: true,
        //imageAutoPlayPauseOnHover: true,
        imageSize: NgxGalleryImageSize.Contain,
        previewZoom: true,
        previewRotate: true,
        previewCloseOnClick: true,
        previewCloseOnEsc: true,
        previewAutoPlay: false,
        imageAnimation: NgxGalleryAnimation.Fade,
        imageActions: [{ icon: 'fas fa-download', onClick: this.downloadButtonPress.bind(this), titleText: 'download' }],
      },
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 100,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      {
        breakpoint: 400,
        preview: false
      }
    ];
  }

  downloadButtonPress(event: any, index: any): void {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body ---*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = this.tmpgallery[index];
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }

  printButtonPress(event: any, index: any): void {
    fetch(this.tmpgallery[index]).then(resp => resp.arrayBuffer()).then(resp => {
      /*--- set the blog type to final pdf ---*/
      var extension = this.tmpgallery[index].substring(this.tmpgallery[index].lastIndexOf('.') + 1);
      const file = new Blob([resp], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(file);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow!.print();
    });
  }

  public ngAfterViewInit() {
  }

  back() {
    this.location.back();
  }
}
