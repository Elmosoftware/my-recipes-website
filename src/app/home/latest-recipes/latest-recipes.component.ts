import { Component, OnInit } from '@angular/core';
import { useAnimation, trigger, transition } from '@angular/animations';

import { CoreService } from 'src/app/services/core-service';
import { Cache } from "../../shared/cache/cache";
import { Recipe } from "../../model/recipe";
import { COOKBOOK_TABS } from "../../cookbook/cookbook-tabs";
import { zoomIn} from "../../static/animations";

@Component({
  selector: 'app-latest-recipes',
  templateUrl: './latest-recipes.component.html',
  styleUrls: ['./latest-recipes.component.css'],
  animations: [
    trigger('visibilityTrigger', [
      transition(':enter', [
        useAnimation(zoomIn, { params: { time: "1s" }})
      ])
    ])
  ]
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

  goToCookbook(){
    this.core.navigate.toCookbook(COOKBOOK_TABS.PublishingOrder);
  }
}
