import { NgZone } from "@angular/core";
import * as moment from "moment";
import "moment/locale/es";

declare var $: any; //jQuery

export class Helper {

    constructor() {
        moment.locale("es");
    }

    /**
     * Return the specified time in a user friendly format.
     * @example If the param timeInMinutes has the value 90. Thi function wil return: "1 hora y 30 minutos".
     * @param timeInMinutes Time in minutes
     */
    estimatedFriendlyTime(timeInMinutes: number): string {

        let hours: number = Math.trunc(timeInMinutes / 60);
        let mins: number = (hours > 0) ? timeInMinutes - (hours * 60) : timeInMinutes;
        let ret: string = "";

        if (hours > 0) {
            ret += `${hours} hora`;
        }

        if (hours > 1) {
            ret += "s";
        }

        if (hours > 0 && mins > 0) {
            ret += " y ";
        }

        if (mins > 0 || (hours + mins == 0)) {
            ret += `${mins} minutos`
        }

        return ret;
    }

    /**
     * This is a wrapper for "moment().fromNow()" method.
     * It returns a human friendly string indicating how much time past or is left between the specified date and the current one.
     * Sample Spanish locale returns are: "hace 6 horas" or "hace un año".
     * @param date Comparison date.
     */
    friendlyTimeFromNow(date: Date): string{
        return moment(date).fromNow();
    }

    /**
     * This is a wrapper for "moment().calendar()" method.
     * It return a string with the relative time that pass between current date and the comparison date. 
     * Sample Spanish locale return are: "El viernes pasado a las 8:45" or "Hoy a las 12:00".
     * @param date Comparison date.
     */
    friendlyCalendarTime(date: Date): string{
        return moment(date).calendar();
    }

    /**
     * 
     * @param date Initial date, (the one which we want to add or substract days). 
     * This is an integer value that can be positive or negative. If the value is positive, this method will return a new date in a relative future to the initial date.
     * If otherwise the value is negative the resulting date will be in a past relative to the initial date.
     * @param daysToAdd Amount of days to add or substract from the inital date.
     */
    addDays(date: Date, daysToAdd: number): Date{
        let ret: Date;

        if(daysToAdd > 0){
            ret = moment(date).add(daysToAdd, "d").toDate();
        }
        else {
            ret = moment(date).subtract(Math.abs(daysToAdd), "d").toDate();
        }

        return ret;
    }

    /**
     * Sadly, sometimes tooltips are not working as expected and still visible when navigatng to a different path or removing 
     * from the DOM the element that is holding the tooltip. So, the workaround is to remove them manually.
     * 
     * When you call this method, any tooltip displayed will disappear until next hover or click over the element.
     * @param zone Angular zone where to run the  invocation.
     */
    removeTooltips(zone: NgZone) {
        zone.runOutsideAngular(() => {
            $("div[role=tooltip]").remove();
        })
    }

    /**
     * Returns a shortened version of the supplied text.
     * @param text Test  to be shortened.
     * @param startPosition Positions of first character to show, default will be the beginning.
     * @param maxLength Total numbers of characters to show, default will be 150.
     * @param posfix the posfix or string terminator to add at the end. Default will be "..." html entity "&hellip;".
     */
    getShortText(text: string, startPosition: number = 0, maxLength: number = 150, posfix: string = "&hellip;") {
        return (text && text.length > maxLength) ? text.substr(startPosition, maxLength - 1) + '&hellip;' : text;
    }

    /**
     * This method replace standard line breaks in textm ("\n") with HTML line breaks, ("<br />").
     * @param text Text in which we are going to replace the line breaks.
     */
    lineBreaksToHTML(text: string): string {
        let ret: string = text;

        if (text) {
            ret =  text.replace(/\n/g, `<br />`);
        }

        return ret;
    }

    /**
     * Returns a random integer between the specified interval.
     * @param {number} min Minimum random integer to include in the results.
     * @param {number} max Maximum random integer to include in the results.
     * @author Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     */
    getRandomNumberFromInterval(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * return the file name extension
     * @param fileName File name
     */
    getFileExtension(fileName: string) :string {
        const sep: string = ".";
        let ret: string = "";

        if (fileName && fileName.indexOf(sep) != -1) {
            ret = sep + fileName.split(sep).pop();
        }

        return ret.toLowerCase();
    }

    /**
     * Returns and object with the actual screen size.
     */
    getScreenSize(): any{

        let ret = { height: 0, width: 0}

        if (screen && screen.height && screen.width) {
            ret.height = screen.height;
            ret.width = screen.width;
        }

        return ret;
    }
}