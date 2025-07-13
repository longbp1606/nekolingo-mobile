import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AchievementList from '../../../components/AchievementList';
import PopupInvite from './../../../components/PopupInvite';

// Data
const profile = {
  name: "Nguyen Tran",
  handle: "@nguyentran10700",
  joinDate: "Đã tham gia Tháng Năm 2025",
  following: 0,
  followers: 0,
};

const stats = [
  {
    icon: require("../../../assets/images/firefire.png"),
    label: "Ngày streak",
    value: "0",
    className: "streak",
  },
  {
    icon: require("../../../assets/images/thunder.png"),
    label: "Tổng điểm XP",
    value: "237",
    className: "lightning",
  },
  {
    icon: require("../../../assets/images/prize.png"),
    label: "Giải đấu hiện tại",
    value: "Đồng",
    className: "bronze",
  },
  {
    icon: require("../../../assets/images/cup.png"),
    label: "Số dấu đạt top 3",
    value: "0",
    className: "trophy",
  },
];

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('following');
  const [showPopup, setShowPopup] = useState(false);

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="create" size={20} color="white" />
      </TouchableOpacity>

      <View style={styles.profileAvatar}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>+</Text>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileHandle}>{profile.handle}</Text>
        <Text style={styles.profileJoinDate}>{profile.joinDate}</Text>
        <View style={styles.followSection}>
          <Text style={styles.followStats}>Đang theo dõi {profile.following}</Text>
          <Text style={styles.followStats}>{profile.followers} Người theo dõi</Text>
        </View>
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Thống kê</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Image source={stat.icon} style={styles.statImg} />
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFollowCard = () => (
    <View style={styles.card}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'following' && styles.tabButtonActive]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            ĐANG THEO DÕI
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'followers' && styles.tabButtonActive]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
            NGƯỜI THEO DÕI
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        <Image
          source={activeTab === 'following' ? require("../../../assets/images/following.gif") : require("../../../assets/images/addfriend.gif")}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyMessage}>
          {activeTab === 'following'
            ? 'Kết nối bạn bè giúp học vui và hiệu quả hơn.'
            : 'Chưa có người theo dõi'
          }
        </Text>
      </View>
    </View>
  );

  const renderAddFriendsCard = () => (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image source={require("../../../assets/images/add.png")} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Mời bạn bè</Text>
          <Text style={styles.description}>
            Chia sẻ với bạn bè về ứng dụng học ngoại ngữ thú vị - Nekolingo nhé!
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setShowPopup(true)}>
        <Text style={styles.buttonText}>GỬI LỜI MỜI</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderProfileHeader()}
      {renderStatsCard()}
      {renderFollowCard()}
      {renderAddFriendsCard()}
      <AchievementList limit={3} showViewAll={true} />

      {showPopup && (
        <PopupInvite visible={showPopup} onClose={() => setShowPopup(false)} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },

  // Profile Header
  profileHeader: {
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
    marginBottom: 20,
    position: 'relative',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#87CEEB',
  },

  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileAvatar: {
    marginBottom: 20,
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 3,
    borderColor: 'white',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },

  profileInfo: {
    alignItems: 'center',
  },

  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B4B4B',
    marginBottom: 5,
  },

  profileHandle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },

  profileJoinDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },

  followSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  followStats: {
    fontSize: 14,
    color: 'white',
  },

  // Card Styles
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#4B4B4B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 16,
    backgroundColor: '#fff',
  },

  statImg: {
    width: 60,
    height: 60,
    marginTop: -10,
  },

  statInfo: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B4B4B',
    lineHeight: 26,
  },

  statLabel: {
    fontSize: 12,
    color: '#777',
    lineHeight: 16,
  },


  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00C2D1',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B4B4B',
  },

  tabTextActive: {
    color: '#00C2D1',
  },

  tabContent: {
    padding: 20,
    alignItems: 'center',
  },

  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },

  emptyMessage: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 12,
    marginTop: -10,
    marginBottom: -15,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B4B4B',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#00C2D1',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ProfileScreen;