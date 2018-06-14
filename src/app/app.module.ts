//Angular and 3rd party
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { NgxSelectModule } from "ngx-select-ex";
import { NgxPageScrollModule } from 'ngx-page-scroll';

//Support Classes
import { CustomErrorHandler } from "./custom-error-handler";

//Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { BackendComponent } from './backend/backend.component';
import { EntitiesComponent } from './backend/entities/entities.component';
import { LatestRecipesComponent } from './home/latest-recipes/latest-recipes.component';
import { NewRecipeComponent } from './new-recipe/new-recipe.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { WizardModule } from "./shared/wizard/wizard.module";
import { RecipeViewComponent } from './recipe-view/recipe-view.component';

//Services
import { SubscriptionService } from "./services/subscription.service";
import { EntityServiceFactory } from "./services/entity-service-factory";
import { StandardDialogService } from "./standard-dialogs/standard-dialog.service";
import { Cache } from "./shared/cache/cache";
import { ToasterHelperService } from "./services/toaster-helper-service";

//Dialogs
import { ConfirmDialogComponent } from './standard-dialogs/confirm-dialog/confirm-dialog.component'
import { EditMealTypeDialog } from "./standard-dialogs/edit-mealtype-dialog/edit-mealtype-dialog";
import { EditLevelDialog } from './standard-dialogs/edit-level-dialog/edit-level-dialog';
import { EditUnitDialog } from './standard-dialogs/edit-unit-dialog/edit-unit-dialog';
import { EditIngredientDialog } from "./standard-dialogs/edit-ingredient-dialog/edit-ingredient-dialog";
import { EditRecipeDirectionDialog } from "./standard-dialogs/edit-recipe-direction-dialog/edit-recipe-direction-dialog";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BackendComponent,
    EntitiesComponent,
    ConfirmDialogComponent,
    EditUnitDialog,
    EditLevelDialog,
    EditMealTypeDialog,
    EditIngredientDialog,
    EditRecipeDirectionDialog,
    LatestRecipesComponent,
    NewRecipeComponent,
    NavigationBarComponent,
    RecipeViewComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatDialogModule,
    HttpClientModule,
    ToastrModule.forRoot({ 
      maxOpened: 5,
      closeButton: true,
      positionClass: "toast-top-right",
      timeOut: 5000
    }), 
    NgxSelectModule,
    NgxPageScrollModule,
    WizardModule
  ],
  entryComponents: [
    ConfirmDialogComponent, 
    EditUnitDialog, 
    EditLevelDialog, 
    EditMealTypeDialog,
    EditIngredientDialog,
    EditRecipeDirectionDialog
  ],
  providers: [
    { provide: ErrorHandler, useClass: CustomErrorHandler },
    EntityServiceFactory,
    SubscriptionService,
    StandardDialogService,
    Cache,
    ToasterHelperService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
