var containerElement = document.getElementById('content');
var signInButton = document.getElementById('sign-in-button');
var dateSelect = document.getElementById('dates_select');
var repoSelect = document.getElementById('repo_select');
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
  var reposRef = database.ref('repos/');

  reposRef.once('value', function(snapshot) {
    onReposLoaded(snapshot);
  });
}

function onReposLoaded(snapshot) {
  var used = false;
  snapshot.forEach(function(childSnapshot) {
      var repoTitleOption = document.createElement('option');
      repoTitleOption.setAttribute("value", childSnapshot.key)
      repoTitleOption.innerHTML = childSnapshot.key;
      repoSelect.appendChild(repoTitleOption);
      if (!used) {
        onRepoSelected(childSnapshot.key);
        used = true;
      }
  });
}

function onRepoSelected() {
  var selectedRepoValue = repoSelect.value;
  onSelectedRepo(selectedRepoValue);
}

function onSelectedRepo(repoKey) {
  var database = firebase.database();
  var reviewsRef = database.ref("repos/").child(repoKey).child('reviews/');

  reviewsRef.once('value', function(snapshot) {
    loadDates(snapshot);
  });
}

function loadDates(snapshot) {
  var used = false;
  snapshot.forEach(function(childSnapshot) {
      var dateTitleOption = document.createElement('option');
      dateTitleOption.setAttribute("value", childSnapshot.key)
      dateTitleOption.innerHTML = childSnapshot.key;
      dateSelect.appendChild(dateTitleOption);
      if (!used) {
        onDateSelected(childSnapshot.key);
        used = true;
      }
  });
}

function onDateSelected() {
  var selectedDateValue = dateSelect.value;
  onSelectedDate(selectedDateValue)
}

function onSelectedDate(dateKey) {
  var database = firebase.database();

  var selectedRepoValue = repoSelect.value;
  var reviewsRef = database.ref("repos/").child(selectedRepoValue).child('reviews/');

  reviewsRef.child(dateKey).once('value', function(userSnapshot) {
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
  if (userChildData.changes_requested_count) {
    tdReject.innerHTML = userChildData.changes_requested_count;
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












