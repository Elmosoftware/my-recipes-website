import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from '../services/core-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private core: CoreService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.core.setPageTitle(this.route.snapshot.data);
  }

  ngAfterViewInit() {
    let referrer: string = this.route.snapshot.queryParamMap.get("referrer");
    this.core.auth.login(referrer);
  }
}
