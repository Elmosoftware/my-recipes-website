import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from "../services/core-service";

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(public core: CoreService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.core.setPageTitle(this.route.snapshot.data);
    this.core.auth.handleAuthentication();
  }

}
