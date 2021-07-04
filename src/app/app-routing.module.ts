import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { PAGES } from "./services/navigation-service";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from './login/login.component';
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
import { NetworkErrorPageComponent } from './error-pages/network-error/network-error.component';
import { GoneFishingPageComponent } from './error-pages/gone-fishing/gone-fishing.component';
import { AboutComponent } from './about/about.component';
import { TestNewStuffComponent } from './test-new-stuff/test-new-stuff.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { DataLossPreventionGuard } from './services/data-loss-prevention-guard';
import { CookbookComponent } from './cookbook/cookbook.component';

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
    component: HomeComponent,
    data: {
      title: "Inicio",
      showVersionInTitle: true
    }
  },
  {
    path: PAGES.Login,
    component: LoginComponent,
    data: {
      title: "Iniciando sesión",
      showVersionInTitle: true
    }
  },
  {
    path: PAGES.AuthCallback,
    component: AuthCallbackComponent,
    data: {
      title: "Iniciando sesión",
      showVersionInTitle: true
    }
  },
  {
    path: PAGES.Unauthorized,
    component: UnauthorizedErrorPageComponent,
    data: {
      title: "Acceso no autorizado",
      showVersionInTitle: true
    }
  },
  {
    path: PAGES.NetworkError,
    component: NetworkErrorPageComponent,
    data: {
      title: "Error de conectividad"
    }
  },
  {
    path: PAGES.GoneFishing,
    component: GoneFishingPageComponent,
    data: {
      title: "Actualización en progreso ..."
    }
  },
  {
    path: PAGES.Search,
    component: SearchComponent,
    data: {
      title: "Buscar en el recetario"
    }
  },
  {
    path: PAGES.Cookbook,
    component: CookbookComponent,
    data: {
      title: "Recetario"
    }
  },
  {
    path: PAGES.Recipe,
    component: RecipeComponent,
    data: {
      title: "Crear una Receta",
      authGuard: {
        adminOnly: false,
        allowSocialUsers: true
      }
    },
    canActivate: [AuthGuard],
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: `${PAGES.Recipe}/:id`,
    component: RecipeComponent,
    data: {
      title: "Editar una Receta",
      authGuard: {
        adminOnly: false,
        allowSocialUsers: true
      }
    },
    canActivate: [AuthGuard],
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: `${PAGES.RecipeView}/:id`,
    component: RecipeViewComponent,
    data: {
      title: "Ver una Receta"
    }
  },
  {
    path: PAGES.Level,
    component: EntitiesComponent,
    data: {
      type: "Level",
      title: "Niveles de dificultad",
      showVersionInTitle: true,
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
      showVersionInTitle: true,
      defaultSort: "name",
      authGuard: {
        adminOnly: true,
        allowSocialUsers: true
      }
    },
    canActivate: [AuthGuard]
  },
  {
    path: PAGES.Unit,
    component: EntitiesComponent,
    data: {
      type: "Unit",
      title: "Unidades de medida",
      showVersionInTitle: true,
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
      showVersionInTitle: true,
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
      title: "Preferencias",
      authGuard: {
        adminOnly: false,
        allowSocialUsers: false
      }
    },
    canActivate: [AuthGuard]
  },
  {
    path: `${PAGES.UserDetails}/:id`,
    component: UserDetailsComponent,
    data: {
      title: "Detalles del Usuario"
    }
  },
  {
    path: PAGES.MyRecipes,
    component: MyRecipesComponent,
    data: {
      title: "Mis Recetas!",
      authGuard: {
        adminOnly: false,
        allowSocialUsers: true
      }
    },
    canActivate: [AuthGuard]
  },
  {
    path: PAGES.About,
    component: AboutComponent,
    data: {
      title: "Acerca de este sitio"
    }
  },
  {
    path: '**',
    component: NotFoundErrorPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
