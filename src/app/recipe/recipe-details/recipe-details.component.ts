import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { RecipeSubcomponentInterface } from "../recipe-subcomponent-interface";
import { Recipe } from 'src/app/model/recipe';
import { CoreService } from "../../services/core-service";
import { Cache } from "../../shared/cache/cache";
import { RECIPE_TABS } from '../recipe-tabs';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit, RecipeSubcomponentInterface<any> {

  //#region RecipeSubcomponentInterface implementation.

  @Input("model") model: Recipe;

  @Input("activationSignal") activationSignal: Observable<RECIPE_TABS>;

  @Input("resetSignal") resetSignal: Observable<void>;

  @Output("itemDeleted") itemDeleted: EventEmitter<any> = new EventEmitter<any>();

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  get isValid(): boolean {
    return this.form.valid;
  };

  get isDirty(): boolean {
    return this.form.dirty;
  }

  //#endregion

  @ViewChild("detailsForm") form: FormGroup;

  get preparationFriendlyTime(): string {
    let ret: string = "";

    if (this.model && this.model.estimatedTime) {
      ret = this.core.helper.estimatedFriendlyTime(this.model.estimatedTime);
    }
    else {
      ret = "Sin tiempo estimado";
    }

    return ret;
  }

  set modelLevel(value) {
    if (this.model._id) {
      this.model.level._id = value;
    }
    else {
      this.model.level = value;
    }    
  }

  get modelLevel(): any {
    if (this.model._id) {
      return this.model.level._id
    }
    else {
      return this.model.level;
    }
  
  }
  set modelMealtype(value) {
    if (this.model._id) {
      this.model.mealType._id = value;
    }
    else {
      this.model.mealType = value;
    }    
  }

  get modelMealtype(): any {
    if (this.model._id) {
      return this.model.mealType._id
    }
    else {
      return this.model.mealType;
    }
  }

  constructor(public core: CoreService,
    public cache: Cache) {
  }

  ngOnInit() {

    this.form.valueChanges.subscribe((value) => {
      if (this.isDirty) {
        this.dataChanged.emit(true);
      }
    })

    if (this.resetSignal) {
      this.resetSignal
        .subscribe(() => {
          this.form.reset();
        })
    }
  }
}
