// =============================================================================
// Vector Architect — Main Screen
// Full-screen Skia canvas with floating layer-switcher toolbar.
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import EditorCanvas from '@/components/canvas/EditorCanvas';
import { useEditorStore } from '@/store/editorStore';
import { ALL_LAYERS, LAYER_LABELS, COLORS, type Layer } from '@/types/blueprint';

export default function MainScreen() {
  const activeLayer = useEditorStore((s) => s.activeLayer);
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer);

  return (
    <View style={styles.root}>
      {/* Full-screen Skia Canvas */}
      <EditorCanvas />

      {/* Floating Layer Toolbar */}
      <View style={styles.toolbar}>
        {ALL_LAYERS.map((layer) => {
          const isActive = layer === activeLayer;
          return (
            <Pressable
              key={layer}
              onPress={() => setActiveLayer(layer)}
              style={[
                styles.toolbarButton,
                isActive && styles.toolbarButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.toolbarText,
                  isActive && styles.toolbarTextActive,
                ]}
              >
                {LAYER_LABELS[layer]}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// =============================================================================
// Styles — Strict Black & White + Yellow accent for active state
// =============================================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.BLACK,
    borderTopWidth: 1,
    borderTopColor: COLORS.WHITE,
    paddingBottom: 20, // Safe area padding
  },
  toolbarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  toolbarButtonActive: {
    backgroundColor: COLORS.BLACK,
  },
  toolbarText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    opacity: 0.5,
  },
  toolbarTextActive: {
    opacity: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: COLORS.ACTIVE,
  },
});