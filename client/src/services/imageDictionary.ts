// Servicio para manejar el diccionario de imágenes localmente
// Usa localStorage para simular el diccionario del VPS

interface ImageDictionaryEntry {
  userId: number;
  fileName: string;
  uploadDate: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string; // Para almacenar la imagen como data URL localmente
}

interface ImageDictionary {
  [userId: string]: ImageDictionaryEntry;
}

class ImageDictionaryService {
  private dictionaryKey = 'ong_images_dictionary';
  private dictionary: ImageDictionary = {};

  constructor() {
    this.loadFromLocalStorage();
  }

  // Cargar diccionario desde localStorage
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.dictionaryKey);
      if (stored) {
        this.dictionary = JSON.parse(stored);
        console.log('📋 Diccionario cargado desde localStorage:', this.dictionary);
      }
    } catch (error) {
      console.error('Error al cargar diccionario desde localStorage:', error);
      this.dictionary = {};
    }
  }

  // Guardar diccionario en localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.dictionaryKey, JSON.stringify(this.dictionary));
      console.log('💾 Diccionario guardado en localStorage');
    } catch (error) {
      console.error('Error al guardar diccionario en localStorage:', error);
    }
  }

  // Obtener el diccionario completo (simulado desde localStorage)
  async loadDictionary(): Promise<ImageDictionary> {
    this.loadFromLocalStorage();
    return this.dictionary;
  }

  // Subir imagen localmente y actualizar diccionario
  async uploadImage(file: File, userId: number): Promise<string> {
    try {
      // Convertir archivo a data URL para almacenamiento local
      const dataUrl = await this.fileToDataUrl(file);
      
      // Generar nombre de archivo único
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `ong_${userId}_${timestamp}.${extension}`;

      // Crear entrada del diccionario
      const entry: ImageDictionaryEntry = {
        userId,
        fileName,
        uploadDate: new Date().toISOString(),
        fileSize: file.size,
        mimeType: file.type,
        dataUrl
      };

      // Actualizar diccionario local
      this.dictionary[userId.toString()] = entry;
      
      // Guardar en localStorage
      this.saveToLocalStorage();

      console.log('✅ Imagen guardada localmente:', entry);
      
      // Retornar la data URL como URL de imagen
      return dataUrl;
    } catch (error) {
      console.error('Error al subir imagen localmente:', error);
      throw error;
    }
  }

  // Convertir archivo a data URL
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Obtener URL de imagen de un usuario
  getImageUrl(userId: number): string | null {
    const entry = this.dictionary[userId.toString()];
    return entry ? entry.dataUrl : null;
  }

  // Obtener información de imagen de un usuario
  getImageInfo(userId: number): ImageDictionaryEntry | null {
    return this.dictionary[userId.toString()] || null;
  }

  // Obtener todas las imágenes de ONGs (para carrusel)
  getAllONGsImages(): Array<{userId: number, imageUrl: string, fileName: string}> {
    return Object.entries(this.dictionary).map(([userId, entry]) => ({
      userId: parseInt(userId),
      imageUrl: entry.dataUrl,
      fileName: entry.fileName,
    }));
  }

  // Eliminar imagen de un usuario
  async deleteImage(userId: number): Promise<boolean> {
    try {
      delete this.dictionary[userId.toString()];
      this.saveToLocalStorage();
      console.log('🗑️ Imagen eliminada localmente para usuario:', userId);
      return true;
    } catch (error) {
      console.error('Error al eliminar imagen localmente:', error);
      return false;
    }
  }

  // Sincronizar diccionario (recargar desde localStorage)
  async syncDictionary(): Promise<void> {
    this.loadFromLocalStorage();
  }

  // Limpiar todo el diccionario (para testing)
  clearAll(): void {
    this.dictionary = {};
    localStorage.removeItem(this.dictionaryKey);
    console.log('🧹 Diccionario limpiado completamente');
  }
}

// Instancia singleton del servicio
export const imageDictionaryService = new ImageDictionaryService();

// Funciones de conveniencia para usar el servicio
export const uploadImageToVPS = (file: File, userId: number) => 
  imageDictionaryService.uploadImage(file, userId);

export const getUserImageUrl = (userId: number) => 
  imageDictionaryService.getImageUrl(userId);

export const getAllONGsImages = () => 
  imageDictionaryService.getAllONGsImages();

export const loadImageDictionary = () => 
  imageDictionaryService.loadDictionary();

export const deleteUserImage = (userId: number) => 
  imageDictionaryService.deleteImage(userId);

export const clearAllImages = () => 
  imageDictionaryService.clearAll();