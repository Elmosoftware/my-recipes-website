import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';

import { CoreService } from '../services/core-service';
import { ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";
import { SearchServiceInterface } from "../services/search-service";
import { Recipe } from '../model/recipe';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
  animations: [
    trigger('isVisibleChanged', [
      state('true', style({ opacity: 1 })),
      state('false', style({ opacity: 0 })),
      transition('* => *', animate('.5s'))])
  ]
})
export class NavigationBarComponent implements OnInit {

  @Input() homePageFeaturesEnabled: boolean;
  @Input() adminMenuEnabled: boolean;
  @Input() searchBoxEnabled: boolean;

  isVisible: boolean;

  constructor(private core: CoreService) {
  }

  ngOnInit() {
    this.isVisible = true;
  }

  onScrollHandler($event: number) {
    this.isVisible = (isNaN($event) || $event < 1);
  }

  get isAdminUser() : boolean {
    return this.core.auth.isAuthenticated && this.core.auth.userProfile.user.details.isAdmin;
  }

  get isAuthenticated(): boolean {
    return this.core.auth.isAuthenticated;
  } 

  get isSocial(): boolean {
    return this.core.auth.isAuthenticated && this.core.auth.userProfile.user.details.isSocial;
  }

  get userPicture(): string {
    let ret: string;

    if (this.core.auth.isAuthenticated) {
      ret = this.core.auth.userProfile.user.details.picture;
    }

    return ret;
  }

  get userName(): string {
    let ret: string;

    if (this.core.auth.isAuthenticated) {
      ret = this.core.auth.userProfile.user.name;
    }

    return ret;
  }

  get userNameAndAccount(): string {
    let ret: string;

    if (this.core.auth.isAuthenticated) {
      ret = this.core.auth.userProfile.userNameAndAccount;
    }

    return ret;
  }

  onSearchHandler($event: SearchServiceInterface<Recipe>) {
    // $event.search();
    this.core.router.navigate(["/search"], { queryParams: { type: $event.searchType, term: $event.term, id: $event.id } } )
  }

  login() {
    this.core.auth.login();
  }

  changePassword() {

    this.core.dialog.showConfirmDialog(new ConfirmDialogConfiguration("Confirmación de cambio de contraseña",
      `Si confirmas tu intención de cambiar tu contraseña de acceso, se te enviará un correo 
      a <i>${this.core.auth.userProfile.user.email}</i> con las instrucciones detalladas para crear tu nueva contraseña.
      <p>Recuerda que el mensaje de cambio de contraseña tiene un tiempo de validez, pasado el cual, el correo
       ya no será válido y deberás volver a iniciar el proceso.</p>`,
      "Si, deseo cambiar mi contraseña", "No, continuaré con la actual")).subscribe(result => {

        if (result == 1) {
          this.core.auth.changePassword((err) => {
            if (err) {
              throw err;
            }
            else {
              this.core.toast.showInformation("Verifica la bandeja de entrada de tu correo y sigue las instrucciones para cambiar tu contraseña.", "Todo ha ido bien!")
            }
          });
        }
      }, err => {
        throw err
      });
  }

  userPreferences(name: string) {
    this.core.router.navigate(['/user-preferences']);
  }

  logout() {
    this.core.auth.logout();
  }
}
