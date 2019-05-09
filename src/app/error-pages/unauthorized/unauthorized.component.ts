import { Component, OnInit } from '@angular/core';

import { CoreService } from 'src/app/services/core-service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedErrorPageComponent implements OnInit {

  constructor(private core: CoreService) { }

  ngOnInit() {
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
