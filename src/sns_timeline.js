import React, {Component} from 'react'
import request from 'superagent'
import styles from './styles'

export default class SNSTimeline extends Component{
	constructor(props){
		super(props)
		this.state = { timelines: [], comment: ''}
	}
	componentWillMount(){
		this.loadTimelines()
	}
	loadTimelines(){
		request
		  .get('/api/get_friends_timeline')
		  .query({
		  	userid: window.localStorage.sns_id,
		  	token: window.localStorage.sns_auth_token
		  })
      .end((err, res) =>{
      	if (err) return
      	this.setState({timelines: res.body.timelines})
      })
	}
	post(){
		request
		  .get('/api/add_timeline')
		  .query({
		  	userid: window.localStorage.sns_id,
		  	token: window.localStorage.sns_auth_token,
		  	comment: this.state.comment
		  })
		  .end((err, res) =>{
		  	if (err) return
		  	this.setState({comment: ''})
		  	this.loadTimelines()
		  })
	}
	render(){
		//render timeline as a row
		const timelines = this.state.timelines.map(e => {
			return(
			  <div key = {e._id} style = {styles.timeline}>
			    <img src={'user.png'} style={styles.tl_img} />
			    <div style={styles.userid}>{e.userid}:</div>
			    <div style={styles.comment}>{e.comment}</div>
			    <p style={{clear: 'both'}} />
			  </div>
			)
		})
		return(
		  <div>
		    <h1>Timeline</h1>
		    <div>
		      <input value={this.state.comment} size={40}
		        onChange={e => this.setState({comment: e.target.value})} />
		      <button onClick={e => this.post()}>Post</button>
		    </div>
		    <div>{timelines}</div>
		    <hr />
		    <p><a href={'/users'}>Follow other user</a></p>
		    <p><a href={'/login'}>Login</a></p>
      </div>
		)
	}
}