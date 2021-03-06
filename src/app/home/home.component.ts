import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { useAnimation, trigger, transition } from '@angular/animations';

import { CoreService } from "../services/core-service";
import { SearchServiceInterface } from "../services/search-service";
import { Cache } from "../shared/cache/cache";
import { environment } from "../../environments/environment";
import { procastinationData } from "../static/procastinationData";
import { Recipe } from '../model/recipe';
import { rotateIn } from "../static/animations";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('isScrollingAnimSearchByIngredient', [
      transition('* => *', [
        useAnimation(rotateIn, { params: { time: "1s" }})
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {

  public procastinationRandomUrl: string;
  public isScrollingAnim: boolean
  
  constructor(private core: CoreService, 
    public cache: Cache,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.core.setPageTitle(this.route.snapshot.data);
    this.procastinationRandomUrl = procastinationData.urls[this.core.helper.getRandomNumberFromInterval(0, 
      procastinationData.urls.length - 1)];
    this.isScrollingAnim = false;
  } 

  ngAfterViewInit(): void {
  }

  onScrollHandler($event: number) {
    this.isScrollingAnim = !this.isScrollingAnim;
  }

  onSearchHandler($event: SearchServiceInterface<Recipe>) {
    this.core.navigate.toSearch($event);
  }

  get contactEmailLink(): string {
    return `mailto:${environment.appSettings.contactEmail}`
  }

  get appNameAndVersion(): string {
    return `${environment.appName} v${environment.appVersion}`
  }

  goToAbout() {
    this.core.navigate.toAbout();
  }
}
