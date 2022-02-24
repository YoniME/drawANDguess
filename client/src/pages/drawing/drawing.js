import React, { Component } from "react";
import CanvasDraw from "react-canvas-draw";
import { GithubPicker } from 'react-color';
import './drawing.css'
import { TailSpin } from  'react-loader-spinner'
import { Link } from "react-router-dom";

const WIDTH = 400;
const HEIGHT = 400;
const BRUSH_RADIUS = 3;
const LAZY_RADIUS = 10;

class Drawing extends Component {


  state = {
    color: "#ffc600", 
    draw: "",
    word: "",
    wordLevel: 0,
    isDrawing: true,
    isStarted: true,
    intervalId: "",
    newGame: false,
    updatedScore: false
  };

  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.state.newGame = false;
  }

  
  componentDidMount() {
    this.props.setPage(3);
    this.socket.emit('wordToClient',{},(msg) => {
      this.setState({word: msg.word});
      this.setState({wordLevel: msg.level});
      });

  }

  handleChangeComplete = (_color) => {
    this.setState({ color: _color.hex });  
  };

  onSendDrawing(draw){

    this.setState({draw: draw});    
    this.socket.emit('drawingToServer', {drawing: draw}); 
    this.setState({isDrawing: false});
    this.state.intervalId = setInterval(async () => {
      this.socket.emit('endOfGame',{},(msg) => {
        if(msg){
          this.setState({newGame: true});
          clearInterval(this.state.intervalId);                   
}
        if(msg && !this.state.updatedScore){
          this.props.updateScore(this.state.wordLevel);
          this.setState({updatedScore: true});  
        }
      });
    }, 1200);
  }; 
  
  renDrawing(){
    return(
      <div className="container">        
        <h1>Draw the word - {this.state.word}</h1>        
        <h2>Then press Send</h2>         
        <div className="container buttons">
          <button
            className="container buttons button"
            onClick={() => {
              this.saveableCanvas.eraseAll();
            }}
          >
            Erase
          </button>
          <button
            className="container buttons button"
            onClick={() => {
              this.saveableCanvas.undo();
            }}
          >
            Undo
          </button>        
        </div>
        <GithubPicker      
              width="212px"        
              triangle="hide"
              onChangeComplete={ this.handleChangeComplete }
            />
        <div className="canvas">
        <CanvasDraw
          ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
          brushColor={this.state.color}
          brushRadius={BRUSH_RADIUS}
          lazyRadius={LAZY_RADIUS}
          canvasWidth={WIDTH}
          canvasHeight={HEIGHT}
        />
        </div>
        <button
            className="container buttons button"
            onClick={() => {           
              this.onSendDrawing(this.saveableCanvas.getDataURL());
            }}
          >
            Send
          </button>
      </div>
    )
  }

  renWaiting(){
    return(
      <div className="container">
        <h1>{this.state.isStarted ? "Waiting for other player to guess" : "Waiting for other player login"}</h1>
        <TailSpin 
        color="#ffc600"
        size={100}
        ariaLabel="Loading..."
        />
      </div>
    )

  }

  render() {
    return (
      <div>
        {this.state.isDrawing ? !this.state.newGame && this.renDrawing() : !this.state.newGame && this.renWaiting()}
        {this.state.newGame &&
        (<Link className='container'  to="/guessing" style={{ textDecoration: 'none' }}>  
          <button className='container buttons button' onClick={() => this.refreshHandler()}>Go to guessing screen</button>
        </Link>)
        }
      </div>
    );
  }
}

export default Drawing;
