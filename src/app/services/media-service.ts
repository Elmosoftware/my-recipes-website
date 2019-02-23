import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
// import 'rxjs/add/operator/shareReplay'
// import { shareReplay, map } from 'rxjs/operators';


import { environment } from "../../environments/environment";
import { Helper } from "../shared/helper";
import { APIResponseParser, APIResponseProgress, EMPTY_RESPONSE } from "./api-response-parser";
import { CarouselItem } from "../shared/carousel/carousel.component";
import { homePageCarouselData } from "../static/homePageCarouselData";

@Injectable()
export class MediaService {

  private helper: Helper;
  private uploadPicturesSettings: any;

  constructor(private http: HttpClient) {
    this.helper = new Helper();
    this.uploadPicturesSettings = null;
  }

  getUploadPicturesSettings(): Observable<object> {

    //We will cache the upload settings value:
    if (this.uploadPicturesSettings) {
      return Observable.of(this.uploadPicturesSettings);
    }
    else {
      return this.http.get(this.getUrl("upload"), { headers: this.buildAPIHeaders() })
        .map(data => {
          let respData = new APIResponseParser(data);
          this.uploadPicturesSettings = respData.entities;
          return this.uploadPicturesSettings;
        });
    }
  }

  /**
   * Upload submitted pictures to the CDN provider and returns a list of the picture URLS and public ids.
   * @param files List of files to upload.
   */
  uploadPictures(files: FileList, callback: Function): void {

    let data = new FormData();

    this.validateUpload(files)
      .subscribe((value) => {

        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          data.append("files", file, file.name);
        }

        this.http.post(this.getUrl("upload"), data, { headers: this.buildAPIHeaders(true), reportProgress: true, observe: 'events' })
          .subscribe((event: HttpEvent<any>) => {

            let respData: APIResponseParser;

            switch (event.type) {
              case HttpEventType.Sent:
                respData = new APIResponseParser(EMPTY_RESPONSE, false,
                  new APIResponseProgress(false, 0, 0));
                break;
              case HttpEventType.Response:
                respData = new APIResponseParser(event.body, true); //, 
                // new APIResponseProgress(true, 100, event["total"]));
                break;
              case HttpEventType.UploadProgress: {
                respData = new APIResponseParser(EMPTY_RESPONSE, false,
                  new APIResponseProgress(false, Math.round((event['loaded'] / event['total']) * 100), event["total"]));
                break;
              }
            }

            if (respData) {
              callback(respData);
            }
          });
      })
  }

  /**
   * This method returns async the list an array of picture to be used in the home page carousel.
   * If there is any kind of errors, this method still return a list of alternative pictures stored in the assets image folder.
   */
  getDynamicHomePagePictures(): Observable<object> {
    return this.http.get(this.getUrl("carousel"), { headers: this.buildAPIHeaders() })
      .catch((err) => {
        //This svc must be error safe. So, if the call to the service fail in some way,
        //we can use the alternative site pictures for the Carousel in the assets folder:
        console.warn(`There was an error trying to get dynamic carousel pictures. Falling back to the static ones.`)
        return Observable.of({ error: null, payload: homePageCarouselData.fallbackPictures });
      })
      .map(data => {
        let respData = new APIResponseParser(data, false);

        return this.buildCarouselItems(respData.entities);
      });
  }

  /*
 "cloudName": "elmosoftware",
        "filesPrefix": "my-recipes-stage/user-files",
        "maxFilesSize": "2097152",
        "maxUploadsPerCall": "5",
        "supportedFileFormats": [
            ".gif",
            ".jpeg",
            ".jpe",
            ".jpg",
            ".png",
            ".tga",
            ".tif",
            ".tiff",
            ".webp"
        ]
  */

  private validateUpload(files: FileList): Observable<object> {

    return this.getUploadPicturesSettings()
      .map((uploadSettings: any) => {

        if (files.length > uploadSettings.maxUploadsPerCall) {
          throw new Error(`You cannot upload more than ${uploadSettings.maxUploadsPerCall} files each time.`)
        }

        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          let fileExt = this.helper.getFileExtension(file.name);

          if (file.size > Number(uploadSettings.maxFilesSize)) {
            throw new Error(`At least one of the files size is higher than allowed. File Name:"${file.name}", Size:${file.size}, Allowed MAX size:${uploadSettings.maxFilesSize}.`);
          }

          if (!uploadSettings.supportedFileFormats.includes(fileExt)) {
            throw new Error(`File type is not supported.File name: "${file.name}", Supported file types:"${uploadSettings.supportedFileFormats.join(", ")}".`);
          }
        }

        return Observable.of({ valid: true });
      });
  }

  /**
   * Returns the random index of the first caption to include with the Carousel pictures.
   */
  private getCaptionsStartIndex(): number {
    return this.helper.getRandomNumberFromInterval(0, homePageCarouselData.captions.length - 1);
  }

  /**
   * Build the data required for the home page Carousel by selecting randoomly a list of pictures to display.
   * @param pictures List of pictures.
   */
  private buildCarouselItems(pictures: any[]): CarouselItem[] {

    let captionIndex: number = this.getCaptionsStartIndex();
    let ret: CarouselItem[] = [];

    pictures.forEach((pic) => {

      let item = new CarouselItem()

      //Carousel image and author crediting:
      item.imageSrc = pic.url

      if (pic.metadata) {
        item.authorName = (pic.metadata.Author) ? pic.metadata.Author : "";
        item.authorURL = (pic.metadata.AuthorURL) ? pic.metadata.AuthorURL : "";
      }

      //Carousel Caption, (text and picture), randomly selected:
      if (captionIndex + 1 > (homePageCarouselData.captions.length - 1)) {
        captionIndex = 0;
      }
      else {
        captionIndex++;
      }

      item.captionImageSrc = homePageCarouselData.captions[captionIndex].img
      item.captionText = homePageCarouselData.captions[captionIndex].text

      ret.push(item);
    })

    return ret;
  }

  /**
 * Assembles the URL to use to call the My Recipes Media API REST Service.
 * @param param Additional params, (like an Object Id)
 */
  private getUrl(functionName: string, param?: string): string {

    if (!param) {
      param = "";
    }

    return `${environment.apiURL}${environment.apiMediaEndpoint}${functionName}/${param}`;
  }

  /**
   * Returns the HTTP headers to include in the request.
   * @param isMultipart Boolean value indicating if the body carries a Multipart form data. Otherwise we will 
   * assume the payload is JSON.
   */
  private buildAPIHeaders(isMultipart: boolean = true): HttpHeaders {

    let ret: HttpHeaders = new HttpHeaders()

    if (isMultipart) {
      ret.set("Content-Type", "multipart/form-data");
    }
    else {
      ret.set("Content-Type", "application/json");
    }

    return ret;
  }
}
