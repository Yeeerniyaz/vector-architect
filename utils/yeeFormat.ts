import { Buffer } from 'buffer';
import {
    documentDirectory,
    readAsStringAsync,
    writeAsStringAsync,
} from 'expo-file-system/legacy';

/**
 * Упаковывает JSON чертежа в защищенный формат .yee
 */
export const exportToYee = async (projectName: string, cadData: object) => {
    try {
        // 1. Превращаем объект в строку
        const jsonString = JSON.stringify(cadData);

        // 2. Кодируем в Base64
        const base64String = Buffer.from(jsonString, 'utf-8').toString('base64');

        // 3. Фирменная маскировка YEE (переворачиваем строку)
        const maskedYeeData = base64String.split('').reverse().join('');

        // 4. Формируем путь (documentDirectory теперь используем напрямую)
        const fileName = `${projectName.replace(/\s+/g, '_')}.yee`;
        const fileUri = `${documentDirectory}${fileName}`;

        await writeAsStringAsync(fileUri, maskedYeeData, {
            encoding: 'utf8',
        });

        console.log(`[УСПЕХ] Файл сохранен: ${fileUri}`);
        return fileUri;
    } catch (error) {
        console.error('Ошибка при создании .yee файла:', error);
        return null;
    }
};

/**
 * Распаковывает файл .yee обратно в JSON для Zustand
 */
export const importFromYee = async (fileUri: string) => {
    try {
        // 1. Читаем зашифрованную кашу
        const maskedYeeData = await readAsStringAsync(fileUri, {
            encoding: 'utf8',
        });

        // 2. Снимаем маскировку (переворачиваем обратно)
        const base64String = maskedYeeData.split('').reverse().join('');

        // 3. Декодируем из Base64 в текст
        const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');

        // 4. Возвращаем родной JSON
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Ошибка! Файл .yee поврежден или имеет неверный формат.', error);
        return null;
    }
};