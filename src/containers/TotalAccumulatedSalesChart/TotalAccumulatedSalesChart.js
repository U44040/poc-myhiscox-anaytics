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
import { Form, Row, Col } from 'react-bootstrap';

const deepClone = rfdc();
const INTERVAL_REFRESH = 1000;

class TotalAccumulatedSalesChart extends Component {

  constructor(props) {
    super();
    const actualMoment = moment().hour(8).minute(0).second(0);
    const data = this.getData();
    this.state = {
      data,
      speed: 100,
      actualMoment,
      segmentType: '',
      aggregatedBy: 'month',
    }
  }

  static contextType = userContext;

  componentDidMount = () => {
    let validData = this.getValidData(this.state.data);
    this.props.updateData(validData);
    //this.setIntervalRefresh(INTERVAL_REFRESH);
    this.setState((oldState, oldProps) => {
      let filteredData = this.filterData(validData);
      let segmentedData = this.getSegmentedData(filteredData);
      let aggregatedData = this.getAggregatedData(segmentedData);

      return {
        validData,
        filteredData,
        segmentedData,
        aggregatedData,
      }
    })
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.filters != this.props.filters || prevProps.dateFilters != this.props.dateFilters || prevProps.specialFilters != this.props.specialFilters) {
      this.setState((oldState, oldProps) => {
        let filteredData = this.filterData(oldState.validData);
        let segmentedData = this.getSegmentedData(filteredData);
        let aggregatedData = this.getAggregatedData(segmentedData);
        return {
          filteredData,
          segmentedData,
          aggregatedData,
        }
      }/*, () => this.props.updateData(this.state.filteredData)*/);
    }
  }

  componentWillUnmount = () => {
    //this.cancelInterval();
  }

  getData = () => {
    return DataGenerator.generateData();
  }

  getValidData = (data) => {

    let validData = deepClone(data);

    if (this.context && this.context.user) {
      let user = this.context.user;

      switch (user.role) {
        case ROLES.NETWORK_MANAGER_ROLE:
          validData = validData.map((d) => {
            return {
              ...d,
              projects: d.projects.filter((p) => p.user.brokerage.network.id == user.network)
            }
          })
          break;

        case ROLES.BROKERAGE_MANAGER_ROLE:
          validData = validData.map((d) => {
            return {
              ...d,
              projects: d.projects.filter((p) => p.user.brokerage.id == user.brokerage && p.user.brokerage.network.id == user.network)
            }
          })
          break;

        case ROLES.USER_ROLE:
          validData = validData.map((d) => {
            return {
              ...d,
              projects: d.projects.filter((p) => p.user.id == user.id)
            }
          })
          break;

        default:
          break;
      }

    }

    return validData;
  }

  getSegmentedData = (data) => {

    let series;

    if (this.state.segmentType) {
      let differentValues = {};

      for (let d of data) {
        for (let project of d.projects) {
          let segmentationObject;
          switch (this.state.segmentType) {
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
          switch (this.state.segmentType) {
            case 'network':
              value.projects = value.projects.filter(p => p.user.brokerage.network.id == d.id);
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

      let values = deepClone(data);
      for (let value of values) {
        value.volume = value.projects.reduce((accumulator, current) => (accumulator += current.totalRate), 0);
      }

      series = [
        {
          id: 0,
          label: 'Total',
          values: values,
        }
      ];
    }
    return series;
  }

  getAggregatedData = (data) => {
    let series = deepClone(data);
    let aggregatedSeries = [];

    let dateFormat = '';

    switch (this.state.aggregatedBy) {
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

    if (this.props.dateFilters) {
      let startDate = moment(this.props.dateFilters.startDate);
      let endDate = moment(this.props.dateFilters.endDate);

      if (startDate.isValid() && endDate.isValid()) {
        let dateFilteredData = [];

        for (let item of filteredData) {
          let day = moment(item.date);
          if (day >= startDate && day <= endDate) {
            dateFilteredData.push(item);
          }
        }

        filteredData = dateFilteredData;
      }

    }

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


    return filteredData;
  }

  /*updateData = () => {
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
      actualMoment: actualMoment,
      segmentedData: segmentedData,
      aggregatedData: aggregatedData,
    }, () => this.props.updateData(updatedData));
  }*/

  /*setIntervalRefresh = (interval) => {
    let windowInterval = window.setInterval(this.updateData, interval);
    this.setState({
      interval: windowInterval,
    });
  }*/

  /*cancelInterval = () => {
    window.clearInterval(this.state.interval);
  }*/

  /*updateSpeed = (e) => {
    this.setState(
      {
        speed: e.target.value,
      }
    )
  }*/

  changeSegmentation = (e) => {
    this.setState({
      segmentType: e.target.value,
    }, () => this.prepareData())
  }

  prepareData = () => {
    let segmentedData = this.getSegmentedData(this.state.filteredData);
    let aggregatedData = this.getAggregatedData(segmentedData);

    this.setState({
      segmentedData,
      aggregatedData,
    })
  }

  render = () => {
    let chart = '';
    if (this.state.aggregatedData) {
      chart = <ConnectedScatterPlotChart segmentType={this.state.segmentType} data={this.state.aggregatedData} />
    }
    return (
      <div className="col-md">
        <Card type="primary">
          <div className="row">
            <div className="col-12">
              <Form inline>
                <Form.Group>
                  <Form.Label>
                    Segmentation
                </Form.Label>
                  <Form.Control className="mx-sm-3" as="select" value={this.state.segmentType} onChange={this.changeSegmentation}>
                    <option value="">Total</option>
                    <option value="broker">Broker</option>
                    <option value="brokerage">Brokerage</option>
                    <option value="network">Network</option>
                  </Form.Control>
                </Form.Group>
              </Form>
            </div>
          </div>
          {chart}
        </Card>
      </div>
    );
  };
}

export default TotalAccumulatedSalesChart;