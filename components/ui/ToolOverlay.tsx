// =============================================================================
// Vector Architect — Tool Overlay (UI Layer)
// Floating UI panels sitting above the Skia Canvas. Connected to Zustand.
// Now includes the Smart Object Catalog Menu.
// =============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useEditorStore, ToolMode, OBJECT_CATALOG } from '../../store/editorStore';
import { Layer, COLORS, SmartObjectType } from '../../types/blueprint';

export default function ToolOverlay() {
  const activeLayer = useEditorStore((state) => state.activeLayer);
  const setActiveLayer = useEditorStore((state) => state.setActiveLayer);

  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);

  const activeObjectType = useEditorStore((state) => state.activeObjectType);
  const setActiveObjectType = useEditorStore((state) => state.setActiveObjectType);

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

      {/* --- НИЖНИЙ БЛОК ИНСТРУМЕНТОВ --- */}
      <View style={styles.bottomArea} pointerEvents="box-none">
        
        {/* Выезжающий каталог объектов (Виден только если выбран инструмент ОБЪЕКТ) */}
        {activeTool === 'ADD_OBJECT' && (
          <View style={styles.catalogWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catalogScroll}
            >
              {/* Проходимся по всему нашему словарю ГОСТ-объектов из стора */}
              {(Object.keys(OBJECT_CATALOG) as SmartObjectType[]).map((key) => {
                const item = OBJECT_CATALOG[key];
                const isSelected = activeObjectType === key;

                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.catalogItem, isSelected && styles.catalogItemActive]}
                    onPress={() => setActiveObjectType(key)}
                  >
                    <Text style={styles.catalogItemIcon}>{item.icon}</Text>
                    <Text style={[styles.catalogItemText, isSelected && styles.catalogItemTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Главная плавающая пилюля (Инструменты) */}
        <View style={styles.bottomBarWrapper} pointerEvents="box-none">
          <View style={styles.bottomBar}>
            
            <ToolButton 
              icon="👆" 
              label="ВЫДЕЛИТЬ" 
              isActive={activeTool === 'SELECT'} 
              onPress={() => setActiveTool('SELECT')} 
            />
            <View style={styles.divider} />
            
            <ToolButton 
              icon="✏️" 
              label="СТЕНА" 
              isActive={activeTool === 'DRAW_WALL'} 
              onPress={() => setActiveTool('DRAW_WALL')} 
            />
            <View style={styles.divider} />
            
            <ToolButton 
              icon="+" 
              label="ОБЪЕКТ" 
              isActive={activeTool === 'ADD_OBJECT'} 
              onPress={() => setActiveTool('ADD_OBJECT')} 
            />

          </View>
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

const ToolButton = ({ icon, label, isActive, onPress }: { icon: string, label: string, isActive: boolean, onPress: () => void }) => {
  return (
    <TouchableOpacity 
      style={[styles.toolBtn, isActive && styles.toolBtnActive]} 
      onPress={onPress}
    >
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text style={[styles.toolText, isActive && styles.toolTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

// =============================================================================
// СТИЛИ
// =============================================================================

const styles = StyleSheet.create({
  pointerEventsContainer: {
    ...StyleSheet.absoluteFillObject,
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
    marginHorizontal: -0.5,
  },
  layerBtnActive: { backgroundColor: COLORS.BLACK },
  layerBtnText: {
    color: COLORS.BLACK,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  layerBtnTextActive: { color: COLORS.WHITE },

  // Нижняя зона (Каталог + Инструменты)
  bottomArea: {
    justifyContent: 'flex-end',
  },

  // Каталог объектов
  catalogWrapper: {
    marginBottom: 15,
  },
  catalogScroll: {
    paddingHorizontal: 20,
    gap: 10, // Расстояние между карточками
  },
  catalogItem: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  catalogItemActive: {
    backgroundColor: COLORS.BLACK,
  },
  catalogItemIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  catalogItemText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: COLORS.BLACK,
  },
  catalogItemTextActive: {
    color: COLORS.WHITE,
  },

  // Главные инструменты
  bottomBarWrapper: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toolBtn: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toolBtnActive: {
    backgroundColor: COLORS.BLACK,
  },
  toolIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  toolText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: COLORS.BLACK,
  },
  toolTextActive: {
    color: COLORS.WHITE,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.BLACK,
    marginVertical: 10,
    marginHorizontal: 5,
  }
});