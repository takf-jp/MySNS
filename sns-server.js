//DB接続
const db = require('./server/database')

//Server起動
const express = require('express')
const app = express()
const portNo = process.env.PORT || 8080
app.listen(portNo, () => {
	console.log('Started!',`http://localhost:${portNo}`)
})

//API
//Add users
app.get('/api/adduser', (req, res) =>{
	const userid = req.query.userid
	const passwd = req.query.passwd
	if( userid === '' || passwd === ''){
		return res.json({status: false, msg: 'Warning: Parameter is blank!'})
	}
	//when the user already exists
	db.getUser(userid, (user) => {
		if (user) {
			return res.json({status: false, msg: 'The user already exists...'})
		}
		// create new user
		db.addUser(userid, passwd, (token) => {
			if(!token){
				res.json({status:false, msg:'DB error'})
			}
			res.json({status:true, token})
		})
	})
})
 
// API: User login
app.get('/api/login', (req, res) => {
	const userid = req.query.userid
	const passwd = req.query.passwd
	db.login(userid, passwd, (err, token) => {
		if (err) {
			res.json({status: false, msg: 'Authorization error'})
			return
		}
		// if succeeded, return token
		res.json({status: true, token})
	})
})

//API: add friend user
app.get('/api/add_friend', (req, res) => {
	const userid = req.query.userid
	const token = req.query.token
	const friendid = req.query.friendid
	db.checkToken(userid, token, (err, user) => {
		if (err) {
			res.json({status: false, msg: 'Authorization error'})
			return
		}
		// adding friend
		user.friends[friendid] = true
		db.updateUser(user, (err) => {
			if (err) {
				res.json({status: false, msg: 'DB erroe'})
				return
			}
			res.json({status: true})
		})
	})
})

//post to timeline
app.get('/api/add_timeline', (req, res) => {
	const userid = req.query.userid
	const token = req.query.token
	const comment = req.query.comment
	const time = (new Date()).getTime()
	db.checkToken(userid, token, (err, user) => {
		if (err){
			res.json({status: false, msg: 'Authorization error'})
		  return
		}
		//add posts timeline
		const item = {userid, comment, time}
		db.timelineDB.insert(item, (err, it) => {
			if (err){
				res.json({status: false, msg: 'DB error'})
				return
			}
			res.json({status: true, timelineid: it._id})
		})
	})
})
//get user list
app.get('/api/get_allusers', (req, res) => {
	db.userDB.find({}, (err, docs) => {
		if(err) return res.json({status: false})
		const users = docs.map(e => e.userid)
		res.json({status: true, users})
	})
})
//get user information
app.get('/api/get_user', (req, res) => {
	const userid = req.query.userid
  db.getUser(userid, (user) => {
  	if (!user) return res.json({status:false})
  	res.json({status:true, friends: user.friends})
  })
})

//get friends' post
app.get('/api/get_friends_timeline', (req, res) => {
	const userid = req.query.userid
	const token = req.query.token
	db.getFriendTimeline(userid, token, (err, docs) => {
		if (err) {
			res.json({status:false, msg: err.toString()})
			return
		}
		res.json({status:true, timelines: docs})
	})
})

app.use('/public', express.static('./public'))
app.use('/login', express.static('./public'))
app.use('/users', express.static('./public'))
app.use('/timeline', express.static('./public'))
app.use('/', express.static('./public'))