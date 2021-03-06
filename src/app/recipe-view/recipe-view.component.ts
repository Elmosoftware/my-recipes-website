import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { CoreService } from "../services/core-service";
import { EntityService } from "../services/entity-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { RecipePicture } from '../model/recipe-picture';
import { ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";
import { CarouselItem } from '../shared/carousel/carousel.component';
import { APIQueryParams, QUERY_PARAM_PUB, QUERY_PARAM_OWNER } from '../services/api-query-params';
import { MediaTransformations } from '../services/media-service';

/**
 * Size of each data page.
 */
export const CAROUSEL_HEIGHT_PERC: number = 60;

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.css']
})
export class RecipeViewComponent implements OnInit {

  model: Recipe;
  modelIsReady: boolean;
  svc: EntityService;
  preparationMode: boolean;
  lastStepDone: number;
  shoppingList: string[];
  carouselPictures: CarouselItem[];

  get carouselHeightPercentage() {
    return CAROUSEL_HEIGHT_PERC;
  }

  constructor(private core: CoreService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    let q: APIQueryParams = new APIQueryParams();
    
    this.core.setPageTitle(this.route.snapshot.data);
    this.preparationMode = false;
    this.lastStepDone = 0;
    this.shoppingList = [];
    this.modelIsReady = false; //This acts like a flag to know when data retrieval process is ready or not.
    this.svc = this.core.entityFactory.getService("Recipe");

    q.pop = "true";

    if (this.core.auth.isAuthenticated) {
      q.pub = QUERY_PARAM_PUB.all;
    }
    
    this.svc.get(this.route.snapshot.paramMap.get("id"), q)
      .subscribe(
        data => {
          let response: APIResponseParser = new APIResponseParser(data);

          if (response.entities.length == 0) {
            this.model = null;
          }
          else {
            this.model = (response.entities[0] as Recipe);
            this.core.setPageTitle(this.model.name);
            this.buildCarouselPictureList();
          }

          this.modelIsReady = true;
        },
        err => {
          throw err
        });
  }

  get isOwner(): boolean {
    let ret: boolean = false;

    if (this.model && this.core.auth.isAuthenticated) {
      ret = this.model.createdBy._id == this.core.auth.userProfile.user._id;
    }

    return ret;
  }

  get preparationFriendlyTime(): string {
    let ret: string = "";

    if (this.model && this.model.estimatedTime) {
      ret = this.core.helper.estimatedFriendlyTime(this.model.estimatedTime);
    }

    return ret;
  }

  buildCarouselPictureList(): void {
    this.carouselPictures = [];
    let screenHeight: number = this.core.helper.getScreenSize().height * (CAROUSEL_HEIGHT_PERC/100);

    if (this.model && this.model.pictures) {

      this.model.pictures.forEach((pic: RecipePicture) => {
        let item: CarouselItem = new CarouselItem();

        item.imageSrc = this.core.media.getTransformationURL(pic.pictureId.publicId, pic.pictureId.cloudName,
          MediaTransformations.autoCropping(screenHeight, pic.attributes.height));
        item.captionText = pic.caption
        this.carouselPictures.push(item);
      })
    }
  }

  enablePreparationMode(): void {

    this.core.dialog.showConfirmDialog(new ConfirmDialogConfiguration("Modo Preparación",
      `<p>
        El modo preparación te permitirá:
      </p>
      <ul>
        <li>
          Crear una lista de compra con los ingredientes que te falten.
        </li>
        <li>
          Marcar los pasos de la preparación que hayas realizado para facilitarte el trabajo.
        </li>
      </ul>`, "Ok!, Comencemos", "Ahora no, gracias!"))
      .subscribe(result => {
        if (result == 1) {
          this.preparationMode = true;
        }
      });
  }

  stepDone(index): void {
    this.lastStepDone = index;
  }

  toggleShoppingListItem(item) {

    if (this.itemIsInShoppingList(item)) {
      this.shoppingList = this.shoppingList.filter(listItem => listItem != item)
    }
    else {
      this.shoppingList.push(item);
    }
  }

  itemIsInShoppingList(item): boolean {
    return (this.shoppingList.find(listItem => {
      return (listItem == item)
    })) ? true : false;
  }
  
  editRecipe() {
    this.core.helper.removeTooltips(this.core.zone);
    this.core.navigate.toRecipe(this.model._id);
  }

  printRecipe() {
    this.core.helper.removeTooltips(this.core.zone);
    window.print();
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
