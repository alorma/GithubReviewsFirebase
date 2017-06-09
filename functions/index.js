const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const crypto = require('crypto');
const secureCompare = require('secure-compare');
const moment = require('moment');

exports.githubWebhook = functions.https.onRequest((req, res) => {
  const cipher = 'sha1';
  const signature = req.headers['x-hub-signature'];

  // TODO: Configure the `github.secret` Google Cloud environment variables.
  const hmac = crypto.createHmac(cipher, functions.config().github.secret)
      // The JSON body is automatically parsed by Cloud Functions so we re-stringify it.
      .update(JSON.stringify(req.body, null, 0))
      .digest('hex');
  const expectedSignature = `${cipher}=${hmac}`;

  // Check that the body of the request has been signed with the GitHub Secret.
  if (secureCompare(signature, expectedSignature)) {
	processRequest(req, res);
  } else {
    console.error('x-hub-signature', signature, 'did not match', expectedSignature);
    res.status(403).send('Your x-hub-signature\'s bad and you should feel bad!');
  }
});

function processRequest(req, res) {
	var payload = req.body;
	if (payload.review && payload.repository) {
		var repository = payload.repository;
		var review = payload.review;
		var user = review.user;
		if (user.login != "service-engprod") {
			sendResponseToGithub(res, user, review);
			sendReviewToDatabase(review.state, user, review, repository);
		}
	} else {
		res.status(200).send('Not PullRequest Review');
	}
}

function sendReviewToDatabase(rState, rUser, review, repository) {
	if (rState !== 'pending') {
		var repo = {
			id: repository.id,
			name: repository.owner.login + "_" + repository.name
		}

		var date = moment(review.submitted_at);

		var day   = date.format('DD');
		var month = date.format('MM');
		var year  = date.format('YYYY');

		var dayRef = admin.database().ref("repos").child(repo.name).child('reviews').child(year + '-' + month + '-' + day);

		var userRef = dayRef.child(rUser.login);

		var stateName = rState;
		if (rState == 'rejected') {
			stateName = 'changes_requested';
		}
		userRef.child(stateName + '_count').transaction(function(count) {
			return (count || 0) + 1;
		});

		var userObject = {
			login: rUser.login,
			avatar: rUser.avatar_url
		};
		userRef.child('login').set(rUser.login);
		userRef.child('avatar').set(rUser.avatar_url);
	}
}

function sendResponseToGithub(res, user, review) {
	var reviewResponse = {
		user: user.login,
		state: review.state,
		link: review._links.html.href
	};
  	res.send(JSON.stringify(reviewResponse));
}






