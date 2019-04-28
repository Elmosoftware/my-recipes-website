import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { Helper } from "../shared/helper";
import { Recipe } from "../model/recipe";
import { MediaService } from "../services/media-service";

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

  helper: Helper;
  options: any;

  constructor(public svcMedia: MediaService, public router: Router, public zone: NgZone) { }

  ngOnInit() {
    this.helper = new Helper();
    this.options = {
      displayFullDescription: (this.displayFullDescription && this.displayFullDescription.toLowerCase() == "true"),
      displayIngredients: (this.displayIngredients && this.displayIngredients.toLowerCase() == "true"),
      displayDirections: (this.displayDirections && this.displayDirections.toLowerCase() == "true"),
      hideUser: (this.hideUser && this.hideUser.toLowerCase() == "true"),
      hideLink: (this.hideLink && this.hideLink.toLowerCase() == "true")
    }
  }

  getDescription(recipe: Recipe): string {
    return (this.options.displayFullDescription) ? recipe.description : this.helper.getShortText(recipe.description);
  }

  getCover(recipe: Recipe): string {
    return this.svcMedia.getCoverPictureCircleThumb(recipe.pictures);
  }

  viewUserDetails(recipe: Recipe) {
    this.helper.removeTooltips(this.zone);
    this.router.navigate([`/user-details/${recipe.createdBy._id}`])
  }

  viewRecipe(recipe: Recipe) {
    this.helper.removeTooltips(this.zone);
    this.router.navigate([`/recipe-view/${recipe._id}`])
  }
}
