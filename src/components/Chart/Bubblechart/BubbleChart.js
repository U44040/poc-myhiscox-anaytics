import React, { Component } from 'react';
import * as d3 from 'd3';
import * as StringSanitizer from 'string-sanitizer';
import './BubbleChart.scss';

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
        this.strokeWidth = '0.75px';

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

    xScale = () => {
        const maximums = [];
        for (let state of this.props.data) {
            maximums.push(d3.max(state.projects.map((d) => d.elapsedTime)));
        }
        return d3.scaleLinear().domain([0, d3.max(maximums)+1]).range([0, this.state.width])
    };
    
    yScale = () => (d3.scaleLinear().domain([-100, 100]).range([this.state.height, 0]));
    zScale = () => {
        const maximums = [];
        for (let state of this.props.data) {
            maximums.push(d3.max(state.projects.map((d) => d.totalRate)));
        }
        return d3.scaleLinear().domain([0, d3.max(maximums)]).range([0, 20]);
    }

    fillColor = (d3.scaleOrdinal().domain(['Draft', 'Policy Holder Step', 'Start Date Step', 'Pending Info', 'Binding Request Pending', 'Issued']).range(d3.schemeSet2));
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

        // Labels
        // Y-Label
        d3.select(this.svgEl).append("text")
            .attr("class", "legend-bubble")
            .attr('x', () => - 170)
            .attr('y', (d, i) => 10)
            .text((d, i) => "% de ventas respecto media")
            .style("font-size", 5)
            .style("font-weight", "bold")
            .style("transform", "rotate(-90deg)");
        // X-Label
            d3.select(this.svgEl).append("text")
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width)
            .attr('y', (d, i) => this.state.height+35)
            .text((d, i) => "Tiempo (minutos)")
            .style("font-size", 5)
            .style("font-weight", "bold");

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

        this.createLegend();
        this.createTooltip();
        this.updateChart();
    }

    createLegend = () => {
        let legendGroup = this.svg
            .selectAll(".legend")
            .data(this.props.data)
            .enter()
            .append('g')
            .on("click", function (d) {
                // is the element currently visible ?
                let isVisible = d3.selectAll("." + StringSanitizer.sanitize(d.state)).style("opacity") == 1;
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + StringSanitizer.sanitize(d.state)).transition().style("opacity", isVisible ? 0 : 1);
                d3.select(this).style("opacity", isVisible  ? 0.5 : 1).style("text-decoration", isVisible ? "line-through" : "inherit");
            });

        legendGroup
            .append("text")
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 10)
            .attr('y', (d, i) => this.state.height - 10 - (10 * i))
            .text((d, i) => d.state)
            .style("fill", (d) => this.fillColor(d.state))
            .style("font-size", 5)
            .style("font-weight", "bold");

        legendGroup
            .append("rect")
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 3 )
            .attr('y', (d, i) => this.state.height - 15 - (10 * i))
            .attr('width', 5)
            .attr('height', 5)
            .style("fill", (d) => this.fillColor(d.state));
    }

    createTooltip = () => {
        this.tooltip = d3.select('body')
            .append("div")
            .attr("id", "tooltip-bubble")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("position", "absolute")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white");
    }

    updateChart = () => {

        let component = this;
        let scatter = this.scatter;
        let scales = this.getScales();

        // Axis
        this.xAxis.call(d3.axisBottom(scales.xScale));
        //this.yAxis.call(d3.axisLeft(scales.yScale).tickFormat((d, i) => d + "%"));

        // Add the points
        scatter = scatter
            .selectAll("g")
            .data(this.props.data);

        let scatterProject = scatter
            .enter()
            // First we need to enter in a group
            .append('g')
            .merge(scatter)
            .style("fill", (d) => this.fillColor(d.state))
            .style("stroke-width", this.strokeWidth)
            .attr("class", (d) => StringSanitizer.sanitize(d.state))
            // Second we need to enter in the 'values' part of this group
            .selectAll("circle")
            .data(d => d.projects);

        scatterProject
            .enter()
            .append("circle")
            .merge(scatterProject)
            .on("click", function (d) { component.showTooltipAlways(d, this) })
            .on("mouseover", function (d) { component.showTooltip(d, this) })
            //.on("mousemove", function(d){ component.showTooltip(d, this)})
            .on("mouseout", function (d) { component.hideTooltip(d, this) })
            .on("contextmenu", function (d) { component.hideProject(d, this) })
            .attr("cx", (d) => scales.xScale(d.elapsedTime))
            .attr("cy", (d) => scales.yScale(d.fullPercentAverage))
            .attr("r", (d) => scales.zScale(d.totalRate))
            .style("opacity", "0.9")
            .attr("stroke", (d) => this.strokeColor(d.isClean));

        scatterProject.exit().remove();



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

    showTooltip = (d, element) => {

        if (this.tooltip.attr('fixed') == "true") {
            return;
        }

        let html = '';
        html += `
            <p><Strong>Reference:</strong> ${ d.reference}</p>
            <p><strong>Brokerage:</strong> ${ d.user.brokerage.name}</p>
            <p><strong>Network:</strong> ${ d.user.brokerage.network.name}</p>
            <p><strong>Clean:</strong> ${ d.isClean ? 'Yes' : 'No'}</p>
            <p><strong>Products:</strong></p>
            <ul>
        `;


        for (let productVariant of d.productVariants) {
            html += `<li>${productVariant.name} - (${productVariant.totalRate}€) [${Math.round(productVariant.percentAverage)}%]</li>`
        }

        html += '</ul>';

        html += `<p><strong>Total rate:</strong> ${d.totalRate}€ [${Math.round(d.fullPercentAverage)}%]</p>`;

        this.tooltip
            .html(html)
            .transition()
            .duration(300)
            .style('opacity', 1)
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY + 20) + 'px')
            .style('z-index', 1000);

        this.scatter.selectAll("circle").transition().duration(300).style('stroke-width', this.strokeWidth);
        d3.select(element).transition().duration(300).style('stroke-width', '2px');
    }

    showTooltipAlways = (d, element) => {
        if (d3.select(element).attr('fixed') == 'true') {
            this.tooltip.attr('fixed', false);
            this.scatter.selectAll('circle').attr('fixed', false);
            d3.select(element).attr('fixed', false);
        }
        else {
            this.tooltip.attr('fixed', false);
            this.showTooltip(d, element);
            this.tooltip.attr('fixed', true);
            d3.select(element).attr('fixed', true);
        }
    }

    hideTooltip = (d, element) => {
        if (this.tooltip.attr('fixed') == "true") {
            return;
        }

        this.tooltip.transition()
            .duration(100)
            .style('opacity', 0)
            .style('z-index', -1);

        d3.select(element).transition().duration(300).style('stroke-width', this.strokeWidth);
    }

    hideProject = (d, element) => {
        d3.event.preventDefault();
        d3.select(element).style("display", "none");
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
            <div id="bubbleChartSales" ref={el => this.divEl = el}>
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