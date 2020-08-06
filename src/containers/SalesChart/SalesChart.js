import React, { Component } from 'react';
import BubbleChart from '../../components/Chart/Bubblechart/BubbleChart';
import Card from '../../components/Shared/Card/Card';

import * as DataGenerator from '../../utils/DataGenerator';

class SalesChart extends Component {

  constructor(props) {
    super();
    this.state = {
      data: this.getData(),
      averageSales: DataGenerator.averageSales,
    }
  }
  
  getData = () => {
    const data = DataGenerator.generateData();

    // return only projects with elapsed time > 0. (<0 are future projects)
    return data.map((d) => {
      return {
        ...d,
        projects: d.projects.filter((p) => p.elapsedTime >= 0)
      }
    });
  }

  handleClick = () => {
      this.setState({
          data: this.getData()
      })
  }

  render = () => (
    <React.Fragment>
      <div className="col-md">
        <Card type="primary" header="Venta de pólizas" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando">
          <BubbleChart data={this.state.data} />
          <button className="btn btn-primary" onClick={this.handleClick}>Actualizar</button>
        </Card>
      </div>
    </React.Fragment>
  );
}

export default SalesChart;