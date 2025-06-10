import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // Sign up state
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Posts state
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  // For comments
  const [commentText, setCommentText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);

  // Track likes per post by user
  const [likedPosts, setLikedPosts] = useState({});

  const handleLogin = () => {
    if (username.length > 0 && password.length > 0) {
      setLoggedIn(true);
    } else {
      Alert.alert('Login Failed', 'Please enter username and password.');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername('');
    setPassword('');  
    setFirstName('');
    setLastName('');
    setIsSignUp(false);
  };

  const handleSignUp = () => {
    setIsSignUp(true);
    setUsername('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  const handleNext = () => {
    if (firstName.length > 0 && lastName.length > 0 && username.length > 0 && password.length > 0) {
      Alert.alert('Sign Up Successful', `Welcome, ${firstName} ${lastName}!`);
      setIsSignUp(false);
      setLoggedIn(true);
    } else {
      Alert.alert('Sign Up Failed', 'Please fill in all fields.');
    }
  };

  // Create post
  const handleAddPost = () => {
    if (newPost.trim().length > 0) {
      setPosts([
        {
          id: Date.now().toString(),
          user: {
            name: firstName + ' ' + lastName,
            username: username,
            avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
          },
          text: newPost,
          likes: 0,
          liked: false,
          comments: [],
          shares: 0,
        },
        ...posts,
      ]);
      setNewPost('');
    } else {
      Alert.alert('Post Failed', 'Please enter some text.');
    }
  };

  // Like/unlike
  const handleLike = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        const liked = !post.liked;
        return {
          ...post,
          liked,
          likes: liked ? post.likes + 1 : post.likes - 1,
        };
      }
      return post;
    }));
  };

  // Share
  const handleShare = (id) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, shares: post.shares + 1 } : post
    ));
    Alert.alert('Shared!', 'You have shared this post.');
  };

  // Show comment input for a post
  const handleShowCommentInput = (postId) => {
    setActiveCommentPostId(postId);
    setCommentText('');
  };

  // Add comment to a post
  const handleAddComment = (postId) => {
    if (commentText.trim().length === 0) return;
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, { text: commentText, user: username }] }
        : post
    ));
    setCommentText('');
    setActiveCommentPostId(null);
  };

  if (isSignUp) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sign Up</Text>
        <View style={styles.loginBox}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleNext}>
            <Text style={styles.loginButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signUpButton} onPress={() => setIsSignUp(false)}>
          <Text style={styles.signUpButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loggedIn) {
    const userProfile = {
      name: firstName || "Jane Doe",
      username: username || "janedoe",
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    };

    return (
      <View style={styles.containerLoggedIn}>
        {/* Top Profile Bar */}
        <View style={styles.profileBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileUsername}>@{userProfile.username}</Text>
            </View>
          </View>
          <View style={styles.iconRow}>
            <TouchableOpacity activeOpacity={0.6} style={styles.iconTouchable}>
              <Ionicons name="search" size={24} color="#4a90e2" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} style={[styles.iconTouchable, { marginLeft: 16 }]}>
              <Ionicons name="notifications-outline" size={24} color="#4a90e2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Post */}
        <View style={styles.createPostBox}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            value={newPost}
            onChangeText={setNewPost}
          />
          <TouchableOpacity style={styles.postButton} onPress={handleAddPost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Posts */}
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Image source={{ uri: item.user.avatar }} style={styles.cardAvatar} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.cardName}>{item.user.name}</Text>
                  <Text style={styles.cardUsername}>@{item.user.username}</Text>
                </View>
              </View>
              <Text style={styles.cardText}>{item.text}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(item.id)}
                  activeOpacity={0.6}
                >
                  <Ionicons name={item.liked ? "heart" : "heart-outline"} size={18} color={item.liked ? "#e74c3c" : "#e74c3c"} />
                  <Text style={styles.actionButtonText}>Like ({item.likes})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleShowCommentInput(item.id)}>
                  <Ionicons name="chatbubble-outline" size={18} color="#4a90e2" />
                  <Text style={styles.actionButtonText}> ({item.comments.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item.id)}>
                  <Ionicons name="share-social-outline" size={18} color="#27ae60" />
                  <Text style={styles.actionButtonText}> ({item.shares})</Text>
                </TouchableOpacity>
              </View>
              {/* Comments */}
              {item.comments.length > 0 && (
                <View style={styles.commentsSection}>
                  {item.comments.map((c, idx) => (
                    <Text key={idx} style={styles.commentText}>
                      <Text style={{ fontWeight: 'bold' }}>{c.user}: </Text>
                      {c.text}
                    </Text>
                  ))}
                </View>
              )}
              {/* Comment input */}
              {activeCommentPostId === item.id && (
                <View style={styles.commentInputBox}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <TouchableOpacity style={styles.sendButton} onPress={() => handleAddComment(item.id)}>
                    <Ionicons name="send" size={20} color="#4a90e2" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />

        {/* Log Out at left bottom corner */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Login screen
  return (
    <View style={styles.container}>
      <Text style={styles.text}>STATUS</Text>
      <View style={styles.loginBox}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-start',
  },
  containerLoggedIn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 40,
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
  },
  text: {
    paddingTop: 200,
    marginBottom: 20,
    fontSize: 35,
    color: '#333',
    fontFamily: 'serif',
    letterSpacing: 5, 
    alignSelf: 'center',
  },
  loginBox: {
    backgroundColor: '#fff',
    padding: 50,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
    width: 300,
    alignSelf: 'center',
  },
  input: {
    width: 250,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  signUpButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4a90e2',
    alignSelf: 'center',
  },
  signUpButtonText: {
    color: '#4a90e2',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'serif',
  },
  profileUsername: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'serif',
  },
  iconRow: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
  },
  createPostBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,      // Increase to move down, decrease to move up
    marginHorizontal: 20,
    marginBottom: 10,   // Increase to add space below
  },
  postButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginLeft: 10,
    alignSelf: 'flex-start', // or 'flex-end' or 'center'
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'serif',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginTop: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'serif',
  },
  cardUsername: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'serif',
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    fontFamily: 'serif',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#e6f0fa',
    marginRight: 8,
  },
  actionButtonText: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'serif',
    marginLeft: 5,
  },
  commentsSection: {
    marginTop: 10,
    marginBottom: 5,
    paddingLeft: 5,
  },
  commentText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
    fontFamily: 'serif',
  },
  commentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 36,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    fontFamily: 'serif',
  },
  sendButton: {
    marginLeft: 8,
    padding: 6,
  },
  logoutButton: {
    position: 'absolute',
    left: 20,
    bottom: 30,
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'serif',
  },
  iconTouchable: {
    padding: 10, // Increases tap area for easier tapping
    borderRadius: 20,
  },
});

