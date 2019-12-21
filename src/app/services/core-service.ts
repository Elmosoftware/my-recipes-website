import { Injectable, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser'

import { EntityServiceFactory } from './entity-service-factory';
import { SubscriptionService } from './subscription.service';
import { ToasterHelperService } from './toaster-helper-service';
import { AuthService } from './auth-service';
import { Helper } from '../shared/helper';
import { StandardDialogService } from '../standard-dialogs/standard-dialog.service';
import { MediaService } from './media-service';
import { NavigationService } from './navigation-service';
import { LoggingService } from "./logging-service";
import { ConnectivityService, ConnectivityStatus } from './connectivity-service';
import { environment } from "../../environments/environment";

/**
 * This core class help inject common services to the app. 
 * Improving maintenability by reducing the amount of injected services on each component. This includes services that 
 * provide common and broadly used functionality like Authentication, Global subscriptions, toasters and also angular 
 * and 3rd party services.
 */
@Injectable()
export class CoreService {

  private svcHelper: Helper
  private svcLogging: LoggingService

  constructor(
    //Angular and 3rd party injected services:
    private injZone: NgZone, 
    //Mi Cocina injected Services:
    private injAuthService: AuthService,
    private injEntityFactory: EntityServiceFactory, 
    private injSubscriptionService: SubscriptionService,
    private injToasterHelperService: ToasterHelperService,
    private injStandardDialogService: StandardDialogService,
    private injMediaService: MediaService,
    private injNavigationService: NavigationService,
    private injConnectivityService: ConnectivityService,
    private injTitle: Title) {

      console.log(`CoreServices Created`)

      this.svcHelper = new Helper();
      this.svcLogging = new LoggingService(this.injAuthService);

      this.injSubscriptionService.getGlobalErrorEmitter()
        .subscribe(item => {
          //We must check connectivity issues in the case they are the error root cause:
          this.injConnectivityService.updateStatus(item);
        });
      
      this.injSubscriptionService.getConnectivityStatusChangeEmitter()
        .subscribe((status: ConnectivityStatus) => {

          console.log(`Connectivity status change has been detected. Current status:
          - Network is ${(status.networkOn) ? "online" : "offline"}.
          - Internet ${(status.wwwOn) ? "is accessible" : "not available"}.
          - Mi Cocina API is ${(status.apiOn) ? "up and ready" : "down"}.
          Last error was: "${(status.lastError) ? this.helper.getShortText(status.lastError.message, 0, 60) : "No errors so far!"}".`)

          if (status.isAllGood && status.lastError) {
            //We show a toaster for the user indicating the error details:
            this.injToasterHelperService.showError(status.lastError);
            //Logging the exception:
            this.svcLogging.logException(status.lastError);
          }

          if (status.isNetworkIssue) {
            this.injNavigationService.toNetworkError();
          }
      
          if (status.isAPIOffline) {
            this.injNavigationService.toGoneFishing();
          }
        })
  }

  get zone() :NgZone {
    return this.injZone;
  }

  get auth(): AuthService {
    return this.injAuthService;
  }

  get entityFactory(): EntityServiceFactory {
    return this.injEntityFactory;
  }

  get subscription(): SubscriptionService {
    return this.injSubscriptionService;
  }

  get toast(): ToasterHelperService {
    return this.injToasterHelperService;
  }

  get helper(): Helper {
    return this.svcHelper;
  }

  get dialog(): StandardDialogService {
    return this.injStandardDialogService;
  }

  get media(): MediaService {
    return this.injMediaService;
  }

  get navigate(): NavigationService {
    return this.injNavigationService;
  }

  get logger(): LoggingService {
    return this.svcLogging;
  }

  get connectivity(): ConnectivityService {
    return this.injConnectivityService;
  }

  getPageTitle(): string {
    return this.injTitle.getTitle();
  }

  setPageTitle(value: any | string, showVersion: boolean = false) {
    let title: string = ""
    let ver: boolean = showVersion;

    if (value && value.title) {
      title = String(value.title);
    }
    else if (typeof value == "string") {
      title = value;
    }
   
    if (value && !(value.showVersionInTitle == null || value.showVersionInTitle == undefined)) {
      ver = Boolean(value.showVersionInTitle);
    }

    this.injTitle.setTitle(`${environment.appName}${(ver) ? " v" + environment.appVersion : ""}${(title) ? " - " + title : ""}`);
  }
}
