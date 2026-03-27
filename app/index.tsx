import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

// Заглушки: Временная база данных проектов
const DUMMY_PROJECTS = [
  { id: '1', name: 'ЖК "Асыл Арман", кв 42', date: '27.03.2026', size: '45 кв.м' },
  { id: '2', name: 'Дом (Умный свет)', date: '20.03.2026', size: '120 кв.м' },
  { id: '3', name: 'Гараж - проводка', date: '15.02.2026', size: '24 кв.м' },
];

export default function DashboardScreen() {
  const router = useRouter();

  const openProject = (id: string) => {
    // Пока просто кидаем в редактор. Позже будем передавать ID: router.push(`/editor?id=${id}`)
    router.push('/editor');
  };

  const createNewProject = () => {
    router.push('/editor');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Верхняя панель (Аккаунт и Настройки) */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>VECTOR ARCHITECT</Text>
        <TouchableOpacity style={styles.accountButton}>
          <Text style={styles.accountText}>[ ЕРНИЯЗ ]</Text>
        </TouchableOpacity>
      </View>

      {/* Список проектов */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>МОИ ЧЕРТЕЖИ</Text>
        
        <FlatList
          data={DUMMY_PROJECTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.projectCard} onPress={() => openProject(item.id)}>
              <View>
                <Text style={styles.projectName}>{item.name.toUpperCase()}</Text>
                <Text style={styles.projectMeta}>{item.size} • {item.date}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Кнопка создания нового проекта */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={createNewProject}>
          <Text style={styles.createButtonText}>+ НОВЫЙ ПРОЕКТ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginTop: 30, // Отступ под челку
  },
  logo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'monospace',
    letterSpacing: -0.5,
  },
  accountButton: {
    padding: 5,
  },
  accountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'monospace',
  },
  content: { flex: 1, padding: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  list: { paddingBottom: 20 },
  projectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  projectMeta: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  arrow: {
    fontSize: 24,
    color: '#000000',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  createButton: {
    backgroundColor: '#000000',
    padding: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});