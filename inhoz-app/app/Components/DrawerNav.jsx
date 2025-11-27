import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Platform, StatusBar, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const statusBarHeight = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const DrawerNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleDrawer = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-windowWidth, 0],
  });

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'user-md', label: 'Profile', route: '/profile' },
    { icon: 'heartbeat', label: 'Vitals', route: '/vitals' },
    { icon: 'history', label: 'History', route: '/history' },
    { icon: 'cog', label: 'Settings', route: '/settings' },
    { icon: 'sign-out', label: 'Logout', route: '/login' },
  ];

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.menuButton,
          { bottom: Platform.OS === 'ios' ? windowHeight * 0.05 : windowHeight * 0.03 }
        ]} 
        onPress={toggleDrawer}
      >
        <Icon name="bars" size={24} color="#fff" />
      </TouchableOpacity>

      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleDrawer}
        />
      )}

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Image
            source={require('../../assets/logo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.hospitalName}>INHOZ</Text>
          <Text style={styles.subtitle}>Intelligent Hospitalization</Text>
        </View>

        <ScrollView style={styles.drawerContent}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                router.pathname === item.route && styles.activeMenuItem
              ]}
              onPress={() => {
                router.push(item.route);
                toggleDrawer();
              }}
            >
              <Icon 
                name={item.icon} 
                size={20} 
                color={router.pathname === item.route ? '#fff' : '#4a90e2'} 
              />
              <Text 
                style={[
                  styles.menuItemText,
                  router.pathname === item.route && styles.activeMenuItemText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.drawerFooter}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    left: windowWidth * 0.04,
    top: Platform.OS === 'ios' ? windowHeight * 0.045 : windowHeight * 0.025,
    zIndex: 90,
    padding: 8,
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 98,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: windowWidth * 0.8,
    backgroundColor: '#fff',
    zIndex: 99,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  drawerHeader: {
    padding: windowWidth * 0.05,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: windowWidth * 0.02,
    marginTop: windowWidth * 0.02,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logo: {
    width: windowWidth * 0.2,
    height: windowWidth * 0.2,
    marginBottom: windowWidth * 0.03,
    backgroundColor: '#fff',
    borderRadius: windowWidth * 0.1,
    padding: windowWidth * 0.02,
  },
  hospitalName: {
    fontSize: Math.min(windowWidth * 0.06, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Math.min(windowWidth * 0.035, 14),
    color: '#fff',
    opacity: 0.9,
  },
  drawerContent: {
    flex: 1,
    paddingTop: windowWidth * 0.05,
    paddingHorizontal: windowWidth * 0.02,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: windowWidth * 0.04,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: '#4a90e2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuItemText: {
    marginLeft: windowWidth * 0.04,
    fontSize: Math.min(windowWidth * 0.04, 16),
    color: '#333',
    fontWeight: '500',
  },
  activeMenuItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  drawerFooter: {
    padding: windowWidth * 0.04,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    marginHorizontal: windowWidth * 0.02,
  },
  version: {
    fontSize: Math.min(windowWidth * 0.03, 12),
    color: '#666',
    fontWeight: '500',
  }
});

export default DrawerNav;