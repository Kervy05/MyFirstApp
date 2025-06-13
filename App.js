import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Image, FlatList, ImageBackground, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const defaultImageUrl = 'https://randomuser.me/api/portraits/men/44.jpg';
const loginBgImage = require('./assets/green.jpg');

const Stack = createStackNavigator();

function MainScreen({ navigation }) {
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

  // Profile image state
  const [profileImage, setProfileImage] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Password validation function
  const isValidPassword = (pwd) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  };

  const handleLogin = () => {
    if (!isValidPassword(password)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters and include a number, an uppercase letter, and a lowercase letter.'
      );
      return;
    }
    setLoading(true);
    // Simulate async login (replace with your real login logic)
    setTimeout(() => {
      setLoading(false);
      setLoggedIn(true);
    }, 1500);
  };

  const handleLogoutInternal = () => {
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
    if (
      firstName.length > 0 &&
      lastName.length > 0 &&
      username.length > 0 &&
      password.length > 0
    ) {
      if (!isValidPassword(password)) {
        Alert.alert(
          'Invalid Password',
          'Password must be at least 8 characters and include a number, an uppercase letter, and a lowercase letter.'
        );
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsSignUp(false);
        setLoggedIn(true);
      }, 1500);
    } else {
      Alert.alert('Sign Up Failed', 'Please fill in all fields.');
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

  // Pick image from gallery
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Update all posts' avatars if the profile image changes
  useEffect(() => {
    if (loggedIn) {
      setPosts(posts =>
        posts.map(post =>
          post.user.username === username
            ? { ...post, user: { ...post.user, avatar: profileImage || defaultImageUrl } }
            : post
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileImage]);

  
  const handleAddPost = () => {
    if (newPost.trim().length > 0) {
      setPosts([
        {
          id: Date.now().toString(),
          user: {
            name: username,
            username: username,
            avatar: profileImage || defaultImageUrl,
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

  // Show loading indicator overlay
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 16, color: '#4a90e2', fontSize: 18 }}>Please wait...</Text>
      </View>
    );
  }

  if (isSignUp) {
    return (
      <ImageBackground source={loginBgImage} style={styles.bgImage}>
        <View style={styles.containerTransparent}>
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
          <TouchableOpacity
            style={{
              marginTop: 18,
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: '#db4437',
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('Gmail Sign Up', 'Gmail sign up tapped! (Integrate Google Sign-In here)')}
          >
            <Ionicons name="logo-google" size={22} color="#db4437" style={{ marginRight: 8 }} />
            <Text style={{ color: '#db4437', fontWeight: 'bold', fontSize: 10 }}>Sign Up using Gmail</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  if (loggedIn) {
    const userProfile = {
      name: username,
      username: username,
      avatar: profileImage || defaultImageUrl, // uses default if none uploaded
    };

    return (
      <View style={styles.containerLoggedIn}>
        {/* Top Profile Bar */}
        <View style={styles.profileBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handlePickImage}>
              <Image
                source={{ uri: userProfile.avatar }}
                style={styles.avatar}
              />
              {!profileImage && (
                <View style={styles.uploadPrompt}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileUsername}>@{userProfile.username}</Text>
              {!profileImage && (
                <Text style={styles.uploadText}>Tap photo to upload</Text>
              )}
            </View>
          </View>
          <View style={styles.iconRow}>
            <TouchableOpacity activeOpacity={0.6} style={styles.iconTouchable}>
              <Ionicons name="search" size={24} color="#4a90e2" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} style={[styles.iconTouchable, { marginLeft: 16 }]}>
              <Ionicons name="notifications-outline" size={24} color="#4a90e2" />
            </TouchableOpacity>
            {/* Settings icon */}
            <TouchableOpacity
              activeOpacity={0.6}
              style={[styles.iconTouchable, { marginLeft: 16 }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#4a90e2" />
            </TouchableOpacity>
            {/* Log out button as icon */}
            <TouchableOpacity
              activeOpacity={0.6}
              style={[styles.iconTouchable, { marginLeft: 16 }]}
              onPress={handleLogoutInternal}
            >
              <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
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
        
      </View>
    );
  }

  // Login screen
  return (
    <ImageBackground source={loginBgImage} style={styles.bgImage}>
      <View style={styles.containerTransparent}>
        {/* Add Welcome image above STATUS */}
        <Image
          source={require('./assets/Welcomepage.png')}
          style={{ width: 240, height: 400, alignSelf: 'center', marginTop: 0, marginBottom: -300 }}
          resizeMode="contain"
        />
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
        {/* Add this below Sign Up */}
        <TouchableOpacity
          style={{
            marginTop: 18,
            backgroundColor: '#fff',
            borderRadius: 20,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: '#db4437',
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => Alert.alert('Gmail Login', 'Gmail login tapped! (Integrate Google Sign-In here)')}
        >
          <Ionicons name="logo-google" size={22} color="#db4437" style={{ marginRight: 10}} />
          <Text style={{ color: '#db4437', fontWeight: 'bold', fontSize: 10}}>Log-In using Gmail</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

function SettingsScreen({ navigation, handleLogout }) {
  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            handleLogout();
            navigation.navigate('Main'); // Direct to login/first page
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#e74c3c',
          borderRadius: 20,
          paddingVertical: 12,
          paddingHorizontal: 32,
          marginBottom: 30,
          elevation: 3,
        }}
        onPress={confirmLogout}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: '#4a90e2',
          borderRadius: 20,
          paddingVertical: 10,
          paddingHorizontal: 28,
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogout = (navigation) => {
    setLoggedIn(false);
    // Optionally, navigate to login or reset state
    if (navigation) navigation.navigate('Main');
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {props => (
            <MainScreen {...props} handleLogout={handleLogout} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {props => (
            <SettingsScreen {...props} handleLogout={handleLogout} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
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
  containerTransparent: {
    flex: 1,
    backgroundColor: 'rgba(80, 78, 78, 0.28)', // semi-transparent overlay for readability
    justifyContent: 'flex-start',
  },
  // status text
  text: {
    paddingTop: 200,
    marginBottom: 20,
    fontSize: 35,
    color: '#fff', // changed from '#333' to white
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
    justifyContent: 'center',
    alignItems: 'center',
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
  uploadPrompt: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    padding: 3,
  },
  uploadText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

