import { Component, OnInit } from '@angular/core';

import { AuthService } from "../services/auth-service";
import { ToasterHelperService } from "../services/toaster-helper-service";
import { User } from "../model/user";

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.css']
})
export class UserPreferencesComponent implements OnInit {

  constructor(private authSvc: AuthService, private toastSvc: ToasterHelperService) { }

  model: User;
  emailConfirmation: string = "";

  ngOnInit() {
    this.dataRefresh();
  }

  dataRefresh() {
    this.model = this.authSvc.userProfile.user;
  }

  save(){
    this.authSvc.updateUserPreferences(this.model, (err) => {
      if (!err) {
        this.toastSvc.showSuccess("Tus preferencias han sido modificadas con éxito!");  
      }
      
      this.dataRefresh();
    })
  }
}
