import { Entity } from "../model/entity";
import { Recipe } from "../model/recipe";

export class RecipePicture extends Entity {

    constructor() {
        super();
        this.recipe = null;
        this.pictureId = null;
        this.isCover = false;
        this.caption = "";
        this.transformationURL = "";
        this.attributes = null;
    }

    recipe: Recipe;
    pictureId: PictureId;
    isCover: boolean;
    caption: string;
    transformationURL: string;
    attributes: PictureAttributes;
}

export class PictureId {

    constructor(publicId: string, cloudName: string) {
        this.publicId = publicId;
        this.cloudName = cloudName;
    }

    publicId: string;
    cloudName: string;
}

export class PictureAttributes {

    constructor() {
        this.width = 0;
        this.height = 0;
    }

    width: number;
    height: number;
}
