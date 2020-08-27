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
    const segmentedData = this.getSegmentedData(data);
    const aggregatedData = this.getAggregatedData(segmentedData);
    const filteredData = aggregatedData;
    this.state = {
      data,
      segmentedData,
      aggregatedData,
      filteredData,
      speed: 100,
      actualMoment,
    }
  }

  static contextType = userContext;

  componentDidMount = () => {
    this.props.updateData(this.state.aggregatedData);
    //this.setIntervalRefresh(INTERVAL_REFRESH);
    this.setState((oldState, oldProps) => ({
      filteredData: this.filterData(oldState.aggregatedData)
    }))
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.filters != this.props.filters || prevProps.specialFilters != this.props.specialFilters) {
      this.setState((oldState, oldProps) => (
        {
          filteredData: this.filterData(oldState.aggregatedData)
        }
      ));
    }
  }

  componentWillUnmount = () => {
    this.cancelInterval();
  }

  getData = () => {
    return DataGenerator.generateData();
  }

  getSegmentedData = (data) => {
    // TODO SEGMENT DATA
    // TODO: Split each segmentation in a different serie
    let originalData = deepClone(data);
    let series = [];

    let segmentType = "network";

      let serie = {
        label: 'global',
        values: [],
      };

      for (let d of originalData) {
        serie.values.push(d);
      }

    series.push(serie);
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
    let segmentedData = this.getSegmentedData(updatedData);
    let aggregatedData = this.getAggregatedData(segmentedData);
    let filteredData = this.filterData(aggregatedData);
    this.setState({
      data: updatedData,
      segmentedData: segmentedData,
      aggregatedData: aggregatedData,
      filteredData: filteredData,
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

  render = () => (
    <div className="col-md">
      <Card type="primary">
        <ConnectedScatterPlotChart data={this.state.filteredData} />
      </Card>
    </div>
  );
}

export default TotalAccumulatedSalesChart;