import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudytabService } from '../study-tab-panel/study-tab.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-study-tab-panel',
  templateUrl: './study-tab-panel.component.html'
  
})
export class StudyTabPanelComponent implements OnInit,OnDestroy {
  

  public subscription: Subscription;
  constructor(private tabservice: StudytabService) { }
  private tabindex:number=0;

  ngOnInit() {
    this.subscription = this.tabservice.getindex().subscribe(index => {
      console.log("callback tabindex",index);
      this.tabindex=index;
     })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleChange(e){
    this.tabindex = e.index;
  }

}
