import React, { Component } from 'react';
import * as d3 from 'd3';
import * as StringSanitizer from 'string-sanitizer';
import * as STATUS from '../../../utils/StatusTypes';
import moment from 'moment';
import './BarChart.scss';

class BarChart extends Component {

    constructor(props) {
        super();

        const margin = { top: 5, right: 20, bottom: 20, left: 10 };
        const width = 670 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;
        const padding = { top: 15, right: 0, bottom: 0, left: 0 };
        const barSize = 10;

        this.svg = null;
        this.scatter = null;
        this.xAxis = null;
        this.yAxis = null;
        this.tooltip = null;
        this.zeroLine = null;
        this.radius = '1.5px';
        this.strokeWidth = '0.5px';
        this.animationDuration = 2000;

        this.state = {
            segmentType: null,
            margin,
            padding,
            barSize,
            width,
            height,
            hiddenProjects: [],
        }
    }

    componentDidMount() {
        this.createChart()
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        return (nextProps.data != this.props.data || nextState !== this.state);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data != this.props.data) {
            this.updateChart();
            this.setState({
                segmentType: this.props.segmentType,
            })
        }
    }

    xScale = () => {
        let volumes = this.props.data.map(d => d.values.volume);
        return d3.scaleLinear().domain([0, d3.max(volumes) * 1.05]).range([0, this.state.width])
    };

    yScale = () => {
        return d3.scaleBand().domain(d3.range(this.props.data.length)).range([this.state.height, 0]).round(true).padding(0.1);
    }

    xScaleTransformed = () => {
        return this.xScale();
    }

    yScaleTransformed = () => {
        return this.yScale();
    }


    getXValue = (d) => { return d.values.volume };
    getYValue = (d) => {
        let volumes = this.props.data.map(v => v.values.volume).sort(d3.ascending)
        return (volumes.indexOf(d.values.volume));
    };

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

        // Plot
        this.scatter = this.svg.append('g').attr("class", "data-barchartrace").attr("clip-path", "url(#clip)").attr("transform", "translate(" + this.state.padding.left + "," + this.state.padding.top + ")");
        // Axis
        this.xAxis = this.svg.append("g").style("font-size", "0.3rem").attr("class", "x-axis").attr("transform", "translate(" + this.state.padding.left + "," + this.state.padding.top + ")");
        this.yAxis = this.svg.append("g").style("font-size", "0.4rem").attr("class", "y-axis").attr("transform", "translate(" + this.state.padding.left + "," + this.state.padding.top + ")");

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

        //this.createTooltip();
        this.updateChart();
    }

    updateLegend = () => {

        this.svg.selectAll(".legend").remove();

        let legendGroup = this.svg
            .selectAll(".legend")
            .data(this.props.data)
            .enter()
            .append('g')
            .attr("class", "legend")
            .on("mouseover", function (d, i) {
                d3.select('.data-barchartrace').selectAll("g.serie:not(.serie-" + i).transition().style("opacity", 0.1);
                //d3.selectAll('.legend').style("opacity", 0.5).style("text-decoration", "line-through");
            })
            .on("mouseout", function (d) {
                d3.select('.data-barchartrace').selectAll("g").transition().style("opacity", 1);
            })

            ;

        legendGroup
            .append("text")
            .merge(legendGroup)
            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 0)
            .attr('y', (d, i) => this.state.height - 0 - (10 * i))
            .text((d) => {
                if (d.label.length > 22) {
                    return d.label.substring(0, 22) + "...";
                }
                return d.label;
            })
            .style("fill", (d, i) => this.fillColor(i))
            .style("font-size", 5)
            .style("font-weight", "bold");

        legendGroup
            .append("rect")
            .merge(legendGroup)

            .attr("class", "legend-bubble")
            .attr('x', () => this.state.width + 60)
            .attr('y', (d, i) => this.state.height - 0 - (10 * i))
            .attr('width', 5)
            .attr('height', 5)
            .style("fill", (d, i) => this.fillColor(i));
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

        this.setState((oldState, oldProps) => (
            { height: oldState.barSize * (oldProps.data.length + 10) }
        ), () => {

            let component = this;
            let scatter = this.scatter;
            let scales = this.getScales();

            // Axis
            this.xAxis.call(d3.axisTop(this.xScaleTransformed()).ticks(10).tickSizeInner(-this.state.height).tickSizeOuter(0));
            this.yAxis.call(d3.axisLeft(this.yScaleTransformed()).tickValues([]).tickSizeInner(1).tickSizeOuter(0));

            //scatter.selectAll("g").remove();

            scatter = scatter
                .selectAll("g.serie")
                .data(this.props.data);

            let scatterSerie = scatter
                .enter()
                .append('g')
                .merge(scatter)
                .style("fill", (d, i) => this.fillColor(d.id))
                .style("opacity", "1")
                .attr("stroke", (d) => '#fff')
                .attr("class", (d, i) => 'serie serie-' + i)
                ;

            let scatterSerieRect = scatterSerie
                .selectAll("rect")
                .data(d => [d])

            scatterSerieRect
                .enter()
                .append("rect")
                .merge(scatterSerieRect)
                .attr("x", scales.xScaleTransformed(0))
                .transition()
                .duration(this.animationDuration)
                .style("opacity", 0.75)
                .attr("height", scales.yScaleTransformed.bandwidth())
                .attr("y", d => scales.yScaleTransformed(this.getYValue(d)))
                .attr("width", d => scales.xScaleTransformed(this.getXValue(d)) - scales.xScaleTransformed(0))
                //.on("click", function (d) { component.showTooltipAlways(d, this) })
                //.on("mouseover", function (d) { component.showTooltip(d, this) })
                //.on("mousemove", function(d){ component.showTooltip(d, this)})
                //.on("mouseout", function (d) { component.hideTooltip(d) })
                //.on("contextmenu", function (d) { component.hideProject(d, this) })
                ;

            scatterSerieRect.exit().remove();

            let scatterSerieGroupLabel = scatterSerie
                .selectAll("g.label")
                .data(d => [d]);

            let newScatterSerieGroupLabel = scatterSerieGroupLabel
                .enter()
                .append("g")
                .attr("class", "label")
                ;

            scatterSerieGroupLabel = newScatterSerieGroupLabel.merge(scatterSerieGroupLabel);

            scatterSerieGroupLabel
                .transition()
                .duration(this.animationDuration)
                .attr("transform", d => `translate(${scales.xScaleTransformed(this.getXValue(d)) - scales.xScaleTransformed(0)},${scales.yScaleTransformed(this.getYValue(d))})`)
                ;

            let scatterSerieLabel = scatterSerieGroupLabel
                .selectAll("text.serieName")
                .data(d => [d]);

            scatterSerieLabel
                .enter()
                .append("text")
                .attr("class", "serieName")
                .merge(scatterSerieLabel)
                .text(d => d.label)
                .transition()
                .duration(this.animationDuration)
                .attr("font-size", 5)
                .attr("stroke-width", 0)
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .attr("fill", "#000")
                .attr("x", -6)
                .attr("y", scales.yScaleTransformed.bandwidth() / 2)
                .attr("dy", "-0.25em")
                ;

            let scatterSerieLabelNumber = scatterSerieGroupLabel
                .selectAll("text.number")
                .data(d => [d]);

            let newScatterSerieLabelNumber = scatterSerieLabelNumber
                .enter()
                .append("text")
                .attr("class", "number")
                .attr("value", 0)
                .text(this.formatCurrency(0));

            newScatterSerieLabelNumber
                .merge(scatterSerieLabelNumber)
                .transition()
                .duration(this.animationDuration)
                .attr("font-size", 4)
                .attr("stroke-width", 0)
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .attr("fill", "#000")
                .attr("x", -6)
                .attr("y", scales.yScaleTransformed.bandwidth() / 2)
                .attr("dy", "1.25em")
                .tween("text", function (d) {
                    var selection = d3.select(this);    // selection of node being transitioned
                    var start = selection.attr("value"); // start value prior to transition
                    var end = d.values.volume;                     // specified end value
                    var interpolator = d3.interpolateNumber(start, end); // d3 interpolator
                    selection.attr("value", end);
                    return function (t) { selection.text(component.formatCurrency(interpolator(t))); };  // return value
                })
                ;

            scatterSerieGroupLabel.exit().remove();
            scatter.exit().remove();

            //this.updateLegend();
        });


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
            <p><strong>ΔX:</strong> ${ duration.hours() == 0 ? '' : duration.hours() + " hours"} ${duration.minutes()} minutes </p>
            <p><strong>ΔY:</strong> <span class="${style}">${Math.round(this.getYValue(d))}%</span></p>
            <p><Strong>Reference:</strong> ${ d.reference}</p>
            <p><Strong>Status:</strong> ${ d.status}</p>
            <p><strong>Broker:</strong> ${ d.user.name}</p>
            <p><strong>Brokerage:</strong> ${ d.user.brokerage.name}</p>
            <p><strong>Network:</strong> ${ d.user.brokerage.network.name}</p>
            <p><strong>Clean:</strong> ${ d.isClean ? '<span class="text-success font-weight-bold">Yes</span>' : '<span class="text-danger font-weight-bold">No</span>'}</p>
            <p><strong>Source:</strong> ${ d.source}</p>
        `;

        let startDate = moment(d.createdAt, 'YYYY-MM-DD HH:mm:ss');
        html += `<p><strong>Start date:</strong> ${startDate.format('DD-MM-YYYY HH:mm:ss')}</p>`;

        if (d.status === STATUS.APPROVED || d.status === STATUS.REJECTED) {
            let endDate = moment(d.finishedAt, 'YYYY-MM-DD HH:mm:ss');
            html += `<p><Strong>End date:</strong> ${endDate.format('DD-MM-YYYY HH:mm:ss')}</p>`;
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
            //this.yScaleTransformed = () => this.yScale();
        }
        else {
            this.xScaleTransformed = () => newX;
            //this.yScaleTransformed = () => newY;
        }

        // update axes with these new boundaries
        xAxis.call(d3.axisTop(this.xScaleTransformed()).ticks(10).tickSizeInner(-this.state.height).tickSizeOuter(0));
        //yAxis.call(d3.axisLeft(this.yScaleTransformed()).tickValues([]).tickSizeInner(1).tickSizeOuter(0));

        // update bar position
        this.scatter
            .selectAll("rect")
            .attr("y", d => scales.yScaleTransformed(this.getYValue(d)))
            .attr("width", d => scales.xScaleTransformed(this.getXValue(d)));

        // update label position
        this.scatter
            .selectAll("g.label")
            .attr("transform", d => `translate(${scales.xScaleTransformed(this.getXValue(d))},${scales.yScaleTransformed(this.getYValue(d))})`)

    }

    formatCurrency = (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

    render() {
        const width = this.state.width + this.state.margin.left + this.state.margin.right;
        const height = this.state.height + this.state.margin.top + this.state.margin.bottom;

        return (
            <div id="barChartRace" ref={el => this.divEl = el}>
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

export default BarChart;