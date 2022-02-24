

import React from "react";
import "./welcome.css";
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

class Welcome extends React.Component {

  state = {
    name: "",
    role: ""
  }

  
  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.socket.emit('getRole',{},(msg) => {
      this.state = {role: msg};
    });
  }


  componentDidMount(){
    this.socket.emit('getRole',{},(msg) => {
      this.setState({role: msg});
    });
    this.props.setPage(1);  
  }

  handleSubmit() {

    this.socket.emit('join', {name: this.state.name}, (msg) => {           
    });
    this.props.setName(this.state.name);
  }

  getNextPage() {    
    return this.state.role == 'd' ? "/wordChoosing" : "/guessing";     
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">  
          <div className="welcome-container">     
          Welcome to Draw {'&'} Guess game  
          </div>
          <form>
            <label>Enter your name:
              <input 
                type="text"
                onChange={(e) => this.setState({name: e.target.value})}
              />              
            </label>
            <Link to={this.getNextPage()}>
              <Button type="button" onClick={() => this.handleSubmit()}>start</Button>
            </Link>
          </form>
        </header>
      </div>
    );
  }
}

export default Welcome;