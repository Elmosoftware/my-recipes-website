import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cloudinary } from "cloudinary-core";

import { environment } from "../../environments/environment";
import { Helper } from "../shared/helper";
import { APIResponseParser, APIResponseProgress, EMPTY_RESPONSE } from "./api-response-parser";
import { APIQueryParams } from "./api-query-params";
import { CarouselItem } from "../shared/carousel/carousel.component";
import { StaticAssets } from "../static/static-assets";
import { AuthService } from './auth-service';
import { RecipePicture } from "../model/recipe-picture";
import { isArray } from 'util';
import { LoggingService } from "../services/logging-service";

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
  private logger: LoggingService;

  constructor(private http: HttpClient,
    private auth: AuthService) {
    this.logger = new LoggingService(this.auth);
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
   * This method returns async an array of picture to be used in the home page carousel.
   * If there is any kind of errors, this method still return a list of alternative pictures stored in the assets image folder.
   */
  getDynamicHomePagePictures(): Observable<object> {
    return this.http.get(this.getUrl("carousel-pictures"), { headers: this.buildAPIHeaders() })
      .pipe(
        catchError((err) => {
          //This svc must be error safe. So, if the call to the service fail in some way,
          //we can use the alternative site pictures for the Carousel in the assets folder:
          this.logger.logWarn(`There was an error trying to get dynamic carousel pictures. Falling back to the static ones.`);
          return of({ error: null, payload: StaticAssets.homePageCarousel.fallbackPictures });
        }),
        map(data => {
          let respData = new APIResponseParser(data, false);

          return this.buildCarouselItems(respData.entities, true);
        })
      );
  }

  /**
   * This method return a list of random ingredients pictures. In the case of any issue with the CDN, will 
   * retrieve a set of pictures stored in the local assets folder.
   * @param count Amount of pictures to retrieve.
   */
  getRandomIngredientPictures(count: number): Observable<object> {

    let query: APIQueryParams = new APIQueryParams();
    query.top = String(count);

    return this.http.get(this.getUrl("ingredients-pictures", "", query), { headers: this.buildAPIHeaders() })
      .pipe(
        catchError((err) => {
          //This svc must be error safe. So, if the call to the service fail in some way,
          //we can use the alternative Ingredient pictures in the assets folder:
          this.logger.logWarn(`There was an error trying to get the dynamic ingredient pictures. Falling back to the static ones.`);
          return of({ error: null, payload: StaticAssets.homePageIngredients.fallbackPictures });
        }),
        map(data => {
          let respData = new APIResponseParser(data, false);

          return this.buildCarouselItems(respData.entities, false,
            MediaTransformations.circleThumbBigGrayBorder, TRANSF_IMAGE_FORMATS.PNG);
        })
      );
  }

  /**
   * Evaluates the list of files to upload in order to validate them and prevent some errors that could be 
   * detected on client side to be propagated through the API call.
   * @param files List of files to upload.
   */
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
  private buildCarouselItems(pictures: any[], includeRandomCaptionData?: boolean,
    mediaTransformation: object = MediaTransformations.none,
    imageFormat: TRANSF_IMAGE_FORMATS = TRANSF_IMAGE_FORMATS.KeepOriginal): CarouselItem[] {

    let captionIndex: number = this.getCaptionsStartIndex();
    let ret: CarouselItem[] = [];

    pictures.forEach((pic) => {

      let item = new CarouselItem();

      //If there is any image transformation set and the image is not a static one, (i mean, proceed from the CDN):
      if (mediaTransformation != MediaTransformations.none && pic.publicId) {
        item.imageSrc = this.getTransformationURL(pic.publicId, pic.cloudName, mediaTransformation, imageFormat);
      }
      else {
        item.imageSrc = pic.url;
      }

      //If the image includes metadata:
      if (pic.metadata) {
        item.authorName = (pic.metadata.Author) ? pic.metadata.Author : "";
        item.authorURL = (pic.metadata.AuthorURL) ? pic.metadata.AuthorURL : "";
      }

      //If we must include a random caption, (text and picture), for the image:
      if (includeRandomCaptionData) {
        if (captionIndex + 1 > (StaticAssets.homePageCarousel.captions.length - 1)) {
          captionIndex = 0;
        }
        else {
          captionIndex++;
        }

        item.captionImageSrc = StaticAssets.homePageCarousel.captions[captionIndex].img
        item.captionText = StaticAssets.homePageCarousel.captions[captionIndex].text
      }

      ret.push(item);
    })

    return ret;
  }

  /**
   * Assembles the URL to use to call the My Recipes Media API REST Service.
   * @param functionName API function to be called.
   * @param param Additional params, (like an Object Id).
   * @param query and APIQueryParams object providing query string params for the http call. 
   */
  private getUrl(functionName: string, param?: string, query?: APIQueryParams): string {

    let queryText: string = "";

    if (!param) {
      param = "";
    }

    if (query) {
      queryText = query.getQueryString();
    }

    return `${environment.apiURL}${environment.apiMediaEndpoint}${functionName}/${param}?${queryText}`;
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

/**
 * Media Transformation objects.
 * They have the required information to transform the image as required. 
 * This can be to change the image format, his size, shape, apply filters, etc.
 */
export const MediaTransformations = {
  none: {},
  uploadedPicturesView: {
    height: 350,
    crop: "scale"
  },
  circleThumbGrayBorder: {
    width: 100,
    height: 100,
    gravity: "center",
    radius: "max",
    crop: "thumb",
    border: "2px_solid_rgb:626262"
  },
  circleThumbBigGrayBorder: {
    width: 150,
    height: 150,
    gravity: "center",
    radius: "max",
    crop: "thumb",
    border: "2px_solid_rgb:626262"
  }
};
