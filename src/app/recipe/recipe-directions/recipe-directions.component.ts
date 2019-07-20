import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { useAnimation, trigger, transition } from '@angular/animations';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { CoreService } from "../../services/core-service";
import { Cache, CACHE_MEMBERS } from "../../shared/cache/cache";
import { RECIPE_TABS } from "../recipe-tabs";
import { RecipeSubcomponentInterface } from '../recipe-subcomponent-interface';
import { Recipe } from 'src/app/model/recipe';
import { Entity } from 'src/app/model/entity';
import { WordAnalyzerService } from "../../services/word-analyzer-service";
import { horizontalSlideIn, horizontalSlideOut } from "../../static/animations";

@Component({
  selector: 'app-recipe-directions',
  templateUrl: './recipe-directions.component.html',
  styleUrls: ['./recipe-directions.component.css'],
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
export class RecipeDirectionsComponent implements OnInit, RecipeSubcomponentInterface<any> {

  //#region RecipeSubcomponentInterface implementation.

  @Input("model") model: Recipe;

  @Input("activationSignal") activationSignal: Observable<RECIPE_TABS>;

  @Input("resetSignal") resetSignal: Observable<void>;

  @Output("itemDeleted") itemDeleted: EventEmitter<any> = new EventEmitter<any>();

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _isValid: boolean = this.isValidData(); //This is to avoid the "ExpressionChangedAfterItHasBeenCheckedError" error. I didn't find a better way :-(

  get isValid(): boolean {
    return this._isValid;
  };

  private _isDirty: boolean = false;

  get isDirty(): boolean {
    return this._isDirty;
  }

  //#endregion

  @ViewChild("directionsForm") form: FormGroup;
  newDirection: string;
  missingIngredients: string[];
  wordAnalyzer: WordAnalyzerService;

  constructor(private core: CoreService, private cache: Cache) {
  }

  ngOnInit() {
    this.newDirection = "";
    this.missingIngredients = [];
    this.wordAnalyzer = new WordAnalyzerService();
    
    if (this.activationSignal) {
      this.activationSignal
        .subscribe((tab: RECIPE_TABS) => {
          if (tab == RECIPE_TABS.Directions) {
            this._isValid = this.isValidData();
            this.evaluateIngredientUsage();
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
    return this.model && this.model.directions && this.model.directions.length > 0;
  }

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

  addDirection(): void {
    this.model.directions.push(this.newDirection);
    this.newDirection = "";
    this.setAsDirty();
    this.evaluateIngredientUsage();
  }

  moveDirectionDown(index): void {
    let d: string = this.model.directions.splice(index, 1)[0];
    this.model.directions.splice(index + 1, 0, d);
    this.setAsDirty();
    this.core.helper.removeTooltips(this.core.zone);
  }

  moveDirectionUp(index): void {
    let d: string = this.model.directions.splice(index, 1)[0];
    this.model.directions.splice(index - 1, 0, d);
    this.setAsDirty();
    this.core.helper.removeTooltips(this.core.zone);
  }

  removeDirection(index): void {
    this.model.directions.splice(index, 1);
    this.setAsDirty();
    this.evaluateIngredientUsage();
    this.core.helper.removeTooltips(this.core.zone);
  }

  editDirection(index): void {
    this.core.helper.removeTooltips(this.core.zone);
    this.core.dialog.showRecipeDirectionDialog(this.model.directions[index])
      .subscribe(result => {

        //If the user does not cancelled the dialog:
        if (result && typeof result === "string" && result != "false") {
          this.model.directions[index] = result;
          this.setAsDirty();
        }

        this.evaluateIngredientUsage();
      });
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
}
