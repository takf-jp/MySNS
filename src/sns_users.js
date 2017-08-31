import React, {Component} from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import styles from './styles'

export default class SNSUsers extends Component{
	constructor(props){
		super(props)
		this.state = {users: [], jump: '', friends: []}
	}
	componentWillMount(){
		this.loadUsers()
	}
	// get user list and friends
	loadUsers(){
		request
		  .get('/api/get_allusers')
		  .end((err, res) => {
		  	if (err) return
		  	this.setState({users: res.body.users})
		  })
		request
		  .get('/api/get_user')
		  .query({userid: window.localStorage.sns_id})
		  .end((err, res) => {
		  	if (err) return
		  	this.setState({friends: res.body.friends})
		  })
	}
	
	//add friend as other user
	addFriend (friendid) {
		if(!window.localStorage.sns_auth_token){
			window.alert('You need to login')
			this.setState({jump: '/login'})
			return
		}
		request
		  .get('/api/add_friend')
		  .query({
		  	userid: window.localStorage.sns_id,
		  	token: window.localStorage.sns_auth_token,
		  	friendid: friendid
		  })
		  .end((err, res) => {
		  	if (err) return
		  	if (!res.body.status){
		  		window.alert(res.body.msg)
		  		return
		  	}
		  	this.loadUsers()
		  })
	}
	render(){
		if(this.state.jump){
			return <Redirect to = {this.state.jump} />
		}
		const friends = this.state.friends ? this.state.friends : {}
		const ulist = this.state.users.map(id => {
			const btn = (friends[id])
			  ? `You have already followed  ${id}`
			  :  (<button onClick = {eve => this.addFriend(id)}> Follow {id} </button>)
			return (<div key = {'fid_' + id} style={styles.friend}>
			  <img src={'user.png'} width={80} /> {btn}
			</div>)
		})
		return(
			<div>
			  <h1>User Lists</h1>
			  <div> {ulist} </div>
			  <div><br /><a href={'/timeline'}>Go to timeline</a></div>
			</div>
		)
	}
}