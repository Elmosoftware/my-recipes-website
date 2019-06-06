import { EventEmitter } from "@angular/core";
import { Observable } from 'rxjs';

import { Recipe } from '../model/recipe';
import { RECIPE_TABS } from './recipe-tabs';

export interface RecipeSubcomponentInterface<T>{

    /**
     * Recipe Model
     */
    model: Recipe;

    /**
     * Triggered every time a sub item is deleted. 
     */
    itemDeleted: EventEmitter<T>

    /**
     * Trigered on every data change made to the model.
     */
    dataChanged: EventEmitter<boolean>;

    /**
     * This signal is send from the parent component every time the subcomponent gets activated. 
     * Useful in a tab frontend scenario.
     */
    activationSignal: Observable<RECIPE_TABS>;

    /**
     * This signals is send from parent componente every time a form reset is required.
     */
    resetSignal: Observable<void>;

    /**
     * Boolean value that indicates if the data in the subcomponent is valid.
     */
    isValid: boolean;

    /**
     * Boolen value that indicates if the data in the subcomponent has changed.
     */
    isDirty: boolean;
}