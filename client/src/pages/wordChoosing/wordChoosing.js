
import React, { useState } from 'react';
import randomWords from 'random-words';
import "./wordChoosing.css";
import ReactTooltip from 'react-tooltip'
import { Link } from "react-router-dom";
import { TailSpin } from  'react-loader-spinner'
  

export class WordChoosing extends React.Component {

  state = {
    chosenWord: "",
    easyWord: "",
    mediumWord: "",
    hardWord: "",
    isStarted: false,
    intervalId: ""
  };

  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.socket.emit('getAmountOfUsers', {}, (msg) => {
      if(msg.amount == 2){
        this.state = {isStarted : true};
      }
    });
  }

  componentDidMount() {
    this.props.setPage(2);

    this.setState({ easyWord : randomWords({exactly: 1, minLength:3, maxLength: 3}),
                    mediumWord : randomWords({exactly: 1, minLength:5, maxLength: 5}),
                    hardWord : randomWords({exactly: 1, minLength:7, maxLength: 7})});

    
    if(this.state.isStarted == false){
      this.intervalId = setInterval(async () => {
        this.refreshHandler();
        }, 1000);
      }

     
  }

  refreshHandler() {
    this.socket.emit('getAmountOfUsers', {}, (msg) => {
      if(msg == 2) {
        clearInterval(this.intervalId)
        this.props.setName();
        this.setState({isStarted: true});        
      }
    });    
  }


  sendWordToServer(level){
    var word = "";
    if(level == 1){
      word = this.state.easyWord;
    }
    else if(level == 3){
      word = this.state.mediumWord;
    }
    else if(level == 5){
      word = this.state.hardWord;
    }
    this.socket.emit('wordToServer', {_word: word, _level: level});
  }


  renWaiting(){
    return(
      <div className="container">
        <h1>{"Waiting for other player login"}</h1>
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
      <div className='App'>
        {this.state.isStarted ? (<header className="App-header">
          <h1>Please choose the word you want to draw</h1>
          <Link className='container'  to="/drawing" style={{ textDecoration: 'none' }}>             
            <button className='container button' onClick={() => this.sendWordToServer(1)} data-tip data-for="easyTip">{this.state.easyWord}</button>
            <ReactTooltip id="easyTip" place="left" effect="solid">Easy - 1 point</ReactTooltip>          
            <button className='container button' onClick={() => this.sendWordToServer(3)} data-tip data-for="mediumTip">{this.state.mediumWord}</button>
            <ReactTooltip id="mediumTip" place="left" effect="solid">Medium - 3 points</ReactTooltip>            
            <button className='container button' onClick={() => this.sendWordToServer(5)} data-tip data-for="hardTip">{this.state.hardWord}</button>
            <ReactTooltip id="hardTip" place="left" effect="solid">Hard - 5 points</ReactTooltip>
          </Link>
        </header>) : this.renWaiting()}
      </div>
     
    );
}
}


export default WordChoosing;