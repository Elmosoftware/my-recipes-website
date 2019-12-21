import { Component, OnInit } from '@angular/core';
import { COOKBOOK_TABS, parseCookbookTab } from "./cookbook-tabs";
import { ActivatedRoute } from '@angular/router';
import { CoreService } from '../services/core-service';

@Component({
  selector: 'app-cookbook',
  templateUrl: './cookbook.component.html',
  styleUrls: ['./cookbook.component.css']
})
export class CookbookComponent implements OnInit {
 
  get tabMealTypes(): string{
    return COOKBOOK_TABS.MealTypes;
  }
  
  get tabLevels(): string{
    return COOKBOOK_TABS.Levels;
  }

  get tabPublishing(): string{
    return COOKBOOK_TABS.PublishingOrder;
  }

  defaultTab: COOKBOOK_TABS;

  constructor(private route: ActivatedRoute, private core: CoreService) {
  }

  ngOnInit() {
    this.core.setPageTitle(this.route.snapshot.data);
    this.parseQueryparams();
  }

  parseQueryparams() {
    if (this.route.snapshot.queryParamMap.get("tab")) {
      try {
        this.defaultTab = parseCookbookTab(this.route.snapshot.queryParamMap.get("tab"));
      } catch (error) {
        this.core.logger.logWarn(`The tab supplied: ${this.route.snapshot.queryParamMap.get("tab")} is not valid. First tab will be the default one active.`);
      }
    }
  }

  onStepChanged(step) {
    //Perform here any initialization required when moving from one step to other:
  }
}
