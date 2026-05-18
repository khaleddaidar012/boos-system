(function() {
  const users = Storage.get('users');
  if (users && users.length > 0) return;

  const defaultUsers = [
    {
      id: Helpers.genId('usr'),
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('usr'),
      username: 'worker',
      password: 'worker123',
      role: 'worker',
      createdAt: new Date().toISOString()
    }
  ];

  Storage.set('users', defaultUsers);

  const defaultProducts = [
    {
      id: Helpers.genId('prod'),
      name: 'Riyad as-Salihin',
      type: 'books',
      price: 25.00,
      cost: 15.00,
      quantity: 50,
      image: '',
      description: 'Garden of the Righteous — Collection of hadith by Imam Nawawi',
      attributes: {
        author: 'Imam Nawawi',
        publisher: 'Darussalam',
        volumes: 1,
        pages: 1200,
        language: 'en',
        edition: 'First',
        printYear: 2007,
        isbn: '978-9960899600'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Sahih al-Bukhari',
      type: 'books',
      price: 45.00,
      cost: 30.00,
      quantity: 30,
      image: '',
      description: 'The most authentic collection of hadith compiled by Imam al-Bukhari',
      attributes: {
        author: 'Imam al-Bukhari',
        publisher: 'Dar Ibn Kathir',
        volumes: 9,
        pages: 5000,
        language: 'ar',
        edition: 'Third',
        printYear: 2002,
        isbn: '978-9960899601'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Tafsir Ibn Kathir',
      type: 'books',
      price: 60.00,
      cost: 40.00,
      quantity: 20,
      image: '',
      description: 'Classic Quran commentary by Imam Ibn Kathir',
      attributes: {
        author: 'Ibn Kathir',
        publisher: 'Darussalam',
        volumes: 10,
        pages: 6000,
        language: 'ar',
        edition: 'Second',
        printYear: 2000,
        isbn: '978-9960899602'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Fortress of the Muslim',
      type: 'books',
      price: 10.00,
      cost: 5.00,
      quantity: 100,
      image: '',
      description: 'Daily supplications from the Quran and Sunnah',
      attributes: {
        author: 'Sa\'id ibn Ali ibn Wahf al-Qahtani',
        publisher: 'Darussalam',
        volumes: 1,
        pages: 200,
        language: 'en',
        edition: 'Fifth',
        printYear: 2009,
        isbn: '978-9960899603'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Cotton Thobe - White',
      type: 'clothes',
      price: 35.00,
      cost: 20.00,
      quantity: 45,
      image: '',
      description: 'Premium cotton thobe for men',
      attributes: {
        size: ['M', 'L', 'XL', 'XXL'],
        color: 'White',
        material: 'Cotton',
        gender: 'men',
        season: 'all'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Oud Al-Madinah',
      type: 'perfumes',
      price: 85.00,
      cost: 50.00,
      quantity: 25,
      image: '',
      description: 'Premium oud fragrance from Madinah',
      attributes: {
        sizeMl: '50',
        fragranceType: 'oud',
        gender: 'unisex',
        concentration: 'parfum'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Musk Al-Khaleej',
      type: 'perfumes',
      price: 65.00,
      cost: 40.00,
      quantity: 35,
      image: '',
      description: 'Pure white musk fragrance',
      attributes: {
        sizeMl: '100',
        fragranceType: 'musk',
        gender: 'unisex',
        concentration: 'edp'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Pilot Pen Set',
      type: 'stationery',
      price: 12.00,
      cost: 7.00,
      quantity: 150,
      image: '',
      description: 'High quality ballpoint pen set',
      attributes: {
        brand: 'Pilot',
        color: 'Blue/Black/Red',
        packageQty: 10
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Misbaha - Amber',
      type: 'islamic',
      price: 15.00,
      cost: 8.00,
      quantity: 80,
      image: '',
      description: 'Amber prayer beads, 33 beads',
      attributes: {
        material: 'Amber',
        size: 'Standard',
        handmade: 'no'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Handmade Misbaha - Agate',
      type: 'islamic',
      price: 45.00,
      cost: 25.00,
      quantity: 15,
      image: '',
      description: 'Premium handmade agate prayer beads',
      attributes: {
        material: 'Agate',
        size: 'Large',
        handmade: 'yes'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'The Sealed Nectar',
      type: 'books',
      price: 20.00,
      cost: 12.00,
      quantity: 40,
      image: '',
      description: 'Biography of the Prophet Muhammad (peace be upon him)',
      attributes: {
        author: 'Safiur Rahman Mubarakpuri',
        publisher: 'Darussalam',
        volumes: 1,
        pages: 650,
        language: 'en',
        edition: 'First',
        printYear: 2003,
        isbn: '978-9960899604'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: Helpers.genId('prod'),
      name: 'Amber Fragrance Oil',
      type: 'perfumes',
      price: 40.00,
      cost: 22.00,
      quantity: 0,
      image: '',
      description: 'Pure amber fragrance oil',
      attributes: {
        sizeMl: '30',
        fragranceType: 'amber',
        gender: 'unisex',
        concentration: 'parfum'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  Storage.set('products', defaultProducts);
  Storage.set('cart', []);
  Storage.set('transactions', []);
  Storage.set('trash', []);
  Storage.set('settings', { theme: 'light', language: 'en' });
  Storage.set('customAttributes', []);

  console.log('Seed data initialized.');
})();
