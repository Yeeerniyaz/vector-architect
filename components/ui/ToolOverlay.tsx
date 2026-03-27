// =============================================================================
// Vector Architect — Tool Overlay (UI Layer)
// Floating UI panels sitting above the Skia Canvas.
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useEditorStore } from '../../store/editorStore';
import { Layer, COLORS } from '../../types/blueprint';

export default function ToolOverlay() {
  const activeLayer = useEditorStore((state) => state.activeLayer);
  const setActiveLayer = useEditorStore((state) => state.setActiveLayer);

  // Временная функция-заглушка для кнопок. Позже мы привяжем их к стору.
  const handleToolPress = (toolName: string) => {
    console.log(`Выбран инструмент: ${toolName}`);
    // Здесь мы будем переключать режимы жестов (например, с "Панорама" на "Черчение стены")
  };

  return (
    <SafeAreaView style={styles.pointerEventsContainer} pointerEvents="box-none">
      
      {/* --- ВЕРХНЯЯ ПАНЕЛЬ: Переключатель слоев --- */}
      <View style={styles.topBar}>
        <LayerButton 
          title="СТЕНЫ" 
          layer="walls" 
          activeLayer={activeLayer} 
          onPress={() => setActiveLayer('walls')} 
        />
        <LayerButton 
          title="МЕБЕЛЬ" 
          layer="furniture" 
          activeLayer={activeLayer} 
          onPress={() => setActiveLayer('furniture')} 
        />
        <LayerButton 
          title="ЭЛЕКТРИКА" 
          layer="electrics" 
          activeLayer={activeLayer} 
          onPress={() => setActiveLayer('electrics')} 
        />
      </View>

      {/* --- НИЖНЯЯ ПАНЕЛЬ: Инструменты (Плавающая пилюля) --- */}
      <View style={styles.bottomBarWrapper} pointerEvents="box-none">
        <View style={styles.bottomBar}>
          
          <TouchableOpacity style={styles.toolBtn} onPress={() => handleToolPress('SELECT')}>
            <Text style={styles.toolIcon}>👆</Text>
            <Text style={styles.toolText}>ВЫДЕЛИТЬ</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.toolBtn} onPress={() => handleToolPress('DRAW_WALL')}>
            <Text style={styles.toolIcon}>✏️</Text>
            <Text style={styles.toolText}>СТЕНА</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.toolBtn} onPress={() => handleToolPress('ADD_OBJECT')}>
            <Text style={styles.toolIcon}>+</Text>
            <Text style={styles.toolText}>ОБЪЕКТ</Text>
          </TouchableOpacity>

        </View>
      </View>

    </SafeAreaView>
  );
}

// =============================================================================
// Вспомогательные UI-компоненты
// =============================================================================

const LayerButton = ({ title, layer, activeLayer, onPress }: { title: string, layer: Layer, activeLayer: Layer, onPress: () => void }) => {
  const isActive = activeLayer === layer;
  return (
    <TouchableOpacity 
      style={[styles.layerBtn, isActive && styles.layerBtnActive]} 
      onPress={onPress}
    >
      <Text style={[styles.layerBtnText, isActive && styles.layerBtnTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// =============================================================================
// СТИЛИ (Строгий Архитектурный Минимализм)
// =============================================================================

const styles = StyleSheet.create({
  pointerEventsContainer: {
    ...StyleSheet.absoluteFillObject, // Растягиваем на весь экран поверх холста
    justifyContent: 'space-between',
  },
  
  // Верхняя панель слоев
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  layerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    marginHorizontal: -0.5, // Схлопываем границы между кнопками
  },
  layerBtnActive: {
    backgroundColor: COLORS.BLACK,
  },
  layerBtnText: {
    color: COLORS.BLACK,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  layerBtnTextActive: {
    color: COLORS.WHITE,
  },

  // Нижняя плавающая панель
  bottomBarWrapper: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    borderRadius: 30, // Форма пилюли
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Для Android
  },
  toolBtn: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: COLORS.BLACK,
  },
  toolText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: COLORS.BLACK,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.BLACK,
    marginVertical: 5,
    marginHorizontal: 5,
  }
});