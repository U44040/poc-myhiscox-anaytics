
import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';

class Export extends Component {

    render = () => {

        return (
            <Dropdown>
                <Dropdown.Toggle>
                    Export
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {this.props.excel ? <Dropdown.Item><span className="fa fa-file-excel-o text-success"></span> As Excel</Dropdown.Item> : ''}
                    {this.props.image ? <Dropdown.Item><span className="fa fa-image text-info"></span> As Image</Dropdown.Item> : ''}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default Export;