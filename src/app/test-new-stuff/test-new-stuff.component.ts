import { Component, OnInit, AfterViewInit } from '@angular/core';

import { CoreService } from "../services/core-service";

@Component({
  selector: 'app-test-new-stuff',
  templateUrl: './test-new-stuff.component.html',
  styleUrls: ['./test-new-stuff.component.css']
})
export class TestNewStuffComponent implements OnInit {

  constructor(private core: CoreService) { }
 

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
  
}