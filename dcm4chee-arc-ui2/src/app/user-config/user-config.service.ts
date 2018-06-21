import { Injectable } from '@angular/core';
import {Http} from "@angular/http";
import {WindowRefService} from "../helpers/window-ref.service";
import {DevicesService} from "../devices/devices.service";
import {J4careHttpService} from "../helpers/j4care-http.service";

@Injectable()
export class UserConfigService {

    constructor(
      private $http:J4careHttpService
    ) { }

    getUserList(){
      return this.$http.get(
          '../user/list'
      ).map(res => {
          let resjson;
          try{
            resjson = res.json();
          }catch (e){
            resjson = [];
          }
          return resjson;})
    }
}
