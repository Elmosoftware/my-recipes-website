import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { environment } from "../../environments/environment";

import { CoreService } from "../services/core-service";
import { WizardComponent } from "../shared/wizard/wizard.component";
import { ErrorLog } from '../model/error-log';
import { EntityService } from "../services/entity-service";
import { APIQueryParams, QUERY_PARAM_OWNER } from "../services/api-query-params";
import { MediaTransformations } from "../services/media-service";
import { WordAnalyzerService } from "../services/word-analyzer-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { RecipeIngredient } from "../model/recipe-ingredient";
import { RecipePicture, PictureId, PictureAttributes } from "../model/recipe-picture";
import { Entity } from "../model/entity";
import { Cache, CACHE_MEMBERS } from "../shared/cache/cache";
import { FileDropperComponent } from '../shared/file-dropper/file-dropper.component';

const enum UPLOAD_STATUS {
  Ready = "READY",
  InProgress = "IN-PROGRESS",
  Error = "ERROR"
}

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit, AfterViewInit {

  @ViewChild('wizard')
  wizard: WizardComponent;

  @ViewChild("fileDropper")
  fileDropper: FileDropperComponent

  isNewRecipe: boolean;
  isCompleted: boolean;
  isPublished: boolean;
  modelIsReady: boolean;
  model: Recipe;
  wordAnalyzer: WordAnalyzerService;
  svcRecipe: EntityService;
  svcIngredient: EntityService;
  svcRecipeIngredient: EntityService;
  svcRecipePicture: EntityService;
  missingIngredients: string[];
  compatibleUnits: Entity[];
  newRecipeIngredient: RecipeIngredient;
  newDirection: string;
  uploadProgress: number;
  uploadStatus: UPLOAD_STATUS;
  deletedPictures: RecipePicture[];
  deletedIngredients: RecipeIngredient[];

  constructor(private core: CoreService,
    private route: ActivatedRoute,
    private cache: Cache) {
  }

  precaching() {
    //When editing a recipe seems like the dropdowns are not binding correctly the values if the list of items is not ready.
    //If those caches are stale or never refreshed, they will be refreshed with the following calls:
    this.cache.levels;
    this.cache.mealTypes;
    this.cache.ingredients;
  }

  ngOnInit() {
    //Initializing:
    this.precaching();
    this.isCompleted = false;
    this.isPublished = false;
    this.modelIsReady = false; //This acts like a flag to know when data retrieval process is ready or not.
    this.wordAnalyzer = new WordAnalyzerService();
    this.svcRecipe = this.core.entityFactory.getService("Recipe");
    this.svcIngredient = this.core.entityFactory.getService("Ingredient");
    this.svcRecipeIngredient = this.core.entityFactory.getService("RecipeIngredient");
    this.svcRecipePicture = this.core.entityFactory.getService("RecipePicture");
    this.core.subscription.getGlobalErrorEmitter()
      .subscribe(item => this.localErrorHandler(item));
    this.resetForm();
  }

  ngAfterViewInit() {
  }

  resetForm(forceNewRecipe: boolean = false) {

    let q: APIQueryParams = new APIQueryParams();
    q.pop = "true";
    q.owner = QUERY_PARAM_OWNER.me; //We need to ensure the user can edit only his own recipes.

    this.isNewRecipe = !this.route.snapshot.paramMap.get("id") || forceNewRecipe;

    //If the form was already completed once, we will reset the wizard:
    if (this.isCompleted) {
      this.wizard.reset();
    }

    this.isCompleted = false;

    if (!this.isNewRecipe) {
      this.svcRecipe.get(this.route.snapshot.paramMap.get("id"), q)
        .subscribe(
          data => {
            let response: APIResponseParser = new APIResponseParser(data);

            if (response.entities.length == 0) {
              this.model = null;
              this.isPublished = false;
            }
            else {
              this.model = (response.entities[0] as Recipe);
              this.isPublished = (this.model.publishedOn) ? true : false;
            }

            this.modelIsReady = true;
          },
          err => {
            throw err
          });
    }
    else {
      this.model = new Recipe();
      this.isPublished = false;
      this.modelIsReady = true;
    }

    this.missingIngredients = [];
    this.compatibleUnits = [];
    this.newRecipeIngredient = new RecipeIngredient();
    this.newDirection = "";
    this.uploadStatus = UPLOAD_STATUS.Ready;
    this.deletedPictures = [];
    this.deletedIngredients = [];
  }

  //#region Cache helper methods

  getIngredientFromCache(ingredientOrId: string | object): Entity | null {

    let id: string = "";
    let ing: Entity[];

    if (typeof ingredientOrId == "string") {
      id = ingredientOrId
    }
    else {
      id = (ingredientOrId as Entity)._id;
    }

    ing = this.cache.ingredients.filter(entity => entity._id == id);

    if (Array.isArray(ing) && ing.length > 0) {
      return ing[0];
    }
    else {
      return null;
    }
  }

  getUnitFromCache(unitOrId: string | object): Entity | null {

    let id: string = "";
    let unit: Entity[];

    if (typeof unitOrId == "string") {
      id = unitOrId
    }
    else {
      id = (unitOrId as Entity)._id;
    }

    unit = this.cache.units.filter(entity => entity._id == id);

    if (Array.isArray(unit) && unit.length > 0) {
      return unit[0];
    }
    else {
      return null;
    }
  }
  //#endregion

  //#region "Ingredientes" tab methods

  newIngredient() {

    this.core.dialog.showEditEntityDialog("Ingredient", this.svcIngredient.getNew(), true)
      .subscribe(result => {

        console.log(`Dialog closed. Result: "${result}" `);

        //If the user does not cancelled the dialog:
        if (typeof result === "object") {

          console.log(`DATA: Name= "${result.name}"`);

          this.svcIngredient.save(result).subscribe(data => {

            let respData = new APIResponseParser(data);
            console.log(`After Save`);
            console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

            if (!respData.error) {
              this.core.toast.showSuccess("El ingrediente fué agregado con éxito!");
            }
          }, err => {
            throw err
          });
        }
      });
  }

  ingredientSelected() {
    //If the ingredient change, we need to update the list of compatible Units:
    this.newRecipeIngredient.unit = null;

    /*
      Need to do this in order to avoid the following error: 
        "ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked".
    */
    setTimeout(() => {

      let ing: Entity = this.getIngredientFromCache(this.newRecipeIngredient.ingredient);

      if (ing) {
        this.compatibleUnits = (ing as any).compatibleUnits;
      }
    });
  }

  addIngredient() {
    if (this.ingredientExists(this.newRecipeIngredient.ingredient)) {
      this.core.toast.showWarning("Verifica la lista de ingredientes agregados y modifica las cantidades de ser necesario.");
    }
    else {
      this.model.ingredients.push(Object.assign({}, this.newRecipeIngredient));
      this.newRecipeIngredient = new RecipeIngredient();
    }
  }

  removeIngredient(id): void {
    this.core.helper.removeTooltips(this.core.zone);

    if (typeof id != "string") {
      id = (id as Entity)._id;
    }

    this.model.ingredients = this.model.ingredients.filter(recipeIngredient => {

      let ingredientId: string = "";

      if (typeof recipeIngredient.ingredient == "string") {
        ingredientId = recipeIngredient.ingredient
      }
      else {
        ingredientId = recipeIngredient.ingredient._id;
      }

      //If the ingredient was already saved, we need to mark it for deletion as soon the Recipe is saved:
      if (id == ingredientId && recipeIngredient._id) {
        this.deletedIngredients.push(recipeIngredient);
      }

      return id != ingredientId;
    })
  }

  ingredientExists(id): boolean {

    if (typeof id != "string") {
      id = (id as Entity)._id;
    }

    return (this.model.ingredients.find(recipeIngredient => {

      let ingredientId: string = "";

      if (typeof recipeIngredient.ingredient == "string") {
        ingredientId = recipeIngredient.ingredient
      }
      else {
        ingredientId = recipeIngredient.ingredient._id;
      }

      return (id == ingredientId);
    })) ? true : false;
  }
  //#endregion 

  //#region "Preparacion" tab methods

  addDirection(): void {
    this.model.directions.push(this.newDirection);
    this.newDirection = "";
    this.evaluateIngredientUsage();
  }

  editDirection(index): void {

    this.core.dialog.showRecipeDirectionDialog(this.model.directions[index])
      .subscribe(result => {

        //If the user does not cancelled the dialog:
        if (result && typeof result === "string" && result != "false") {
          this.model.directions[index] = result;
        }

        this.evaluateIngredientUsage();
      });
  }

  moveDirectionDown(index): void {
    let d: string = this.model.directions.splice(index, 1)[0];
    this.model.directions.splice(index + 1, 0, d);
  }

  moveDirectionUp(index): void {
    let d: string = this.model.directions.splice(index, 1)[0];
    this.model.directions.splice(index - 1, 0, d);
  }

  removeDirection(index): void {
    this.model.directions.splice(index, 1);
    this.evaluateIngredientUsage();
  }

  evaluateIngredientUsage(): void {
    if (this.model) {
      let allDirections: string = this.model.directions.join("\n");
      this.missingIngredients = [];

      this.getRecipeIngredientsList().forEach(ingredient => {
        if (this.wordAnalyzer.searchWord(allDirections, ingredient).length == 0) {
          this.missingIngredients.push(ingredient);
        }
      })
    }
  }

  parseIngredientsInDirection(direction: string): string {

    this.getRecipeIngredientsList().forEach((ingredient, i) => {

      let amount: number = this.model.ingredients[i].amount;
      let unit = this.getUnitFromCache(this.model.ingredients[i].unit)
      let unitAbbrev: string = (unit) ? (unit as any).abbrev : "";

      direction = this.wordAnalyzer.searchAndReplaceWord(direction,
        new Map([[ingredient, `<abbr title="Utilizando ${amount}${unitAbbrev} en esta preparación.">${ingredient}</abbr>`]]));
    })

    return direction;
  }

  parseRecipeIngredient(recipeIngredient: any): string {

    let ret: string = "";
    let ingredient: any;
    let unit: any;

    if (recipeIngredient) {
      ingredient = this.getIngredientFromCache(recipeIngredient.ingredient);
      unit = this.getUnitFromCache(recipeIngredient.unit);

      if (ingredient) {
        ret += ingredient.name + ", ";
      }

      if (unit) {
        ret += String(recipeIngredient.amount) + unit.abbrev;
      }
    }

    return ret;
  }

  getRecipeIngredientsList(): string[] {

    let ret: string[] = [];

    if (this.model) {
      //If not yet, we cached the current list of ingredients set in the "Ingredientes" form step:
      this.model.ingredients.forEach(item => {

        let ing: Entity = this.getIngredientFromCache(item.ingredient);

        if (ing) {
          ret.push((ing as any).name);
        }
      })
    }

    return ret;
  }
  //#endregion

  //#region "Fotos" tab methods

  get maxPicturesPerRecipe(): number {
    return environment.appSettings.maxPicturesPerRecipe;
  }

  get remainingPictures(): number {
    return environment.appSettings.maxPicturesPerRecipe - this.uploadedPictures;
  }

  get uploadedPictures(): number {
    return ((this.modelIsReady) ? this.model.pictures.length : 0);
  }

  handleFileDrop($event: FileList) {
    console.log("DROPPED!!!");

    if ($event.length > this.remainingPictures) {
      this.core.toast.showWarning(`Intentaste agregar ${$event.length} imagenes, mientras que tu limite restante es de solo ${this.remainingPictures}${(this.remainingPictures > 1) ? "imagen" : "imagenes"}.`,
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
        }
      }
    });
  }

  handleDeletePicture(picture: RecipePicture) {

    this.core.helper.removeTooltips(this.core.zone);

    //If the picture was already saved, (mean was not just added):
    if (picture._id) {
      this.deletedPictures.push(picture); //We add it to the list of pictures to be deleted when the Recipe is saved.
    }

    this.model.pictures = this.model.pictures.filter((p: RecipePicture) => {
      //return p._id != picture._id
      return p.pictureId.publicId != picture.pictureId.publicId;
    })
  }

  drop(event: CdkDragDrop<RecipePicture[]>) {
    this.core.helper.removeTooltips(this.core.zone);
    moveItemInArray(this.model.pictures, event.previousIndex, event.currentIndex);
  }

  selectedCoverChange(selectedCover: RecipePicture) {
    this.model.pictures.forEach((item: RecipePicture) => {
      item.isCover = Boolean(item.pictureId.publicId == selectedCover.pictureId.publicId);
    })
  }

  get coverPicture(): RecipePicture {
    return this.model.pictures.find((pic: RecipePicture) => { return pic.isCover })
  }

  //#endregion

  get friendlyPublishDate(): string {
    let ret: string = "";

    if (this.isPublished && !this.model.publishedOn) {
      ret = this.core.helper.friendlyCalendarTime(new Date());
    }
    else if (this.model.publishedOn) {
      ret = this.core.helper.friendlyCalendarTime(this.model.publishedOn);
    }

    return ret;
  }

  get preparationFriendlyTime(): string {
    let ret: string = "";
    
    if (this.model && this.model.estimatedTime) {
      ret = this.core.helper.estimatedFriendlyTime(this.model.estimatedTime);
    }

    return ret;
  }

  onComplete(event) {

    //First we must update the publishedOn attribute either is a new Recipe, or is an updated one in 
    //which we changed the published indicator:
    if (this.isNewRecipe || this.isPublished != ((this.model.publishedOn) ? true : false)) {
      this.model.publishedOn = (this.isPublished) ? new Date() : null;
    }

    //We need to keep in sync the published attribute of the Recipe with the ones in the RecipeIngredients and RecipePictures:
    this.model.ingredients.forEach(ing => {
      ing.publishedOn = this.model.publishedOn;
    })

    this.model.pictures.forEach(pic => {
      pic.publishedOn = this.model.publishedOn;
    })

    //If there is no cover picture, we will auto select the last in the list:
    if (this.model.pictures.length > 0 && !this.coverPicture) {
      this.model.pictures[this.model.pictures.length - 1].isCover = true;
    }

    //If some pictures already saved in the Recipe has been deleted, we proceed to delete the entity too:
    if (this.deletedPictures.length > 0) {
      this.deletedPictures.forEach((pic: RecipePicture) => {
        this.svcRecipePicture.delete(pic._id)
        .subscribe(data =>{
          console.log(`The RecipePicture with id:${pic._id}, was successfully deleted.`)
        }, (err) =>{
          console.error(`We were unable to delete the RecipePicture with id:${pic._id}. This is not a critical issue.`)
        })
      })
    }

    //The same for ingredients:
    if (this.deletedIngredients.length > 0) {
      this.deletedIngredients.forEach((ing: RecipeIngredient) => {
        this.svcRecipeIngredient.delete(ing._id)
        .subscribe(data =>{
          console.log(`The RecipeIngredient with id:${ing._id}, was successfully deleted.`)
        }, (err) =>{
          console.error(`We were unable to delete the RecipeIngredient with id:${ing._id}. This is not a critical issue.`)
        })
      })
    }

    //Saving the Recipe:
    this.svcRecipe.save(this.model)
      .subscribe(data => {

        let respData = new APIResponseParser(data);
        console.log(`Recipe saved sucessfully!`);

        if (!respData.error) {
          this.core.toast.showSuccess("Los cambios se guardaron con éxito!");
          //If this is a new recipe, we need to invalidate the "LatestRecipes" cache:
          if (this.isNewRecipe) {
            this.cache.invalidateOne(CACHE_MEMBERS.LatestRecipes);
          }
          this.isCompleted = true;
        }
      }, err => {
        throw err
      });
  }

  onStepChanged(step) {
    //Perform here any initialization required when moving from one step to other:
    this.evaluateIngredientUsage();
  }

  goToHome() {
    this.core.navigate.toHome();
  }

  localErrorHandler(item: ErrorLog) {
    //There is one special case we need to handle, this is when the error occurs as part of a file upload. 
    //If this happens, we need to ensure the status is changed back so we'll be able to upload files again:
    if (this.uploadStatus == UPLOAD_STATUS.InProgress) {
      this.uploadStatus = UPLOAD_STATUS.Error;
    }
  }
}
