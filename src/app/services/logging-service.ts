import * as Sentry from "@sentry/browser";

import { environment } from "../../environments/environment";
import { AuthService } from './auth-service';
import { ErrorLog } from '../model/error-log';

/**
 * This class is a wrapper for the error logging provider.
 */
export class LoggingService {

    private initOptions:any = {
        dsn: environment.logging.dsn
    }

    constructor(private auth: AuthService) {
    }

    /**
     * Log an information message to the log provider and optionally to the browser console.
     * @param msg Message to log
     * @param toConsole Boolean value that indicates if the message need to be logged to the browser console too.
     */
    logInfo(msg, toConsole = true) {
        this._logMessage(msg, Sentry.Severity.Info, toConsole);
    }

    /**
     * Log a warning message to the log provider and optionally to the browser console.
     * @param msg Message to log
     * @param toConsole Boolean value that indicates if the message need to be logged to the browser console too.
     */
    logWarn(msg, toConsole = true) {
        this._logMessage(msg, Sentry.Severity.Warning, toConsole);
    }

    /**
     * Log an exeception sending the error and context data to the log provoder. Optionally showing the error in the Browser console.
     * @param e ErrorLog object containing not only error but also context information to be sent to the log provider.
     * @param toConsole Boolean value that indicates if the message need to be logged to the browser console too.
     */
    logException(e: ErrorLog, toConsole = true) {

        Sentry.withScope((scope) => {
            this._setScope(scope);
            this._setScopeAdditionalData(scope, e)
            Sentry.captureMessage(e.message, Sentry.Severity.Error);
        })

        if (toConsole) {
            let message: string = "";

            this._getErrorLogProperties(e).forEach((item) => {
                message += `${item.key}: "${item.value}"\n`
            })

            console.error(`Mi Cocina - Exception details:\n${message}`);
        }
    }

    private _logMessage(msg: string, severity: Sentry.Severity, toConsole = true) {

        Sentry.withScope((scope) => {
            this._setScope(scope);
            Sentry.captureMessage(String(msg), severity);
        })

        if (toConsole) {
            if (severity == Sentry.Severity.Warning) {
                console.warn(msg);
            }
            else{
                console.log(msg);
            }            
        }
    }

    private _setScope(scope: Sentry.Scope): void {
        Sentry.init(this.initOptions);
        Sentry.configureScope((scope) => {
            scope.setTag("source", environment.logging.source);
        });
        this._setUserInScope(scope);
    }

    private _setUserInScope(scope: Sentry.Scope): void {
        if (this.auth.isAuthenticated) {
            scope.setUser({
                id: this.auth.userProfile.user._id,
                providerId: this.auth.userProfile.user.providerId,
                isAdmin: this.auth.userProfile.user.details.isAdmin,
                email: this.auth.userProfile.user.email
            })
        }
    }

    private _setScopeAdditionalData(scope: Sentry.Scope, e: ErrorLog) {

        let props = this._getErrorLogProperties(e, ["error", "message"]);

        props.forEach((pair) => {
            scope.setExtra(pair.key, pair.value);
        })
    }

    private _getErrorLogProperties(e: ErrorLog, exclude: string[] = null): any[] {
        let ret = [];

        if (!exclude) {
            exclude = [];
        }

        exclude.push("innerExceptions");

        Object.getOwnPropertyNames(e).forEach((prop) => {
            if (!exclude.includes(prop)) {

                let val: string = ""

                if(typeof e[prop] == "object"){
                    val = JSON.stringify(e[prop], Object.getOwnPropertyNames(e[prop]))
                }
                else{
                    val = String(e[prop]);
                }

                ret.push({
                    key: prop,
                    value: val
                });
            }
        })

        if (e.innerExceptions && e.innerExceptions.length > 0) {
            e.innerExceptions.forEach((error, i) => {
                ret.push({
                    key: `Inner Exception #${i + 1}`, 
                    value: JSON.stringify(error, Object.getOwnPropertyNames(error))
                });
            })       
        }

        return ret;
    }
}
