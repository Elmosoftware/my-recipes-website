import { TestBed, inject } from '@angular/core/testing';
import { APIResponseParser, APIResponseProgress, EMPTY_RESPONSE } from "./api-response-parser";


describe("APIResponseParser Class", () => {
    describe("Constructor", () => {
        it("Parsing a response of error = null and payload = []", () => {

            let parser = new APIResponseParser(EMPTY_RESPONSE)
            
            expect(parser.error).toEqual(null);
            expect(Array.isArray(parser.entities)).toEqual(true);
            expect(parser.entities.length).toEqual(0);
            expect(parser.headers).toEqual({});
            expect(parser.progress).toEqual(null);
        });
        it("Parsing a response of error = null and payload = [] with progress", () => {

            let parser = new APIResponseParser(EMPTY_RESPONSE, true, new APIResponseProgress(true,100,99999))
            
            expect(parser.error).toEqual(null);
            expect(Array.isArray(parser.entities)).toEqual(true);
            expect(parser.entities.length).toEqual(0);
            expect(parser.headers).toEqual({});
            expect(parser.progress.isDone).toEqual(true);
            expect(parser.progress.percentage).toEqual(100);
            expect(parser.progress.totalBytes).toEqual(99999);
        });
        it("Exception thrown. When we received an error from the API.", () => {
            var b = 
            {
                error: { 
                    message: "-The Object Id '111' is not a valid object Id.", 
                    stack: "at MyService.getErrors:21:19)"
                },
                payload: []
            }

            expect(() => { new APIResponseParser(b) })
                .toThrow({ message: "-The Object Id '111' is not a valid object Id.", stack: "at MyService.getErrors:21:19)" })
        });
        it("No Exception thrown when we received an error from the API but the parameter \"throwAPIErrors\" is set to \"false\".", () => {

            var b = 
            {
                error: { 
                    message: "-The Object Id '111' is not a valid object Id.", 
                    stack: "at MyService.getErrors:21:19)"
                },
                payload: []
            }

            expect((new APIResponseParser(b, false)).error.message).toEqual("-The Object Id '111' is not a valid object Id.");
        });
    });
});

