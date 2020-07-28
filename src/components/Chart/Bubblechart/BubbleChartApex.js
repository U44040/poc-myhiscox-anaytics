import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class BubbleChart extends React.Component {
    
    state = {
        series: [
            {
            name: 'Bubble1',
            data: [[1, 45, 20]],
            },
            {
                name: 'Bubble2',
                data: [[2, 45, 20]],
            },
            {
                name: 'Bubble3',
                data: [[5, 100, 30]],
            },
        ],
        options: {
          chart: {
              height: '400px',
              type: 'bubble',
          },
          dataLabels: {
              enabled: false
          },
          fill: {
              opacity: 0.8,
              colors: ['#f00', '#0f0', '#00f']
          },
          markers: {
            size: 10,
            colors: ['#ff0', '#0ff', '#f0f'],
            strokeColors: ['#ff0', '#0ff', '#f0f'],
            strokeWidth: 3,
            strokeOpacity: 0.9,
            strokeDashArray: 0,
            fillOpacity: 0,
            discrete: [],
            radius: 50,
            offsetX: 0,
            offsetY: 0,
            onClick: undefined,
            onDblClick: undefined,
            showNullDataPoints: true,
            hover: {
              size: 10,
              sizeOffset: 30
            }
        },
          title: {
              text: 'Simple Bubble Chart'
          },
          xaxis: {
              min: 0,
              max: 10,
              tickAmount: 10,
              type: 'numeric',
          },
          yaxis: {
              //max: 40
          }
        },
    };
  
    render() {
      return (
        <div id="chart">
            <ReactApexChart options={this.state.options} series={this.state.series} type="bubble" height={400} />
        </div>
      );
    }

}

export default BubbleChart;