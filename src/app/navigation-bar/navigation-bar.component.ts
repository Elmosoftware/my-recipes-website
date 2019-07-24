import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, animate, transition, style } from '@angular/animations';

import { CoreService } from '../services/core-service';
import { ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";
import { SearchServiceInterface } from "../services/search-service";
import { PAGES } from "../services/navigation-service";
import { Recipe } from '../model/recipe';
import { SEARCH_TYPE } from "../services/search-type";
import { SearchServiceFactory } from "../services/search-service-factory";

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
  animations: [
    trigger('isVisibleChanged', [
      state('true', style({ opacity: 1, display: "flex" })),
      state('false', style({ opacity: 0, display: "none" })), 
      transition('true => false', [
        animate('.5s')
      ]),
      transition('false => true', [
        animate('.5s')
      ]),
    ])
  ]
})
export class NavigationBarComponent implements OnInit {

  @Input() homePageFeaturesEnabled: boolean;
  @Input() adminMenuEnabled: boolean;
  @Input() searchBoxEnabled: boolean;

  isVisible: boolean;
  currentPage: PAGES
  adminMenuExpanded: boolean;

  get isHome(): boolean {
    return this.currentPage == PAGES.Home;
  }

  constructor(private core: CoreService, private route: ActivatedRoute, 
    private svcSearchFac: SearchServiceFactory) {
  }

  ngOnInit() {
    this.adminMenuExpanded = false;
    this.isVisible = true;
    this.currentPage = this.core.navigate.parsePageURL(this.route.snapshot.url[0]);
  }

  onScrollHandler($event: number) {
    this.isVisible = (isNaN($event) || $event < 1);
  }

  toggleAdminMenu($event):void {
    this.adminMenuExpanded = !this.adminMenuExpanded;
    $event.preventDefault();
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
    this.core.navigate.toSearch($event);
  }

  login() {
    this.core.auth.login();
  }

  changePassword() {

    this.core.dialog.showConfirmDialog(new ConfirmDialogConfiguration("Confirmación de cambio de contraseña",
      `Si confirmas tu intención de cambiar tu contraseña de acceso, se te enviará un correo 
      a <i>${this.core.auth.userProfile.user.email}</i> con las instrucciones detalladas para crear tu nueva contraseña.
      <p class="mt-2 mb-0">Recuerda que el mensaje de cambio de contraseña tiene un tiempo de validez, pasado el cual, el correo
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

  goToHome() {
    this.core.navigate.toHome();
  }

  goToCookbook(){
    this.core.navigate.toCookbook();
  }

  goToSearchByIngredient(){
    let s: SearchServiceInterface<Recipe>;

    //This need to do something only if we are not in Home page. Otherwise the pagescroll directive 
    //will do the job.
    if (!this.isHome) {
      s = this.svcSearchFac.getService(SEARCH_TYPE.Ingredient);
      this.core.navigate.toSearch(s);
    }
  }

  goToMyRecipes() {
    this.core.navigate.toMyRecipes();
  }

  goToUserPreferences() {
    this.core.navigate.toUserPreferences();
  }

  goToRecipe() {
    this.core.navigate.toRecipe();
  }

  goToMealtypes() {
    this.core.navigate.toMealTypes();
  }

  goToLevels() {
    this.core.navigate.toLevels();
  }

  goToUnits() {
    this.core.navigate.toUnits();
  }

  goToIngredients() {
    this.core.navigate.toIngredients();
  }

  logout() {
    this.core.auth.logout();
  }
}
