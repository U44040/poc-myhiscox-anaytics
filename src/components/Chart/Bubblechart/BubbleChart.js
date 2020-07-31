import React, { Component } from 'react';
import * as d3 from 'd3';

class BubbleChart extends Component {

    constructor(props) {
        super();

        const margin = { top: 10, right: 100, bottom: 30, left: 50 };
        const width = 700 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        this.svg = null;
        this.scatter = null;
        this.xAxis = null;
        this.yAxis = null;
        this.tooltip = null;
        this.zeroLine = null;

        this.state = {
            margin,
            width,
            height,
        }
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.updateChart()
    }

    xScale = () => (d3.scaleLinear().domain([0, 60]).range([0, this.state.width]));
    yScale = () => (d3.scaleLinear().domain([-100, 100]).range([this.state.height, 0]));
    zScale = () => (d3.scaleLinear().domain([0, 1500]).range([0, 20]));
    fillColor = (d3.scaleOrdinal().domain(['Draft', 'Policy Holder Step', 'Start Date Step', 'Pending Info', 'Binding Request Pending']).range(d3.schemeSet2));
    strokeColor = (d3.scaleOrdinal().domain([true, false]).range(['#039453', '#bf003d']));

    getScales = () => {
        return {
            xScale: this.xScale(),
            yScale: this.yScale(),
            zScale: this.zScale(),
        }
    }

    createChart = () => {

        const scales = this.getScales();
        this.svg = d3.select(this.svgEl).append("g").attr("transform", "translate(" + this.state.margin.left + "," + this.state.margin.top + ")");

        // Axis
        this.xAxis = this.svg.append("g").attr("transform", "translate(0," + this.state.height + ")").call(d3.axisBottom(scales.xScale));
        this.yAxis = this.svg.append("g").call(d3.axisLeft(scales.yScale).tickFormat((d, i) => d + "%"));

        let clip = this.svg.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", this.state.width)
            .attr("height", this.state.height)
            .attr("x", 0)
            .attr("y", 0);

        let zoom = d3.zoom()
            .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([[0, 0], [this.state.width, this.state.height]])
            .on("zoom", () => this.updateChartZoom(scales.xScale, this.xAxis, scales.yScale, this.yAxis));

        // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
        this.svg.append("rect")
            .attr("width", this.state.width)
            .attr("height", this.state.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            //.attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')')
            .call(zoom);

        // Plot
        this.scatter = this.svg.append('g').attr("class", "data-bubble").attr("clip-path", "url(#clip)");
        
        //this.createLegend(svg);
        this.createTooltip();
        this.updateChart();
    }

    createLegend = (svg) => {
        svg
            .selectAll("myLegend")
            .data(this.props.data)
            .enter()
            .append('g')
            .append("text")
                .attr('x', function(d,i){ return 30 + i*60})
                .attr('y', 30)
                .text(function(d) { return d.isClean; })
                .style("fill", (d) => this.fillColor(d.colour))
                .style("font-size", 10)
            .on("click", function(d){
                // is the element currently visible ?
                let currentOpacity = d3.selectAll("." + d.name).style("opacity")
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0:1);
            });
    }

    createTooltip = () => {
        //https://bl.ocks.org/Jverma/2385cb7794d18c51e3ab
        this.tooltip = d3.select('body')
            .append("div")
            .attr("id","tooltip-bubble")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("position", "absolute")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white");
    }

    updateChart = () => {

        let scatter = this.scatter;
        let scales = this.getScales();

        // Add the points
        scatter = scatter
        // First we need to enter in a group
        .selectAll("g")
        .data(this.props.data)
        .enter()
        .append('g')
        .style("fill", (d) => this.fillColor(d.state) )
        .attr("class", (d) => d.name )
        // Second we need to enter in the 'values' part of this group
        .selectAll("circle")
        .data(d => d.projects)
        .enter()
        .append("circle")
        .attr("cx", (d) => scales.xScale(d.elapsedTime))
        .attr("cy", (d) => scales.yScale(d.fullPercentAverage))
        .attr("r", (d) => scales.zScale(d.totalRate))
        .style("opacity", "0.9")
        .attr("stroke", (d) => this.strokeColor(d.isClean))
        .style("stroke-width", "0.75px")
        .on("mouseover", this.showTooltip)
        .on("mousemove", this.showTooltip)
        .on("mouseout", this.hideTooltip)







        /*scatter = scatter
            .selectAll("circle")
            .data(this.props.data);

        scatter.enter()
            .append("circle")
            .merge(scatter)
            .on("mouseover", d => {
                this.tooltip.transition()
                    .duration(100)
                    .style('opacity', 1)
                    .text(d.isClean)
                    .style('left', d3.event.pageX + 'px')
                    .style('top', d3.event.pageY + 'px');
            })
            .on("mouseout", () => {
                this.tooltip.transition()
                  .duration(400)
                  .style('opacity', 0);
              })
            .transition()
            .duration(1000)
            .attr("cx", (d) => scales.xScale(d.x))
            .attr("cy", (d) => scales.yScale(d.y))
            .attr("r", (d) => scales.zScale(d.z))
            .style("fill", (d) => this.fillColor(d.colour))
            .style("opacity", "0.9")
            .attr("stroke", (d) => this.strokeColor(d.isClean))
            .style("stroke-width", "0.5px");

        scatter.exit().remove();*/
    }

    showTooltip = (d) => {

        let html = '';
        html += `
            <p><strong>Clean:</strong> ${ d.isClean ? 'Yes' : 'No' }</p>
            <p><strong>Brokerage:</strong> ${ d.user.brokerage.name }</p>
            <p><strong>Network:</strong> ${ d.user.brokerage.network.name }</p>
            <p><strong>Products:</strong></p>
            <ul>
        `;


        for (let productVariant of d.productVariants) {
            html += `<li>${productVariant.name}</li>`
        }

        html += '</ul>';

        this.tooltip
            .html(html)
            .transition()
            .duration(100)
            .style('opacity', 1)
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY + 20) + 'px');
    }

    hideTooltip = () => {
        this.tooltip.transition()
          .duration(1)
          .style('opacity', 0);
    }

    updateChartZoom = (xScale, xAxis, yScale, yAxis) => {
        // recover the new scale
        var newX = d3.event.transform.rescaleX(xScale);
        var newY = d3.event.transform.rescaleY(yScale);

        this.xScale = () => newX;
        this.yScale = () => newY;

        // update axes with these new boundaries
        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY).tickFormat((d, i) => d + "%"));

        // update circle position
        this.scatter
            .selectAll("circle")
            .attr('cx', (d) => newX(d.elapsedTime))
            .attr('cy', (d) => newY(d.fullPercentAverage));
    }

    render() {
        const width = this.state.width + this.state.margin.left + this.state.margin.right;
        const height = this.state.height + this.state.margin.top + this.state.margin.bottom;

        return (
            <div ref={el => this.divEl = el}>
                <svg ref={el => this.svgEl = el}
                //width={width}
                //height={height}
                viewBox={"0 0 " + width + " " + height} 
                preserveAspectRatio="xMinYMin meet"
                ></svg>
            </div>
        );
    }

}

export default BubbleChart;