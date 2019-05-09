import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { PAGES } from "./services/navigation-service";
import { HomeComponent } from "./home/home.component";
import { SearchComponent } from './search/search.component';
import { EntitiesComponent } from "./entities/entities.component";
import { RecipeViewComponent } from "./recipe-view/recipe-view.component";
import { RecipeComponent } from './recipe/recipe.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { AuthGuard } from "./services/auth-guard";
import { UnauthorizedErrorPageComponent } from './error-pages/unauthorized/unauthorized.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { NotFoundErrorPageComponent } from './error-pages/not-found/not-found.component';
import { AboutComponent } from './about/about.component';
import { TestNewStuffComponent } from './test-new-stuff/test-new-stuff.component';
import { UserDetailsComponent } from './user-details/user-details.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: PAGES.Home,
    pathMatch: 'full' 
  },
  { 
    path: 'test', 
    component: TestNewStuffComponent 
  },
  { 
    path: PAGES.Home, 
    component: HomeComponent 
  },
  { 
    path: PAGES.AuthCallback, 
    component: AuthCallbackComponent 
  },
  { 
    path: PAGES.Unauthorized, 
    component: UnauthorizedErrorPageComponent 
  },
  { 
    path: PAGES.Search, 
    component: SearchComponent 
  },
  { 
    path: PAGES.Recipe, 
    component: RecipeComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] },
  { 
    // path: 'recipe/:id', 
    path: `${PAGES.Recipe}/:id`, 
    component: RecipeComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: true 
      }
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    // path: 'recipe-view/:id', 
    path: `${PAGES.RecipeView}/:id`, 
    component: RecipeViewComponent 
  },
  { 
    path: PAGES.Level, 
    component: EntitiesComponent, 
    data: { 
      type: "Level", 
      title: "Niveles de dificultad", 
      defaultSort: "name",
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      }
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: PAGES.MealType, 
    component: EntitiesComponent, 
    data: { 
      type: "MealType", 
      title: "Platos", 
      defaultSort: "name",
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] },
  { 
    path: PAGES.Unit, 
    component: EntitiesComponent, 
    data: { 
      type: "Unit", 
      title: "Unidades de medida", 
      defaultSort: "abbrev",
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: PAGES.Ingredient, 
    component: EntitiesComponent, 
    data: { 
      type: "Ingredient", 
      title: "Ingredientes", 
      defaultSort: "name",
      authGuard: { 
        adminOnly: true, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: PAGES.UserPreferences, 
    component: UserPreferencesComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: false 
      } 
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    // path: 'user-details/:id', 
    path: `${PAGES.UserDetails}/:id`, 
    component: UserDetailsComponent 
  },
  { 
    path: PAGES.MyRecipes, 
    component: MyRecipesComponent, 
    data: { 
      authGuard: { 
        adminOnly: false, 
        allowSocialUsers: true 
      } 
    }, 
    canActivate: [AuthGuard] 
  },
  { 
    path: PAGES.About, 
    component: AboutComponent 
  },
  { 
    path: '**', 
    component: NotFoundErrorPageComponent 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
