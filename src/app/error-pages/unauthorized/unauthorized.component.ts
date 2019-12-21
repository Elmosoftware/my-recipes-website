import { Component, OnInit } from '@angular/core';

import { CoreService } from 'src/app/services/core-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedErrorPageComponent implements OnInit {

  constructor(private core: CoreService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.core.setPageTitle(this.route.snapshot.data);
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
