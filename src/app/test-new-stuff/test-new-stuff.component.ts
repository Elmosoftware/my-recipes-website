import { Component, OnInit, AfterViewInit } from '@angular/core';

import { CoreService } from "../services/core-service";

@Component({
  selector: 'app-test-new-stuff',
  templateUrl: './test-new-stuff.component.html',
  styleUrls: ['./test-new-stuff.component.css']
})
export class TestNewStuffComponent implements OnInit {

  constructor(private core: CoreService) { }
 
  message: string;

  ngOnInit() {
    this.message = "Nec an eirmod instructior, no velit harum veritus mei. Ut salutandi assueverit appellantur sed. Saepe maiorum forensibus ne sit."
  }

  ngAfterViewInit() {
  }

  showInfo(){
    this.core.toast.showInformation(this.message, "Title of Info toast")
  }
  showWarn(){
    this.core.toast.showWarning(this.message, "Title of Warn toast")
  }
  showErr(){
    this.core.toast.showError(this.message, "Title of Error toast")
  }
  showSuc(){
    this.core.toast.showSuccess(this.message, "Title of Success toast")
  }


  
}