import React, { Component } from 'react';
import Card from '../../components/Shared/Card/Card';
import * as DataGenerator from '../../utils/ScatterPlotChartDataGenerator';
import * as STATUS from '../../utils/StatusTypes';
import rfdc from 'rfdc';
import * as FILTER_TYPES from '../../utils/FilterTypes';
import moment from 'moment';
import userContext from '../../context/userContext';
import * as ROLES from '../../utils/RoleTypes';
import ConnectedScatterPlotChart from '../../components/TotalAccumulatedSales/ConnectedScatterPlotChart/ConnectedScatterPlotChart';

const deepClone = rfdc();
const INTERVAL_REFRESH = 1000;

class TotalAccumulatedSalesChart extends Component {

  constructor(props) {
    super();
    const actualMoment = moment().hour(8).minute(0).second(0);
    const data = this.getData();
    /*const filteredData = data;
    const segmentedData = this.getSegmentedData(filteredData);
    const aggregatedData = this.getAggregatedData(segmentedData);*/
    this.state = {
      data,
      speed: 100,
      actualMoment,
    }
  }

  static contextType = userContext;

  componentDidMount = () => {
    this.props.updateData(this.state.data);
    //this.setIntervalRefresh(INTERVAL_REFRESH);
    this.setState((oldState, oldProps) => {
      let filteredData = this.filterData(oldState.data);
      let segmentedData = this.getSegmentedData(filteredData);
      let aggregatedData = this.getAggregatedData(segmentedData);

      return {
        filteredData,
        segmentedData,
        aggregatedData,
      }
    })
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.filters != this.props.filters || prevProps.specialFilters != this.props.specialFilters) {
      this.setState((oldState, oldProps) => {
        let filteredData = this.filterData(oldState.data);
        let segmentedData = this.getSegmentedData(filteredData);
        let aggregatedData = this.getAggregatedData(segmentedData);

        return {
          filteredData,
          segmentedData,
          aggregatedData,
        }
      });
    }
  }

  componentWillUnmount = () => {
    this.cancelInterval();
  }

  getData = () => {
    return DataGenerator.generateData();
  }

  getSegmentedData = (data) => {

    let segmentType = "network";
    let series;

    if (segmentType) {
      let differentValues = {};

      for (let d of data) {
        for (let project of d.projects) {
          let segmentationObject;
          switch (segmentType) {
            case 'network':
              segmentationObject = project.user.brokerage.network;
              break;
            case 'brokerage':
              segmentationObject = project.user.brokerage;
              break;
            case 'broker':
              segmentationObject = project.user;
              break;
          }
  
          differentValues[segmentationObject.id] = segmentationObject;
        } 
      }
  
      differentValues = Object.values(differentValues);
      series = differentValues.map(d => {
        let values = deepClone(data);
        for (let value of values) {
          switch (segmentType) {
            case 'network':
              value.projects = value.projects.filter(p => p.user.brokerage.network.id == d.id);
              value.volume = value.projects.reduce((accumulator, current) => (accumulator += current.totalRate), 0);
              break;
            case 'brokerage':
              value.projects = value.projects.filter(p => p.user.brokerage.id == d.id);
              break;
            case 'broker':
              value.projects = value.projects.filter(p => p.user.id == d.id);
              break;
          }
          value.volume = value.projects.reduce((accumulator, current) => (accumulator += current.totalRate), 0);
        }
        return {
          id: d.id,
          label: d.name,
          values: values,
        };
      });

    } else {
      series = [
        {
          id: 0,
          label: 'global',
          values: deepClone(data),
        }
      ];
    }

    return series;
  }

  getAggregatedData = (data) => {
    let series = deepClone(data);
    let aggregatedSeries = [];

    let aggregation = 'month';
    let dateFormat = '';

    switch (aggregation) {
      case 'year':
        dateFormat = 'YYYY';
        break
      case 'month':
        dateFormat = 'YYYYMM';
        break;
      case 'day':
        dateFormat = 'YYYYMMDD';
        break;
    }


    for (let serie of series) {
      let aggregatedSerie = {
        ...serie,
        values: {}
      };

      for (let d of serie.values) {
        let dateFormatted = moment(d.date).locale('es').format(dateFormat);

        if (aggregatedSerie.values[dateFormatted] == undefined) {
          aggregatedSerie.values[dateFormatted] = {
            keyTime: moment(dateFormatted, dateFormat),
            items: [],
            volume: 0,
          };
        }
        
        aggregatedSerie.values[dateFormatted].items.push(d);
        aggregatedSerie.values[dateFormatted].volume += d.volume;
      }

      aggregatedSerie.values = Object.values(aggregatedSerie.values);
      aggregatedSeries.push(aggregatedSerie);
    }

    return aggregatedSeries;
  }

  concatTypeValue = (type, value) => (type + "_" + value);

  filterData = (data) => {
    let filteredData = deepClone(data);
    for (let filterType in this.props.filters) {
      let filters = this.props.filters[filterType].map(d => d.value);
      switch (filterType) {
        case FILTER_TYPES.STATUS:
          for (let status of filteredData) {
            if (filters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, status.status)) == false) {
              status.projects = [];
            }
          }
          break;

        case FILTER_TYPES.BROKER:
          for (let status of filteredData) {
            status.projects = status.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.BROKER, d.user.id)));
          }
          break;

        case FILTER_TYPES.BROKERAGE:
          for (let status of filteredData) {
            status.projects = status.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.BROKERAGE, d.user.brokerage.id)));
          }
          break;

        case FILTER_TYPES.NETWORK:
          for (let status of filteredData) {
            status.projects = status.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.NETWORK, d.user.brokerage.network.id)));
          }
          break;

        case FILTER_TYPES.SOURCE:
          for (let status of filteredData) {
            status.projects = status.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.SOURCE, d.source)));
          }
          break;

        case FILTER_TYPES.PRODUCT:
          for (let status of filteredData) {
            for (let project of status.projects) {
              project.productVariants = project.productVariants.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.PRODUCT, d.idProductVariant)));
              status.projects = status.projects.filter(d => d.productVariants.length != 0);
            }
          }
          break;
      }
    }

    let hasApprovedFilter = false;
    let hasRejectedFilter = false;

    if (this.props.filters[FILTER_TYPES.STATUS]) {
      let filters = this.props.filters[FILTER_TYPES.STATUS].map(d => d.value);
      if (filters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.APPROVED))) {
        hasApprovedFilter = true;
      }
      if (filters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.REJECTED))) {
        hasRejectedFilter = true;
      }
    }


    for (let status of filteredData) {

      if (status.status == STATUS.APPROVED) {
        if (hasApprovedFilter == false && this.props.specialFilters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.APPROVED)) == false) {
          status.projects = [];
        }
      }

      if (status.status == STATUS.REJECTED) {
        if (hasRejectedFilter == false && this.props.specialFilters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, STATUS.REJECTED)) == false) {
          status.projects = [];
        }
      }
    }

    return filteredData;
  }

  updateData = () => {
    // Update data
    if (this.state.speed == 0) { return }

    let actualMoment = this.state.actualMoment.clone().add(60 * this.state.speed / 100, 'seconds');
    if (actualMoment.dayOfYear() > moment().dayOfYear()) {
      this.cancelInterval();
    }

    let updatedData = DataGenerator.updateData(this.state.data, actualMoment);
    let filteredData = this.filterData(updatedData);
    let segmentedData = this.getSegmentedData(filteredData);
    let aggregatedData = this.getAggregatedData(segmentedData);
    this.setState({
      data: updatedData,
      filteredData: filteredData,
      segmentedData: segmentedData,
      aggregatedData: aggregatedData,
      actualMoment: actualMoment,
    }, () => this.props.updateData(aggregatedData));
  }

  setIntervalRefresh = (interval) => {
    let windowInterval = window.setInterval(this.updateData, interval);
    this.setState({
      interval: windowInterval,
    });
  }

  cancelInterval = () => {
    window.clearInterval(this.state.interval);
  }

  updateSpeed = (e) => {
    this.setState(
      {
        speed: e.target.value,
      }
    )
  }

  render = () => {
    let chart = '';
    if (this.state.aggregatedData) {
      chart = <ConnectedScatterPlotChart data={this.state.aggregatedData} />
    }
    return (
    <div className="col-md">
      <Card type="primary">
        { chart }
      </Card>
    </div>
    );
  };
}

export default TotalAccumulatedSalesChart;