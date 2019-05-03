import { Component, OnInit } from '@angular/core';

import { CoreService } from "../services/core-service";
import { User } from "../model/user";

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.css']
})
export class UserPreferencesComponent implements OnInit {

  constructor(private core: CoreService) { }

  model: User;
  emailConfirmation: string = "";

  ngOnInit() {
    this.dataRefresh();
  }

  dataRefresh() {
    this.model = this.core.auth.userProfile.user;
  }

  save(){
    this.core.auth.updateUserPreferences(this.model, (err) => {
      if (!err) {
        this.core.toast.showSuccess("Tus preferencias han sido modificadas con éxito!");  
      }
      
      this.dataRefresh();
    })
  }
}
