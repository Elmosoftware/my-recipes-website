import { Component, OnInit } from '@angular/core';

import { CoreService } from "../services/core-service";

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(public core: CoreService) { }

  ngOnInit() {
    this.core.auth.handleAuthentication();
  }

}
