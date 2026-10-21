// Module 2: CLASS component with state + lifecycle methods
import { Component } from "react";

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = { now: new Date() };
  }

  // Lifecycle: runs after the component is mounted
  componentDidMount() {
    this.timer = setInterval(() => this.setState({ now: new Date() }), 1000);
  }

  // Lifecycle: runs when state/props change
  componentDidUpdate(prevProps, prevState) {
    // (kept simple - could react to prop changes here)
  }

  // Lifecycle: cleanup before removal
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const { now } = this.state;
    return (
      <div className="hero-clock">
        <h2>{now.toLocaleTimeString()}</h2>
        <p>{now.toDateString()}</p>
        <small>{this.props.label}</small>
      </div>
    );
  }
}

export default Clock;