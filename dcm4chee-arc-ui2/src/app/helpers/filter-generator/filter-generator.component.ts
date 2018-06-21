import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {j4care} from "../j4care.service";

@Component({
  selector: 'filter-generator',
  templateUrl: './filter-generator.component.html'
})
export class FilterGeneratorComponent implements OnInit {

    @Input() schema;
    @Input() model;
    @Output() submit  = new EventEmitter();
    @Output() onChange  = new EventEmitter();
    filterForm;
    constructor() { }

    ngOnInit() {
    }
    submitEmit(id){
        this.model = j4care.clearEmptyObject(this.model);
      if(id){
        this.submit.emit({model:this.model,id:id});
      }else{
        this.submit.emit(this.model);
      }
    }
    filterChange(test){
        console.log("change teest",test);
        console.log("change",this.model);
        this.onChange.emit(this.model);
    }
}
