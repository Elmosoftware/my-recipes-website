import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaService } from "../services/media-service";
import { FileDropperComponent } from '../shared/file-dropper/file-dropper.component';

@Component({
  selector: 'app-test-new-stuff',
  templateUrl: './test-new-stuff.component.html',
  styleUrls: ['./test-new-stuff.component.css']
})
export class TestNewStuffComponent implements OnInit {

  @ViewChild("fileDropper") fileDropper: FileDropperComponent

  uploadProgress: number = 0;
  uploadEnabled: boolean = true;
  autoResetEnabled: boolean = true;

  constructor(private svcMedia: MediaService) { }

  ngOnInit() {
  }

  switchEnabled() {
    this.uploadEnabled = !this.uploadEnabled;
  }

  switchAutoReset() {
    this.autoResetEnabled = !this.autoResetEnabled;
  }

  reset() {
    this.fileDropper.forceReset();
  }

  handleDrop($event: FileList) {
    console.log("DROPPED!!!");


    // try {

      this.svcMedia.uploadPictures($event, (data) => {

        if (data.progress) {
          console.log(`Isdone:${data.progress.isDone}, %:${data.progress.percentage}, total:${data.progress.totalBytes}`);
          this.uploadProgress = data.progress.percentage
        }

      });
    // }
    // catch (error) {
    //   this.fileDropper.forceReset();
    //   throw error;
    // }
  }

}
