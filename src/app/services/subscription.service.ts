import { Injectable, EventEmitter } from '@angular/core';
import { ErrorLog } from '../model/error-log'
import { RECIPE_TABS } from "../recipe/recipe-tabs";

@Injectable()
export class SubscriptionService {

  /**
   * This will emit every time an unhandled exception is throw by the app.
   */
  onGlobalError: EventEmitter<ErrorLog> = new EventEmitter();

  constructor() {}
  
  /**
   * This will be handled by a custom error handler defined in the app.
   * @param errorLog ErrorLog object to emit including a complete error description.
   */
  emitGlobalErrorEvent(errorLog) {
    this.onGlobalError.emit(errorLog);
  }

  /**
   * Returns the global error event emitter in order to subscribe.
   */
  getGlobalErrorEmitter() {
    return this.onGlobalError;
  }
}
