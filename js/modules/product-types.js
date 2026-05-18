const ProductTypes = {
  TYPES: {
    books: {
      id: 'books',
      icon: '📚',
      labelKey: 'typeBooks',
      color: '#4361ee',
      attributes: [
        { key: 'author', labelKey: 'attrAuthor', type: 'text', required: false, placeholderKey: 'attrAuthorPlaceholder' },
        { key: 'publisher', labelKey: 'attrPublisher', type: 'text', required: false, placeholderKey: 'attrPublisherPlaceholder' },
        { key: 'volumes', labelKey: 'attrVolumes', type: 'number', required: false, min: 1, default: 1 },
        { key: 'pages', labelKey: 'attrPages', type: 'number', required: false, min: 1 },
        { key: 'language', labelKey: 'attrLanguage', type: 'select', required: false, options: [
          { value: 'ar', labelKey: 'langArabic' },
          { value: 'en', labelKey: 'langEnglish' },
          { value: 'fr', labelKey: 'langFrench' },
          { value: 'ur', labelKey: 'langUrdu' },
          { value: 'tr', labelKey: 'langTurkish' },
          { value: 'other', labelKey: 'langOther' }
        ]},
        { key: 'edition', labelKey: 'attrEdition', type: 'text', required: false },
        { key: 'printYear', labelKey: 'attrPrintYear', type: 'number', required: false, min: 1000, max: 2100 },
        { key: 'isbn', labelKey: 'attrISBN', type: 'text', required: false, placeholderKey: 'attrISBNPlaceholder' }
      ],
      cardAttributes: ['volumes', 'language'],
      cardAttributeLabels: { volumes: 'attrVolumes', language: 'attrLanguage' }
    },
    clothes: {
      id: 'clothes',
      icon: '👕',
      labelKey: 'typeClothes',
      color: '#e63946',
      attributes: [
        { key: 'size', labelKey: 'attrSize', type: 'multiselect', required: false, options: [
          { value: 'XS', label: 'XS' },
          { value: 'S', label: 'S' },
          { value: 'M', label: 'M' },
          { value: 'L', label: 'L' },
          { value: 'XL', label: 'XL' },
          { value: 'XXL', label: 'XXL' }
        ]},
        { key: 'color', labelKey: 'attrColor', type: 'text', required: false, placeholderKey: 'attrColorPlaceholder' },
        { key: 'material', labelKey: 'attrMaterial', type: 'text', required: false, placeholderKey: 'attrMaterialPlaceholder' },
        { key: 'gender', labelKey: 'attrGender', type: 'select', required: false, options: [
          { value: 'men', labelKey: 'genderMen' },
          { value: 'women', labelKey: 'genderWomen' },
          { value: 'kids', labelKey: 'genderKids' },
          { value: 'unisex', labelKey: 'genderUnisex' }
        ]},
        { key: 'season', labelKey: 'attrSeason', type: 'select', required: false, options: [
          { value: 'summer', labelKey: 'seasonSummer' },
          { value: 'winter', labelKey: 'seasonWinter' },
          { value: 'spring', labelKey: 'seasonSpring' },
          { value: 'autumn', labelKey: 'seasonAutumn' },
          { value: 'all', labelKey: 'seasonAll' }
        ]}
      ],
      cardAttributes: ['size', 'color'],
      cardAttributeLabels: { size: 'attrSize', color: 'attrColor' }
    },
    perfumes: {
      id: 'perfumes',
      icon: '🌸',
      labelKey: 'typePerfumes',
      color: '#f72585',
      attributes: [
        { key: 'sizeMl', labelKey: 'attrSizeMl', type: 'select', required: false, options: [
          { value: '15', label: '15 ml' },
          { value: '30', label: '30 ml' },
          { value: '50', label: '50 ml' },
          { value: '75', label: '75 ml' },
          { value: '100', label: '100 ml' },
          { value: '150', label: '150 ml' },
          { value: '200', label: '200 ml' }
        ]},
        { key: 'fragranceType', labelKey: 'attrFragranceType', type: 'select', required: false, options: [
          { value: 'oud', labelKey: 'fragranceOud' },
          { value: 'musk', labelKey: 'fragranceMusk' },
          { value: 'amber', labelKey: 'fragranceAmber' },
          { value: 'floral', labelKey: 'fragranceFloral' },
          { value: 'citrus', labelKey: 'fragranceCitrus' },
          { value: 'woody', labelKey: 'fragranceWoody' },
          { value: 'fresh', labelKey: 'fragranceFresh' },
          { value: 'oriental', labelKey: 'fragranceOriental' }
        ]},
        { key: 'gender', labelKey: 'attrGender', type: 'select', required: false, options: [
          { value: 'men', labelKey: 'genderMen' },
          { value: 'women', labelKey: 'genderWomen' },
          { value: 'unisex', labelKey: 'genderUnisex' }
        ]},
        { key: 'concentration', labelKey: 'attrConcentration', type: 'select', required: false, options: [
          { value: 'parfum', label: 'Parfum' },
          { value: 'edp', label: 'EDP' },
          { value: 'edt', label: 'EDT' },
          { value: 'cologne', label: 'Cologne' }
        ]}
      ],
      cardAttributes: ['sizeMl', 'fragranceType'],
      cardAttributeLabels: { sizeMl: 'attrSizeMl', fragranceType: 'attrFragranceType' }
    },
    stationery: {
      id: 'stationery',
      icon: '🖊️',
      labelKey: 'typeStationery',
      color: '#4cc9f0',
      attributes: [
        { key: 'brand', labelKey: 'attrBrand', type: 'text', required: false, placeholderKey: 'attrBrandPlaceholder' },
        { key: 'color', labelKey: 'attrColor', type: 'text', required: false, placeholderKey: 'attrColorPlaceholder' },
        { key: 'packageQty', labelKey: 'attrPackageQty', type: 'number', required: false, min: 1, default: 1 }
      ],
      cardAttributes: ['brand', 'color'],
      cardAttributeLabels: { brand: 'attrBrand', color: 'attrColor' }
    },
    islamic: {
      id: 'islamic',
      icon: '🎁',
      labelKey: 'typeIslamic',
      color: '#2a9d8f',
      attributes: [
        { key: 'material', labelKey: 'attrMaterial', type: 'text', required: false, placeholderKey: 'attrMaterialPlaceholder' },
        { key: 'size', labelKey: 'attrSize', type: 'text', required: false, placeholderKey: 'attrSizePlaceholder' },
        { key: 'handmade', labelKey: 'attrHandmade', type: 'select', required: false, options: [
          { value: 'yes', labelKey: 'yes' },
          { value: 'no', labelKey: 'no' }
        ]}
      ],
      cardAttributes: ['material', 'handmade'],
      cardAttributeLabels: { material: 'attrMaterial', handmade: 'attrHandmade' }
    },
    other: {
      id: 'other',
      icon: '📦',
      labelKey: 'typeOther',
      color: '#8888a0',
      attributes: [],
      cardAttributes: [],
      cardAttributeLabels: {}
    }
  },

  getCustomAttributes() {
    return Storage.get('customAttributes') || [];
  },

  saveCustomAttributes(attrs) {
    Storage.set('customAttributes', attrs);
  },

  addCustomAttribute(attr) {
    const attrs = this.getCustomAttributes();
    attr.id = Helpers.genId('attr');
    attrs.push(attr);
    this.saveCustomAttributes(attrs);
    return attr;
  },

  removeCustomAttribute(id) {
    const attrs = this.getCustomAttributes().filter(a => a.id !== id);
    this.saveCustomAttributes(attrs);
  },

  getCustomTypeAttributes() {
    const customAttrs = this.getCustomAttributes();
    if (customAttrs.length === 0) return [];
    return customAttrs.map(attr => ({
      key: attr.key,
      labelKey: null,
      label: attr.label,
      type: attr.type,
      required: attr.required || false,
      options: attr.options || [],
      placeholder: attr.placeholder || '',
      isCustom: true
    }));
  },

  getAllAttributesForType(typeId) {
    const typeDef = this.TYPES[typeId];
    if (!typeDef) return [];
    const baseAttrs = [...typeDef.attributes];
    if (typeId !== 'other') {
      return [...baseAttrs, ...this.getCustomTypeAttributes()];
    }
    return [...baseAttrs, ...this.getCustomTypeAttributes()];
  },

  getTypeLabel(typeId) {
    const typeDef = this.TYPES[typeId];
    if (!typeDef) return typeId;
    if (typeDef.labelKey) return I18n.t(typeDef.labelKey);
    return typeId;
  },

  getTypeIcon(typeId) {
    return this.TYPES[typeId]?.icon || '📦';
  },

  getTypeColor(typeId) {
    return this.TYPES[typeId]?.color || '#8888a0';
  },

  getAttributeLabel(attrDef) {
    if (attrDef.labelKey) return I18n.t(attrDef.labelKey);
    if (attrDef.label) return attrDef.label;
    return attrDef.key;
  },

  getOptionLabel(option) {
    if (option.labelKey) return I18n.t(option.labelKey);
    return option.label || option.value;
  },

  renderAttributeInput(attrDef, value = '', containerId) {
    const label = this.getAttributeLabel(attrDef);
    const required = attrDef.required ? 'required' : '';
    const inputId = `attr_${attrDef.key}`;

    let inputHtml = '';

    switch (attrDef.type) {
      case 'text':
        inputHtml = `<input type="text" id="${inputId}" class="form-input" 
          value="${Helpers.escapeHtml(value)}" ${required}
          placeholder="${attrDef.placeholderKey ? I18n.t(attrDef.placeholderKey) : attrDef.placeholder || ''}">`;
        break;
      case 'number':
        inputHtml = `<input type="number" id="${inputId}" class="form-input" 
          value="${value || attrDef.default || ''}" ${required}
          min="${attrDef.min || ''}" max="${attrDef.max || ''}">`;
        break;
      case 'select':
        const options = attrDef.options.map(opt => 
          `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${this.getOptionLabel(opt)}</option>`
        ).join('');
        inputHtml = `<select id="${inputId}" class="form-select" ${required}>
          <option value="">${I18n.t('select')}</option>${options}</select>`;
        break;
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : (value ? value.split(',').filter(Boolean) : []);
        const msOptions = attrDef.options.map(opt => {
          const isSelected = selectedValues.includes(opt.value);
          return `<label class="multiselect-option ${isSelected ? 'selected' : ''}">
            <input type="checkbox" name="${inputId}" value="${opt.value}" ${isSelected ? 'checked' : ''}>
            <span>${this.getOptionLabel(opt)}</span>
          </label>`;
        }).join('');
        inputHtml = `<div class="multiselect-container" id="${inputId}">${msOptions}</div>
          <input type="hidden" id="${inputId}_value" value="${selectedValues.join(',')}">`;
        break;
      case 'textarea':
        inputHtml = `<textarea id="${inputId}" class="form-textarea" ${required}
          placeholder="${attrDef.placeholder || ''}">${Helpers.escapeHtml(value)}</textarea>`;
        break;
      case 'boolean':
        inputHtml = `<label class="toggle-switch">
          <input type="checkbox" id="${inputId}" ${value === 'yes' || value === true ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>`;
        break;
    }

    return `
      <div class="form-group attribute-field" data-attr-key="${attrDef.key}" data-attr-type="${attrDef.type}">
        <label class="form-label">${label} ${required ? '<span class="required-star">*</span>' : ''}</label>
        ${inputHtml}
      </div>`;
  },

  getAttributeValue(attrDef, container) {
    const inputId = `attr_${attrDef.key}`;
    const input = container.querySelector(`#${inputId}`);
    if (!input) return '';

    switch (attrDef.type) {
      case 'multiselect':
        const checked = container.querySelectorAll(`input[name="${inputId}"]:checked`);
        return Array.from(checked).map(cb => cb.value);
      case 'boolean':
        return input.checked ? 'yes' : 'no';
      case 'number':
        return input.value ? parseFloat(input.value) : '';
      default:
        return input.value;
    }
  },

  formatAttributeValue(attrDef, value) {
    if (!value && value !== 0) return '';
    if (attrDef.type === 'multiselect') {
      if (Array.isArray(value)) return value.join(', ');
      return value;
    }
    if (attrDef.type === 'select' && attrDef.options) {
      const opt = attrDef.options.find(o => o.value === value);
      return opt ? this.getOptionLabel(opt) : value;
    }
    if (attrDef.type === 'boolean') {
      return value === 'yes' ? I18n.t('yes') : I18n.t('no');
    }
    return value;
  },

  getAllTypes() {
    return Object.values(this.TYPES).map(t => ({
      id: t.id,
      icon: t.icon,
      label: this.getTypeLabel(t.id),
      color: t.color
    }));
  },

  getCardDisplayAttributes(product) {
    const typeDef = this.TYPES[product.type];
    if (!typeDef || !typeDef.cardAttributes) return [];
    return typeDef.cardAttributes.map(key => {
      const attrDef = typeDef.attributes.find(a => a.key === key);
      if (!attrDef) return null;
      return {
        key,
        label: this.getAttributeLabel(attrDef),
        value: this.formatAttributeValue(attrDef, product.attributes?.[key])
      };
    }).filter(Boolean);
  }
};
