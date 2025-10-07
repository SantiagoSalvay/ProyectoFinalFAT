import React, { useState } from 'react';
import { Plus, X, Check, Link as LinkIcon } from 'lucide-react';
import { 
  detectSocialMediaType, 
  formatSocialMediaUrl, 
  getSocialMediaIcon,
  getSocialMediaColor,
  getDisplayName,
  type SocialMediaLink 
} from '../utils/socialMediaDetector';

interface SocialMediaManagerProps {
  initialLinks: SocialMediaLink[];
  onSave: (links: SocialMediaLink[]) => Promise<void>;
  saving?: boolean;
}

export default function SocialMediaManager({ initialLinks, onSave, saving = false }: SocialMediaManagerProps) {
  const [links, setLinks] = useState<SocialMediaLink[]>(initialLinks);
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Debug logs
  console.log('🔍 [SocialMediaManager] initialLinks recibidos:', initialLinks);
  console.log('🔍 [SocialMediaManager] links actuales:', links);
  console.log('🔍 [SocialMediaManager] Son iguales?', JSON.stringify(initialLinks) === JSON.stringify(links));

  // Actualizar links cuando initialLinks cambie
  React.useEffect(() => {
    console.log('🔄 [SocialMediaManager] useEffect - initialLinks cambió:', initialLinks);
    setLinks(initialLinks);
  }, [initialLinks]);

  const handleAddLink = () => {
    if (!newUrl.trim()) return;

    const type = detectSocialMediaType(newUrl);
    const formattedUrl = formatSocialMediaUrl(newUrl);
    
    const newLink: SocialMediaLink = {
      id: Date.now().toString(),
      url: formattedUrl,
      type,
      displayName: getDisplayName(type)
    };

    setLinks([...links, newLink]);
    setNewUrl('');
    setIsAdding(false);
    setHasChanges(true);
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    setHasChanges(true);
  };

  const handleSave = async () => {
    console.log('💾 [SocialMediaManager] Guardando links:', links);
    await onSave(links);
    setHasChanges(false);
    console.log('✅ [SocialMediaManager] Links guardados exitosamente');
  };

  const handleCancel = () => {
    setLinks(initialLinks);
    setHasChanges(false);
    setIsAdding(false);
    setNewUrl('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Redes Sociales</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar red social</span>
          </button>
        )}
      </div>

      {/* Lista de redes sociales */}
      <div className="space-y-2">
        {links.map((link) => {
          const IconComponent = getSocialMediaIcon(link.type as any);
          const color = getSocialMediaColor(link.type as any);
          
          return (
            <div
              key={link.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div 
                  className="flex-shrink-0 p-2 rounded-full" 
                  style={{ backgroundColor: color + '20', color: color }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{link.displayName}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-purple-600 truncate block"
                    style={{ color: color }}
                  >
                    {link.url}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleRemoveLink(link.id)}
                className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {links.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <LinkIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No hay redes sociales agregadas</p>
            <p className="text-sm">Haz clic en "Agregar red social" para comenzar</p>
          </div>
        )}
      </div>

      {/* Formulario para agregar nueva red social */}
      {isAdding && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            URL de la red social o sitio web
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="https://instagram.com/tuong o tu@email.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              autoFocus
            />
            <button
              onClick={handleAddLink}
              disabled={!newUrl.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewUrl('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            💡 Detectamos automáticamente el tipo de red social. Soportamos: Facebook, Instagram, Twitter/X, LinkedIn, YouTube, TikTok, WhatsApp, sitios web y emails.
          </p>
        </div>
      )}

      {/* Botones de guardar/cancelar */}
      {hasChanges && (
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar cambios</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

