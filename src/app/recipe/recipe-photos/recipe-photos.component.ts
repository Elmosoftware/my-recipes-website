import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Observable } from 'rxjs';

import { RECIPE_TABS } from "../recipe-tabs";
import { RecipeSubcomponentInterface } from '../recipe-subcomponent-interface';
import { CoreService } from '../../services/core-service';
import { environment } from "../../../environments/environment";
import { Recipe } from '../../model/recipe';
import { RecipePicture, PictureId, PictureAttributes } from '../../model/recipe-picture';
import { ErrorLog } from '../../model/error-log';
import { MediaTransformations } from "../../services/media-service";

const enum UPLOAD_STATUS {
  Ready = "READY",
  InProgress = "IN-PROGRESS",
  Error = "ERROR"
}

@Component({
  selector: 'app-recipe-photos',
  templateUrl: './recipe-photos.component.html',
  styleUrls: ['./recipe-photos.component.css']
})
export class RecipePhotosComponent implements OnInit, RecipeSubcomponentInterface<RecipePicture> {

  //#region RecipeSubcomponentInterface implementation.

  @Input("model") model: Recipe;

  @Input("activationSignal") activationSignal: Observable<RECIPE_TABS>;

  @Input("resetSignal") resetSignal: Observable<void>;

  @Output("itemDeleted") itemDeleted = new EventEmitter<RecipePicture>();

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  get isValid(): boolean {
    return this.form.valid;
  };

  private _isDirty: boolean = false;

  get isDirty(): boolean {
    return this._isDirty;
  }

  //#endregion

  @ViewChild("photosForm") form: FormGroup;
  uploadProgress: number;
  uploadStatus: UPLOAD_STATUS;

  get maxPicturesPerRecipe(): number {
    return environment.appSettings.maxPicturesPerRecipe;
  }

  get remainingPictures(): number {
    return environment.appSettings.maxPicturesPerRecipe - this.uploadedPictures;
  }

  get uploadedPictures(): number {
    return ((this.model) ? this.model.pictures.length : 0);
  }

  get selectedCoverId(): string {

    let ret: string = "";
    let pic: RecipePicture;

    if (this.model) {
      pic = this.model.pictures.find((item: RecipePicture) => {
        return item.isCover;
      })

      if (pic) {
        ret = pic.pictureId.publicId;
      }
    }

    return ret;
  }
  set selectedCoverId(value: string) {
    //This is related to: BUG #78 Error when trying to select the picture as cover, 
    //(https://trello.com/c/n6oVl8Cu/90-78-error-when-trying-to-select-the-picture-as-cover)
    //This was not able to reproduce but the setter was added to avoid it in the future.
    //Change in the selected cover id is made by the "selectedCoverChange" method.
  }

  constructor(private core: CoreService) {
    this.core.subscription.getGlobalErrorEmitter()
      .subscribe(item => this.localErrorHandler(item));
  }

  ngOnInit() {
    this.uploadStatus = UPLOAD_STATUS.Ready;
    
    this.form.valueChanges
      .subscribe((value) => {
        if (this.form.dirty) {
          this.setAsDirty();
        }
      })
    
    if (this.resetSignal) {
      this.resetSignal
        .subscribe(() => {
          this._isDirty = false;
          this.form.reset();
        })
    }
  }

  setAsDirty(): void {
    this._isDirty = true
    this.dataChanged.emit(true);
  }

  handleFileDrop($event: FileList) {
    console.log("DROPPED!!!");

    if ($event.length > this.remainingPictures) {
      this.core.toast.showWarning(`Intentaste agregar ${$event.length} imagenes, mientras que tu limite restante es de solo ${this.remainingPictures} ${(this.remainingPictures > 1) ? "imagenes" : "imagen"}.`,
        "Limite de imágenes excedido");
      return;
    }

    this.core.toast.showInformation("Tus imagenes están siendo cargadas, aguarda un momento por favor ...")
    this.uploadStatus = UPLOAD_STATUS.InProgress;

    this.core.media.uploadPictures($event, MediaTransformations.uploadedPicturesView, (respData) => {

      if (respData.progress) {
        console.log(`Isdone:${respData.progress.isDone}, %:${respData.progress.percentage}, total:${respData.progress.totalBytes}`);
        this.uploadProgress = respData.progress.percentage;
      }
      else {
        if (respData.error) {
          this.core.toast.showError("Por favor reintenta esta operación luego.", "Ocurrió un error al intentar subir tus imagenes.")
          this.uploadStatus = UPLOAD_STATUS.Error;
        }
        else {
          //Here we create the new RecipePicture and we add it to the Recipe:
          respData.entities.forEach((pic) => {
            let newRecipePicture = new RecipePicture();
            newRecipePicture.pictureId = new PictureId(pic.publicId, pic.cloudName);
            newRecipePicture.attributes = new PictureAttributes();
            newRecipePicture.attributes.width = pic.width;
            newRecipePicture.attributes.height = pic.height;
            newRecipePicture.transformationURL = pic.url;
            this.model.pictures.push(newRecipePicture);
          })
          this.uploadStatus = UPLOAD_STATUS.Ready;
          this.setAsDirty();
        }
      }
    });
  }

  drop(event: CdkDragDrop<RecipePicture[]>) {
    this.core.helper.removeTooltips(this.core.zone);
    moveItemInArray(this.model.pictures, event.previousIndex, event.currentIndex);
    this.setAsDirty()
  }

  selectedCoverChange(selectedCover: RecipePicture) {
    this.model.pictures.forEach((item: RecipePicture) => {
      item.isCover = Boolean(item.pictureId.publicId == selectedCover.pictureId.publicId);
    })
  }

  handleDeletePicture(picture: RecipePicture) {

    this.core.helper.removeTooltips(this.core.zone);

    //If the picture was already saved, (mean was not just added):
    if (picture._id) {
      this.itemDeleted.emit(picture);//We add it to the list of pictures to be deleted when the Recipe is saved.
      this.setAsDirty();
    }

    this.model.pictures = this.model.pictures.filter((p: RecipePicture) => {
      return p.pictureId.publicId != picture.pictureId.publicId;
    })
  }

  localErrorHandler(item: ErrorLog) {
    //There is one special case we need to handle, this is when the error occurs as part of a file upload. 
    //If this happens, we need to ensure the status is changed back so we'll be able to upload files again:
    if (this.uploadStatus == UPLOAD_STATUS.InProgress) {
      this.uploadStatus = UPLOAD_STATUS.Error;
    }
  }
}
