import { Component, OnInit } from '@angular/core';

import { CoreService } from 'src/app/services/core-service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundErrorPageComponent implements OnInit {

  constructor(private core: CoreService) { }

  ngOnInit() {
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
