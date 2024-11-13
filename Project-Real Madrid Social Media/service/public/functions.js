function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}
if (typeof window !== 'undefined') {
  window.onclick = function (event) {
    var modals = document.getElementsByClassName('modal');
    for (var i = 0; i < modals.length; i++) {
      if (event.target == modals[i]) {
        modals[i].style.display = 'none';
      }
    }
  };
}

var basePath = '/M00898450';

function register() {
  var email = document.getElementById('register-email').value;
  var username = document.getElementById('register-username').value;
  var password = document.getElementById('register-password').value;
  var repassword = document.getElementById('register-repassword').value;
  var age = document.getElementById('register-age').value;

  if (password !== repassword) {
    alert("Passwords do not match");
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', `${basePath}/register`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status === 201) {
      alert('User registered successfully');
      closeModal('registerModal'); // Close the register modal after successful registration
    } else {
      alert('Failed to register user');
    }
  };
  xhr.send(JSON.stringify({ email: email, username: username, password: password, age: age }));
}
function login() {
  var username = document.getElementById('login-username').value;
  var password = document.getElementById('login-password').value;

  var xhr = new XMLHttpRequest();
  xhr.open('POST', basePath + '/login');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status === 200) {
      var responseData = JSON.parse(xhr.responseText);
      alert('Login successful');
      handleSuccessfulLogin(responseData.username); // Update the username
    } else if (xhr.status === 401) {
      alert('Invalid credentials');
    } else {
      alert('Failed to login');
    }
  };
  xhr.send(JSON.stringify({ username: username, password: password }));
}
function handleSuccessfulLogin(username) {
  // Update the username element with the new value
  const usernameSpan = document.getElementById('username-display');
  if (usernameSpan) {
    usernameSpan.textContent = username;
  }

  // Clear the posts count
  const postsSpan = document.getElementById('posts-display');
  if (postsSpan) {
    postsSpan.textContent = '0';
  }

  // Clear the following count
  const followingSpan = document.getElementById('following-display');
  if (followingSpan) {
    followingSpan.textContent = '0';
  }

  // Trigger a refresh to update the counts
  refreshData();
}
function refreshData() {
  const followingSpan = document.getElementById('following-display');
  const postsSpan = document.getElementById('posts-display');
  const usernameSpan = document.getElementById('username-display');

  const loggedInUsername = usernameSpan.textContent.trim();
  fetch(`${basePath}/refresh?username=${loggedInUsername}`)
    .then(response => response.json())
    .then(data => {
      // Update following count
      followingSpan.textContent = data.following > 0 ? data.following : 0;
      // Update posts count
      postsSpan.textContent = data.posts > 0 ? data.posts : 0;

      // After updating user data, fetch and display posts again
      fetchAndDisplayPosts();
    })
    .catch(error => console.error('Error refreshing data:', error));
}
function uploadPost() {
  const blogContent = document.getElementById('blog-content').value.trim();
  const imageURL = document.getElementById('photo-url').value.trim();
  const successMsg = document.getElementById('upload-success');

  if (!blogContent) {
    alert('Please enter your blog content.');
    return;
  }

  const postData = {
    content: blogContent,
    imageURL: imageURL
  };

  fetch(`${basePath}/uploadPost`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })
    .then(response => {
      if (response.ok) {
        // Clear input fields
        document.getElementById('blog-content').value = '';
        document.getElementById('photo-url').value = '';

        // Assuming this function fetches and displays posts
        fetchAndDisplayPosts();

        // Show success message
        successMsg.style.display = 'block';
      } else {
        throw new Error('Post Uploaded');
      }
    })
    .catch(error => {
      console.error('Error uploading post:', error);
      alert('Post Uploaded');
    });
  refreshData();
}
function addPhoto() {
  const fileInput = document.getElementById('photo-upload');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please choose a file.');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  fetch(`${basePath}/uploadPhoto`, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to upload photo');
    })
    .then(data => {
      document.getElementById('photo-url').value = data.imageUrl;
      alert('Photo uploaded successfully');
    })
    .catch(error => {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    });
}
function getCurrentDate() {
  // Get current date in YYYY-MM-DD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // January is 0
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function displayPosts(posts) {
  const feedContent = document.getElementById('userPostsContent');

  // Clear previous posts
  feedContent.innerHTML = '';

  // Loop through each post
  posts.forEach(post => {
    // Create post element
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Add empty div for spacing
    const spacingElement = document.createElement('div');
    spacingElement.style.height = '2em'; // Adjust height for desired spacing
    postElement.appendChild(spacingElement);

    // Add username
    const usernameElement = document.createElement('div');
    usernameElement.textContent = `@${post.username}`;
    postElement.appendChild(usernameElement);

    // Add post content
    const contentElement = document.createElement('div');
    contentElement.textContent = post.content;
    postElement.appendChild(contentElement);

    // Add image if imageURL exists
    if (post.imageURL) {
      const imageElement = document.createElement('img');
      imageElement.src = post.imageURL;
      postElement.appendChild(imageElement);
    }

    // Add post element to feed content
    feedContent.appendChild(postElement);
  });
}
function fetchAndDisplayPosts() {
  fetch(`${basePath}/posts`)
    .then(response => response.json())
    .then(data => {
      displayPosts(data.posts); // Use displayPosts to show user-specific posts
    })
    .catch(error => console.error('Error fetching posts:', error));
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);
}
function displayAllPosts(posts) {
  const feedContent = document.getElementById('feed-content');

  // Clear previous posts
  feedContent.innerHTML = '';

  // Loop through each post
  posts.forEach(post => {
    // Create post element
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Add empty div for spacing
    const spacingElement = document.createElement('div');
    spacingElement.style.height = '2em'; // Adjust height for desired spacing
    postElement.appendChild(spacingElement);

    // Add username
    const usernameElement = document.createElement('div');
    usernameElement.textContent = `@${post.username}`;
    postElement.appendChild(usernameElement);

    // Add post content
    const contentElement = document.createElement('div');
    contentElement.textContent = post.content;
    postElement.appendChild(contentElement);

    // Add image if imageURL exists
    if (post.imageURL) {
      const imageElement = document.createElement('img');
      imageElement.src = post.imageURL;
      postElement.appendChild(imageElement);
    }

    // Add post element to feed content
    feedContent.appendChild(postElement);
  });
}
function fetchAndDisplayAllPosts() {
  fetch(`${basePath}/allshow`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayAllPosts(data.posts);
    })
    .catch(error => {
      console.error('Error fetching posts:', error.message); // Log the specific error message
      alert('Failed to fetch posts. Please check the console for details.');
    });
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', fetchAndDisplayAllPosts);
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', refreshData);
  });
}
function searchPeople() {
  const searchInput = document.getElementById('searchPeopleInput').value.trim();
  if (!searchInput) {
    alert('Please enter a search keyword');
    return;
  }

  fetch(`${basePath}/search?keyword=${encodeURIComponent(searchInput)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to search');
      }
      return response.json();
    })
    .then(data => {
      displaySearchResults(data.users, data.posts);
    })
    .catch(error => {
      console.error('Error searching:', error);
      alert('Failed to search');
    });
}
function displaySearchResults(users, posts) {
  const searchResultsContainer = document.getElementById('searchResults');
  searchResultsContainer.innerHTML = ''; // Clear previous results

  // Display matching usernames
  if (users.length > 0) {
    searchResultsContainer.innerHTML += '<h3>Matching Users:</h3>';
    users.forEach(user => {
      const followButton = `<button id="followButton-${user.username}" onclick="toggleFollow('${user.username}')">${user.followed ? 'Unfollow' : 'Follow'}</button>`;
      searchResultsContainer.innerHTML += `<p>@${user.username} ${followButton}</p>`;
    });
    searchResultsContainer.innerHTML += '<hr>'; // Add a horizontal line between users and posts
  }

  // Display matching posts (if any)
  if (posts.length > 0) {
    searchResultsContainer.innerHTML += '<h3>Matching Posts:</h3>';
    posts.forEach(post => {
      searchResultsContainer.innerHTML += `<p>@${post.username}: ${post.content}</p>`;
    });
  }

  // Display message if no results found
  if (users.length === 0 && posts.length === 0) {
    searchResultsContainer.innerHTML = '<p>No results found.</p>';
  }
}
function displayAllForwards(forwards) {
  const forwardsContent = document.getElementById('fwd');

  // Clear previous forwards
  forwardsContent.innerHTML = '';

  // Loop through each forward
  forwards.forEach(forward => {
    // Create forward element
    const forwardElement = document.createElement('div');
    forwardElement.classList.add('forward');

    // Add empty div for spacing
    const spacingElement = document.createElement('div');
    spacingElement.style.height = '2em'; // Adjust height for desired spacing
    forwardElement.appendChild(spacingElement);

    // Add name
    const nameElement = document.createElement('div');
    nameElement.textContent = `Name: ${forward.name}`;
    forwardElement.appendChild(nameElement);

    // Add jersey
    const jerseyElement = document.createElement('div');
    jerseyElement.textContent = `Jersey: ${forward.jersey}`;
    forwardElement.appendChild(jerseyElement);

    // Add position
    const positionElement = document.createElement('div');
    positionElement.textContent = `Position: ${forward.position}`;
    forwardElement.appendChild(positionElement);

    // Add nationality
    const nationalityElement = document.createElement('div');
    nationalityElement.textContent = `Nationality: ${forward.nationality}`;
    forwardElement.appendChild(nationalityElement);

    // Add forward element to forwards content
    forwardsContent.appendChild(forwardElement);
  });
}
function fetchAndDisplayAllForwards() {
  fetch(`${basePath}/allforwards`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch forwards: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayAllForwards(data.forwards);
    })
    .catch(error => {
      console.error('Error fetching forwards:', error.message); // Log the specific error message
      alert('Failed to fetch forwards. Please check the console for details.');
    });
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', fetchAndDisplayAllForwards);
}
// Function to display midfielders
function displayAllMidfielders(midfielders) {
  const midfieldersContent = document.getElementById('mid');

  // Clear previous midfielders
  midfieldersContent.innerHTML = '';

  // Loop through each midfielder
  midfielders.forEach(midfielder => {
    // Create midfielder element
    const midfielderElement = document.createElement('div');
    midfielderElement.classList.add('midfielder');

    // Add empty div for spacing
    const spacingElement = document.createElement('div');
    spacingElement.style.height = '2em'; // Adjust height for desired spacing
    midfielderElement.appendChild(spacingElement);

    // Add name
    const nameElement = document.createElement('div');
    nameElement.textContent = `Name: ${midfielder.name}`;
    midfielderElement.appendChild(nameElement);

    // Add jersey
    const jerseyElement = document.createElement('div');
    jerseyElement.textContent = `Jersey: ${midfielder.jersey}`;
    midfielderElement.appendChild(jerseyElement);

    // Add position
    const positionElement = document.createElement('div');
    positionElement.textContent = `Position: ${midfielder.position}`;
    midfielderElement.appendChild(positionElement);

    // Add nationality
    const nationalityElement = document.createElement('div');
    nationalityElement.textContent = `Nationality: ${midfielder.nationality}`;
    midfielderElement.appendChild(nationalityElement);

    // Add midfielder element to midfielders content
    midfieldersContent.appendChild(midfielderElement);
  });
}
// Function to fetch and display midfielders
function fetchAndDisplayAllMidfielders() {
  fetch(`${basePath}/allmidfielders`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch midfielders: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayAllMidfielders(data.midfielders);
    })
    .catch(error => {
      console.error('Error fetching midfielders:', error.message);
      alert('Failed to fetch midfielders. Please check the console for details.');
    });
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', fetchAndDisplayAllMidfielders);
}
// Function to display defenders
function displayAllDefenders(defenders) {
  const defendersContent = document.getElementById('def');

  // Clear previous defenders
  defendersContent.innerHTML = '';

  // Loop through each defender
  defenders.forEach(defender => {
    // Create defender element
    const defenderElement = document.createElement('div');
    defenderElement.classList.add('defender');

    // Add empty div for spacing
    const spacingElement = document.createElement('div');
    spacingElement.style.height = '2em'; // Adjust height for desired spacing
    defenderElement.appendChild(spacingElement);

    // Add name
    const nameElement = document.createElement('div');
    nameElement.textContent = `Name: ${defender.name}`;
    defenderElement.appendChild(nameElement);

    // Add jersey
    const jerseyElement = document.createElement('div');
    jerseyElement.textContent = `Jersey: ${defender.jersey}`;
    defenderElement.appendChild(jerseyElement);

    // Add position
    const positionElement = document.createElement('div');
    positionElement.textContent = `Position: ${defender.position}`;
    defenderElement.appendChild(positionElement);

    // Add nationality
    const nationalityElement = document.createElement('div');
    nationalityElement.textContent = `Nationality: ${defender.nationality}`;
    defenderElement.appendChild(nationalityElement);

    // Add defender element to defenders content
    defendersContent.appendChild(defenderElement);
  });
}
// Function to fetch and display defenders
function fetchAndDisplayAllDefenders() {
  fetch(`${basePath}/alldefenders`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch defenders: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayAllDefenders(data.defenders);
    })
    .catch(error => {
      console.error('Error fetching defenders:', error.message);
      alert('Failed to fetch defenders. Please check the console for details.');
    });
}
// Trigger fetch and display of defenders on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', fetchAndDisplayAllDefenders);
}
// Function to display goalkeepers
function displayAllGoalkeepers(goalkeepers) {
  const goalkeepersContent = document.getElementById('gk');

  // Clear previous goalkeepers
  goalkeepersContent.innerHTML = '';

  // Loop through each goalkeeper
  goalkeepers.forEach(goalkeeper => {
    // Create goalkeeper element
    const goalkeeperElement = document.createElement('div');
    goalkeeperElement.classList.add('goalkeeper');

    // Add empty div for spacing
    const spacingElement = document.createElement('div');
    spacingElement.style.height = '2em'; // Adjust height for desired spacing
    goalkeeperElement.appendChild(spacingElement);

    // Add name
    const nameElement = document.createElement('div');
    nameElement.textContent = `Name: ${goalkeeper.name}`;
    goalkeeperElement.appendChild(nameElement);

    // Add jersey
    const jerseyElement = document.createElement('div');
    jerseyElement.textContent = `Jersey: ${goalkeeper.jersey}`;
    goalkeeperElement.appendChild(jerseyElement);

    // Add position
    const positionElement = document.createElement('div');
    positionElement.textContent = `Position: ${goalkeeper.position}`;
    goalkeeperElement.appendChild(positionElement);

    // Add nationality
    const nationalityElement = document.createElement('div');
    nationalityElement.textContent = `Nationality: ${goalkeeper.nationality}`;
    goalkeeperElement.appendChild(nationalityElement);

    // Add goalkeeper element to goalkeepers content
    goalkeepersContent.appendChild(goalkeeperElement);
  });
}
// Function to fetch and display goalkeepers
function fetchAndDisplayAllGoalkeepers() {
  fetch(`${basePath}/allgoalkeepers`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch goalkeepers: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayAllGoalkeepers(data.goalkeepers);
    })
    .catch(error => {
      console.error('Error fetching goalkeepers:', error.message);
      alert('Failed to fetch goalkeepers. Please check the console for details.');
    });
}
// Trigger fetch and display of goalkeepers on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', fetchAndDisplayAllGoalkeepers);
}