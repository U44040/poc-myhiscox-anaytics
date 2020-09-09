import React, { Component } from 'react';
import Card from '../../components/Shared/Card/Card';
import * as DataGenerator from '../../utils/BarChartRaceDataGenerator';
import * as STATUS from '../../utils/StatusTypes';
import rfdc from 'rfdc';
import * as FILTER_TYPES from '../../utils/FilterTypes';
import moment from 'moment';
import userContext from '../../context/userContext';
import * as ROLES from '../../utils/RoleTypes';
import { Form, Dropdown } from 'react-bootstrap';
import BarChart from './../../components/BarChartRace/BarChart/BarChart';
import Export from '../../components/Shared/Dropdown/Export/Export';

const deepClone = rfdc();
const INTERVAL_REFRESH = 4000;

class BarChartRace extends Component {

  constructor(props) {
    super();
    const actualMoment = moment();
    const data = this.getData();
    this.state = {
      data,
      speed: 100,
      actualMoment,
      segmentType: 'network',
    }
  }

  static contextType = userContext;

  componentDidMount = () => {
    let validData = this.getValidData(this.state.data);
    this.props.updateData(validData);
    this.setIntervalRefresh(INTERVAL_REFRESH);
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
    this.cancelInterval();
  }

  getData = () => {
    return DataGenerator.generateData();
  }

  getValidData = (data) => {

    let validData = deepClone(data);

    validData = validData.map((d) => {
      return {
        ...d,
        projects: d.projects.filter((p) => moment(p.createdAt) <= this.state.actualMoment)
      }
    });

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

    for (let serie of series) {
      let aggregatedSerie = {
        ...serie,
        values: {
          items: [],
          volume: 0,
        },
      };

      for (let d of serie.values) {
        aggregatedSerie.values.items.push(d);
        aggregatedSerie.values.volume += d.volume;
      }

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

  updateData = () => {
    // Update data
    if (this.state.speed == 0) { return }

    let actualMoment = this.state.actualMoment.clone().add(60 * this.state.speed / 100, 'minutes');
    /*
    if (actualMoment.dayOfYear() > moment().dayOfYear()) {
      this.cancelInterval();
    }*/

    //let updatedData = DataGenerator.updateData(this.state.data, actualMoment);
    let validData = this.getValidData(this.state.data);
    let filteredData = this.filterData(validData);
    let segmentedData = this.getSegmentedData(filteredData);
    let aggregatedData = this.getAggregatedData(segmentedData);
    this.setState({
      //data: updatedData,
      filteredData: filteredData,
      actualMoment: actualMoment,
      segmentedData: segmentedData,
      aggregatedData: aggregatedData,
    }, () => this.props.updateData(validData));
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

  changeSegmentation = (e) => {
    this.setState({
      segmentType: e.target.value,
    }, () => {
      this.cancelInterval();
      this.prepareData();
      this.setIntervalRefresh(INTERVAL_REFRESH);
    })
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
      chart = <BarChart segmentType={this.state.segmentType} data={this.state.aggregatedData} />
    }
    return (
      <div className="col-md">
        <Card type="primary">
          <div className="row">
            <div className="col-12">
              <div className="pull-left">
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
                  <Form.Group>
                    <Form.Label>
                      Date: {this.state.actualMoment.format('DD/MM/Y H:m:s')} - Speed:
                    </Form.Label>

                    <input className="mx-sm-3" type="range" min="0" max="200" value={this.state.speed} onChange={this.updateSpeed} /> {this.state.speed}%
                  </Form.Group>
                </Form>
              </div>
              <div className="pull-right">
                <Export excel image />
              </div>
            </div>
          </div>
          {chart}
        </Card>
      </div>
    );
  };
}

export default BarChartRace;