import { Injectable } from '@angular/core';
import {Http,Headers} from "@angular/http";
import {AppService} from "../app.service";
import {WindowRefService} from "../helpers/window-ref.service";
import {J4careHttpService} from "../helpers/j4care-http.service";

@Injectable()
export class LoginService {

    constructor(
      private $http:J4careHttpService,
      public mainservice:AppService,
      private http: Http
    ) { }

    _config = function(params) {
        return '?' + this.mainservice.param(params);
    };

    checkUser(userName, password){
        let $this = this;
        let params = {
            userId: userName,
            passWd: password
        };
        this.http.get('../user/login' + this._config(params))
                .toPromise()
                .then(res => {
                    console.log('call checkUser');
                    let resjson = res.json();
                    if(resjson.status === "ok"){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/#studies";
                    }else{
                        $this.mainservice.setMessage( {
                            'title': '登录失败',
                            'text': '用户名或密码错误！',
                            'status': 'error'
                        });
                    }
                });
    //   return this.$http.get(
    //       '../user/validate' + this._config(params),
    //       {
    //         headers:  new Headers({'Accept': 'application/json'})
    //       }
    //   ).map(res => {console.log("res", res);WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/#studies";});
    }
}
