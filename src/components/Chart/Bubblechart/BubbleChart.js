import React, { Component } from 'react';
import * as d3 from 'd3';

class BubbleChart extends Component {

    constructor(props) {
        super();

        const margin = { top: 10, right: 20, bottom: 30, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        this.scatter = null;
        this.xAxis = null;
        this.yAxis = null;
        this.tooltip = null;

        this.state = {
            margin,
            width,
            height,
            data: this.getData()
        }
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.updateChart()
    }

    getData = () => {
        let numItems = 20 + Math.floor(20 * Math.random())
        let data = [];
        const state = ['State1', 'State2'];
        for (let i = 0; i < numItems; i++) {
            data.push({
                x: Math.random(),
                y: Math.random(),
                z: Math.random(),
                colour: state[i % 2],
                isClean: (i % 2 == 0),
            })
        }
        return data
    }

    handleClick = () => {
        this.setState({
            data: this.getData()
        })
    }

    xScale = () => (d3.scaleLinear().domain([0, 1.5]).range([0, this.state.width]));
    yScale = () => (d3.scaleLinear().domain([0, 1.5]).range([this.state.height, 0]));
    zScale = () => (d3.scaleLinear().domain([0, 1]).range([4, 20]));
    fillColor = (d3.scaleOrdinal().domain(['State1', 'State2']).range(d3.schemeSet2));
    strokeColor = (d3.scaleOrdinal().domain([true, false]).range(['#f0f', '#ff0']));

    getScales = () => {
        return {
            xScale: this.xScale(),
            yScale: this.yScale(),
            zScale: this.zScale(),
        }
    }

    createChart = () => {
        const scales = this.getScales();

        let svg = d3.select(this.svgEl).append("g").attr("transform", "translate(" + this.state.margin.left + "," + this.state.margin.top + ")");

        // Axis
        this.xAxis = svg.append("g").attr("transform", "translate(0," + this.state.height + ")").call(d3.axisBottom(scales.xScale));
        this.yAxis = svg.append("g").call(d3.axisLeft(scales.yScale));

        let clip = svg.append("defs").append("SVG:clipPath")
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
        svg.append("rect")
            .attr("width", this.state.width)
            .attr("height", this.state.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            //.attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')')
            .call(zoom);

        // Plot
        this.scatter = svg.append('g').attr("class", "data-bubble").attr("clip-path", "url(#clip)");

        this.createTooltip();
        this.updateChart();
    }

    createTooltip = () => {
        this.tooltip = d3.select(this.divEl)
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

    showTooltip = function (d) {
        d3.select('#tooltip-bubble')
            .transition()
            .duration(200);
        let tooltip = d3.select('#tooltip-bubble')
            .style("opacity", 1)
            .html("isClean: " + d.isClean)
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            ;
    }

    moveTooltip = function (d) {
        d3.select('#tooltip-bubble')
            .style("left",  d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
    }

    hideTooltip = function (d) {
        d3.select('#tooltip-bubble')
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    updateChart = () => {

        let scatter = this.scatter;
        let scales = this.getScales();

        let component = this;

        scatter = scatter
            .selectAll("circle")
            .data(this.state.data);

        scatter.enter()
            .append("circle")
            .merge(scatter)
            .on("mouseover", d => {
                this.tooltip
                .transition()
                .duration(100)
                .style('opacity', 1)
                .text(d.isClean)
                .style('left', `${d3.mouse(d3.event.target)[0] + 2}px`)
                .style('top', `${d3.mouse(d3.event.target)[1] - 18}px`);
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
            .style("stroke-width", "2px")
            ;

        scatter.exit().remove();
    }

    updateChartZoom = (xScale, xAxis, yScale, yAxis) => {
        // recover the new scale
        var newX = d3.event.transform.rescaleX(xScale);
        var newY = d3.event.transform.rescaleY(yScale);

        this.xScale = () => newX;
        this.yScale = () => newY;

        // update axes with these new boundaries
        xAxis.call(d3.axisBottom(newX))
        yAxis.call(d3.axisLeft(newY))

        // update circle position
        this.scatter
            .selectAll("circle")
            .attr('cx', (d) => newX(d.x))
            .attr('cy', (d) => newY(d.y));
    }

    render() {
        const width = this.state.width + this.state.margin.left + this.state.margin.right;
        const height = this.state.height + this.state.margin.top + this.state.margin.bottom;

        return (
            <div ref={el => this.divEl = el}>
                <svg viewBox={"0 0 " + width + " " + height} ref={el => this.svgEl = el}></svg>
                <button className="btn btn-primary" onClick={this.handleClick}>Actualizar</button>
            </div>
        );
    }

}

export default BubbleChart;