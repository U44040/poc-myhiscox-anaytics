import React, { Component } from 'react';
import BubbleChart from '../../components/Chart/Bubblechart/BubbleChart';
import Card from '../../components/Shared/Card/Card';

import * as DataGenerator from '../../utils/DataGenerator';

const INTERVAL_REFRESH = 1000;

class SalesChart extends Component {

  constructor(props) {
    super();
    const data = this.getData();
    const validData = this.getValidData(data);
    this.state = {
      data,
      validData,
      averageSales: DataGenerator.averageSales,
    }
  }

  componentDidMount = () => {
    this.props.updateData(this.state.validData);
    this.setIntervalRefresh(INTERVAL_REFRESH);
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

  updateData = () => {
    // Update data
    let updatedData = DataGenerator.updateData(this.state.data);
    let validData = this.getValidData(updatedData);
    this.setState({
      data: updatedData,
      validData: validData,
    }, () => this.props.updateData(validData));
  }

  setIntervalRefresh = (interval) => {
    window.setInterval(this.updateData, interval);
  }

  render = () => (
    <div className="col-md">
      <Card type="primary" header="Venta de pólizas" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando">
        <BubbleChart data={this.state.validData} />
      </Card>
    </div>
  );
}

export default SalesChart;