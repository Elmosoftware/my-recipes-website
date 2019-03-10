import { Component, OnInit, Inject } from '@angular/core';

import { ToasterHelperService } from '../../services/toaster-helper-service';
import { SubscriptionService } from "../../services/subscription.service";
import { ErrorLog } from '../../model/error-log';
import { Helper } from "../../shared/helper";
import { Cache } from "../../shared/cache/cache";
import { RecipePicture } from '../../model/recipe-picture';
import { MediaService } from "../../services/media-service";

@Component({
  selector: 'app-latest-recipes',
  templateUrl: './latest-recipes.component.html',
  styleUrls: ['./latest-recipes.component.css']
})
export class LatestRecipesComponent implements OnInit {

  globalErrorSubscription: any;
  helper: Helper;

  constructor(private subs: SubscriptionService,
    public cache: Cache,
    public toast: ToasterHelperService, 
    public svcMedia: MediaService) {
  }

  ngOnInit() {
    this.globalErrorSubscription = this.subs.getGlobalErrorEmitter().subscribe(item => this.localErrorHandler(item))
    this.helper = new Helper();
  }

  ngOnDestroy() {
    this.globalErrorSubscription.unsubscribe();
  }

  getCover(pictures: RecipePicture[]): string{
    return this.svcMedia.getCoverPictureCircleThumb(pictures);
  }

  localErrorHandler(item: ErrorLog) {
    this.toast.showError(item.getUserMessage());
  }
}
