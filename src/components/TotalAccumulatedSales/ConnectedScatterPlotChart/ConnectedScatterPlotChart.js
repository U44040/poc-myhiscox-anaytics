import React, { Component } from 'react';
import * as d3 from 'd3';
import * as StringSanitizer from 'string-sanitizer';
import * as STATUS from '../../../utils/StatusTypes';
import './ConnectedScatterPlotChart.scss';
import moment from 'moment';

class ConnectedScatterPlotChart extends Component {

    constructor(props) {
        super();

        const margin = { top: 5, right: 20, bottom: 15, left: 38 };
        const width = 670 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        this.svg = null;
        this.scatter = null;
        this.xAxis = null;
        this.yAxis = null;
        this.tooltip = null;
        this.zeroLine = null;
        this.radius = '1.5px';
        this.strokeWidth = '0.5px';

        this.state = {
            margin,
            width,
            height,
            hiddenProjects: [],
        }
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.updateChart()
    }

    xScale = () => {
        let firstSerieValues = this.props.data[0].values;
        let dateStart = moment(firstSerieValues[0].keyTime).subtract(1, "days").toDate();
        let dateEnd = moment(firstSerieValues[firstSerieValues.length -1].keyTime).add(1, "days").toDate()
        return d3.scaleTime().domain([dateStart, dateEnd]).range([0, this.state.width])
    };

    yScale = () => {
        const volumes = [];
        for (let serie of this.props.data) {
            for (let value of serie.values) {
                volumes.push(value.volume);
            }
        }

        let max = d3.max(volumes);
        if (max == undefined) {
            max = 0;
        } else {
            max = max + max * 0.01
        }

        let min = d3.min(volumes);
        if (min == undefined) {
            min = 0;
        }
        else {
            min = min - min * 0.01;
        }

        return d3.scaleLinear().domain([min, max]).range([this.state.height, 0]);
    }

    xScaleTransformed = () => {
        return this.xScale();
    }

    yScaleTransformed = () => {
        return this.yScale();
    }


    getXValue = (d) => moment(d.keyTime).toDate();
    getYValue = (d) => d.volume;

    fillColor = (d3.scaleOrdinal().range(d3.schemeSet2));
    strokeColor = (d3.scaleOrdinal().domain([true, false]).range(['#039453', '#bf003d']));

    getScales = () => {
        return {
            xScale: this.xScale(),
            yScale: this.yScale(),

            xScaleTransformed: this.xScaleTransformed(),
            yScaleTransformed: this.yScaleTransformed(),
        }
    }

    addHiddenProject = (projectReference) => {
        let hiddenProjects = this.state.hiddenProjects.map(d => d);
        hiddenProjects.push(projectReference);
        this.setState({
            hiddenProjects
        });
    }

    createChart = () => {

        const scales = this.getScales();
        this.svg = d3.select(this.svgEl).append("g").attr("transform", "translate(" + this.state.margin.left + "," + this.state.margin.top + ")");

        // Axis
        this.xAxis = this.svg.append("g").style("font-size", "0.4rem").attr("transform", "translate(0," + this.state.height + ")").call(d3.axisBottom(scales.xScale).ticks(this.state.width/80))            
        this.yAxis = this.svg.append("g").style("font-size", "0.4rem").call(d3.axisLeft(scales.yScale).tickFormat((d, i) => d + "€"))
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", this.state.width)
                .attr("stroke-opacity", 0.1))
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 4)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .attr("fill", "black")
            );

        // Labels
        // Y-Label
        this.yLabel = d3.select(this.svgEl).append("text")
            .attr('x', () => - 100)
            .attr('y', (d, i) => 4)
            .text((d, i) => "")
            .style("font-size", 5)
            .style("font-weight", "bold")
            .style("transform", "rotate(-90deg)");
        // X-Label
        /*this.xLabel = d3.select(this.svgEl).append("text")
            .attr('x', () => this.state.width)
            .attr('y', (d, i) => this.state.height)
            .text((d, i) => "Date")
            .style("font-size", 5)
            .style("font-weight", "bold");*/

        let clip = this.svg.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", this.state.width + 5)
            .attr("height", this.state.height + 5)
            .attr("x", 0)
            .attr("y", -5);

        let zoom = d3.zoom()
            .scaleExtent([1, 60])  // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([[0, 0], [this.state.width, this.state.height]])
            .translateExtent([[0, 0], [this.state.width, this.state.height]])
            .on("zoom", () => this.updateChartZoom(this.xAxis, this.yAxis));

    
        d3.select(this.svgEl).call(zoom).on("dblclick.zoom", null);

        // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user click to dismiss tooltip
        this.svg.append("rect")
            .attr("width", this.state.width)
            .attr("height", this.state.height)
            .style("fill", "none")
            .style("pointer-events", "all")
        //    .on("click", () => { this.forceHideTooltip() } )
        ;

        // Plot
        this.scatter = this.svg.append('g').attr("class", "data-scatterplot").attr("clip-path", "url(#clip)");

        //this.createLegend();
        //this.createTooltip();
        this.updateChart();
    }

    createLegend = () => {
        let legendGroup = this.svg
            .selectAll(".legend")
            .data(this.props.data)
            .enter()
            .append('g')
            .on("mouseover", function (d) {
                d3.select('.data-scatterplot').selectAll("g:not(." + StringSanitizer.sanitize(d.status)).transition().style("opacity", 0.1);
                //d3.selectAll('.legend').style("opacity", 0.5).style("text-decoration", "line-through");
            })
            .on("mouseout", function (d) {
                d3.select('.data-scatterplot').selectAll("g").transition().style("opacity", 1);
            });

        legendGroup
            .append("text")
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 3)
            .attr('y', (d, i) => this.state.height - 20 - (10 * i))
            .text((d, i) => this.mappedStatusForLegend(d.status))
            .style("fill", (d) => this.fillColor(d.status))
            .style("font-size", 5)
            .style("font-weight", "bold");

        legendGroup
            .append("rect")
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 50)
            .attr('y', (d, i) => this.state.height - 25 - (10 * i))
            .attr('width', 5)
            .attr('height', 5)
            .style("fill", (d) => this.fillColor(d.status));
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
        //this.xAxis.call(d3.axisBottom(this.xScaleTransformed()).ticks(12));
        //this.yAxis.call(d3.axisLeft(scales.yScale).tickFormat((d, i) => d + "%"));

        scatter = scatter
            .selectAll("g.serie")
            .data(this.props.data);

        let scatterSerie = scatter
            .enter()
            // First we need to enter in a group per each serie
            .append('g')
            .merge(scatter)
            .style("stroke-width", this.strokeWidth)
            .style("fill", (d, i) => this.fillColor(i))
            .style("opacity", "1")
            .attr("stroke", (d) => '#fff')
            .attr("class", (d, i) => 'serie serie-' + i)
            // Second we need to enter in the 'values' part of this group

        // Create path for first time
        if (scatterSerie.selectAll("path").size() == 0) {

            let path = scatterSerie
            .append("path")
            .datum(d => d.values)
                .attr("fill", "none")
                .attr("stroke", (d, i) => this.fillColor(i))
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", d3.line()
                    .curve(d3.curveCatmullRom)
                    .x(d => scales.xScaleTransformed(this.getXValue(d)))
                    .y(d => scales.yScaleTransformed(this.getYValue(d)))
                )
            ;

            let length = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", `0,${length}`)
                .transition()
                    .duration(3000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dasharray", `${length},${length}`)
            ;
        }
        else {
            // Update existing path
            scatterSerie
            .datum(d => d.values)
            .select("path")
            .attr("d", d3.line().curve(d3.curveCatmullRom)
                .x(d => scales.xScaleTransformed(this.getXValue(d)))
                .y(d => scales.yScaleTransformed(this.getYValue(d)))
            );
        }        

        scatterSerie
            .selectAll("circle")
            .data(d => d.values)
            .enter()
            .append("circle")
            .merge(scatterSerie)
            //.on("click", function (d) { component.showTooltipAlways(d, this) })
            //.on("mouseover", function (d) { component.showTooltip(d, this) })
            //.on("mousemove", function(d){ component.showTooltip(d, this)})
            //.on("mouseout", function (d) { component.hideTooltip(d) })
            //.on("contextmenu", function (d) { component.hideProject(d, this) })
            .attr("cx", (d) => scales.xScaleTransformed(this.getXValue(d)))
            .attr("cy", (d) => scales.yScaleTransformed(this.getYValue(d)))
            .attr("r", this.radius)
        ;

        const label = scatterSerie
            .selectAll("g.labelpoint")
            .data(d => d.values)
            .enter()
            .append("g")
            .merge(scatterSerie)
                .attr("font-size", 4)
                .attr("stroke-width", 0)
                .attr("class", "labelpoint")
                .attr("transform", d => `translate(${(scales.xScaleTransformed(this.getXValue(d)))},${scales.yScaleTransformed(this.getYValue(d))})`)
                .attr("opacity", 0);
            
        let last = 0;
        let num = 0;
        label.append("text")
            .text(d => this.formatCurrency(d.volume))
            .each(function(d, i) {
                num++;
            })
            .each(function(d, i) {
                const t = d3.select(this);
                if (i == 0) {
                    t.attr("text-anchor", "middle").attr("dx", "+4em");
                } else if (i == num - 1) {
                    t.attr("text-anchor", "middle").attr("dx", "-4em");
                } else if (last >= d.volume) {
                    t.attr("text-anchor", "middle").attr("dy", "+1.2em");
                } else {
                    t.attr("text-anchor", "middle").attr("dy", "-0.7em");
                }
                last = d.volume;
            })
           
        label.transition()
            .delay((d, i) => 3000)
            .duration(500)
            .attr("opacity", 1);

        scatterSerie.exit().remove();
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

        this.tooltip
            .html(html)
            .transition()
            .duration(300)
            //.style('display','block')
            .style('opacity', 1)
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY + 20) + 'px')
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
        d3.select(element).style("display", "none").attr("isHidden", true);
        this.addHiddenProject(d.reference);
    }

    updateChartZoom = (xAxis, yAxis) => {

        const scales = this.getScales();

        // recover the new scale
        var newX = d3.event.transform.rescaleX(scales.xScale);
        //var newY = d3.event.transform.rescaleY(scales.yScale);
        var newY = scales.yScale;

        //console.log(newX.domain());

        if (d3.event.transform.k == 1) {
            this.xScaleTransformed = () => this.xScale();
            this.yScaleTransformed = () => this.yScale();
        }
        else {
            this.xScaleTransformed = () => newX;
            this.yScaleTransformed = () => newY;
        }

        // update axes with these new boundaries
        xAxis.attr("transform", "translate(0," + this.state.height + ")").call(d3.axisBottom(this.xScaleTransformed()));
        yAxis.call(d3.axisLeft(this.yScaleTransformed()).tickFormat((d, i) => d + "€"));

        // update circle position
        this.scatter
            .selectAll("circle")
            .attr('cx', (d) => newX(this.getXValue(d)))
            .attr("cy", (d) => newY(this.getYValue(d)));

        // update path position
        this.scatter
            .selectAll("path")
            .attr("d", d3.line().curve(d3.curveCatmullRom)
                .x(d => newX(this.getXValue(d)))
                .y(d => newY(this.getYValue(d)))
            )
            .attr("stroke-dasharray","none");

        // update label  position
        this.scatter
            .selectAll("g.labelpoint")
            .attr("transform", d => `translate(${newX(this.getXValue(d))},${newY(this.getYValue(d))})`)

    }

    formatCurrency = (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

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

export default ConnectedScatterPlotChart;