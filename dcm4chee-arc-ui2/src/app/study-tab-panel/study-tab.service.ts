import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';


@Injectable()
export class StudytabService {
  
  private index = new Subject<number>();

  constructor() { }

  setindex(tabindex : number) :void {
    console.log("set tabindex",tabindex);
    this.index.next(tabindex);
  }

  clearindex() {
   console.log("clear tabindex");
   this.index.next();
  }

  getindex():Observable<number>{
    console.log("get tabindex");
    return this.index.asObservable();
  }

}
