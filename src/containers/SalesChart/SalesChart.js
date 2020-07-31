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

    let data = DataGenerator.generateData();
    console.log(data);

    return data;
    
    /*let numItems = 20 + Math.floor(20 * Math.random())
    let data = [];
    const state = ['State1', 'State2'];
    for (let i = 0; i < numItems; i++) {
      data.push({
        x: Math.random()*5,
        y: Math.random()*200-100,
        z: Math.random(),
        colour: state[i % 2],
        isClean: (i % 2 == 0),
      })
    }
    return data*/
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