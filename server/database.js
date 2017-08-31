const path = require('path')
const NeDB = require('nedb')

const userDB = new NeDB({
	filename: path.join(__dirname, 'user.db'),
	autoload: true
})
const timelineDB = new NeDB({
	filename: path.join(__dirname, 'timeline.db'),
	autoload: true
})

//get hash
function getHash (pw) {
	const salt = '::EVuCMOQwfI48Krpr'
	const crypto = require('crypto')
	const hashsum = crypto.createHash('sha512')
	hashsum.update(pw + salt)
	return hashsum.digest('hex')
}

//generate auth token
function getAuthToken (userid) {
	const time = (new Date()).getTime()
	return getHash(`${userid}:${time}`)
}
//Find user
function getUser (userid, callback) {
	userDB.findOne({userid}, (err, user) => {
	if(err || user === null) return callback(null)
	callback(user)
	})
}

//Add new user
function addUser (userid, passwd, callback){
	const hash = getHash(passwd)
	const token = getAuthToken(userid)
	const regDoc = {userid, hash, token, friends: {}}
	userDB.insert(regDoc, (err, newdoc) => {
    if (err) return callback(null)
    callback(token)
	})
}

//step: Login
function login (userid, passwd, callback){
  const hash = getHash(passwd)
  const token = getAuthToken(userid)
  //get user info
  getUser(userid, (user) => {
  	if (!user || user.hash !== hash){
  		return callback(new Error('Authorization error'), null)
  	}
  	// update token
  	user.token = token
  	updateUser(user, (err) => {
  		if (err) return callback(err, null)
  		callback(null, token)
  	})
  })
}
//check auth token
function checkToken (userid, token, callback){
  getUser(userid, (user) => {
  	if (!user || user.token !== token){
  		return callback(new Error('Authorization error'), null)
  	}
  	callback(null, user)
  })
}
//update user info
function updateUser (user, callback){
	userDB.update({userid: user.userid}, user, {}, (err, n) => {
		if (err) return callback(err, null)
		callback(null)
	})
}
//get friends' timeline
function getFriendTimeline (userid, token, callback){
	checkToken(userid, token, (err, user) => {
		if (err) return callback(new Error('Authorization Error'), null)
		
		const friends = []
		for (const f in user.friends) friends.push(f)
		friends.push(userid)
		//get per 20 posts
		timelineDB
		  .find({userid: {$in: friends}})
		  .sort({time: -1})
		  .limit(20)
		  .exec((err, docs) => {
		  	if (err) {
		  		callback(new Error('DB Error'), null)
		  		return
		  	}
		  	callback(null, docs)
		  })
	})
}

module.exports = {
	userDB, timelineDB, getUser, addUser, login, checkToken, updateUser, getFriendTimeline
}