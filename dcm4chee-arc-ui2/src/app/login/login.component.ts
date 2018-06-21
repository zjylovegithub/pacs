import {Component, ViewContainerRef, HostListener, OnInit} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import * as _ from 'lodash';
import {AppService} from '../app.service';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {LoginService} from "./login.service";
import {HttpErrorHandler} from "../helpers/http-error-handler";
import {J4careHttpService} from "../helpers/j4care-http.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
    _ = _;

    userName;
    password;
    userNameMsg = [];
    passwordMsg = [];

    constructor(
      public $http:J4careHttpService,
      public cfpLoadingBar: SlimLoadingBarService,
      public mainservice: AppService,
      public viewContainerRef: ViewContainerRef ,
      public dialog: MdDialog,
      public config: MdDialogConfig,
      public service: LoginService,
      public httpErrorHandler:HttpErrorHandler
    ){}
    ngOnInit(){
    }

    ngAfterViewInit(){
        $(".ui-message").hide();
        $(".toggle-button").remove();
    }

    // 登录
    login(){
        console.log("call login");
        let loginFlag = false;
        if(this.userName == null || this.userName == ""){
            $("#div_userName .ui-message").show();
            loginFlag = true;
        }
        if(this.password == null || this.password == ""){
            $("#div_password .ui-message").show();
            loginFlag = true;
        }
        if(loginFlag){
            return;
        }
        //
        this.service.checkUser(this.userName, this.password);

    };

}
