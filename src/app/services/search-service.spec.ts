import { SEARCH_TYPE } from "./search-type";
import { SearchServiceFactory } from "./search-service-factory";
import { SearchServiceInterface } from "./search-service";
import { Recipe } from '../model/recipe';

describe("SearchService Class", () => {

  let ss: SearchServiceInterface<Recipe>; 

  beforeEach(() => {
    let sf = new SearchServiceFactory(null);
    ss = sf.getService(SEARCH_TYPE.Text);
  });

  describe("term", () => {
    it(`When "term" is an empty string, "words" must be an empty array.`, () => {
      expect(Array.isArray(ss.words)).toBe(true);
      expect(ss.words.length).toEqual(0);
    });
    it(`When "term" is "first", "words" must be ["first"].`, () => {
      ss.term = "first";
      expect(ss.words).toEqual(["first"]);
    });
    it(`When "term" is "first second", "words" must be ["first", "second"].`, () => {
      ss.term = "first second";
      expect(ss.words).toEqual(["first", "second"]);
    });
    it(`When "term" is ""first second"", "words" must be ["first second"].`, () => {
      ss.term = "\"first second\"";
      expect(ss.words).toEqual(["first second"]);
    });
    it(`When "term" is ""first second", "words" must be ["first second"].`, () => {
      ss.term = "\"first second";
      expect(ss.words).toEqual(["first second"]);
    });
    it(`When "term" is "first second"", "words" must be ["first second"].`, () => {
      ss.term = "first second\"";
      expect(ss.words).toEqual(["first second"]);
    });    
  });
  
});
