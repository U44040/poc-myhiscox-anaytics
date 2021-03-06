import React, { Component } from 'react';
import * as d3 from 'd3';
import * as StringSanitizer from 'string-sanitizer';
import * as STATUS from '../../../utils/StatusTypes';
import './BubbleChart.scss';
import moment from 'moment';

class BubbleChart extends Component {

    constructor(props) {
        super();

        const margin = { top: 5, right: 70, bottom: 5, left: 38 };
        const width = 670 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

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

    componentWillUnmount = () => {
        this.tooltip.remove();
    }

    xScale = () => {
        const maximums = [];
        for (let status of this.props.data) {
            maximums.push(d3.max(status.projects.map((d) => d.elapsedTime)));
        }
        let max = d3.max(maximums);
        if (max == undefined) {
            max = 0;
        }
        return d3.scaleLinear().domain([0, max+5]).range([0, this.state.width])
    };

    yScale = () => (d3.scaleLinear().domain([-110, 110]).range([this.state.height, 0]));
    zScale = () => {
        const maximums = [];
        for (let status of this.props.data) {
            maximums.push(d3.max(status.projects.map((d) => d.totalRate)));
        }
        return d3.scaleLinear().domain([0, d3.max(maximums)]).range([0, 20]);
    }

    xScaleTransformed = () => {
        return this.xScale();
    }

    yScaleTransformed = () => {
        return this.yScale();
    }


    getXValue = (d) => d.elapsedTime;
    getYValue = (d) => {
        let sum = 0;
        if (d.productVariants.length == 0) { return 0; }

        for (let productVariant of d.productVariants) {
            sum += productVariant.percentAverage;
        }

        return sum / d.productVariants.length;        
    }

    fillColor = (d3.scaleOrdinal().domain([STATUS.DRAFT, STATUS.PENDING_INFO, STATUS.BINDING_REQUEST_PENDING, STATUS.MANUAL_QUOTATION_REQUIRED, STATUS.TO_BE_ISSUED, STATUS.APPROVED, STATUS.REJECTED]).range(d3.schemeSet2));
    strokeColor = (d3.scaleOrdinal().domain([true, false]).range(['#039453', '#bf003d']));

    getScales = () => {
        return {
            xScale: this.xScale(),
            yScale: this.yScale(),
            zScale: this.zScale(),

            xScaleTransformed: this.xScaleTransformed(),
            yScaleTransformed: this.yScaleTransformed(),
        }
    }

    createChart = () => {

        const scales = this.getScales();
        this.svg = d3.select(this.svgEl).append("g").attr("transform", "translate(" + this.state.margin.left + "," + this.state.margin.top + ")");

        // Axis
        this.xAxis = this.svg.append("g").style("font-size", "0.4rem").attr("transform", "translate(0," + scales.yScale(0) + ")").call(d3.axisBottom(scales.xScale));
        this.yAxis = this.svg.append("g").style("font-size", "0.4rem").call(d3.axisLeft(scales.yScale).tickFormat((d, i) => d + "%"));

        // Labels
        // Y-Label
        this.yLabel = d3.select(this.svgEl).append("text")
            .attr('x', () => - scales.yScale(0) - 5)
            .attr('y', (d, i) => 5)
            .attr("text-anchor", "middle")
            .text((d, i) => "Market Position")
            .style("font-size", 6)
            .style("font-weight", "bold")
            .style("transform", "rotate(-90deg)");
        // X-Label
        this.xLabel = d3.select(this.svgEl).append("text")
            .attr('x', () => this.state.width)
            .attr('y', (d, i) => scales.yScale(0) + 3)
            .attr("text-anchor", "middle")
            .text((d, i) => "Time in Market (minutes)")
            .style("font-size", 6)
            .style("font-weight", "bold");

        let clip = this.svg.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", this.state.width)
            .attr("height", this.state.height)
            .attr("x", 0)
            .attr("y", 0);

        let zoom = d3.zoom()
            .scaleExtent([1, 60])  // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([[0, 0], [this.state.width, this.state.height]])
            .translateExtent([[0, 0], [Infinity, this.state.height]])
            .on("zoom", () => this.updateChartZoom(this.xAxis, this.yAxis));

    
        d3.select(this.svgEl).call(zoom).on("dblclick.zoom", null);

        // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user click to dismiss tooltip
        this.svg.append("rect")
            .attr("width", this.state.width)
            .attr("height", this.state.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("click", () => { this.forceHideTooltip() } );

        // Plot
        this.scatter = this.svg.append('g').attr("class", "data-bubble").attr("clip-path", "url(#clip)");

        this.createLegend();
        this.createInfoText();
        this.createTooltip();
        this.updateChart();
    }

    createLegend = () => {
        let legendGroup = this.svg
            .selectAll(".legend")
            .data(this.props.data)
            .enter()
            .append('g')
            .on("mouseover", function (d) {
                d3.select('.data-bubble').selectAll("g:not(." + StringSanitizer.sanitize(d.status)).transition().style("opacity", 0.1);
                //d3.selectAll('.legend').style("opacity", 0.5).style("text-decoration", "line-through");
            })
            .on("mouseout", function (d) {
                d3.select('.data-bubble').selectAll("g").transition().style("opacity", 1);
            });

        legendGroup
            .append("text")
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 5)
            .attr('y', (d, i) => this.state.height - 20 - (10 * i))
            .text((d, i) => this.mappedStatusForLegend(d.status))
            .style("fill", (d) => this.fillColor(d.status))
            .style("font-size", 6)
            .style("font-weight", "bold");

        legendGroup
            .append("rect")
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 60)
            .attr('y', (d, i) => this.state.height - 25 - (10 * i))
            .attr('width', 5)
            .attr('height', 5)
            .style("fill", (d) => this.fillColor(d.status));
    }

    createInfoText = () => {
        this.infoText = this.svg
        .append('text')
        .attr('class', 'info-text')
        .attr('x', () => this.state.width + 5)
        .attr('y', () => this.state.height - 10)
        .style("font-size", 6)
        .style("font-weight", "bold");
    }

    updateInfoText = () => {
        let circles = this.scatter.selectAll("circle").filter(function () { return d3.select(this).attr("isHidden") != "true"; });
        this.infoText.text('Nº Projects: ' + circles.size());
    }

    mappedStatusForLegend = (status) => {
        switch (status) {
            case 'Manual Quotation Required':
                return 'M. Quot. Required.';
            case 'Binding Request Pending':
                return 'Bind. Req. Pending';
            default:
                return status;
        }
    }

    createTooltip = () => {
        this.tooltip = d3.select('body')
            .append("div")
            .attr("id", "tooltip-bubble")
            .style("opacity", 0)
            .style("display", "none")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("border-radius", "5px")
            .style("padding", "10px")
    }

    updateChart = () => {

        let component = this;
        let scatter = this.scatter;
        let scales = this.getScales();

        // Axis
        this.xAxis.call(d3.axisBottom(this.xScaleTransformed()));
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
            .style("fill", (d) => this.fillColor(d.status))
            .style("stroke-width", this.strokeWidth)
            .attr("class", (d) => StringSanitizer.sanitize(d.status))
            // Second we need to enter in the 'values' part of this group
            .selectAll("circle")
            .data(d => d.projects);

        scatterProject
            .enter()
            .append("circle")
            .merge(scatterProject)
            .attr("id", d => "project-" + d.reference)
            .on("click", function (d) { component.showTooltipAlways(d, this) })
            .on("mouseover", function (d) { component.showTooltip(d, this) })
            //.on("mousemove", function(d){ component.showTooltip(d, this)})
            .on("mouseout", function (d) { component.hideTooltip(d) })
            .on("contextmenu", function (d) { component.hideProject(d, this) })
            .attr("cx", (d) => scales.xScaleTransformed(this.getXValue(d)))
            .attr("cy", (d) => scales.yScaleTransformed(this.getYValue(d) > 100 ? 100 : this.getYValue(d) < -100 ? -100 : this.getYValue(d)))
            .attr("r", (d) => scales.zScale(d.totalRate))
            .style("opacity", "0.9")
            .attr("stroke", (d) => this.strokeColor(d.isClean))
            //.style("display", (d) => this.state.hiddenProjects.includes(d.reference) ? "none" : "initial")
            //.attr("isHidden", (d) => this.state.hiddenProjects.includes(d.reference) ? "true" : "false")
            ;

        scatterProject.exit().remove();

        this.updateInfoText();

    }

    showTooltip = (d, element) => {
        if (this.tooltip.attr('fixed') == "true") {
            return;
        }

        this.tooltip.style("display", "block");

        let duration = moment.duration(d.elapsedTime, "minutes");
        let style;

        if (Math.round(this.getYValue(d)) >= 0) {
            style = "text-success font-weight-bold";
        }
        else {
            style = "text-danger font-weight-bold";
        }

        let html = '';
        html += `
            <p><strong>ΔX:</strong> ${ duration.hours() == 0 ? '' : duration.hours() + " hours"} ${ duration.minutes() } minutes </p>
            <p><strong>ΔY:</strong> <span class="${style}">${Math.round(this.getYValue(d))}%</span></p>
            <p><Strong>Reference:</strong> ${ d.reference}</p>
            <p><Strong>Status:</strong> ${ d.status }</p>
            <p><strong>Broker:</strong> ${ d.user.name}</p>
            <p><strong>Brokerage:</strong> ${ d.user.brokerage.name}</p>
            <p><strong>Network:</strong> ${ d.user.brokerage.network.name}</p>
            <p><strong>Clean:</strong> ${ d.isClean ? '<span class="text-success font-weight-bold">Yes</span>' : '<span class="text-danger font-weight-bold">No</span>'}</p>
            <p><strong>Source:</strong> ${ d.source }</p>
        `;

        let startDate = moment(d.createdAt, 'YYYY-MM-DD HH:mm:ss');
        html += `<p><strong>Start date:</strong> ${ startDate.format('DD-MM-YYYY HH:mm:ss') }</p>`;

        if (d.status === STATUS.APPROVED || d.status === STATUS.REJECTED) {
            let endDate = moment(d.finishedAt, 'YYYY-MM-DD HH:mm:ss');
            html += `<p><Strong>End date:</strong> ${ endDate.format('DD-MM-YYYY HH:mm:ss') }</p>`;
        }
        
        let minimumRate = 0;
        if (d.productVariants.length != 0) {
            for (let productVariant of d.productVariants) {
                minimumRate += productVariant.minimumRate;
            }
        }

        let totalRate = 0;
        if (d.productVariants.length != 0) {
            for (let productVariant of d.productVariants) {
                totalRate += productVariant.totalRate;
            }
        }

        if (d.isClean) {
            html += `<p><strong>Total rate:</strong> ${totalRate}€</p>`;
        } else {
            html += `<p><strong>Minimum rate:</strong> ${minimumRate}€</p>`;
        }
            
        html += `
        <div class="tooltip-products">
                <p><strong>Products (+)</strong></p>
                <ul>
        `;

        for (let productVariant of d.productVariants) {
            if (Math.round(productVariant.percentAverage) >= 0) {
                style = "text-success font-weight-bold";
            }
            else {
                style = "text-danger font-weight-bold";
            }

            html += `<li>${productVariant.name} - (${productVariant.totalRate}€) <span class="${style}">[${Math.round(productVariant.percentAverage)}%]</span></li>`
        }

        html += '</ul></div>';

        let position = element.getBoundingClientRect();

        this.tooltip
            .html(html)
            .transition()
            .duration(300)
            //.style('display','block')
            .style('opacity', 1)
            //.style('left', (d3.event.pageX + 10) + 'px')
            .style('left', (window.scrollX + position.x + position.width) + 'px')
            //.style('top', (d3.event.pageY + 20) + 'px')
            .style('top', (window.scrollY + position.y + position.height) + 'px')
            .style('z-index', 1000);

        this.scatter.selectAll("circle").transition().duration(300).style('stroke-width', this.strokeWidth);
        d3.select(element).transition().duration(300).style('stroke-width', '1.25px');
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
            this.scatter.selectAll('circle').attr('fixed', false);
            d3.select(element).attr('fixed', true);
        }
    }

    hideTooltip = (d) => {
        if (this.tooltip.attr('fixed') == "true") {
            return;
        }

        this.tooltip
            .html('')
            .transition()
            .duration(10)
            //.style('display', 'none')
            .style('opacity', 0)
            .style('z-index', -1);

        this.scatter.selectAll("circle").transition().duration(300).style('stroke-width', this.strokeWidth);
    }

    forceHideTooltip = (d) => {
        this.scatter.selectAll("circle").attr('fixed', false);
        this.tooltip.attr('fixed', false);
        this.hideTooltip(d);
    }

    hideProject = (d, element) => {
        d3.event.preventDefault();
        //d3.select(element).style("display", "none").attr("isHidden", true);
        this.props.addHiddenProject(d.reference);
    }

    updateChartZoom = (xAxis, yAxis) => {

        const scales = this.getScales();

        // recover the new scale
        var newX = d3.event.transform.rescaleX(scales.xScale);
        var newY = d3.event.transform.rescaleY(scales.yScale);

        if (d3.event.transform.k == 1) {
            this.xScaleTransformed = () => this.xScale();
            this.yScaleTransformed = () => this.yScale();
        }
        else {
            this.xScaleTransformed = () => newX;
            this.yScaleTransformed = () => newY;
        }

        // update axes with these new boundaries
        xAxis.attr("transform", "translate(0," + this.yScaleTransformed()(0) + ")").call(d3.axisBottom(this.xScaleTransformed()));
        yAxis.call(d3.axisLeft(this.yScaleTransformed()).tickFormat((d, i) => d + "%"));
        this.xLabel.attr('y', () => this.yScaleTransformed()(0) + 3);

        // update circle position
        this.scatter
            .selectAll("circle")
            .attr('cx', (d) => newX(this.getXValue(d)))
            .attr("cy", (d) => newY(this.getYValue(d) > 100 ? 100 : this.getYValue(d) < -100 ? -100 : this.getYValue(d)));
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