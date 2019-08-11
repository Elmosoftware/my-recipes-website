//Angular and 3rd party
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef, MatAutocompleteModule, MatInputModule, MatCheckboxModule} from '@angular/material';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { NgxSelectModule } from "ngx-select-ex";
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarModule } from '@ngx-loading-bar/core';

//Support Classes and Modules
import { CoreService } from "./services/core-service"
import { CustomErrorHandler } from "./custom-error-handler";
import { InfiniteScrollingModule } from "./shared/infinite-scrolling/infinite-scrolling-module";

//Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { EntitiesComponent } from './entities/entities.component';
import { LatestRecipesComponent } from './home/latest-recipes/latest-recipes.component';
import { RecipeComponent } from "./recipe/recipe.component";
import { RecipeDetailsComponent } from './recipe/recipe-details/recipe-details.component';
import { RecipeIngredientsComponent } from './recipe/recipe-ingredients/recipe-ingredients.component';
import { RecipeDirectionsComponent } from './recipe/recipe-directions/recipe-directions.component';
import { RecipePhotosComponent } from './recipe/recipe-photos/recipe-photos.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { WizardModule } from "./shared/wizard/wizard.module";
import { RecipeViewComponent } from './recipe-view/recipe-view.component';
import { SearchComponent } from './search/search.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { UnauthorizedErrorPageComponent } from './error-pages/unauthorized/unauthorized.component';
import { NotFoundErrorPageComponent } from "./error-pages/not-found/not-found.component";
import { NetworkErrorPageComponent } from './error-pages/network-error/network-error.component';
import { GoneFishingPageComponent } from './error-pages/gone-fishing/gone-fishing.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { CarouselComponent } from './shared/carousel/carousel.component';
import { AboutComponent } from './about/about.component';
import { FileDropperComponent } from './shared/file-dropper/file-dropper.component';
import { TestNewStuffComponent } from './test-new-stuff/test-new-stuff.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { CookingAnimationComponent } from './cooking-animation/cooking-animation.component';
import { CookbookComponent } from './cookbook/cookbook.component';
import { InnerCookbookComponent } from './cookbook/mealtype-cookbook/inner-cookbook.component';

//Services
import { NavigationService } from './services/navigation-service';
import { SubscriptionService } from "./services/subscription.service";
import { EntityServiceFactory } from "./services/entity-service-factory";
import { StandardDialogService } from "./standard-dialogs/standard-dialog.service";
import { Cache } from "./shared/cache/cache";
import { ToasterHelperService } from "./services/toaster-helper-service";
import { AuthService } from "./services/auth-service";
import { MediaService } from "./services/media-service";
import { SearchServiceFactory } from "./services/search-service-factory";
import { ConnectivityService } from './services/connectivity-service';

//Guards
import { AuthGuard } from './services/auth-guard';
import { DataLossPreventionGuard } from "./services/data-loss-prevention-guard";

//Dialogs
import { ConfirmDialogComponent } from './standard-dialogs/confirm-dialog/confirm-dialog.component'
import { EditMealTypeDialog } from "./standard-dialogs/edit-mealtype-dialog/edit-mealtype-dialog";
import { EditLevelDialog } from './standard-dialogs/edit-level-dialog/edit-level-dialog';
import { EditUnitDialog } from './standard-dialogs/edit-unit-dialog/edit-unit-dialog';
import { EditIngredientDialog } from "./standard-dialogs/edit-ingredient-dialog/edit-ingredient-dialog";
import { EditRecipeDirectionDialog } from "./standard-dialogs/edit-recipe-direction-dialog/edit-recipe-direction-dialog";
import { RecipeItemComponent } from './recipe-item/recipe-item.component';
import { RecipePublishingComponent } from './recipe/recipe-publishing/recipe-publishing.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    TestNewStuffComponent,
    AppComponent,
    HomeComponent,
    SearchComponent,
    EntitiesComponent,
    ConfirmDialogComponent,
    EditUnitDialog,
    EditLevelDialog,
    EditMealTypeDialog,
    EditIngredientDialog,
    EditRecipeDirectionDialog,
    LatestRecipesComponent,
    RecipeComponent,
    RecipeDetailsComponent,
    RecipeIngredientsComponent,
    RecipeDirectionsComponent,
    NavigationBarComponent,
    RecipePhotosComponent,
    RecipeViewComponent,
    SearchBoxComponent,
    AuthCallbackComponent,
    UserPreferencesComponent,
    UnauthorizedErrorPageComponent,
    NotFoundErrorPageComponent,
    NetworkErrorPageComponent,
    GoneFishingPageComponent,
    MyRecipesComponent,
    CarouselComponent,
    AboutComponent,
    FileDropperComponent,
    UserDetailsComponent,
    RecipeItemComponent,
    RecipePublishingComponent,
    LoginComponent,
    CookingAnimationComponent,
    CookbookComponent,
    InnerCookbookComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    HttpClientModule,
    ToastrModule.forRoot({
      maxOpened: 5,
      closeButton: true,
      positionClass: "toast-top-right",
      disableTimeOut: false,
      timeOut: 5000
    }),
    NgxSelectModule,
    WizardModule,
    HttpClientModule,
    LoadingBarModule,
    LoadingBarHttpClientModule,
    NgxPageScrollModule,
    NgxPageScrollCoreModule,
    InfiniteScrollingModule,
    DragDropModule,
    MatRadioModule
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
    CoreService,
    NavigationService,
    AuthService,
    AuthGuard,
    { provide: ErrorHandler, useClass: CustomErrorHandler },
    EntityServiceFactory,
    SubscriptionService,
    StandardDialogService,
    Cache,
    ToasterHelperService,
    MediaService,
    SearchServiceFactory,
    DataLossPreventionGuard,
    ConnectivityService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
