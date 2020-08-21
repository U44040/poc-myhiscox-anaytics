import React, { Component } from 'react';
import BubbleChart from '../../components/Chart/Bubblechart/BubbleChart';
import Card from '../../components/Shared/Card/Card';
import * as DataGenerator from '../../utils/DataGenerator';
import * as STATUS from '../../utils/StatusTypes';
import rfdc from 'rfdc';
import * as FILTER_TYPES from '../../components/SidebarFilters/FilterTypes';
import moment from 'moment';

const deepClone = rfdc();
const INTERVAL_REFRESH = 1000;

class SalesChart extends Component {

  constructor(props) {
    super();
    const actualMoment = moment().hour(8).minute(0).second(0);
    const data = this.getData(actualMoment);
    const validData = this.getValidData(data);
    const filteredData = validData;
    this.state = {
      data,
      validData,
      filteredData,
      averageSales: DataGenerator.averageSales,
      speed: 100,
      actualMoment,
    }
  }

  componentDidMount = () => {
    this.props.updateData(this.state.validData);
    this.setIntervalRefresh(INTERVAL_REFRESH);
    this.setState((oldState, oldProps) => ({
      filteredData: this.filterData(oldState.validData)
    }))
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.filters != this.props.filters || prevProps.specialFilters != this.props.specialFilters) {
      this.setState((oldState, oldProps) => (
        {
          filteredData: this.filterData(oldState.validData)
        }
      ));
    }
  }

  getData = (actualMoment) => {
    const data = DataGenerator.generateData(actualMoment);
    return data;
  }

  getValidData = (data) => {
    // return only projects with elapsed time > 0. (<0 are future projects)
    return data.map((d) => {
      return {
        ...d,
        projects: d.projects.filter((p) => p.elapsedTime >= 0)
      }
    })
  }

  concatTypeValue = (type, value) => (type + "_" + value);

  filterData = (data) => {
    let filteredData = deepClone(data);
    for (let filterType in this.props.filters){
      let filters = this.props.filters[filterType].map(d=>d.value);
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
      let filters = this.props.filters[FILTER_TYPES.STATUS].map(d=>d.value);
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
    let validData = this.getValidData(updatedData);
    let filteredData = this.filterData(validData);
    this.setState({
      data: updatedData,
      validData: validData,
      filteredData: filteredData,
      actualMoment: actualMoment,
    }, () => this.props.updateData(validData));
  }

  setIntervalRefresh = (interval) => {
    let windowInterval = window.setInterval(this.updateData, interval);
    this.setState({
      interval: windowInterval,
    });
  }

  cancelInterval  = () => {
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
      <Card type="primary" /* header="Venta de pólizas" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando"*/ >
        <div>
          Hora: {this.state.actualMoment.format('HH:mm:ss')} - Velocidad: <input type="range" min="0" max="200" value={this.state.speed} onChange={this.updateSpeed} /> {this.state.speed}%
        </div>
        <BubbleChart data={this.state.filteredData} />
      </Card>
    </div>
  );
}

export default SalesChart;