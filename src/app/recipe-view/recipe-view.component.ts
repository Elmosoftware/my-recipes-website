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

  constructor(private core: CoreService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    let q: APIQueryParams = new APIQueryParams();

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

    if (this.model && this.model.pictures) {

      this.model.pictures.forEach((pic: RecipePicture) => {
        let item: CarouselItem = new CarouselItem();

        item.imageSrc = this.core.media.getTransformationURL(pic.pictureId.publicId, pic.pictureId.cloudName)
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

  printShoppingList() {

    let popupWin;
    let content: string;

    content = `<p><h3>Lista de compras:</h3></p><p><ul>`;

    this.shoppingList.forEach((item) => {
      content += `<li>${item}</li>`;
    })

    content += `</ul></p>`

    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mi lista de compras</title>
    </head>
    <body onload="window.print();window.close()">${content}</body>
    </html>
    `);
    popupWin.document.close();
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
