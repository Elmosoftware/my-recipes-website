import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ErrorLog } from '../model/error-log';

/**
 * Helper class for the ngx-toastr component.
 * 
 * This facilitates the implementation of the toaster with the same visual aids in all the app.
 */
@Injectable()
export class ToasterHelperService {

    constructor(private zone: NgZone,
        private toastr: ToastrService) {
    }

    /**
     * Shows an error message in a toaster. This message could be a single string or a whole ErrorLog object.
     * @param message Message to show in the toaster or an ErrorLog object containing all the Error details.
     * @param title Optional toaster title.
     */
    showError(message: string | ErrorLog, title: string = 'Ooops!, algo no anduvo bien... :-(') {

        this.zone.run(() => {
            if (typeof message == "object") {
                if (message.isUserError) {
                    this.toastr.warning(message.getUserMessage())
                }
                else {
                    this.toastr.error(message.getUserMessage(), title);
                }
            }
            else {
                this.toastr.error(String(message), title);
            }            
        });
    }

    /**
     * Shows a success message in a toaster.
     * @param message Message to show in the toaster.
     * @param title Optional toaster title.
     */
    showSuccess(message, title = 'Ok!') {
        this.zone.run(() => {
            this.toastr.success(message, title);
        });
    }

    /**
     * Shows an informational message message in a toaster.
     * @param message Message to show in the toaster.
     * @param title Optional toaster title.
     */
    showInformation(message, title ='Info...') {
        this.zone.run(() => {
            this.toastr.info(message, title);
        });
    }

    /**
     * Shows a warning message in a toaster.
     * @param message Message to show in the toaster.
     * @param title Optional toaster title.
     */
    showWarning(message, title = 'Atención!') {
        this.zone.run(() => {
            this.toastr.warning(message, title);
          });
    }
}