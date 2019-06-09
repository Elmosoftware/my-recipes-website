import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CoreService } from '../services/core-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private core: CoreService,
    private route: ActivatedRoute) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let referrer: string = this.route.snapshot.queryParamMap.get("referrer");
    this.core.auth.login(referrer);
  }
}
