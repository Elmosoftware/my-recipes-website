import { Component, OnInit } from '@angular/core';

import { CoreService } from "../services/core-service";
import { User } from "../model/user";

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.css']
})
export class UserPreferencesComponent implements OnInit {

  constructor(private core: CoreService) {
  }

  private originalEmail: string = "";

  model: User;
  emailConfirmation: string = "";

  get emailChanged(): boolean {
    let ret: boolean = false;

    if (this.model && this.model.email != this.originalEmail) {
      ret = true;
    }

    return ret;
  }

  ngOnInit() {
    this.dataRefresh();
  }

  dataRefresh() {
    this.model = Object.assign({}, this.core.auth.userProfile.user);
    this.originalEmail = this.model.email;
  }

  save() {
    this.core.auth.updateUserPreferences(this.model, (err) => {
      if (!err) {
        this.core.toast.showSuccess("Tus preferencias han sido modificadas con éxito!, los cambios se aplicaran a partir de tu proximo inicio de sesión.");
      }

      this.dataRefresh();
    })
  }
}
