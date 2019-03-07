import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaService } from "../services/media-service";
import { FileDropperComponent } from '../shared/file-dropper/file-dropper.component';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { RecipePicture } from "../model/recipe-picture";

@Component({
  selector: 'app-test-new-stuff',
  templateUrl: './test-new-stuff.component.html',
  styleUrls: ['./test-new-stuff.component.css']
})
export class TestNewStuffComponent implements OnInit {

  @ViewChild("fileDropper") fileDropper: FileDropperComponent

  uploadProgress: number = 0;
  uploadEnabled: boolean = true;
  autoResetEnabled: boolean = true;

  constructor(private svcMedia: MediaService) { }

  ngOnInit() {
    this.initRecipePictures();
  }

  switchEnabled() {
    this.uploadEnabled = !this.uploadEnabled;
  }

  switchAutoReset() {
    this.autoResetEnabled = !this.autoResetEnabled;
  }

  reset() {
    this.fileDropper.forceReset();
  }

  handleDrop($event: FileList) {
    console.log("DROPPED!!!");


    // try {

      this.svcMedia.uploadPictures($event, {}, (data) => {

        if (data.progress) {
          console.log(`Isdone:${data.progress.isDone}, %:${data.progress.percentage}, total:${data.progress.totalBytes}`);
          this.uploadProgress = data.progress.percentage
        }

      });
    // }
    // catch (error) {
    //   this.fileDropper.forceReset();
    //   throw error;
    // }
  }

  ///////////////////////////////////////////////////////////////////////////////////
  //DRAG DROP SAMPLE:

  // items: string[] = [
  //   'Episode I - The Phantom Menace',
  //   'Episode II - Attack of the Clones',
  //   'Episode III - Revenge of the Sith',
  //   'Episode IV - A New Hope',
  //   'Episode V - The Empire Strikes Back',
  //   'Episode VI - Return of the Jedi',
  //   'Episode VII - The Force Awakens',
  //   'Episode VIII - The Last Jedi'
  // ];

  items: RecipePicture[] = [];

  initRecipePictures() {
    // let r1 = new RecipePicture()
    // r1.pictureId = "1"
    // r1.isCover = false
    // r1.caption = "Picture 1 caption"
    
    // let r2 = new RecipePicture()
    // r2.pictureId = "2"
    // r2.isCover = true
    // r2.caption = "Picture 2 caption"
    
    // let r3 = new RecipePicture()
    // r3.pictureId = "3"
    // r3.isCover = false
    // r3.caption = "Picture 3 caption"

    // this.items.push(r1);
    // this.items.push(r2);
    // this.items.push(r3);
  }
  
  getRecipePictureURL(rp: RecipePicture) {

    let baseURL: string = "https://res.cloudinary.com/elmosoftware/image/upload/v1551181208/my-recipes-stage/user-files/Test-RecipePhoto-" //1.jpg
  // https://res.cloudinary.com/elmosoftware/image/upload/v1551181206/my-recipes-stage/user-files/Test-RecipePhoto-3.jpg
  // https://res.cloudinary.com/elmosoftware/image/upload/v1551181191/my-recipes-stage/user-files/Test-RecipePhoto-2.jpg
    let ret =`url("${baseURL}${rp.pictureId}.jpg")`
    
    return ret;
  }

  itemsAsString(){
    return JSON.stringify(this.items);
  }
  
  
  drop(event: CdkDragDrop<RecipePicture[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }

  selectedCoverChange(selectedCover: RecipePicture){
    this.items.forEach((item) => {
      item.isCover = Boolean(item.pictureId == selectedCover.pictureId);
    })
  }
/*
SAMPLEs:
=====================


*/

  favoriteSeason: string;
  seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi'
  ];

  dropSample(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

}

//RecipePictures Model:
// import { Entity } from "../model/entity";
// import { Recipe } from "../model/recipe";

// export class RecipePicture extends Entity {

//     constructor(){
//         super();
//         this.recipe = null;
//         this.publicId = null;
//         this.isCover = false;
//         this.caption = "";
//     }

//     recipe: Recipe;
//     publicId: string;
//     isCover: boolean;
//     caption: string;
// }

/*
let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
    publicId: { type: String, required: true },
    isCover: { type: Boolean, required: true },
    caption: { type: String, required: false }
}));
*/

