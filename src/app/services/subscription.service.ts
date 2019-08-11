import { Injectable, EventEmitter } from '@angular/core';
import { ErrorLog } from '../model/error-log'
import { ConnectivityStatus } from "../services/connectivity-service";

@Injectable()
export class SubscriptionService {

  /**
   * Fires when an unhandled exception is throw by the app.
   */
  onGlobalError: EventEmitter<ErrorLog> = new EventEmitter();

  /**
   * Fires when there is a connectivity status change on client side.
   */
  onConnectivityStatusChange: EventEmitter<ConnectivityStatus> = new EventEmitter();

  constructor() {}

  /**
   * Returns the global error event emitter in order to subscribe.
   */
  getGlobalErrorEmitter() {
    return this.onGlobalError;
  }

  /**
   * This will be handled by a custom error handler defined in the app.
   * @param errorLog ErrorLog object to emit including a complete error description.
   */
  emitGlobalErrorEvent(errorLog) {
    this.onGlobalError.emit(errorLog);
  }

  /**
   * Allows to subscribe to connectivity status changes.
   */
  getConnectivityStatusChangeEmitter(): EventEmitter<ConnectivityStatus> {
    return this.onConnectivityStatusChange;
  }
  
  /**
   * This will be handled by the Connectivity service to report connectivity status changes.
   * @param status ConnectivityStatus object containing all the information 
   * about the current connectivitystatus of the client.
   */
  emitConnectivityStatusChange(status: ConnectivityStatus): void {
    this.onConnectivityStatusChange.emit(status);
  }
}
