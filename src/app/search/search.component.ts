import { Component, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from "../services/core-service";
import { WordAnalyzerService } from "../services/word-analyzer-service";
import { Recipe } from "../model/recipe";
import { SearchServiceInterface } from "../services/search-service";
import { SearchServiceFactory } from "../services/search-service-factory";
import { SEARCH_TYPE, parseSearchType } from "../services/search-type";
import { SearchResults } from "../services/search-results";
import { InfiniteScrollingService, SCROLL_POSITION, PagingHelper } from "../shared/infinite-scrolling/infinite-scrolling-module";

/**
 * Size of each data page.
 */
const PAGE_SIZE: number = 50;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  svcInfScroll: InfiniteScrollingService<Recipe>;
  onDataFeed: EventEmitter<PagingHelper>;
  wordAnalyzer: WordAnalyzerService;
  svcSearch: SearchServiceInterface<Recipe>;
  initialValues = { term: "", id: "" };
  paramsTermChangedSubscription: EventEmitter<boolean>;
  asyncInProgress: boolean;
  placeHolderText: string;

  constructor(private core: CoreService,
    private route: ActivatedRoute,
    private svcSearchFactory: SearchServiceFactory) {
  }

  ngOnInit() {
    //Initializing:
    this.core.setPageTitle(this.route.snapshot.data);
    this.wordAnalyzer = new WordAnalyzerService();
    this.resetSearch();
    this.parseQueryparams();
    this.initPlaceHolderText();

    //If there is some initial values sent by query string to start searching, and those are valid, we can 
    //kick off the search immediately:
    if (this.initialValues.term) {
      if (!this.svcSearch.termIsValid) {
        /*
          Need to do this in order to avoid the following error: 
          "ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked".
        */
        setTimeout(() => {
          this.core.toast.showInformation("Intenta refinar el texto a buscar. Prueba agregando más caracteres!");
        });
      }
      else {
        this.search();
      }
    }
  }

  initPlaceHolderText(): void {

    switch (this.svcSearch.searchType) {
      case SEARCH_TYPE.Text:
        this.placeHolderText = "Ingresa el texto a buscar en las recetas ...";
        break;
      case SEARCH_TYPE.Ingredient:
        this.placeHolderText = "Ingresa aqui el ingrediente que te interesa ...";
        break;
      case SEARCH_TYPE.User:
        this.placeHolderText = "Ingresa aqui el nombre del usuario ...";
        break;
    }
  }

  resetSearch() {
    this.svcInfScroll = new InfiniteScrollingService<Recipe>(PAGE_SIZE);
    this.onDataFeed = this.svcInfScroll.dataFeed;

    this.onDataFeed
      .subscribe((ph: PagingHelper) => {
        this.onDataFeedHandler(ph)
      });
  }

  parseQueryparams() {

    let searchType: SEARCH_TYPE;

    if (this.route.snapshot.queryParamMap.get("type")) {

      try {
        searchType = parseSearchType(this.route.snapshot.queryParamMap.get("type"))
      } catch (error) {
        this.core.logger.logWarn(`The search type supplied: ${this.route.snapshot.queryParamMap.get("type")} is not valid. We are setting search type "${SEARCH_TYPE.Text}" instead.`);
        searchType = SEARCH_TYPE.Text
      }

      this.svcSearch = this.svcSearchFactory.getService(searchType);
    }
    else {
      this.svcSearch = this.svcSearchFactory.getService(SEARCH_TYPE.Text)
    }

    if (this.route.snapshot.queryParamMap.get("term")) {

      this.svcSearch.term = this.route.snapshot.queryParamMap.get("term");
      this.initialValues.term = this.svcSearch.term;

      if (this.route.snapshot.queryParamMap.get("id")) {
        this.svcSearch.id = this.route.snapshot.queryParamMap.get("id");
        this.initialValues.id = this.svcSearch.id;
      }
    }
  }

  onScrollEndHandler(e: SCROLL_POSITION): void {
    this.svcInfScroll.onScrollEndHandler(e);
  }

  onDataFeedHandler(ph: PagingHelper): void {
    this.fetchData(ph.top, ph.skip);
  }

  onSearchHandler($event: SearchServiceInterface<Recipe>) {
    this.svcSearch.term = $event.term;
    this.svcSearch.id = $event.id;
    this.search();
  }

  search() {
    this.resetSearch();
    this.fetchData(this.svcInfScroll.pageSize, 0);
  }

  fetchData(top: number, skip: number): void {

    if (this.svcInfScroll.model) {
      this.core.toast.showInformation("Estamos trayendo más resultados de tu búsqueda...", "Espera!");
    }

    this.asyncInProgress = true;

    this.svcSearch.fetch(top, skip, true)
      .subscribe((data: SearchResults<Recipe>) => {
        this.svcInfScroll.feed(data.totalCount, data.items);
        this.asyncInProgress = false;
      });
  }

  fullScrollUp() {
    this.svcInfScroll.fullScrollUp();
  }

  fullScrollDown() {
    this.svcInfScroll.fullScrollDown();
  }
}
