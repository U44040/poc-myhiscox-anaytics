import React, { Component } from 'react';
import BubbleChart from '../../components/Chart/Bubblechart/BubbleChart';
import Card from '../../components/Shared/Card/Card';

import * as DataGenerator from '../../utils/DataGenerator';

const INTERVAL_REFRESH = 1000;

class SalesChart extends Component {

  constructor(props) {
    super();
    const data = this.getData();
    const filteredData = this.filterData(data);
    this.state = {
      data,
      filteredData,
      averageSales: DataGenerator.averageSales,
    }
  }

  componentDidMount = () => {
    this.setIntervalRefresh(INTERVAL_REFRESH);
  }

  getData = () => {
    const data = DataGenerator.generateData();
    return data;
  }

  filterData = (data) => {
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
    this.setState({
      data: updatedData,
      filteredData: this.filterData(updatedData),
    })
  }

  setIntervalRefresh = (interval) => {
    window.setInterval(this.updateData, interval);
  }

  render = () => (
    <div className="col-md">
      <Card type="primary" header="Venta de pólizas" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando">
        <BubbleChart data={this.state.filteredData} />
      </Card>
    </div>
  );
}

export default SalesChart;