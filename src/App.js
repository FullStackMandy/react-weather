import React, { Component } from "react";
import Weatheroverview from "./Weatheroverview";
import './App.css';

class App extends Component {
  render() {
    return (
      <Weatheroverview
        cities={['Haarlem', 'Aalsmeer']}
      />
    );
  }
}

export default App;
