import React from 'react';
import { TailSpin } from  'react-loader-spinner'
import './guessing.css'
import { Link } from "react-router-dom";

  
class Guessing extends React.Component {

  state = {
    draw: "",
    guess: "",
    loading: true,
    intervalId: "",
    correctAnswer: "",
    input:"",
    isCorrect: false,
    amountOfGuesses: 0

  };

  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.state = {draw:"", guess:"", loading: true, isCorrect: false, amountOfGuesses: 0} ;    
  }

  componentDidMount() {
    this.props.setPage(4);
    if(this.state.loading != false){
      this.intervalId = setInterval(async () => {
        this.refreshHandler();
        if(this.state.loading == false) {
          clearInterval(this.intervalId) 
          this.socket.emit('wordToClient',{},(msg) => {
            this.state.correctAnswer = msg.word;
            });       
        }
        }, 2000);
      }
  }

  isWaiting() {
    if(this.state.loading) {
      return (
        <div className='container'>
          <h2>Waiting for other player to draw</h2>
          <TailSpin 
          color="#ffc600"
          size={100}
          ariaLabel="Loading..."
          />
        </div>
      )

    }

  }

  checkGuess() {   
    if(this.state.correctAnswer == this.state.input) {
      this.setState({isCorrect: true});
      alert("Correct Answer! now its your turn to draw");
      this.socket.emit('newGame',{amountOfGuesses: this.state.amountOfGuesses},(msg) => {
        this.state.correctAnswer = msg.word;
        });


    } else {
      alert("Incorrect! try again...");
      this.setState({amountOfGuesses: this.state.amountOfGuesses + 1});
    }
  }

  showDrawing() {
    if(this.state.draw !== "") {
      return (
        <div className='container'>
          <form>
                <label>
                  Enter your guess:
                </label>
                <input type="text" name="name" className='item' onChange={(e)=>{this.setState({input:e.target.value})}}/>
                <button type="button" value="Submit" onClick={() => this.checkGuess()}> Submit </button>
          </form>   
          <img 
          className='canvas'
          src={this.state.draw}
          alt="new"
          />
        </div>)
    }
  }

  refreshHandler() {
    this.socket.emit('getDrawing');
    this.socket.on('drawToClient', (draw) => {
      this.setState({
        draw: draw.draw
      });      
    });
    if(this.state.draw != "") {
      this.setState({
        loading: false
      });
    }
  }

  moveToDraw() {
    this.props.renderScore();
  }

  render() {
    return (
      <div className='container'>
        {!this.state.isCorrect && <h1>Guessing</h1>}
        {this.state.loading ? (
        <div className='container waiting'>
          {!this.state.isCorrect && this.isWaiting()}
        </div>
        ) : 
        (<div>
          {!this.state.isCorrect && this.showDrawing()}
        </div>)
        }
        {this.state.isCorrect &&
        <Link className='container'  to="/wordChoosing" style={{ textDecoration: 'none' }}>  
          <button className='button' onClick={() => this.moveToDraw()}>Start your turn</button>
        </Link>
        }
      </div>
    );
  }
};
  
export default Guessing;