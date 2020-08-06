import React, { Component } from 'react';
import BubbleChart from '../../components/Chart/Bubblechart/BubbleChart';
import Card from '../../components/Shared/Card/Card';

import * as DataGenerator from '../../utils/DataGenerator';

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
    this.setIntervalRefresh(1000);
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

  handleClick = () => {
    // Update data
    let updatedData = DataGenerator.updateData(this.state.data);
    this.setState({
      data: updatedData,
      filteredData: this.filterData(updatedData),
    })
  }

  setIntervalRefresh = (interval) => {
    window.setInterval(this.handleClick, interval);
  }

  render = () => (
    <React.Fragment>
      <div className="col-md">
        <Card type="primary" header="Venta de pólizas" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando">
          <BubbleChart data={this.state.filteredData} />
          <button className="btn btn-primary" onClick={this.handleClick}>Actualizar</button>
        </Card>
      </div>
    </React.Fragment>
  );
}

export default SalesChart;