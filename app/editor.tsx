import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
// Если у тебя EditorCanvas лежит по другому пути, поправь импорт
import EditorCanvas from '../components/canvas/EditorCanvas';
import { useEditorStore } from '../store/editorStore';
import ToolOverlay from '../components/ui/ToolOverlay';

export default function EditorScreen() {
    const router = useRouter();
    const activeLayer = useEditorStore((state) => state.activeLayer);

    return (
        <View style={styles.container}>
            {/* Шапка редактора */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.headerText}>[ НАЗАД ]</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>ПРОЕКТ: БЕЗ ИМЕНИ</Text>
                <Text style={styles.layerText}>СЛОЙ: {activeLayer.toUpperCase()}</Text>

            </View>
            
            {/* Наш графический движок */}
            <EditorCanvas />
            <ToolOverlay />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 5,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000000',
        fontFamily: 'monospace',
    },
    layerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
        fontFamily: 'monospace',
    },
});