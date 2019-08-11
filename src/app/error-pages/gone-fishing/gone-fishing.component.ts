import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/services/core-service';
import { ConnectivityStatus } from 'src/app/services/connectivity-service';
import { StaticAssets } from "../../static/static-assets";

@Component({
  selector: 'app-gone-fishing',
  templateUrl: './gone-fishing.component.html',
  styleUrls: ['./gone-fishing.component.css']
})
export class GoneFishingPageComponent implements OnInit {

  assets: any;

  constructor(private core: CoreService) { }

  ngOnInit() {
    this.assets = StaticAssets
    
    this.core.subscription.getConnectivityStatusChangeEmitter()
      .subscribe((status: ConnectivityStatus) => {
        if (status.isAllGood) {
          this.core.navigate.toHome();
        }
      })
  }
}
