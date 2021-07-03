import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { RECIPE_TABS, parseRecipeTab } from "./recipe-tabs";
import { CoreService } from "../services/core-service";
import { DataLossPreventionInterface } from "../services/data-loss-prevention-guard";
import { WizardComponent } from "../shared/wizard/wizard.component";
import { EntityService } from "../services/entity-service";
import { APIQueryParams, QUERY_PARAM_OWNER, QUERY_PARAM_PUB } from "../services/api-query-params";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { RecipeIngredient } from "../model/recipe-ingredient";
import { RecipePicture } from "../model/recipe-picture";
import { Cache, CACHE_MEMBERS } from "../shared/cache/cache";
import { ConfirmDialogConfiguration } from '../standard-dialogs/standard-dialog.service';
import { MediaTransformations } from '../services/media-service';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit, DataLossPreventionInterface {

  @ViewChild('wizard') wizard: WizardComponent;

  activeTab: RECIPE_TABS;
  activatedTabSignal: BehaviorSubject<RECIPE_TABS>;
  resetSignal: Subject<void>;
  isNewRecipe: boolean;
  isCompleted: boolean;
  isCompletedWithError: boolean;
  modelIsReady: boolean;
  modelIsDirty: boolean;
  model: Recipe;
  svcRecipe: EntityService;
  svcRecipeIngredient: EntityService;
  svcRecipePicture: EntityService;
  deletedPictures: RecipePicture[];
  deletedIngredients: RecipeIngredient[];

  get detailsTabName(): string {
    return RECIPE_TABS.Details;
  }

  get ingredientsTabName(): string {
    return RECIPE_TABS.Ingredients;
  }

  get directionsTabName(): string {
    return RECIPE_TABS.Directions;
  }

  get photosTabName(): string {
    return RECIPE_TABS.Photos;
  }

  get publishingTabName(): string {
    return RECIPE_TABS.Publishing;
  }

  get finishTabName(): string {
    return RECIPE_TABS.Finish;
  }

  constructor(private core: CoreService,
    private route: ActivatedRoute,
    private cache: Cache) {
  }

  ngOnInit() {
    //Initializing:
    this.core.setPageTitle(this.route.snapshot.data);
    this.precaching();
    this.activeTab = RECIPE_TABS.Details; //Setting the initial tab here.
    this.activatedTabSignal = new BehaviorSubject(this.activeTab);
    this.resetSignal = new Subject<void>();
    this.isCompleted = false;
    this.isCompletedWithError = false;
    this.modelIsReady = false; //This acts like a flag to know when data retrieval process is ready or not.
    this.modelIsDirty = false;
    this.svcRecipe = this.core.entityFactory.getService("Recipe");
    this.svcRecipeIngredient = this.core.entityFactory.getService("RecipeIngredient");
    this.svcRecipePicture = this.core.entityFactory.getService("RecipePicture");
    this.resetForm();
  }

  precaching() {
    //When editing a recipe seems like the dropdowns are not binding correctly the values if the list of items is not ready.
    //If those caches are stale or never refreshed, they will be refreshed with the following calls:
    this.cache.levels;
    this.cache.mealTypes;
    this.cache.ingredients;
  }

  resetForm(forceNewRecipe: boolean = false) {

    let q: APIQueryParams = new APIQueryParams();
    q.pop = "true";
    q.pub = QUERY_PARAM_PUB.all;
    q.owner = QUERY_PARAM_OWNER.me; //We need to ensure the user can edit only his own recipes.

    this.isNewRecipe = !this.route.snapshot.paramMap.get("id") || forceNewRecipe;

    //If the form was already completed, (this mean that a recipe was edited and saved or created and saved) once, we 
    //will reset the wizard and the subcomponents:
    if (this.isCompleted) {
      this.wizard.reset();
      this.resetSignal.next();
    }

    this.isCompleted = false;
    this.isCompletedWithError = false;
    this.modelIsDirty = false;

    if (!this.isNewRecipe) {
      this.svcRecipe.get(this.route.snapshot.paramMap.get("id"), q)
        .subscribe(
          data => {
            let response: APIResponseParser = new APIResponseParser(data);

            if (response.entities.length == 0) {
              this.model = null;
            }
            else {

              let recipe: Recipe = (response.entities[0] as Recipe);

              //Preprocessing recipe pictures:
              if (recipe.pictures && recipe.pictures.length > 0) {
                recipe.pictures.forEach((p: RecipePicture) => {
                  p.transformationURL = this.core.media.getTransformationURL(p.pictureId.publicId, p.pictureId.cloudName, MediaTransformations.uploadedPicturesView);
                })
              }

              this.model = recipe;
              this.core.setPageTitle(`Editando "${this.model.name}" ...`);
            }

            this.modelIsReady = true;
          },
          err => {
            throw err
          });
    }
    else {
      this.model = new Recipe();
      this.modelIsReady = true;
    }

    this.deletedPictures = [];
    this.deletedIngredients = [];
  }

  getActivatedTabSignal(): Observable<RECIPE_TABS> {
    return this.activatedTabSignal.asObservable();
  }

  getResetSignal(): Observable<void> {
    return this.resetSignal.asObservable();
  }

  onRecipeIngredientDeleted($event) {
    this.deletedIngredients.push($event);
  }

  onRecipePictureDeleted($event) {
    this.deletedPictures.push($event);
  }

  onComplete(event) {

    //We need to keep in sync the published attribute of the Recipe with the ones in the RecipeIngredients and RecipePictures:
    this.model.ingredients.forEach(ing => {
      ing.publishedOn = this.model.publishedOn;
    })

    this.model.pictures.forEach(pic => {
      pic.publishedOn = this.model.publishedOn;
    })

    //If there is no cover picture, we will auto select the last in the list:
    if (this.model.pictures.length > 0 && !this.core.media.hasCoverPicture(this.model.pictures)) { //  !this.coverPicture) {
      this.model.pictures[this.model.pictures.length - 1].isCover = true;
    }

    //If some pictures already saved in the Recipe has been deleted, we proceed to delete the entity too:
    if (this.deletedPictures.length > 0) {
      this.deletedPictures.forEach((pic: RecipePicture) => {
        this.svcRecipePicture.delete(pic._id)
          .subscribe(data => {
            console.log(`The RecipePicture with id:${pic._id}, was successfully deleted.`)
          }, (err) => {
            console.error(`We were unable to delete the RecipePicture with id:${pic._id}. This is not a critical issue.`)
          })
      })
    }

    //The same for ingredients:
    if (this.deletedIngredients.length > 0) {
      this.deletedIngredients.forEach((ing: RecipeIngredient) => {
        this.svcRecipeIngredient.delete(ing._id)
          .subscribe(data => {
            console.log(`The RecipeIngredient with id:${ing._id}, was successfully deleted.`)
          }, (err) => {
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
          this.isCompleted = true; //Mark as completed, indicating data has been already persisted.
          this.isCompletedWithError = false;
        }
      }, err => {
        this.isCompleted = false;
        this.isCompletedWithError = true;
        this.wizard.completedWithError();
        throw err
      });
  }

  onStepChanged(step) {
    //Perform here any initialization required when moving from one step to other:
    this.activeTab = parseRecipeTab(step.title);
    this.activatedTabSignal.next(this.activeTab);
  }

  onDataChangedHandler($event) {
    //This event is throw only when data changed in the subcomponents:
    console.log(`Data has changed on tab ${this.activeTab}`)
    this.modelIsDirty = true;
  }

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {

    //If some of the subcomponent data has been modified and not been persisted yet:
    if (this.modelIsDirty && !this.isCompleted) {
      return this.core.dialog.showConfirmDialog(new ConfirmDialogConfiguration("¡Atención!",
        `Si continúas perderás ${(this.isNewRecipe) ? "los datos de esta nueva" : "las modificaciones a esta"} receta. ¿Estás seguro de continuar?`,
        "Si, descartar cambios.", "No, continuar editando."))
        .pipe(
          map(value => {
            //If the user clicks first button, means we can deactivate the component even loosing data:
            if (value == 1) {
              return true;
            }
            else {
              return false;
            }
          })
        );
    }
    else {
      //If there is no modified data, we can deactivate the component:
      return true;
    }
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
