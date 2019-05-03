import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CoreService } from "../services/core-service";
import { Recipe } from "../model/recipe";
import { SearchServiceInterface } from "../services/search-service";
import { SearchServiceFactory } from "../services/search-service-factory";
import { SEARCH_TYPE, parseSearchType } from "../services/search-type";
import { SearchSuggestion } from '../services/search-suggestion';

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {

  @Input() searchType: string;

  @Input() initialTerm: string;

  @Input() initialId: string;

  @Input() placeHolder: string = "Busca recetas con ...";

  @Input() searchInProgress: boolean;

  @Output() search = new EventEmitter<SearchServiceInterface<Recipe>>();

  svcSearch: SearchServiceInterface<Recipe>;
  suggestions: SearchSuggestion[];
  searchTextBox: FormControl;

  constructor(private core: CoreService,
    private svcSearchFactory: SearchServiceFactory) {
  }

  ngOnInit() {
    this.svcSearch = this.svcSearchFactory.getService(parseSearchType(this.searchType));
    this.suggestions = [];
    this.searchTextBox = new FormControl();

    //We set the initial values if any:
    if (this.initialTerm || this.initialId) {
      this.svcSearch.term = this.initialTerm;
      this.svcSearch.id = this.initialId;
      this.searchTextBox.setValue(this.svcSearch.term, { emitEvent: false });
    }

    this.searchTextBox.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.termChangeHandle(term)
      });
  }

  termChangeHandle(text: string) {

    //If there is no search text, we reset the values:
    if (!text) {
      this.suggestions = [];
      this.svcSearch.reset();
      return;
    }

    //If we are doing a text based search, no suggestions are expected. The user just enter 
    //the text and click on the magnifier glass to get the results:
    if (this.svcSearch.isTextBasedSearch) {
      this.svcSearch.term = text;
    }
    else {
      //If this is a suggestion based search and not any of the previous suggestions match the user text:
      if (!this.suggestionMatch(text)) {

        //We fetch new suggestions:
        this.svcSearch.findSuggestions(text)
          .subscribe((suggestions: SearchSuggestion[]) => {

            this.suggestions = suggestions;

            if (this.suggestionMatch(text)) {
              this.startSearching();
            }
          })
      }
      else {
        this.startSearching();
      }
    }
  }

  suggestionMatch(text: string): boolean {

    let ret: boolean = false;

    this.svcSearch.reset();

    if (this.suggestions.length > 0) {
      this.suggestions.forEach((s: SearchSuggestion) => {

        if (text.toLowerCase() == s.text.toLowerCase()) {
          this.svcSearch.term = s.text;
          this.svcSearch.id = s.id;
          this.searchTextBox.setValue(this.svcSearch.term, { emitEvent: false });
          ret = true;
        }
      });
    }

    return ret;
  }

  suggestionSelected($event) {
    this.searchTextBox.setValue($event.option.viewValue);
  }

  getSearchingLegend(): string {

    let ret: string = "Buscando recetas "

    switch (this.svcSearch.searchType) {
      case SEARCH_TYPE.Text:
        ret += "con el texto ";
        break;
      case SEARCH_TYPE.Ingredient:
        ret += "que contengan ";
        break;
      case SEARCH_TYPE.User:
        ret += "creadas por "
        break;
      default:
        ret += "con "
    }

    ret += `"${this.svcSearch.term}", espere por favor.`

    return ret;
  }

  startSearching() {

    if (!this.svcSearch.term) {
      return;
    }

    if (!this.svcSearch.termIsValid) {
      this.core.toast.showInformation("Para tener más éxito, te aconsejamos refinar el texto a buscar. Prueba agregando más caracteres!")
      return;
    }

    this.search.emit(this.svcSearch);
  }
}
