import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { trigger, useAnimation, transition } from '@angular/animations';

import { Recipe } from 'src/app/model/recipe';
import { RecipeSubcomponentInterface } from '../recipe-subcomponent-interface';
import { RECIPE_TABS } from "../recipe-tabs";
import { CoreService } from 'src/app/services/core-service';
import { Cache } from "../../shared/cache/cache";
import { Entity } from 'src/app/model/entity';
import { RecipeIngredient } from 'src/app/model/recipe-ingredient';
import { EntityService } from 'src/app/services/entity-service';
import { APIResponseParser } from 'src/app/services/api-response-parser';
import { horizontalSlideIn, horizontalSlideOut } from "../../static/animations";

@Component({
  selector: 'app-recipe-ingredients',
  templateUrl: './recipe-ingredients.component.html',
  styleUrls: ['./recipe-ingredients.component.css'],
  animations: [
    trigger('filterVisibilityTrigger', [
      transition(':enter', [
        useAnimation(horizontalSlideIn, { params: { time: ".5s" }})
      ]),
      transition(':leave', [
        useAnimation(horizontalSlideOut, { params: { time: ".5s ease-in" }})
      ])
    ])
  ]
})
export class RecipeIngredientsComponent implements OnInit, RecipeSubcomponentInterface<RecipeIngredient> {

  //#region RecipeSubcomponentInterface implementation.

  @Input("model") model: Recipe;

  @Input("activationSignal") activationSignal: Observable<RECIPE_TABS>;

  @Input("resetSignal") resetSignal: Observable<void>;

  @Output("itemDeleted") itemDeleted = new EventEmitter<RecipeIngredient>();

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _isValid: boolean = this.isValidData(); //This is to avoid the "ExpressionChangedAfterItHasBeenCheckedError" error. I didn't find a better way :-(

  get isValid(): boolean {
    return this._isValid;
  }

  private _isDirty: boolean = false;

  get isDirty(): boolean {
    return this._isDirty;
  }

  //#endregion

  @ViewChild("ingredientsForm", {static: false}) form: FormGroup;

  svcIngredient: EntityService;
  newRecipeIngredient: RecipeIngredient;
  compatibleUnits: Entity[];

  constructor(public core: CoreService,
    public cache: Cache) { }

  ngOnInit() {
    this.compatibleUnits = [];
    this.newRecipeIngredient = new RecipeIngredient();
    this.svcIngredient = this.core.entityFactory.getService("Ingredient");
    
    if (this.activationSignal) {
      this.activationSignal
        .subscribe((tab: RECIPE_TABS) => {
          if (tab == RECIPE_TABS.Ingredients) {
            this._isValid = this.isValidData();
          }
        })
    }

    if (this.resetSignal) {
      this.resetSignal
        .subscribe(() => {
          this._isDirty = false;
          this._isValid = this.isValidData();
          this.form.reset();
        })
    }
  }

  setAsDirty(): void {
    this._isDirty = true
    this._isValid = this.isValidData();
    this.dataChanged.emit(true);
  }

  isValidData(): boolean{
    return this.model && this.model.ingredients && this.model.ingredients.length > 0;
  }

  newIngredient() {

    this.core.dialog.showEditEntityDialog("Ingredient", this.svcIngredient.getNew(), true)
      .subscribe(result => {

        //If the user does not cancelled the dialog:
        if (typeof result === "object") {
          this.svcIngredient.save(result).subscribe(data => {
            let respData = new APIResponseParser(data);

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
      this.setAsDirty();
    }
  }

  removeIngredient(id): void {
    let found: boolean = false;
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

      if (ingredientId == id) {
        //If the ingredient was already saved, we need to mark it for deletion as soon the Recipe is saved:
        if (recipeIngredient._id) {
          this.itemDeleted.emit(recipeIngredient);
        }   
        found = true
      }

      return id != ingredientId;
    })

    if (found) {
      this.setAsDirty();
    }
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

  private getIngredientFromCache(ingredientOrId: string | object): Entity | null {

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

  private getUnitFromCache(unitOrId: string | object): Entity | null {

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
}
