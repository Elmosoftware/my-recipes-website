import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { CoreService } from "../services/core-service";
import { EntityService } from "../services/entity-service";
import { APIQueryParams } from "../services/api-query-params";
import { APIResponseParser } from "../services/api-response-parser";
import { SEARCH_TYPE } from "../services/search-type";
import { SearchServiceFactory } from "../services/search-service-factory";

const TOP_USER_RECIPES: number = 5;

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  svc: EntityService;
  model: any;

  constructor(private core: CoreService,
    private route: ActivatedRoute,
    private svcSearchFac: SearchServiceFactory) { }

  ngOnInit() {
    let q: APIQueryParams;

    this.core.setPageTitle(this.route.snapshot.data);
    this.svc = this.core.entityFactory.getService("Recipe");
    this.model = {
      userId: this.route.snapshot.paramMap.get("id"),
      user: null,
      userIsReady: false,
      recipes: null,
      recipesAreReady: false,
      topLastRecipes: TOP_USER_RECIPES,
      totalRecipes: -1
    }

    //Retrieving user data:
    this.core.auth.getUsersInfo(this.model.userId, null)
      .subscribe((data) => {
        let parser: APIResponseParser = new APIResponseParser(data); //This will throw if there is an API error

        this.model.userIsReady = true;

        if (parser.entities.length > 0) {
          this.model.user = parser.entities[0];
        }
      },
        err => {
          throw err
        });

    q = new APIQueryParams();
    q.pop = "true";
    q.top = String(this.model.topLastRecipes);
    q.sort = "-publishedOn";
    q.owner = this.model.userId;
    q.count = "true";

    this.svc.get("", q)
      .subscribe(data => {
        let response: APIResponseParser = new APIResponseParser(data);
        this.model.recipes = response.entities;
        this.model.totalRecipes = Number(response.headers.XTotalCount);
        this.model.recipesAreReady = true;
      },
        err => {
          throw err
        });
  }

  getFriendlyDate(d: Date): string {
    return this.core.helper.friendlyTimeFromNow(d);
  }

  searchMore(): void {
    let s = this.svcSearchFac.getService(SEARCH_TYPE.User);

    s.term = this.model.user.name;
    s.id = this.model.userId;

    this.core.navigate.toSearch(s);
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
