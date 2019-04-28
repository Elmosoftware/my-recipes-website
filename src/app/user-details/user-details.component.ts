import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService } from "../services/entity-service";
import { APIQueryParams } from "../services/api-query-params";
import { APIResponseParser } from "../services/api-response-parser";
import { AuthService } from "../services/auth-service";
import { Helper } from "../shared/helper";
import { ErrorLog } from '../model/error-log';
import { ToasterHelperService } from '../services/toaster-helper-service';
import { SubscriptionService } from "../services/subscription.service";
import { MediaService } from "../services/media-service";

const TOP_USER_RECIPES: number = 5;

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  svc: EntityService;
  globalErrorSubscription: any;
  model: any;
  helper: Helper;

  constructor(private svcFac: EntityServiceFactory,
    private svcAuth: AuthService,
    private route: ActivatedRoute,
    private subs: SubscriptionService,
    private toast: ToasterHelperService,
    public svcMedia: MediaService) { }

  ngOnInit() {

    let q: APIQueryParams;
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.helper = new Helper();
    this.svc = this.svcFac.getService("Recipe");
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
    this.svcAuth.getUsersInfo(this.model.userId, null)
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
    return this.helper.friendlyTimeFromNow(d);
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item);
  }
}
