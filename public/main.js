var containerElement = document.getElementById('content');
var signInButton = document.getElementById('sign-in-button');
var dateSelect = document.getElementById('dates_select');
var usersData = document.getElementById('user_data_body');

window.addEventListener('load', function() {
  signInButton.addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });
});

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    signInButton.style.visibility = "hidden";
    onUserLoaded();
  } else {
    signInButton.style.visibility = "visible";
  }
});

function onUserLoaded() {

  var database = firebase.database();
  var reviewsRef = database.ref('reviews/');

  reviewsRef.once('value', function(snapshot) {
    loadDates(reviewsRef, snapshot);
  });
}

function loadDates(reviewsRef, snapshot) {
  snapshot.forEach(function(childSnapshot) {
      var dateTitleDiv = document.createElement('option');
      dateTitleDiv.setAttribute("value", childSnapshot.key)
      dateTitleDiv.innerHTML = childSnapshot.key;
      dateSelect.appendChild(dateTitleDiv);
  });
  containerElement.appendChild(dateSelect);
}

function onDateSelected() {
  var selectedDateValue = dateSelect.value;
  var database = firebase.database();
  database.ref('reviews/').child(selectedDateValue).once('value', function(userSnapshot) {
    loadUserData(userSnapshot);
  });
}

function loadUserData(userSnapshot) {
  while (usersData.firstChild) {
    usersData.removeChild(usersData.firstChild);
  }
  userSnapshot.forEach(function(userChildSpanshot) {
    addUserDiv(userChildSpanshot);
  });
}

function addUserDiv(userChildSpanshot) {
  var userChildKey = userChildSpanshot.key;
  var userChildData = userChildSpanshot.val();

  var trUser = document.createElement("tr");

  var tdName = document.createElement("td");
  tdName.innerHTML = '<b>' + userChildKey + '</b>';
  trUser.appendChild(tdName);

  var tdApprove = document.createElement("td");
  if (userChildData.approved_count) {
    tdApprove.innerHTML = userChildData.approved_count;
  } else {
    tdApprove.innerHTML = 0
  }
  trUser.appendChild(tdApprove);

  var tdReject = document.createElement("td");
  if (userChildData.rejected_count) {
    tdReject.innerHTML = userChildData.rejected_count;
  } else {
    tdReject.innerHTML = 0
  }
  trUser.appendChild(tdReject);

  var tdComment = document.createElement("td");
  if (userChildData.commented_count) {
    tdComment.innerHTML = userChildData.commented_count;
  } else {
    tdComment.innerHTML = 0
  }
  trUser.appendChild(tdComment);

  usersData.appendChild(trUser);
}












