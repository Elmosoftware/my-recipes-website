import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  /**
   * List of "CarouselItems" to be displayed.
   */
  @Input() items: CarouselItem[];
  /**
   * This value allow to specify a fixed height for the carousel as a percentage of the viewport size.
   * This value could be a integer number between 20 and 100. Any other value will be ignored causing 
   * the carousel to not have a fixed height.
   */
  @Input() fixedHeight: number;
  /**
   * Any posible unit and value for the image border radius.
   * e.g: "20px", "2em", etc.
   */
  @Input() borderRadius: string;

  imageStyle: {};

  constructor() { }

  ngOnInit() {
    this.parseImageStyle();
    
  }

  parseImageStyle() :void{
    this.imageStyle = {};

    if(this.fixedHeight && !isNaN(parseInt(this.fixedHeight.toString()))){
      if(this.fixedHeight >= 20 && this.fixedHeight <= 100){
        this.imageStyle["height"] = `calc(100vh * ${this.fixedHeight/100})`
      } 
    }

    if (this.borderRadius) {
      this.imageStyle["border-radius"] = this.borderRadius;
    }
  }
}

export class CarouselItem {

  constructor() {
  }

  imageSrc: string;
  authorName: string;
  authorURL: string;
  captionImageSrc: string;
  captionText: string;
}

