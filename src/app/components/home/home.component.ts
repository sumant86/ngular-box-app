import { Component, OnInit } from '@angular/core';
import { AppdataService } from "./../../core/services/appdata.service";
import { Boxplot } from "./../../core/interfaces/boxplot"
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  boxData :Boxplot[] = [];
  constructor(public appdataService: AppdataService) { }

  ngOnInit(): void {
    this.initBoxPlotData();
  }
  initBoxPlotData(){
    this.appdataService.getBoxData().subscribe((response) =>{
      this.boxData = response as Boxplot[];
    })
  }

}
