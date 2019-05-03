import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CoreService } from "../services/core-service";
import { SearchServiceInterface } from "../services/search-service";
import { Cache } from "../shared/cache/cache";
import { environment } from "../../environments/environment";
import { procastinationData } from "../static/procastinationData";
import { Recipe } from '../model/recipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public procastinationRandomUrl: string;

  constructor(private core: CoreService,private router: Router, public cache: Cache) {
  }

  ngOnInit() {
    this.procastinationRandomUrl = procastinationData.urls[this.core.helper.getRandomNumberFromInterval(0, 
      procastinationData.urls.length - 1)];
  } 

  ngAfterViewInit(): void {
  }

  onSearchHandler($event: SearchServiceInterface<Recipe>) {
    console.log(`SEARCH! type:"${$event.searchType}", term:"${$event.term}", id:"${$event.id}"`);
    this.router.navigate(["/search"], { queryParams: { type: $event.searchType, term: $event.term, id: $event.id } } )
  }

  get contactEmailLink(): string {
    return `mailto:${environment.appSettings.contactEmail}`
  }
}
