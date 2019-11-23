import { Component, OnInit, Input } from '@angular/core';

import { CoreService } from "../services/core-service";
import { Recipe } from "../model/recipe";

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.css']
})
export class RecipeItemComponent implements OnInit {

  @Input() model: Recipe[];
  @Input("display-full-description") displayFullDescription: string;
  @Input("display-ingredients") displayIngredients: string;
  @Input("display-directions") displayDirections: string;
  @Input("hide-user") hideUser: string;
  @Input("hide-link") hideLink: string;

  options: any;

  constructor(public core: CoreService) { }

  ngOnInit() {
    this.options = {
      displayFullDescription: (this.displayFullDescription && this.displayFullDescription.toLowerCase() == "true"),
      displayIngredients: (this.displayIngredients && this.displayIngredients.toLowerCase() == "true"),
      displayDirections: (this.displayDirections && this.displayDirections.toLowerCase() == "true"),
      hideUser: (this.hideUser && this.hideUser.toLowerCase() == "true"),
      hideLink: (this.hideLink && this.hideLink.toLowerCase() == "true")
    }
  }

  isOwner(recipe: Recipe) :boolean {
    let ret: boolean = false;

    if (this.core.auth.isAuthenticated) {
      ret = recipe.createdBy._id == this.core.auth.userProfile.user._id;
    }
    
    return ret;
  }


  getDescription(recipe: Recipe): string {
    return (this.options.displayFullDescription) ? recipe.description : this.core.helper.getShortText(recipe.description);
  }

  getCover(recipe: Recipe): string {
    return this.core.media.getCoverPictureCircleThumb(recipe.pictures);
  }

  goToUserDetails(recipe: Recipe) {
    this.core.helper.removeTooltips(this.core.zone);
    this.core.navigate.toUserDetails(recipe.createdBy._id);
  }

  goToRecipeView(recipe: Recipe) {
    this.core.helper.removeTooltips(this.core.zone);
    this.core.navigate.toRecipeView(recipe._id);
  }

  editRecipe(recipe: Recipe){
    this.core.helper.removeTooltips(this.core.zone);
    this.core.navigate.toRecipe(recipe._id);
  }
}
