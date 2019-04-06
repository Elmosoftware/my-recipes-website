import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

import { EntityServiceFactory } from "../services/entity-service-factory";
import { EntityService } from "../services/entity-service";
import { APIResponseParser } from "../services/api-response-parser";
import { Recipe } from "../model/recipe";
import { RecipePicture } from '../model/recipe-picture';
import { Helper } from "../shared/helper";
import { ErrorLog } from '../model/error-log';
import { StandardDialogService, ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";
import { ToasterHelperService } from '../services/toaster-helper-service';
import { SubscriptionService } from "../services/subscription.service";
import { MediaService } from "../services/media-service";
import { AuthService } from '../services/auth-service';
import { CarouselItem } from '../shared/carousel/carousel.component';

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.css']
})
export class RecipeViewComponent implements OnInit {

  globalErrorSubscription: any;
  model: Recipe;
  modelIsReady: boolean;
  svc: EntityService;
  helper: Helper;
  preparationMode: boolean;
  lastStepDone: number;
  shoppingList: string[];
  carouselPictures: CarouselItem[];

  constructor(private svcAuth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private subs: SubscriptionService,
    private dlgSvc: StandardDialogService,
    private svcFac: EntityServiceFactory,
    private toast: ToasterHelperService,
    private zone: NgZone,
    private svcMedia: MediaService) { }

  ngOnInit() {
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item));
    this.preparationMode = false;
    this.lastStepDone = 0;
    this.shoppingList = [];
    this.modelIsReady = false; //This acts like a flag to know when data retrieval process is ready or not.
    this.helper = new Helper();
    this.svc = this.svcFac.getService("Recipe");

    this.svc.get(this.route.snapshot.paramMap.get("id"), null)
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
 
  get isOwner() :boolean {
    let ret: boolean = false;

    if (this.model && this.svcAuth.isAuthenticated) {
      ret = this.model.createdBy._id == this.svcAuth.userProfile.user._id;
    }
    
    return ret;
  }

  buildCarouselPictureList(): void {
    this.carouselPictures = [];

    if (this.model && this.model.pictures) {
      
      this.model.pictures.forEach((pic: RecipePicture) => {
        let item: CarouselItem = new CarouselItem();

        item.imageSrc = this.svcMedia.getTransformationURL(pic.pictureId.publicId, pic.pictureId.cloudName)
        item.captionText = pic.caption
        this.carouselPictures.push(item);
      })   
    }
  }

  enablePreparationMode(): void {

    this.dlgSvc.showConfirmDialog(new ConfirmDialogConfiguration("Modo Preparación",
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

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item);
  }
  
  editRecipe(){
    this.helper.removeTooltips(this.zone);
    this.router.navigate([`/recipe/${this.model._id}`]);
  }
}
