import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cloudinary } from "cloudinary-core";

import { environment } from "../../environments/environment";
import { Helper } from "../shared/helper";
import { APIResponseParser, APIResponseProgress, EMPTY_RESPONSE } from "./api-response-parser";
import { CarouselItem } from "../shared/carousel/carousel.component";
import { StaticAssets } from "../static/static-assets";
import { AuthService } from './auth-service';
import { RecipePicture } from "../model/recipe-picture";
import { isArray } from 'util';

export const enum TRANSF_IMAGE_FORMATS {
  KeepOriginal = "",
  PNG = ".PNG",
  JPEG = ".JPG",
  GIF = ".GIF",
  WEBP = ".WebP",
  PDF = ".PDF"
}

@Injectable()
export class MediaService {

  private helper: Helper;
  private uploadPicturesSettings: any;

  constructor(private http: HttpClient,
    private auth: AuthService) {
    this.helper = new Helper();
    this.uploadPicturesSettings = null;
  }

  /**
   * Returns the upload settings directly from the /media endpoint.
   */
  getUploadPicturesSettings(): Observable<object> {

    //We will cache the upload settings value:
    if (this.uploadPicturesSettings) {
      return of(this.uploadPicturesSettings);
    }
    else {
      return this.http.get(this.getUrl("upload"), { headers: this.buildAPIHeaders() })
        .pipe(
          map(data => {
            let respData = new APIResponseParser(data);
            this.uploadPicturesSettings = respData.entities[0];
            return this.uploadPicturesSettings;
          })
        );
    }
  }

  /**
   * Returns a secure HTTP resource from the CDN with all the image transformations applied.
   * @param publicId CDN resource public ID
   * @param cloudName CDN Cloud name
   * @param mediaTransformation This is the media transformation object as required by the CDN library. 
   * @param imageFormat As part of the transformation we can convert the original image format. If this 
   * parameter is not specified, the original image format will be used.
   */
  getTransformationURL(publicId: string, cloudName: string, mediaTransformation: object = MediaTransformations.none, 
    imageFormat: TRANSF_IMAGE_FORMATS = TRANSF_IMAGE_FORMATS.KeepOriginal): string {
    
    let url: string;
    let cl = new Cloudinary({ cloud_name: cloudName, secure: true });

    url = cl.url(publicId, mediaTransformation);

    if (imageFormat) {
      url = url + imageFormat.toLowerCase();
    }

    return url;
  }

  /**
   * Returns the RecipePicture object corresponding to the uploaded recipe image that is acting as the recipe cover.
   * @param pictures Recipe pictures collection.
   */
  getCoverPicture(pictures: RecipePicture[]): RecipePicture {
    return pictures.find((p: RecipePicture) => {
      return p.isCover; //Find the Cover picture.
    })
  }

  /**
   * Returns a boolean value indicating if there is a picture selected as cover in the recipe pictures collection.
   * @param pictures Recipe pictures collection.
   */
  hasCoverPicture(pictures: RecipePicture[]): boolean {
    return Boolean(this.getCoverPicture(pictures));
  }

  /**
   * Returns the cover picture for the recipe transformed as a circular thumbnail.
   * @param pictures Recipes Pictures collection.
   */
  getCoverPictureCircleThumb(pictures: RecipePicture[]): string {

    let ret: string = StaticAssets.otherPictures.recipeCircleThumb; //If there is no images on the collection we 
    //will fallback to this static placeholder.
    let cover: RecipePicture;

    if (pictures && isArray(pictures) && pictures.length > 0) {
      cover = pictures.find((p: RecipePicture) => {
        return p.isCover; //Find the Cover picture.
      })

      //If there is a cover, we transform it to a circle thumbnail:
      if (cover) {
        ret = this.getTransformationURL(cover.pictureId.publicId, cover.pictureId.cloudName, 
          MediaTransformations.circleThumbGrayBorder, TRANSF_IMAGE_FORMATS.PNG);
      }
    }

    return ret;
  }

  /**
   * Upload submitted pictures to the CDN provider and returns a list of the picture URLS and public ids.
   * @param files List of files to upload.
   */
  uploadPictures(files: FileList, transformation: object, callback: Function): void {

    let data = new FormData();

    this.validateUpload(files)
      .subscribe((value: any) => {

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
                respData = new APIResponseParser(event.body, true);

                if (transformation) {
                  respData.entities.forEach((ent: any) => {
                    ent.url = this.getTransformationURL(ent.publicId, ent.cloudName, transformation);
                  })
                }

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
      .pipe(
        catchError((err) => {
          //This svc must be error safe. So, if the call to the service fail in some way,
          //we can use the alternative site pictures for the Carousel in the assets folder:
          console.warn(`There was an error trying to get dynamic carousel pictures. Falling back to the static ones.`)
          return of({ error: null, payload: StaticAssets.homePageCarousel.fallbackPictures });
        }),
        map(data => {
          let respData = new APIResponseParser(data, false);

          return this.buildCarouselItems(respData.entities);
        })
      );
  }

  private validateUpload(files: FileList): Observable<object> {

    return this.getUploadPicturesSettings()
      .pipe(
        map((uploadSettings: any) => {

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

          // return Observable.of({ valid: true });
          return of({ valid: true, settings: uploadSettings });
        })
      );
  }

  /**
   * Returns the random index of the first caption to include with the Carousel pictures.
   */
  private getCaptionsStartIndex(): number {
    return this.helper.getRandomNumberFromInterval(0, StaticAssets.homePageCarousel.captions.length - 1);
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
      if (captionIndex + 1 > (StaticAssets.homePageCarousel.captions.length - 1)) {
        captionIndex = 0;
      }
      else {
        captionIndex++;
      }

      item.captionImageSrc = StaticAssets.homePageCarousel.captions[captionIndex].img
      item.captionText = StaticAssets.homePageCarousel.captions[captionIndex].text

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

    if (this.auth.isAuthenticated) {
      ret = ret.append("Authorization", "Bearer " + this.auth.userProfile.accessToken);
    }

    return ret;
  }
}

export const MediaTransformations = {
  none: {},
  uploadedPicturesView: {
    height: 250,
    crop: "scale"
  },
  circleThumbGrayBorder: {
    width: 100, 
    height: 100, 
    gravity: "center", 
    radius: "max", 
    crop: "thumb", 
    border: "2px_solid_rgb:626262"
  }
};
