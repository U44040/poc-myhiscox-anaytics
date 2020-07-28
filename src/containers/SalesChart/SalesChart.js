import React, { Component } from 'react';
import BubbleChart from '../../components/Chart/Bubblechart/BubbleChart';
import Card from '../../components/Shared/Card/Card';

class SalesChart extends Component
{

  state = {
    
  }

  render = () => (
    <React.Fragment>
      <div className="col-md">
          <Card type="primary" header="Venta de pólizas" title="Tiempo real" text="Gráfica en tiempo real de las pólizas que se están creando">
              <BubbleChart />
          </Card>
      </div>
    </React.Fragment>
  );
}

export default SalesChart;