import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { SubscriptionService } from "./services/subscription.service";
import { ErrorLog } from './model/error-log'

@Injectable()
export class CustomErrorHandler implements ErrorHandler {

  constructor(private subs: SubscriptionService) {
  }

  /**
   * This method return the list of user errors that we need to handle.
   * Most of them come from the API and are detailed in  the "error.userErrorCode" attribute of the standard JSON returned by the API.
   * NOTE: The set of "upload errors" in the API are not here because this app perform validations on file to be uploaded on 
   * client side.  
   */
  get UserErrorCodes(): object {
    return {
      DUP_ITEM: "El item que estas intentando agregar ya existe. Si estás realizando una modificación, asegurate que no haya otro igual.",
      VOID_UPDATE: "El item que intentaste modificar no existe ya o bien no posees los permisos para hacerlo. Actualiza los datos y verificalo.",
      VOID_DELETE: "No posees permiso para eliminar el item o bien este ya no existe. Actualiza los datos y verificalo."
    }
  }

  handleError(error) {

    var innerErr = null;
    let e = new ErrorLog;

    e.location = location.href;
    e.user = "anonymous";
    e.message = (error.message) ? error.message : "";
    e.stack = (error.stack) ? error.stack : ""

    //Filling Inner exceptions recursively:
    this.FillInnerExceptions(error, e.innerExceptions)

    //We need now to check for user error codes. If the code is in the error:
    if (error.userErrorCode && this.UserErrorCodes[error.userErrorCode]) {
      e.userMessage = this.UserErrorCodes[error.userErrorCode]
      e.isUserError = true;
    }
    else {
      //We must check on the inner exceptions for user error codes:
      e.innerExceptions.forEach(inner => {
        if (inner.userErrorCode && this.UserErrorCodes[inner.userErrorCode]) {
          e.userMessage = this.UserErrorCodes[inner.userErrorCode];
          e.isUserError = true;
          return;
        }
      })
    }

    if (error instanceof HttpErrorResponse) {
      e.httpStatus = error.status.toString();
      e.httpStatusText = error.statusText;
      e.url = error.url;
      //If the error is related to some request that went wrong, we note this to the user:
      if (!e.isUserError) {
        e.userMessage = "Ocurrió un error de conectividad, reintenta la operación en unos minutos."
      }
    }

    console.error(`MyRecipes App unhandled error:\n${JSON.stringify(e)}`);
    this.subs.emitGlobalErrorEvent(e);
  }

  FillInnerExceptions(e, inners) {
    if (e.error) {
      inners.push(e.error);
      this.FillInnerExceptions(e.error, inners);
    }
  }
}
