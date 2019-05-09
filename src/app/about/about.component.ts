import { Component, OnInit } from '@angular/core';

import { CoreService } from '../services/core-service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private core: CoreService) { }

  ngOnInit() {
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
