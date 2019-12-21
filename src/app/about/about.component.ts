import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from '../services/core-service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private core: CoreService, 
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.core.setPageTitle(this.route.snapshot.data);
  }

  goToHome() {
    this.core.navigate.toHome();
  }
}
