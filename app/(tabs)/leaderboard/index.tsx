import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const LeaderboardScreen = () => {
  const [selectedTournament, setSelectedTournament] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('bronze');

  const theme = {
    color: {
      white: '#FFFFFF',
      title: '#4B4B4B',
      primary: '#00C2D1',
      darkPrimary: '#009EB2',
      description: '#777',
      red: '#FF4B4B',
      bgRed: '#FFDFE0',
      green: '#58CC02',
      bgGreen: '#D7FFB8',
      bgBlue: '#CCF2F5',
      darkGreen: '4DAA02',
      darkRed: 'E04343',
      lightOrange: 'FFD700',
      orange: 'FFA500',
      lightPurple: 'AB47BC',
      darkPurple: '9C27B0',
    },
  };

  const tournaments = {
    bronze: {
      icon: '🥉',
      title: 'Giải đấu Đồng',
      subtitle: 'Top 15 sẽ được thăng hạng lên giải đấu cao hơn',
      gradient: 'linear-gradient(135deg, #CD7F32, #F4E4BC)',
      backgroundColor: '#CD7F32',
      data: [
        { rank: 1, name: 'xFaKvB9u', score: '164 KN', avatar: 'X', color: '#ff9500', isOnline: true },
        { rank: 2, name: 'blevins', score: '117 KN', avatar: '🤓', color: '#ff69b4', isOnline: true },
        { rank: 3, name: 'tu.8zPhLRDVr49BC', score: '30 KN', avatar: 'T', color: '#ff4444', isOnline: true },
        { rank: 4, name: 'kaito', score: '30 KN', avatar: 'K', color: '#ff4444', isOnline: true },
        { rank: 5, name: 'Eduardo Picano', score: '28 KN', avatar: 'E', color: '#9966ff', isOnline: true },
        { rank: 6, name: 'tu.8zPhLBrEOdxpl', score: '20 KN', avatar: '🦉', color: '#333', isOnline: true },
        { rank: 7, name: 'Khanh Tr?n Th?y H?ng', score: '15 KN', avatar: 'K', color: '#ff4444', isOnline: true },
        { rank: 8, name: 'xFaKvB9u', score: '164 KN', avatar: 'X', color: '#ff9500', isOnline: true },
        { rank: 9, name: 'blevins', score: '117 KN', avatar: '🤓', color: '#ff69b4', isOnline: true },
        { rank: 10, name: 'tu.8zPhLRDVr49BC', score: '30 KN', avatar: 'T', color: '#ff4444', isOnline: true },
        { rank: 11, name: 'kaito', score: '30 KN', avatar: 'K', color: '#ff4444', isOnline: true },
        { rank: 12, name: 'Eduardo Picano', score: '28 KN', avatar: 'E', color: '#9966ff', isOnline: true },
        { rank: 13, name: 'tu.8zPhLBrEOdxpl', score: '20 KN', avatar: '🦉', color: '#333', isOnline: true },
        { rank: 14, name: 'Khanh', score: '15 KN', avatar: 'K', color: '#ff4444', isOnline: true },
        { rank: 15, name: 'Khanh Tr?n Th?y H?ng', score: '15 KN', avatar: 'K', color: '#ff4444', isOnline: true },
      ]
    },
    silver: {
      icon: '🥈',
      title: 'Giải đấu Bạc',
      subtitle: 'Top 10 sẽ được thăng hạng lên giải đấu cao hơn',
      gradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
      backgroundColor: '#C0C0C0',
      data: [
        { rank: 1, name: 'ProGamer2024', score: '892 KN', avatar: 'P', color: '#ff9500', isOnline: true },
        { rank: 2, name: 'SilverKnight', score: '756 KN', avatar: '⚔️', color: '#ff69b4', isOnline: true },
        { rank: 3, name: 'MasterChef', score: '689 KN', avatar: '👨‍🍳', color: '#ff4444', isOnline: false },
        { rank: 4, name: 'CodeWarrior', score: '634 KN', avatar: 'C', color: '#4CAF50', isOnline: true },
        { rank: 5, name: 'NightHawk', score: '598 KN', avatar: '🦅', color: '#9966ff', isOnline: true },
        { rank: 6, name: 'DragonSlayer', score: '567 KN', avatar: 'D', color: '#ff4444', isOnline: false },
        { rank: 7, name: 'PhoenixRise', score: '523 KN', avatar: '🔥', color: '#ff9500', isOnline: true }
      ]
    },
    gold: {
      icon: '🥇',
      title: 'Giải đấu Vàng',
      subtitle: 'Top 5 sẽ được thăng hạng lên giải đấu cao hơn',
      gradient: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
      backgroundColor: '#FFD700',
      data: [
        { rank: 1, name: 'GoldLegend', score: '2.1M KN', avatar: '👑', color: '#ff9500', isOnline: true },
        { rank: 2, name: 'ElitePlayer', score: '1.8M KN', avatar: 'E', color: '#ff69b4', isOnline: true },
        { rank: 3, name: 'ChampionX', score: '1.6M KN', avatar: '🏆', color: '#ff4444', isOnline: true },
        { rank: 4, name: 'GoldenEagle', score: '1.4M KN', avatar: '🦅', color: '#4CAF50', isOnline: false },
        { rank: 5, name: 'KingOfGames', score: '1.2M KN', avatar: 'K', color: '#9966ff', isOnline: true },
        { rank: 6, name: 'GoldRush', score: '1.1M KN', avatar: 'G', color: '#ff4444', isOnline: true },
        { rank: 7, name: 'UltimateWin', score: '980K KN', avatar: 'U', color: '#333', isOnline: true }
      ]
    },
    diamond: {
      icon: '💎',
      title: 'Giải đấu Kim Cương',
      subtitle: 'Giải đấu cao nhất - Chỉ dành cho những người chơi xuất sắc nhất',
      gradient: 'linear-gradient(135deg, #00BFFF, #E0F6FF)',
      backgroundColor: '#00BFFF',
      data: [
        { rank: 1, name: 'DiamondKing', score: '10.5M KN', avatar: '💎', color: '#00BFFF', isOnline: true },
        { rank: 2, name: 'CrystalMaster', score: '9.8M KN', avatar: '🔮', color: '#9966ff', isOnline: true },
        { rank: 3, name: 'PlatinumPro', score: '9.2M KN', avatar: 'P', color: '#E5E4E2', isOnline: true },
        { rank: 4, name: 'DiamondQueen', score: '8.7M KN', avatar: '👸', color: '#ff69b4', isOnline: false },
        { rank: 5, name: 'GemLord', score: '8.1M KN', avatar: '💍', color: '#FFD700', isOnline: true },
        { rank: 6, name: 'CrystalHeart', score: '7.8M KN', avatar: '💖', color: '#ff4444', isOnline: true },
        { rank: 7, name: 'DiamondStorm', score: '7.3M KN', avatar: '⚡', color: '#ff9500', isOnline: true }
      ]
    }
  };

  const currentTournament = tournaments[selectedTournament];

  const handleTournamentChange = (tournamentType: any) => {
    setSelectedTournament(tournamentType);
  };

  const getRankColor = (rank: any) => {
    switch (rank) {
      case 1: return theme.color.lightOrange;
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return theme.color.green;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.fixedHeader}>
          <View style={styles.tournamentSelector}>
            {Object.entries(tournaments).map(([key, tournament]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tournamentOption,
                  selectedTournament === key && styles.tournamentOptionActive,
                  { backgroundColor: tournament.backgroundColor }
                ]}
                onPress={() => handleTournamentChange(key)}
              >
                <Text style={[
                  styles.tournamentIcon,
                  selectedTournament === key && styles.tournamentIconActive
                ]}>
                  {tournament.icon}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tournamentContent}>
            <Text style={styles.tournamentTitle}>{currentTournament.title}</Text>
            <Text style={styles.tournamentSubtitle}>
              {currentTournament.subtitle}
            </Text>
            <Text style={styles.tournamentDays}>6 ngày</Text>
          </View>
        </View>

        {/* Leaderboard Container */}
        <View style={styles.leaderboardContainer}>
          <View style={styles.leaderboardList}>
            {currentTournament.data.map((player: any, index: any) => (
              <View key={index} style={styles.leaderboardItem}>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(player.rank) }]}>
                  <Text style={styles.rankText}>{player.rank}</Text>
                </View>

                <View style={styles.avatarContainer}>
                  <View style={[styles.userAvatar, { backgroundColor: player.color }]}>
                    <Text style={styles.avatarText}>{player.avatar}</Text>
                  </View>
                  {player.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {player.name}
                  </Text>
                </View>

                <Text style={styles.userScore}>{player.score}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  fixedHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  tournamentSelector: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  tournamentOption: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tournamentOptionActive: {
    width: 80,
    height: 80,
    opacity: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tournamentIcon: {
    fontSize: 24,
  },
  tournamentIconActive: {
    fontSize: 32,
  },
  tournamentContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  tournamentSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  tournamentDays: {
    fontSize: 14,
    color: '#ff9500',
    fontWeight: '500',
    textAlign: 'center',
  },
  leaderboardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  leaderboardList: {
    paddingHorizontal: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  userScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
});

export default LeaderboardScreen;