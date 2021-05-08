import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { Boxplot } from 'src/app/core/interfaces/boxplot';

@Component({
  selector: 'app-boxplot',
  templateUrl: './boxplot.component.html',
  styleUrls: ['./boxplot.component.scss']
})
export class BoxplotComponent implements OnInit, OnChanges {
  _boxData: Boxplot[] = [];
  @ViewChild('boxplot')
  private boxplotContainer: ElementRef = {nativeElement:null};
  element:any;
  width:number = 0;
  height:number = 0;
  barWidth:number = 0;
  margin:any = {};
  totalWidth:number = 0;
  totalheight:number = 0;
  groupCounts:any = {};
  globalCounts:any = [];
  boxPlotData:any = [];
  colorScale:any;
  svg:any;
  g:any;
  yScale:any;
  xScale:any;
  @Input()
    set boxData(boxData: Boxplot[]) {
      this._boxData = boxData;
    }
    get boxData() {
      return this._boxData;
    }

  constructor() { }
  ngOnInit(){
    this.width = 900;
  this.height = 400;
  this.barWidth = 30;

  this.margin = {top: 20, right: 10, bottom: 20, left: 10};

  this.width = this.width - this.margin.left - this.margin.right,
  this.height = this.height - this.margin.top - this.margin.bottom;

  this.totalWidth =this. width + this.margin.left + this.margin.right;
  this.totalheight = this.height + this.margin.top + this.margin.bottom;


  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['boxData']['currentValue'].length > 0) {
      this._boxData = changes['boxData']['currentValue'];
      this.generateBoxData();
      this.drawBox();
    }

  }

  generateBoxData = () => {
    // Generate five 100 count, normal distributions with random means

    var meanGenerator = d3.randomUniform(10);
    for(let i=0; i<7; i++) {
      var randomMean = meanGenerator();
      var generator = d3.randomNormal(randomMean);
      var key = i.toString();
      this.groupCounts[key] = [];

      for(let j=0; j<100; j++) {
        var entry:any = generator();
        this.groupCounts[key].push(generator());
        this.globalCounts.push(entry);
      }
    }

    // Sort group counts so quantile methods work
    for(let key in this.groupCounts) {
      let groupCount = this.groupCounts[key];
      this.groupCounts[key] = groupCount.sort(this.sortNumber);
    }
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(Object.keys(this.groupCounts));
    for (var [key, groupCount] of Object.entries(this.groupCounts)) {

      let record:any = {};
      var localMin = d3.min(groupCount as any);
      var localMax = d3.max(groupCount as any);

      record["key"] = key;
      record["counts"] = groupCount;
      record["quartile"] = this.boxQuartiles(groupCount);
      record["whiskers"] = [localMin, localMax];
      record["color"] = this.colorScale(key);

      this.boxPlotData.push(record);
    }
  }
  drawBox(){
    this.element = this.boxplotContainer.nativeElement;
    d3.select(this.element).select('svg').remove()
    this.svg = d3.select(this.element).append("svg")
        .attr("width", this.totalWidth)
        .attr("height", this.totalheight)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.g = this.svg.append("g")
        .attr("transform", "translate(20,5)");
    // Compute an ordinal xScale for the keys in boxPlotData
    this.xScale = d3.scalePoint()
    .domain(Object.keys(this.groupCounts))
    .rangeRound([0, this.width])
    .padding([0.5] as any);

    // Compute a global y scale based on the global counts
    let min = d3.min(this.globalCounts);
    let max = d3.max(this.globalCounts);
    this.yScale = d3.scaleLinear()
      .domain([min, max] as any)
      .range([0, this.height] as any);



      // Move the left axis over 25 pixels, and the top axis over 35 pixels
      let axisG = this.svg.append("g").attr("transform", "translate(25,0)");
      // var axisTopG = this.svg.append("g").attr("transform", "translate(35,0)");
      var axisBottomG = this.svg.append("g").attr("transform", "translate(35,360)");

      // Setup the group the box plot elements will render in


        // Draw the box plot vertical lines
      var verticalLines = this.g.selectAll(".verticalLines")
      .data(this.boxPlotData)
      .enter()
      .append("line")
      .attr("x1", (datum:any) => this.xScale(datum.key) + this.barWidth/2)
      .attr("y1", (datum:any) => this.yScale(datum.whiskers[0]))
      .attr("x2", (datum:any) => this.xScale(datum.key) + this.barWidth/2)
      .attr("y2", (datum:any) => this.yScale(datum.whiskers[1]))
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("fill", "none");

      // Draw the boxes of the box plot, filled in white and on top of vertical lines
      var rects = this.g.selectAll("rect")
      .data(this.boxPlotData)
      .enter()
      .append("rect")
      .attr("width", this.barWidth)
      .attr("height", (datum:any) => {
          var quartiles = datum.quartile;
          var height = this.yScale(quartiles[2]) - this.yScale(quartiles[0]);
          return height;
        }
      )
      .attr("x", (datum:any) => this.xScale(datum.key))
      .attr("y", (datum:any) => this.yScale(datum.quartile[0]))
      .attr("fill", (datum:any) => datum.color)
      .attr("stroke", "#000")
      .attr("stroke-width", 1);

        // Now render all the horizontal lines at once - the whiskers and the median
      var horizontalLineConfigs = [
        // Top whisker
        {
          x1: (datum:any) => this.xScale(datum.key),
          y1: (datum:any) => this.yScale(datum.whiskers[0]) ,
          x2: (datum:any) => this.xScale(datum.key) + this.barWidth,
          y2: (datum:any) => this.yScale(datum.whiskers[0])
        },
        // Median line
        {
          x1: (datum:any) => this.xScale(datum.key),
          y1: (datum:any) => this.yScale(datum.quartile[1]),
          x2: (datum:any) => this.xScale(datum.key) + this.barWidth,
          y2: (datum:any) => this.yScale(datum.quartile[1])
        },
        // Bottom whisker
        {
          x1: (datum:any) => this.xScale(datum.key),
          y1: (datum:any) => this.yScale(datum.whiskers[1]),
          x2: (datum:any) => this.xScale(datum.key) + this.barWidth,
          y2: (datum:any) => this.yScale(datum.whiskers[1])
        }
      ];

      for(let i=0; i < horizontalLineConfigs.length; i++) {

        let lineConfig = horizontalLineConfigs[i];

        // Draw the whiskers at the min for this series
          this.g.selectAll(".whiskers")
            .data(this.boxPlotData)
            .enter()
            .append("line")
            .attr("x1", lineConfig.x1)
            .attr("y1", lineConfig.y1)
            .attr("x2", lineConfig.x2)
            .attr("y2", lineConfig.y2)
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");
        }

        // Setup a scale on the left
        let axisLeft = d3.axisLeft(this.yScale);
        axisG.append("g")
          .call(axisLeft);

        // Setup a series axis on the top
        // let axisTop = d3.axisTop(this.xScale);
        // axisTopG.append("g")
        //   .call(axisTop);


          let axisBottom = d3.axisBottom(this.xScale);
          axisBottomG.append("g")
            .call(axisBottom);

  }

  sortNumber = (a:number,b:number) => {
    return a - b;
  }
  boxQuartiles = (d:any) => [
    	d3.quantile(d, .25),
    	d3.quantile(d, .5),
    	d3.quantile(d, .75)
  	];

}
