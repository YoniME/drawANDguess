import React, { Component } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route}
	from 'react-router-dom';
import WordChoosing from './pages/wordChoosing/wordChoosing';
import Drawing from './pages/drawing/drawing';
import Guessing from './pages/guessing/guessing';
import Welcome from './pages/welcome/welcome';
import io from "socket.io-client";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const endPoint = "http://localhost:3000";

class App extends Component {
	
	state = {
		currentPage: 0,
		player1Name:"",
		player2Name:"",
		player1Score:0,
		player2Score:0,
		currentPlayer: 1
	}

	constructor(props) {
		super(props);
		this.socket = io(endPoint);	
		this.setPage = this.setPage.bind(this);
		this.setName = this.setName.bind(this);
		this.updateScore = this.updateScore.bind(this);
		this.renderScore = this.renderScore.bind(this);

	}

	componentDidMount() {

	}


	setPage(number) {
		this.setState({currentPage: number});
	}

	setName() {
		this.socket.emit("getPlayersNames", {} , (data) => {
			this.setState({player1Name: data.one, player2Name: data.two});
		});
		// this.socket.emit("getAmountOfUsers",{},(data) => {
		// 	this.setState({currentPlayer: data});
		// });
	}

	renderScore(){
		this.socket.emit("getScore", {}, (data) => {
			this.setState({player1Score: data.one, player2Score: data.two});
		});
		this.setState({currentPlayer: this.state.currentPlayer == 1 ? 2 : 1});
	}

	updateScore(pointsToAdd){		
		if(this.state.currentPlayer == 1){
			const s = this.state.player1Score + pointsToAdd;
			this.setState({player1Score: s});
		}
		else{
			const s = this.state.player2Score + pointsToAdd;
			this.setState({player2Score: s});
		}
		this.setState({currentPlayer: this.state.currentPlayer == 1 ? 2 : 1});	
		this.socket.emit("updateScore", {one: this.state.player1Score, two: this.state.player2Score});
		
	}
	
	render() {	
		return (
			<Router>
			<div className='wrapper'>
				<div className={this.state.currentPage == 1 ? 'wrapper item selected' : 'wrapper item'} >
					Welcome
				</div>
				<div className={this.state.currentPage == 2 ? 'wrapper item selected' : 'wrapper item'}>
					Word Choosing
				</div>
				<div className={this.state.currentPage == 3 ? 'wrapper item selected' : 'wrapper item'}>
					Drawing
				</div>
				<div className={this.state.currentPage == 4 ? 'wrapper item selected' : 'wrapper item'}>
					Guessing
				</div>
        	</div>
			<div className='players'>
				<div>
					{this.state.player1Name == "" ? "Player 1" : this.state.player1Name}
					- {this.state.player1Score}
				</div>
				<div>
					{this.state.player2Name == "" ? "Player 2" : this.state.player2Name}
					- {this.state.player2Score}
				</div>
			</div>
			<Routes>
				<Route path='/' element={<Welcome setPage={this.setPage} setName={this.setName} socket={this.socket}/>}/>
				<Route path='/wordChoosing' element={<WordChoosing setPage={this.setPage} setName={this.setName} socket={this.socket}/>} />
				<Route path='/drawing' element={<Drawing setPage={this.setPage} socket={this.socket} updateScore={this.updateScore} />}/>
				<Route path='/guessing' element={<Guessing setPage={this.setPage} socket={this.socket} renderScore={this.renderScore}/>} />
			</Routes>
			</Router>
		);
	}
}

export default App;
