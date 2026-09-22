import React, { useState } from 'react';
import { CraftCategory } from '../../types';
import { useTranslation } from '../../i18n';
import { Plus, Minus, Check, Layers, Package, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface WizardStep3DetailsProps {
  category: CraftCategory;
  selectedMaterials: string[];
  onToggleMaterial: (material: string) => void;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  onSubmitAnalysis: () => void;
  isLoading: boolean;
}

const COMMON_MATERIALS: Record<CraftCategory, string[]> = {
  pottery: ['Quartz Stone Powder', 'Multani Mitti (Fuller’s Earth)', 'Cobalt Blue Oxide', 'Natural Borax Glaze', 'Copper Oxide'],
  metal: ['Bell Metal (Kansa)', 'Recycled Brass', 'Natural Beeswax', 'River Bed Mud', 'Charcoal Fuel'],
  textiles: ['Pure Mulberry Silk', 'Tested Metallic Zari', 'Organic Kala Cotton', 'Natural Indigo Dye', 'Vegetable Mordant'],
  painting: ['Handmade Bamboo Paper', 'Lamp Soot Ink', 'Turmeric Ochre', 'Indigo Leaf Extract', 'Cow Dung Wash'],
  woodwork: ['Ivory Wood (Aale Mara)', 'Purified Lac Resin', 'Turmeric Yellow Dye', 'Kumkum Powder', 'Acacia Wood'],
  basketry: ['Wild Sikki Golden Grass', 'Munj Reed', 'Natural Madder Root Dye', 'Palm Leaves'],
  jewelry: ['925 Sterling Silver', 'Hand-Twisted Wire', 'Natural Borax Flux', 'Agate Stone'],
  leather: ['Naturally Tanned Rawhide', 'Silk Dabka Thread', 'Cotton Twine', 'Acacia Bark Tanning'],
  other: ['Natural Clay', 'Terracotta Earth', 'Organic Dyes', 'Handspun Yarn']
};

export const WizardStep3Details: React.FC<WizardStep3DetailsProps> = ({
  category,
  selectedMaterials,
  onToggleMaterial,
  quantity,
  onChangeQuantity,
  onSubmitAnalysis,
  isLoading
}) => {
  const { t, isHindi } = useTranslation();
  const [customMaterialInput, setCustomMaterialInput] = useState('');

  const availableMaterials = COMMON_MATERIALS[category] || COMMON_MATERIALS.other;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMaterialInput.trim()) {
      onToggleMaterial(customMaterialInput.trim());
      setCustomMaterialInput('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Materials Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-terracotta-500" />
            <span>{t('wizard.materialsLabel')}</span>
          </label>
          <span className="text-xs text-stone-500">
            {selectedMaterials.length} {isHindi ? 'चयनित' : 'selected'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableMaterials.map((mat) => {
            const isSelected = selectedMaterials.includes(mat);
            return (
              <button
                key={mat}
                type="button"
                onClick={() => onToggleMaterial(mat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer tap-target-accessible min-h-[44px] flex items-center gap-2 ${
                  isSelected
                    ? 'bg-terracotta-50 border-terracotta-500 text-terracotta-800 font-semibold shadow-xs ring-1 ring-terracotta-400'
                    : 'bg-paper-100 border-paper-300 text-stone-700 hover:border-stone-400 hover:bg-paper-200'
                }`}
              >
                <span>{mat}</span>
                {isSelected && <Check className="w-4 h-4 text-terracotta-600" />}
              </button>
            );
          })}
        </div>

        {/* Custom material input */}
        <form onSubmit={handleAddCustom} className="mt-3 flex gap-2">
          <input
            type="text"
            value={customMaterialInput}
            onChange={(e) => setCustomMaterialInput(e.target.value)}
            placeholder={isHindi ? 'अन्य सामग्री लिखें...' : 'Add other raw material...'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-paper-300 bg-paper-50 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
          />
          <button
            type="submit"
            disabled={!customMaterialInput.trim()}
            className="px-4 py-2.5 bg-paper-200 hover:bg-paper-300 text-indigo-950 font-semibold text-xs sm:text-sm rounded-xl border border-paper-300 disabled:opacity-40 cursor-pointer tap-target-accessible"
          >
            {isHindi ? '+ जोड़ें' : '+ Add'}
          </button>
        </form>
      </div>

      {/* Available Quantity Stepper */}
      <div className="bg-paper-100 border border-paper-300 rounded-2xl p-5 shadow-xs">
        <label className="block text-sm font-bold text-indigo-950 mb-1 flex items-center gap-2">
          <Package className="w-4 h-4 text-turmeric-600" />
          <span>{t('wizard.quantityLabel')}</span>
        </label>
        <p className="text-xs text-stone-500 mb-4">
          {isHindi ? 'कार्यशाला में तुरंत बिक्री के लिए तैयार नग' : 'Ready stock currently available in your workshop'}
        </p>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
            className="w-14 h-14 rounded-2xl bg-paper-200 hover:bg-paper-300 text-indigo-950 border border-paper-300 flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer tap-target-accessible"
            aria-label="Decrease quantity"
          >
            <Minus className="w-6 h-6" />
          </button>

          <div className="text-center min-w-[80px]">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-indigo-950">
              {quantity}
            </span>
            <span className="block text-xs font-semibold text-stone-500">
              {t('common.pieces')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeQuantity(quantity + 1)}
            className="w-14 h-14 rounded-2xl bg-paper-200 hover:bg-paper-300 text-indigo-950 border border-paper-300 flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer tap-target-accessible"
            aria-label="Increase quantity"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Submit Trigger Banner */}
      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onSubmitAnalysis}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-5 h-5 text-turmeric-300" />}
          className="w-full text-base sm:text-lg py-4 shadow-craft-md font-bold"
        >
          {t('wizard.btnAnalyze')}
        </Button>
      </div>

    </div>
  );
};
