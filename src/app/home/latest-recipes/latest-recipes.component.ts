import { Component, OnInit } from '@angular/core';

import { CoreService } from 'src/app/services/core-service';
import { Cache } from "../../shared/cache/cache";
import { Recipe } from "../../model/recipe";

@Component({
  selector: 'app-latest-recipes',
  templateUrl: './latest-recipes.component.html',
  styleUrls: ['./latest-recipes.component.css']
})
export class LatestRecipesComponent implements OnInit {

  constructor(private core: CoreService, public cache: Cache) {
  }

  get model(): Recipe[] {
      return this.cache.latestRecipes as Recipe[];
  }

  ngOnInit() {
  }

  goToRecipe() {
    this.core.navigate.toRecipe();
  }
}
