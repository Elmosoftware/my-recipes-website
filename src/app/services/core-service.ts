import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { EntityServiceFactory } from './entity-service-factory';
import { SubscriptionService } from './subscription.service';
import { ToasterHelperService } from './toaster-helper-service';
import { AuthService } from './auth-service';
import { Helper } from '../shared/helper';
import { StandardDialogService } from '../standard-dialogs/standard-dialog.service';
import { MediaService } from './media-service';

/**
 * This core class help inject common services to the app. 
 * Improving maintenability by reducing the amount of injected services on each component. This includes services that 
 * provide common and broadly used functionality like Authentication, Global subscriptions, toasters and also angular 
 * and 3rd party services.
 */
@Injectable()
export class CoreService {

  private svcHelper: Helper
  // globalErrorSubscription: any;

  constructor(
    //Angular and 3rd party injected services:
    private injZone: NgZone, 
    private injRouter: Router, 
    //Mi Cocina injected Services:
    private injAuthService: AuthService,
    private injEntityFactory: EntityServiceFactory, 
    private injSubscriptionService: SubscriptionService,
    private injToasterHelperService: ToasterHelperService,
    private injStandardDialogService: StandardDialogService,
    private injMediaService: MediaService) {

      console.log(`CoreServices Created`)
      this.svcHelper = new Helper();
      this.injSubscriptionService.getGlobalErrorEmitter()
        .subscribe(item => {
          this.injToasterHelperService.showError(item);
        });
  }

  get zone() :NgZone {
    return this.injZone;
  }

  get router(): Router {
    return this.injRouter;
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
}
