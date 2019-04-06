import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';

import { environment } from "../../environments/environment";
import { APIResponseParser } from "../services/api-response-parser";
import { User } from "../model/user";

(window as any).global = window;

const REFERRER_URL_KEY: string = "AUTH-LOGIN-REFERRER-URL";

/**
 * Authentication and Authorization service
 * @class
 */
@Injectable()
export class AuthService {

  constructor(public router: Router, private http: HttpClient) {
    this._getAccessToken();
  }

  auth0 = new auth0.WebAuth({
    clientID: environment.authSettings.clientID,
    domain: environment.authSettings.domain,
    responseType: environment.authSettings.responseType,
    redirectUri: environment.authSettings.redirectURI,
    scope: environment.authSettings.scope,
    audience: environment.authSettings.audience
  });

  private _userProfile: UserProfile

  /**
   * Return the User profile for the authenticated user.
   * If there is no authenticated user, this attribute will return a null value.
   */
  public get userProfile(): UserProfile {
    return this._userProfile;
  }

  /**
   * Starts the user login process.
   * @param referrerURL The URL to be redirected as soon the authentication process finished. If no value is specified, 
   * the authenticated user will be redirected to the home page.
   */
  public login(referrerURL?: string): void {

    if (referrerURL) {
      localStorage.setItem(REFERRER_URL_KEY, referrerURL);
    }

    this.auth0.authorize();
  }

  /**
   * This method handle the callback request for a log in process.
   * Need to be called from the authorization callback page.
   */
  public handleAuthentication(): void {

    let redirectTo: string = "/home";

    if (localStorage.getItem(REFERRER_URL_KEY)) {
      redirectTo = localStorage.getItem(REFERRER_URL_KEY);
      localStorage.removeItem(REFERRER_URL_KEY);
    }

    this.auth0.parseHash((err, authResult) => {

      if (err) {
        throw err;
      }

      this._getUserInfo(authResult, () => {
        this.router.navigate([redirectTo]);
      });
    });
  }

  /**
   * Ends the current user session.
   * @throws If there is no authenticated user.
   */
  public logout() {

    if (!this.isAuthenticated) {
      throw this._getNotAuthenticatedError("logout");
    }

    //Removing session data:
    this._removeSession();

    // Log out of Auth0 session now.
    // NOTE: Ensure that returnTo URL is specified in Auth0 app settings for "Allowed Logout URLs".
    this.auth0.logout({
      returnTo: environment.appURL,
      clientID: environment.authSettings.clientID
    });
  }

  /**
   * Starts the password reset process with the Auth provider.
   * @param callback Callback function to be invoked when the remote process is already finished.
   */
  public changePassword(callback: Function) {

    if (!this.isAuthenticated) {
      callback(this._getNotAuthenticatedError("password change"));
      return;
    }

    this.auth0.changePassword({
      email: this._userProfile.user.email,
      connection: environment.authSettings.dbConnection
    }, (err) => {
      callback(err);
    });
  }

  /**
   * 
   * @param user New user preferences like, email, name, etc..
   * @param cb Function callback to be invoked as soon the asynchronous process ends. 
   * This function will receive a single parameter with the error details. If this parameter is null or empty 
   * means the update was successful.
   */
  public updateUserPreferences(user: User, cb: Function) {

    if (!this.isAuthenticated) {
      throw this._getNotAuthenticatedError("update user preferences");
    }

    this.http.put(this._buildManagementAPIURL("user"), user,
      { headers: this._buildManagementAPIHeaders(this._userProfile.accessToken) })
      .subscribe((data) => {
        new APIResponseParser(data); //If there is an API error, this will throw.  
        this._setSession(null, user);
        cb(null, this._userProfile.user);
      }, err => {
        throw err
      });
  }

  /**
   * Returns a boolean value indicating if there is a current authenticated user with a valid session.
   */
  public get isAuthenticated(): boolean {
    return this._userProfile && this._userProfile.sessionExpiresAt > new Date();
  }

  /**
   * This method is called once when the app is started.
   * It uses session cookies to refresh the token and continue an previous user session.
   */
  private _getAccessToken() {
    this.auth0.checkSession({}, (err, authResult) => {
      //The Auth service provider is reporting as error if a login is required, so whatever 
      //the case, if there is an error there is no point to get the user info:
      if (!err) {
        this._getUserInfo(authResult);
      }
    });
  }

  /**
   * Return the full user profile based on the authentication data recevived during the log in process.
   * @param authResult Auth process data incuding tokens, expiration and user id.
   */
  private _getUserInfo(authResult, cb?: Function) {

    if (authResult && authResult.idTokenPayload && authResult.idTokenPayload.sub) {

      //Use access token to retrieve user's profile and set session:
      this.http.get(this._buildManagementAPIURL("login"),
        { headers: this._buildManagementAPIHeaders(authResult.accessToken) })
        .subscribe((data) => {
          let response: APIResponseParser = new APIResponseParser(data); //This will throw if there is an API error

          //Sometimes, (and because the async nature of the auth process), at this point the session and the user profile was 
          //already set. So, we check that before to re-create the session twice :-)
          if (!this.isAuthenticated) {
            this._setSession(authResult, response.entities[0] as any);
          }

          if (cb) {
            cb();
          }
        },
          err => {
            throw err
          });
    }
    else {
      throw new Error(`The authentication process results provided doesn't contain the user identification data in the ID Token payload.`)
    }
  }

  /**
   * Erase the stored user session and profile data.
   */
  private _removeSession() {
    this._userProfile = null;
  }

  /**
   * This set the user profile and session data.
   * the parameter @param authResult can be null only if the user session is already established and the intention is to 
   * update the user profile data.
   * Otherwise this method will @throws An error indicating that the @param authResult can't be null.
   * @param authResult Authentication data received afte the authentication 
   * process, (includes tokens, user id, session expiration, etc.)
   * @param user User object with all the user required information.
   */
  private _setSession(authResult = null, user: User) {

    try {
      if (!authResult && !this._userProfile) {
        throw new Error("You can't establish session data without the authentication tokens.")
      }

      if (!this._userProfile) {
        this._userProfile = new UserProfile();
      }

      if (authResult) {
        this._userProfile.accessToken = authResult.accessToken;
        this._userProfile.idToken = authResult.idToken;
        this._userProfile.sessionExpiresAt = new Date((authResult.expiresIn * 1000) + Date.now());
      }

      this.userProfile.user = user;

      console.log(`User "${this._userProfile.user.name}" (${this._userProfile.user.email}) successfully logged in. 
        (Session expires at ${this._userProfile.sessionExpiresAt})`)
    } catch (error) {
      this._removeSession();
      throw new Error(`There was an error while trying to gather the user authentication data. \n
        Following error details: ${error.message}`);
    }
  }

  /**
   * Helper to build the URL for a My Recipes Management API call.
   * @param functionName Management API function name to invoke.
   * @param param URL Param to send.
   */
  private _buildManagementAPIURL(functionName: string, param?: string): string {

    if (!param) {
      param = "";
    }

    return `${environment.apiURL}${environment.apiManagementEndpoint}${functionName}/${param}`;
  }

  private _buildManagementAPIHeaders(accessToken: string): HttpHeaders {

    let ret: HttpHeaders;

    if (!accessToken) {
      throw new Error(`The parameter "accessToken" can't be a null reference.`)
    }

    ret = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken);

    return ret;
  }

  /**
   * Returns a customized Error object with an error message indicating that the operation will be aborted because there is not an 
   * active user session.
   * @param operation The operation that cause the exception.
   */
  private _getNotAuthenticatedError(operation: string): Error {
    return new Error(`The operation "${operation}" is only available when the user is already authenticated.`)
  }
}

export class UserProfile {

  constructor() {
  }

  user: User;
  idToken: string;
  accessToken: string;
  sessionExpiresAt: Date;

  get userNameAndAccount(): string {
    let ret = ""

    if (this.user) {
      ret = this.user.name + " (" + this.user.email + ")."  
    }
    
    return ret;
  }
}
