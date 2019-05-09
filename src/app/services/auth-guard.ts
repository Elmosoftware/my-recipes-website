import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { CoreService } from "./core-service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private core: CoreService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    let adminOnly: boolean = (next.data && next.data.authGuard && next.data.authGuard.adminOnly);
    let allowSocialUsers: boolean = (next.data && next.data.authGuard && next.data.authGuard.allowSocialUsers);

    let ret: boolean = true;
    let msg: string = "";

    //This guard requires an authenticated user, if not we will redirect to the login page:
    if (!this.core.auth.isAuthenticated) {
      console.info(`An authenticated user is required to navigate to ${state.url}. Redirecting to login page...`);
      this.core.auth.login(state.url);
    }
    else {

      //If the user is already logged in, we will check for other constraints:

      if (adminOnly && !this.core.auth.userProfile.user.details.isAdmin) {
        ret = false;
        msg = `Administrator privileges are required to navigate to ${state.url}`;
      }

      if (allowSocialUsers == false && this.core.auth.userProfile.user.details.isSocial) {
        ret = false;
        msg = `Social users are not allowed to navigate to ${state.url}`;
      }

      if (!ret) {
        console.info(msg);
        this.core.navigate.toUnauthorizedAccess();
      }
    }

    return ret;
  }
}
