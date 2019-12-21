import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from "../../services/core-service";
import { ConnectivityStatus } from "../../services/connectivity-service";

@Component({
  selector: 'app-network-error',
  templateUrl: './network-error.component.html',
  styleUrls: ['./network-error.component.css']
})
export class NetworkErrorPageComponent implements OnInit {

  checkInProgress: boolean

  constructor(private core: CoreService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.core.setPageTitle(this.route.snapshot.data);
    this.checkInProgress = false;

    this.core.subscription.getConnectivityStatusChangeEmitter()
      .subscribe((status: ConnectivityStatus) => {
        if (status.isAllGood) {
          this.core.navigate.toHome();
        }
        this.checkInProgress = false;
      })
  }

  checkConnectivity(){
    this.checkInProgress = true;
    this.core.connectivity.updateStatus();
  }
}
