import { Injectable, OnDestroy } from '@angular/core';
import { forkJoin, of, fromEvent } from 'rxjs';
import { map, catchError, last } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { SubscriptionService } from './subscription.service';
import { environment } from "../../environments/environment";
import { ErrorLog } from "../model/error-log";

/**
 * Provides connectivity awareness.
 */
@Injectable()
export class ConnectivityService implements OnDestroy {

  /**
   * Connectivity service global settings.
   */
  settings: any;

  /**
   * Returns a ConnectivityStatus object that represents the current connectivity status for 
   * the client side application.
   */
  status: ConnectivityStatus

  private statusNetOfflineSubscription$; //Subscription for the window.offline event.
  private statusNetOnlineSubscription$; //Subscription for the window.online event.
  private statusWWWSubscription$; //Subscription for accessing the WWW.
  private statusAPISubscription$; //Subscription for accessing the Mi Cocina API.

  constructor(private http: HttpClient, private subs: SubscriptionService) {
    this.settings = environment.connectivityCheck;
    this.status = new ConnectivityStatus();
    this.initialize();
  }

  private initialize() {

    this.statusNetOnlineSubscription$ = fromEvent(window, "online");
    this.statusNetOfflineSubscription$ = fromEvent(window, "offline");

    this.statusNetOnlineSubscription$.subscribe(() => {
      console.log("window.online event has been fired.");
      this.updateStatus();
    });

    this.statusNetOfflineSubscription$.subscribe(() => {
      console.warn("window.OFFLINE event has been fired.");
      this.updateStatus();
    });

    this.updateStatus();
  }

  /**
   * 
   * @param lastError Optionally, an ErrorLog object containing the unhandled exception details that 
   * is causing this request to update connectivity status.
   * If an error is passed as parameter, the SubscriptionService ConnectivityStatusChange event will be fired.
   * If no error is passes as parameter, the evnt will be fired ONLY if there is a status change.
   */
  updateStatus(lastError?: ErrorLog): void {

    this.statusWWWSubscription$ =
      this.http[this.settings.wwwMethod.toLowerCase()](this.settings.wwwURL)
        .pipe(
          catchError((err) => {
            return of({ error: err });
          }),
          map((data: any) => {
            return this.mapResponse(data, "External", lastError)
          })
        );

    this.statusAPISubscription$ =
      this.http[this.settings.apiMethod.toLowerCase()](this.getAPIURL())
        .pipe(
          catchError((err) => {
            return of({ error: err });
          }),
          map((data: any) => {
            return this.mapResponse(data, "API", lastError)
          })
        );

    forkJoin(this.statusWWWSubscription$, this.statusAPISubscription$)
      .subscribe((data) => {
        let newStatus: ConnectivityStatus = this.evaluate(data);

        //We will fire the event only if there is a connectivity status change or there was an 
        //error that is requiring to check the connectivity status for proper logging:
        if (this.isStatusChanged(newStatus) || newStatus.lastError) {
          this.status = Object.assign({}, newStatus);
          this.subs.emitConnectivityStatusChange(newStatus);
        }
      },
        err => {
          throw err
        });
  }

  private getAPIURL(): string {
    return environment.apiURL + environment.apiManagementEndpoint +
      this.settings.apiManagementFunction;
  }

  private mapResponse(data, endpointType: string, lastError?: ErrorLog) {

    let ret = {
      error: null,
      url: endpointType,
      lastError: lastError
    }

    if (data && data.error) {
      ret.error = data.error
    }

    return ret;
  }

  private evaluate(data: any): ConnectivityStatus {

    let s: ConnectivityStatus = new ConnectivityStatus();

    data.forEach(item => {
      if (item.url == "External") {
        s.wwwOn = !Boolean(item.error);
      }

      if (item.url == "API") {
        s.apiOn = !Boolean(item.error);
      }

      if (item.lastError) {
        s.lastError = item.lastError;
      }      
    });    

    return s;
  }

  private isStatusChanged(newStatus: ConnectivityStatus): boolean {
    return (this.status.apiOn != newStatus.apiOn || this.status.wwwOn != newStatus.wwwOn ||
      this.status.networkOn != newStatus.networkOn);
  }

  ngOnDestroy(): void {
    try {
      this.statusNetOfflineSubscription$.unsubscribe();
      this.statusNetOnlineSubscription$.unsubscribe();
      this.statusWWWSubscription$.unsubscribe();
      this.statusAPISubscription$.unsubscribe();
    }
    catch (e) {
    }
  }
}

/**
 * Provide all teh required information about the current client side app connectivity status.
 */
export class ConnectivityStatus {
  /**
   * 
   * @param networkOn Boolean value indicating if the user has network connectivity. By default the browser connectivity indicator will be used.
   * @param apiOn Boolean value that indicates if the API is up and running.
   * @param wwwOn Boolean value that indicates if the user is able to hit an external website. 
   * @param lastError ErrorLog objectthat contains the information for the last error sent to this service.
   */
  constructor(networkOn: boolean = window.navigator.onLine, apiOn: boolean = false,
    wwwOn: boolean = false, lastError: ErrorLog = null) {
    this.networkOn = networkOn;
    this.apiOn = apiOn;
    this.wwwOn = wwwOn;
    this.lastError = lastError;
  }

  /**
   * Boolean value indicating if the user has network connectivity.
   */
  networkOn: boolean;

  /**
   * Boolean value that indicates if the API is up and running.
   */
  apiOn: boolean;

  /**
   * Boolean value that indicates if the user is able to hit an external website.
   * Note: That website is configured at global level for the service.
   */
  wwwOn: boolean;

  /**
   * Last error sent to this service.
   */
  lastError: ErrorLog;

  /**
   * Indicates if the user has connectivity issues.
   */
  get isNetworkIssue(): boolean {
    return !this.networkOn || !this.wwwOn;
  }

  /**
   * Indicates if Mi Cocina must report to be offline.
   */
  get isAPIOffline(): boolean {
    return !this.isNetworkIssue && !this.apiOn;
  }

  /**
   * Indicate if the 3 main params are ok, this means:
   *  - The user has network connectivity
   *  - The user has access to an external website.
   *  - Mi Cocina is up and running.
   */
  get isAllGood(): boolean {
    return !this.isNetworkIssue && !this.isAPIOffline;
  }
}