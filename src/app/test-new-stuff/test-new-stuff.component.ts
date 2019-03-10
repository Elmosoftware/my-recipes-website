import { Component, OnInit } from '@angular/core';

import { Helper } from "../shared/helper";
import { Cache } from "../shared/cache/cache";
import { RecipePicture } from '../model/recipe-picture';
import { MediaService } from "../services/media-service";

@Component({
  selector: 'app-test-new-stuff',
  templateUrl: './test-new-stuff.component.html',
  styleUrls: ['./test-new-stuff.component.css']
})
export class TestNewStuffComponent implements OnInit {

  helper: Helper;

  constructor(public cache: Cache, public svcMedia: MediaService) { }

  ngOnInit() {
    this.helper = new Helper();
  }

  getCover(pictures: RecipePicture[]): string{
    return this.svcMedia.getCoverPictureCircleThumb(pictures);
  }
}