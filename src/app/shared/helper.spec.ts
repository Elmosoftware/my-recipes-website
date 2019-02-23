import { TestBed, inject } from '@angular/core/testing';
import { Helper } from "./helper";

describe("Helper Class", () => {

    let h: Helper;

    beforeEach(() => {
        h = new Helper();
    });    

    describe("EstimatedFriendlyTime", () => {
        it("Must return '0 minutos' when value is 0", () => {
            expect(h.estimatedFriendlyTime(0)).toBe("0 minutos");
        });
        it("Must return '30 minutos' when value is 30", () => {
            expect(h.estimatedFriendlyTime(30)).toBe("30 minutos");
        });
        it("Must return '1 hora' when value is 60", () => {
            expect(h.estimatedFriendlyTime(60)).toBe("1 hora");
        });
        it("Must return '1 hora y 30 minutos' when value is 90", () => {
            expect(h.estimatedFriendlyTime(90)).toBe("1 hora y 30 minutos");
        });
        it("Must return '2 horas' when value is 120", () => {
            expect(h.estimatedFriendlyTime(120)).toBe("2 horas");
        });
        it("Must return '2 horas y 30 minutos' when value is 150", () => {
            expect(h.estimatedFriendlyTime(150)).toBe("2 horas y 30 minutos");
        });
        it("Must return '3 horas' when value is 180", () => {
            expect(h.estimatedFriendlyTime(180)).toBe("3 horas");
        });
    });
    describe("getFileExtension", () => {
        it("Must return '' when the file is ''", () => {
            expect(h.getFileExtension("")).toBe("");
        });
        it("Must return '' when the file is a null reference", () => {
            expect(h.getFileExtension(null)).toBe("");
        });
        it("Must return '' when the file is a undefined", () => {
            expect(h.getFileExtension(undefined)).toBe("");
        });
        it("Must return '' when the file has no extension", () => {
            expect(h.getFileExtension("filewithoutextension")).toBe("");
        });
        it("Must return the file extension on a normal file", () => {
            expect(h.getFileExtension("filewithextension.ext")).toBe(".ext");
        });
        it("Must return the last file extension on file with multiple dots in the name", () => {
            expect(h.getFileExtension("filewithextension.ext1.ext2.finalext")).toBe(".finalext");
        });
        it("Must return the file extension on a file without name", () => {
            expect(h.getFileExtension(".ext")).toBe(".ext");
        });
    });
});

