import { Artisan, Product, Inquiry, SalesRecord, CategoryDistribution } from '../types';

export const initialArtisan: Artisan = {
  id: 'artisan-ramswaroop',
  name: 'Ramswaroop Sharma',
  nameHi: 'रामस्वरूप शर्मा',
  phone: '+91 98290 44211',
  location: 'Kot Jewar, Jaipur District',
  state: 'Rajasthan',
  craftSpecialty: 'Jaipur Blue Pottery & Glazed Ceramics',
  experienceYears: 34,
  cooperativeName: 'Sanganer Vikas Hastshilp Samiti',
  isCooperativeMember: true,
  rating: 4.9,
  totalSales: 485000,
  activeListingsCount: 8,
  openInquiriesCount: 3,
  avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
  bio: 'Third-generation master artisan practicing the GI-certified art of Jaipur Blue Pottery. Our workshop utilizes non-clay quartz stone dough fired at low kiln temperatures with cobalt oxide and copper blues.',
  bioHi: 'जयपुर ब्लू पॉटरी के तीसरी पीढ़ी के उस्ताद कारीगर। हमारी कार्यशाला बिना मिट्टी के, केवल क्वार्ट्ज पत्थर, मुल्तानी मिट्टी और प्राकृतिक रंगों से हस्तनिर्मित कलाकृतियां बनाती है।'
};

export const initialProducts: Product[] = [
  {
    id: 'prod-surahi-01',
    title: 'Jaipur Blue Pottery Floral Surahi (Water Pitcher)',
    titleHi: 'पारंपरिक जयपुर ब्लू पॉटरी फ्लोरल सुराही',
    description: 'Authentic GI-tagged Jaipur Blue Pottery water vessel adorned with hand-painted Persian floral arabesques in traditional cobalt and turquoise glazes.',
    descriptionHi: 'हाथ से चित्रित पारंपरिक कोबाल्ट और फिरोज़ी रंगों वाली जीआई प्रमाणित जयपुर ब्लू पॉटरी सुराही।',
    culturalStory: 'Derived from Turko-Persian origins introduced during the reign of Maharaja Sawai Ram Singh II in the 19th century. Blue Pottery does not use traditional river clay; instead, the body is formed from quartz stone powder, Fuller’s earth, and katira gond gum.',
    culturalStoryHi: '19वीं शताब्दी में महाराजा सवाई राम सिंह द्वितीय के संरक्षण में विकसित। इसमें साधारण मिट्टी का उपयोग नहीं होता, बल्कि क्वार्ट्ज चूर्ण, मुल्तानी मिट्टी और प्राकृतिक गोंद से ढाला जाता है।',
    category: 'pottery',
    priceMin: 1450,
    priceMax: 1850,
    finalPrice: 1650,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'
    ],
    artisanId: 'artisan-ramswaroop',
    artisanName: 'Ramswaroop Sharma',
    artisanLocation: 'Kot Jewar, Jaipur, Rajasthan',
    artisanPhone: '+91 98290 44211',
    craftOrigin: 'Jaipur Heritage Cluster, Rajasthan (GI #33)',
    materials: ['Quartz Stone Powder', 'Fuller’s Earth (Multani Mitti)', 'Cobalt Oxide', 'Copper Glaze'],
    stockQuantity: 12,
    status: 'live',
    giTagged: true,
    giTagNumber: 'GI-RAJ-0033',
    tags: ['Blue Pottery', 'GI Certified', 'Jaipur Craft', 'Hand Painted', 'Cobalt Glaze'],
    detectedLanguage: 'hi',
    audioTranscript: 'यह सुराही मैंने और मेरे बेटे ने मिलकर बनाई है। इसमें क्वार्ट्ज पत्थर और तांबे के नीले रंग का लेप किया गया है।',
    createdAt: '2026-08-14T10:30:00Z'
  },
  {
    id: 'prod-dhokra-02',
    title: 'Bastar Lost-Wax Bell Metal (Dhokra) Nandi Figurine',
    titleHi: 'बस्तर ढोकरा कांस्य नंदी शिल्प (लॉस्ट-वैक्स पद्धति)',
    description: 'Hand-cast tribal bronze bell metal Nandi bull created using the ancient 4,000-year-old cire perdue (lost wax) metal casting technique.',
    descriptionHi: '4000 वर्ष पुरानी पारंपरिक ढोकरा लॉस्ट-वैक्स धातु ढलाई तकनीक से बना हस्तनिर्मित नंदी बैल।',
    culturalStory: 'Practiced by the Ghadwa tribal community of Bastar for millennia, Dhokra metal casting requires creating a clay core, winding beeswax threads to carve intricate ornamentation, and casting with molten scrap brass and bell metal.',
    culturalStoryHi: 'बस्तर के घड़वा समुदाय द्वारा पीढ़ियों से संरक्षित ढोकरा शिल्प। प्रत्येक कृति मोम के धागों से हाथों द्वारा गढ़ी जाती है, जिससे हर मूर्ति अपने आप में अद्वितीय होती है।',
    category: 'metal',
    priceMin: 2200,
    priceMax: 2800,
    finalPrice: 2500,
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
    ],
    artisanId: 'artisan-ramswaroop',
    artisanName: 'Sukhdev Ghadwa',
    artisanLocation: 'Kondagaon, Bastar, Chhattisgarh',
    artisanPhone: '+91 94252 88190',
    craftOrigin: 'Bastar Tribal Craft Cluster (GI #83)',
    materials: ['Bell Metal (Kansa)', 'Recycled Brass', 'Beeswax', 'River Clay'],
    stockQuantity: 7,
    status: 'live',
    giTagged: true,
    giTagNumber: 'GI-CG-0083',
    tags: ['Dhokra Art', 'Lost Wax', 'Bastar Tribal', 'Bell Metal', 'GI Heritage'],
    detectedLanguage: 'hi',
    audioTranscript: 'यह नंदी हमने पुरानी घंटी धातु और मधुमक्खी के मोम के तारों से सांचे में ढाला है।',
    createdAt: '2026-08-18T14:15:00Z'
  },
  {
    id: 'prod-banarasi-03',
    title: 'Handloom Pure Mulberry Silk Banarasi Kadhwa Stole',
    titleHi: 'हथकरघा शुद्ध शहतूत रेशम बनारसी कढ़वा स्टोल',
    description: 'Heirloom quality hand-woven Banarasi silk stole featuring delicate floral shikargah motifs woven with tested gold and silver zari threads.',
    descriptionHi: 'विशुद्ध शहतूत रेशम और सुनहरी ज़री से बुना हुआ हथकरघा बनारसी कढ़वा स्टोल।',
    culturalStory: 'In the revered Kadhwa technique, each floral buti motif is individually engraved on the pit loom without loose floats on the reverse side. A single master weaver spends over 20 days on each handcrafted stole.',
    culturalStoryHi: 'कढ़वा बुनाई बनारस की सबसे कठिन और मूल्यवान कला है जिसमें प्रत्येक बूटा अलग-अलग हाथ से बुना जाता है।',
    category: 'textiles',
    priceMin: 4200,
    priceMax: 5400,
    finalPrice: 4800,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    artisanId: 'artisan-ramswaroop',
    artisanName: 'Mohammad Shahid Ansari',
    artisanLocation: 'Madanpura, Varanasi, Uttar Pradesh',
    artisanPhone: '+91 97920 11984',
    craftOrigin: 'Varanasi Handloom Cluster (GI #99)',
    materials: ['Pure Mulberry Silk', 'Tested Gold/Silver Zari', 'Natural Plant Mordants'],
    stockQuantity: 5,
    status: 'live',
    giTagged: true,
    giTagNumber: 'GI-UP-0099',
    tags: ['Banarasi Silk', 'Kadhwa Weave', 'Handloom', 'GI Certified', 'Heirloom'],
    detectedLanguage: 'hi',
    audioTranscript: 'यह कढ़वा बुनाई का स्टोल है जिसमें पीछे कोई धागा नहीं छूटता। पूरे 25 दिन लगे हैं इसे तैयार करने में।',
    createdAt: '2026-08-22T09:00:00Z'
  },
  {
    id: 'prod-madhubani-04',
    title: 'Madhubani Handpainted "Tree of Life" Parchment Art',
    titleHi: 'मधुबनी हस्तचित्रित "जीवन का वृक्ष" (गोबर लिपे बांस कागज़ पर)',
    description: 'Fine-nib Kachni style folk painting depicting the sacred cosmic tree, birds, and flora using natural plant dyes and cow dung wash on handmade rag paper.',
    descriptionHi: 'हाथ से बने कागज़ पर प्राकृतिक वनस्पति रंगों और बांस की कलम से उकेरी गई मधुबनी कछनी चित्रकला।',
    culturalStory: 'Originating in the Mithila region of Bihar, Madhubani painting was traditionally practiced by women on the freshly plastered mud walls of their huts during weddings and harvest festivals.',
    culturalStoryHi: 'मिथिला की महिलाओं द्वारा सदियों से दीवारों पर प्राकृतिक रंगों जैसे हल्दी, नील और काजल से बनाई जाने वाली शुभ चित्रकला।',
    category: 'painting',
    priceMin: 1800,
    priceMax: 2400,
    finalPrice: 2100,
    images: [
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80'
    ],
    artisanId: 'artisan-ramswaroop',
    artisanName: 'Bina Devi Paswan',
    artisanLocation: 'Jitwarpur, Madhubani, Bihar',
    artisanPhone: '+91 93041 55231',
    craftOrigin: 'Mithila Region, Bihar (GI #105)',
    materials: ['Handmade Bamboo Paper', 'Indigo Plant Dye', 'Turmeric Ochre', 'Lampblack Ink'],
    stockQuantity: 15,
    status: 'live',
    giTagged: true,
    giTagNumber: 'GI-BR-0105',
    tags: ['Madhubani', 'Mithila Folk Art', 'Natural Dyes', 'Tree of Life', 'GI Heritage'],
    detectedLanguage: 'hi',
    audioTranscript: 'यह चित्रकला हमने घर में बनाई है, प्राकृतिक हल्दी, काजल और नीम के पत्तों के रस से।',
    createdAt: '2026-08-28T16:40:00Z'
  },
  {
    id: 'prod-kala-cotton-05',
    title: 'Kutch Kala Cotton Handspun Organic Shawl',
    titleHi: 'कच्छ काला कॉटन प्राकृतिक हथकरघा शॉल',
    description: 'Indigenous rain-fed organic Kala cotton handwoven on traditional throw-shuttle pit looms by the Vankar community of Bhujodi.',
    descriptionHi: 'कच्छ के भुजोड़ी बुनकरों द्वारा वर्षा-आधारित जैविक काला कपास से बुनी गई पारंपरिक शॉल।',
    culturalStory: 'Kala cotton is an indigenous genetically pure Old World cotton from Kutch that requires zero pesticides or chemical fertilizers. Each geometric border is picked by hand on the loom.',
    culturalStoryHi: 'कच्छ की वर्षा-आधारित देशज कपास जो बिना रासायनिक खाद के उगती है। इसके किनारे हाथों से पारंपरिक नमूनों में बुने गए हैं।',
    category: 'textiles',
    priceMin: 2800,
    priceMax: 3600,
    finalPrice: 3200,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ],
    artisanId: 'artisan-ramswaroop',
    artisanName: 'Pravin Vankar',
    artisanLocation: 'Bhujodi, Kutch, Gujarat',
    artisanPhone: '+91 99791 22340',
    craftOrigin: 'Kutch Artisan Cluster, Gujarat',
    materials: ['100% Organic Kala Cotton', 'Pomegranate Peel Yellow', 'Hardu Vegetable Dye'],
    stockQuantity: 9,
    status: 'live',
    giTagged: false,
    tags: ['Organic Cotton', 'Kutch Weaving', 'Sustainable', 'Handspun', 'Natural Dye'],
    detectedLanguage: 'hi',
    createdAt: '2026-09-02T11:20:00Z'
  },
  {
    id: 'prod-channapatna-06',
    title: 'Channapatna Non-Toxic Lacquerware Wooden Stacking Birds',
    titleHi: 'चन्नपटना प्राकृतिक लाख रंगीन काष्ठ खिलौने (पक्षी)',
    description: 'Eco-friendly traditional wooden stacking puzzle crafted from locally harvested Ivory wood (Wrightia tinctoria) and finished with natural non-toxic vegetable lacquers.',
    descriptionHi: 'आइवरी की लकड़ी और प्राकृतिक लाख (हल्दी और नील) से बने बच्चों के लिए सुरक्षित खिलौने।',
    culturalStory: 'Originating during the reign of Tipu Sultan who invited Persian artisans to train local craftspeople, Channapatna woodcraft is known as the "Gombegala Ooru" (Toy Town) of India.',
    culturalStoryHi: 'टीपू सुल्तान के समय से प्रचलित चन्नपटना खिलौना कला। इसमें केवल प्राकृतिक वनस्पति रंगों का उपयोग होता है।',
    category: 'woodwork',
    priceMin: 750,
    priceMax: 1050,
    finalPrice: 890,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
    ],
    artisanId: 'artisan-ramswaroop',
    artisanName: 'Girish Gowda',
    artisanLocation: 'Channapatna, Ramanagara, Karnataka',
    artisanPhone: '+91 94812 66720',
    craftOrigin: 'Channapatna Craft Cluster (GI #01)',
    materials: ['Ivory Wood (Aale Mara)', 'Natural Lac Resin', 'Turmeric and Kumkum Dyes'],
    stockQuantity: 24,
    status: 'live',
    giTagged: true,
    giTagNumber: 'GI-KA-0001',
    tags: ['Channapatna', 'GI Tagged', 'Eco Friendly Toys', 'Non Toxic', 'Woodcraft'],
    detectedLanguage: 'en',
    createdAt: '2026-09-08T08:15:00Z'
  }
];

export const initialInquiries: Inquiry[] = [
  {
    id: 'inq-01',
    productId: 'prod-surahi-01',
    productTitle: 'Jaipur Blue Pottery Floral Surahi',
    productImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80',
    artisanId: 'artisan-ramswaroop',
    buyerName: 'Vikramaditya Patel',
    buyerPhone: '+91 98980 12345',
    buyerEmail: 'vikram.heritage@gmail.com',
    channel: 'call',
    message: 'Hello Ramswaroop Ji, we want to place an order of 15 handcrafted surahis for our heritage resort dining hall in Udaipur. Please arrange a callback.',
    status: 'new',
    createdAt: '2026-09-20T14:30:00Z',
    replies: []
  },
  {
    id: 'inq-02',
    productId: 'prod-banarasi-03',
    productTitle: 'Handloom Pure Mulberry Silk Banarasi Kadhwa Stole',
    productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    artisanId: 'artisan-ramswaroop',
    buyerName: 'Priya Sundaram',
    buyerPhone: '+91 98450 77123',
    buyerEmail: 'priya.sundaram@designstudio.in',
    channel: 'chat',
    message: 'Namaste! Can the zari border pattern be slightly customized with peacock motifs for a wedding trousseau? How many days lead time is required?',
    status: 'new',
    createdAt: '2026-09-21T18:45:00Z',
    replies: [
      {
        id: 'rep-01',
        sender: 'artisan',
        message: 'Namaste Priya Ji! Yes, peacock motifs can be incorporated on our pit loom. It will take 18 days to weave by hand.',
        timestamp: '2026-09-22T08:10:00Z'
      }
    ]
  },
  {
    id: 'inq-03',
    productId: 'prod-dhokra-02',
    productTitle: 'Bastar Lost-Wax Bell Metal (Dhokra) Nandi Figurine',
    productImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80',
    artisanId: 'artisan-ramswaroop',
    buyerName: 'Rahul Mehra',
    buyerPhone: '+91 99100 45678',
    channel: 'sms',
    message: 'Interested in Bastar Dhokra Nandi. Confirming availability for immediate dispatch to South Extension, New Delhi. Is packaging shatter-proof?',
    status: 'contacted',
    createdAt: '2026-09-19T11:20:00Z',
    replies: []
  }
];

export const salesRecords6Months: SalesRecord[] = [
  { month: 'Apr', revenue: 54000, orders: 28 },
  { month: 'May', revenue: 68500, orders: 36 },
  { month: 'Jun', revenue: 72000, orders: 41 },
  { month: 'Jul', revenue: 86000, orders: 49 },
  { month: 'Aug', revenue: 98500, orders: 58 },
  { month: 'Sep', revenue: 106000, orders: 63 }
];

export const categoryDistribution: CategoryDistribution[] = [
  { category: 'Blue Pottery & Ceramics', percentage: 42, itemCount: 18 },
  { category: 'Dhokra & Bell Metal', percentage: 28, itemCount: 12 },
  { category: 'Handloom & Textiles', percentage: 18, itemCount: 8 },
  { category: 'Folk Paintings', percentage: 12, itemCount: 5 }
];
