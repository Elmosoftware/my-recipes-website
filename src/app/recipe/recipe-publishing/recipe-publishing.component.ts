import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { RECIPE_TABS } from "../recipe-tabs";
import { RecipeSubcomponentInterface } from '../recipe-subcomponent-interface';
import { CoreService } from '../../services/core-service';
import { Recipe } from '../../model/recipe';

@Component({
  selector: 'app-recipe-publishing',
  templateUrl: './recipe-publishing.component.html',
  styleUrls: ['./recipe-publishing.component.css']
})
export class RecipePublishingComponent implements OnInit, RecipeSubcomponentInterface<any> {

  //#region RecipeSubcomponentInterface implementation.

  @Input("model") model: Recipe;

  @Input("activationSignal") activationSignal: Observable<RECIPE_TABS>;

  @Input("resetSignal") resetSignal: Observable<void>;

  @Output("itemDeleted") itemDeleted: EventEmitter<any> = new EventEmitter<any>();

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  get isValid(): boolean {
    return (this.form) ? this.form.valid : true;
  };

  get isDirty(): boolean {
    return (this.form) ? this.form.dirty : false;
  }

  //#endregion

  @ViewChild("publishedForm", { static: false }) form: FormGroup;

  set isPublished(value: boolean) {

    if (!this.model) {
      return;
    }

    if (value) {
      this.model.publishedOn = new Date();
    }
    else {
      this.model.publishedOn = null;
    }
  }

  get isPublished(): boolean {
    return this.model && Boolean(this.model.publishedOn);
  }

  get friendlyPublishDate(): string {
    let ret: string = "No publicada";

    if (this.model && this.model.publishedOn) {
      ret = this.core.helper.friendlyCalendarTime(this.model.publishedOn);
    }

    return ret;
  }

  constructor(private core: CoreService) {
  }

  ngOnInit() {
    if (this.resetSignal) {
      this.resetSignal
        .subscribe(() => {
          this.form.reset();
        })
    }
  }

  ngAfterViewInit() {
    this.form.valueChanges
      .subscribe((value) => {
        if (this.isDirty) {
          this.dataChanged.emit(true);
        }
      })
  }
}
