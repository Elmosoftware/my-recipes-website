import { Component, OnInit } from '@angular/core';

import { ToasterHelperService } from '../../services/toaster-helper-service';
import { SubscriptionService } from "../../services/subscription.service";
import { ErrorLog } from '../../model/error-log';
import { Cache } from "../../shared/cache/cache";
import { Recipe } from "../../model/recipe";

@Component({
  selector: 'app-latest-recipes',
  templateUrl: './latest-recipes.component.html',
  styleUrls: ['./latest-recipes.component.css']
})
export class LatestRecipesComponent implements OnInit {

  globalErrorSubscription: any;

  constructor(private subs: SubscriptionService,
    public cache: Cache,
    public toast: ToasterHelperService,
    ) {
  }

  get model(): Recipe[] {
      return this.cache.latestRecipes as Recipe[];
  }

  ngOnInit() {
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
  }

  ngOnDestroy() {
    this.globalErrorSubscription.unsubscribe();
  }
  
  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
