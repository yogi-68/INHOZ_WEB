import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { usePathname, router } from 'expo-router';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: 'home', label: 'Home', route: '/dashboard' },
    { icon: 'heartbeat', label: 'Vitals', route: '/vitals' },
    { icon: 'history', label: 'History', route: '/history' },
    { icon: 'user-md', label: 'Profile', route: '/profile' },
    { icon: 'cog', label: 'Settings', route: '/settings' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => router.push(item.route)}
        >
          <Icon
            name={item.icon}
            size={24}
            color={pathname === item.route ? '#4a90e2' : '#666'}
          />
          <Text
            style={[
              styles.navLabel,
              pathname === item.route && styles.activeNavLabel,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#4a90e2',
  },
});

export default BottomNav; 