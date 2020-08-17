import React, { Component } from 'react';
import BubbleChart from '../../components/Chart/Bubblechart/BubbleChart';
import Card from '../../components/Shared/Card/Card';
import * as DataGenerator from '../../utils/DataGenerator';
import rfdc from 'rfdc';
import * as FILTER_TYPES from '../../components/SidebarFilters/FilterTypes';

const deepClone = rfdc();
const INTERVAL_REFRESH = 1000;

class SalesChart extends Component {

  constructor(props) {
    super();
    const data = this.getData();
    const validData = this.getValidData(data);
    const filteredData = validData;
    this.state = {
      data,
      validData,
      filteredData,
      averageSales: DataGenerator.averageSales,
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
    if (prevProps.filters != this.props.filters) {
      this.setState((oldState, oldProps) => (
        {
          filteredData: this.filterData(oldState.validData)
        }
      ));
    }
  }

  getData = () => {
    const data = DataGenerator.generateData();
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
          for (let state of filteredData) {
            if (filters.includes(this.concatTypeValue(FILTER_TYPES.STATUS, state.state)) == false) {
              state.projects = [];
            }
          }
          break;

        case FILTER_TYPES.BROKER:
          for (let state of filteredData) {
            state.projects = state.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.BROKER, d.user.brokerage.id)));
          }
          break;

        case FILTER_TYPES.NETWORK:
          for (let state of filteredData) {
            state.projects = state.projects.filter(d => filters.includes(this.concatTypeValue(FILTER_TYPES.NETWORK, d.user.brokerage.network.id)));
          }
          break;
      }
    }

    return filteredData;
  }

  updateData = () => {
    // Update data
    let updatedData = DataGenerator.updateData(this.state.data);
    let validData = this.getValidData(updatedData);
    let filteredData = this.filterData(validData);
    this.setState({
      data: updatedData,
      validData: validData,
      filteredData: filteredData,
    }, () => this.props.updateData(validData));
  }

  setIntervalRefresh = (interval) => {
    window.setInterval(this.updateData, interval);
  }

  render = () => (
    <div className="col-md">
      <Card type="primary" /* header="Venta de pólizas" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando"*/ >
        <BubbleChart data={this.state.filteredData} />
      </Card>
    </div>
  );
}

export default SalesChart;