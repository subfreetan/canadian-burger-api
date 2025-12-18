// Base de données en mémoire (reset à chaque cold start)
let db = {
  users: [
    { id: 1, email: "admin@canadianburger.be", password: "admin123", name: "Admin Restaurant", phone: "0470000000", points: 0, role: "admin", createdAt: "2024-01-01T00:00:00.000Z" }
  ],
  categories: [
    { id: 1, name: "Burgers", icon: "🍔" },
    { id: 2, name: "Poulet", icon: "🍗" },
    { id: 3, name: "Fish", icon: "🐟" },
    { id: 4, name: "Végétarien", icon: "🥬" },
    { id: 5, name: "Accompagnements", icon: "🍟" },
    { id: 6, name: "Boissons", icon: "🥤" },
    { id: 7, name: "Desserts", icon: "🍦" }
  ],
  products: [
    { id: 1, name: "Real Canadian", description: "Notre burger signature avec bacon croustillant, cheddar fondant, oignons caramélisés et sauce maison", price: 8.99, categoryId: 1, available: true },
    { id: 2, name: "Double Cheese", description: "Double steak haché, double cheddar, cornichons, oignons et sauce spéciale", price: 9.99, categoryId: 1, available: true },
    { id: 3, name: "Double Bacon Cheese", description: "Double steak, double bacon croustillant, double cheddar et sauce BBQ", price: 10.99, categoryId: 1, available: true },
    { id: 4, name: "Poulet Cheese", description: "Filet de poulet pané croustillant, cheddar, salade et mayonnaise", price: 8.49, categoryId: 2, available: true },
    { id: 5, name: "Pepper Burger", description: "Steak haché, sauce au poivre, oignons frits et fromage", price: 9.49, categoryId: 1, available: true },
    { id: 6, name: "Fish Burger", description: "Filet de poisson pané, sauce tartare, salade iceberg", price: 8.99, categoryId: 3, available: true },
    { id: 7, name: "Vegan Moutarde", description: "Steak végétal, sauce moutarde et miel, légumes frais", price: 9.49, categoryId: 4, available: true },
    { id: 8, name: "Miel Moutarde", description: "Filet de poulet grillé, sauce miel moutarde, tomates et salade", price: 8.99, categoryId: 2, available: true },
    { id: 9, name: "BBQ Burger", description: "Steak haché, sauce BBQ fumée, oignons frits, cheddar", price: 9.49, categoryId: 1, available: true },
    { id: 10, name: "Curry Madras Cheese", description: "Poulet mariné au curry, fromage fondu, oignons et sauce épicée", price: 9.99, categoryId: 2, available: true },
    { id: 11, name: "Frites Maison", description: "Portion généreuse de frites fraîches", price: 3.50, categoryId: 5, available: true },
    { id: 12, name: "Onion Rings", description: "Rondelles d'oignons panées et croustillantes", price: 4.50, categoryId: 5, available: true },
    { id: 13, name: "Coca-Cola", description: "33cl", price: 2.50, categoryId: 6, available: true },
    { id: 14, name: "Sprite", description: "33cl", price: 2.50, categoryId: 6, available: true },
    { id: 15, name: "Eau Minérale", description: "50cl", price: 2.00, categoryId: 6, available: true },
    { id: 16, name: "Milkshake Vanille", description: "Milkshake onctueux à la vanille", price: 4.50, categoryId: 6, available: true },
    { id: 17, name: "Brownie", description: "Brownie au chocolat fondant", price: 3.50, categoryId: 7, available: true },
    { id: 18, name: "Sundae Caramel", description: "Glace vanille, sauce caramel, chantilly", price: 4.00, categoryId: 7, available: true }
  ],
  rewards: [
    { id: 1, name: "Boisson Offerte", description: "Une boisson au choix", pointsCost: 70, type: "drink" },
    { id: 2, name: "Frites Offertes", description: "Une portion de frites maison", pointsCost: 50, type: "side" },
    { id: 3, name: "Dessert Offert", description: "Un dessert au choix", pointsCost: 100, type: "dessert" },
    { id: 4, name: "Burger Offert", description: "Un burger au choix", pointsCost: 200, type: "burger" },
    { id: 5, name: "Menu Complet", description: "Burger + Frites + Boisson", pointsCost: 350, type: "menu" }
  ],
  orders: [],
  redeemedRewards: [],
  events: []
};

function generateOrderCode() {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CB-${dateStr}-${random}`;
}

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url.replace('/api', '');
  const method = req.method;
  const body = req.body || {};

  // Route racine
  if (url === '' || url === '/') {
    return res.json({ status: 'ok', message: 'Canadian Burger API', version: '1.0' });
  }

  // AUTH - Login
  if (url === '/auth/login' && method === 'POST') {
    const user = db.users.find(u => u.email === body.email && u.password === body.password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, user: userWithoutPassword });
    }
    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
  }

  // AUTH - Register
  if (url === '/auth/register' && method === 'POST') {
    if (db.users.find(u => u.email === body.email)) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }
    const newUser = {
      id: db.users.length + 1,
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      points: 0,
      role: 'client',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ success: true, user: userWithoutPassword });
  }

  // USERS - Get by ID
  const userMatch = url.match(/^\/users\/(\d+)$/);
  if (userMatch && method === 'GET') {
    const user = db.users.find(u => u.id === parseInt(userMatch[1]));
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
    return res.status(404).json({ error: 'User not found' });
  }

  // USERS - Get rewards
  const userRewardsMatch = url.match(/^\/users\/(\d+)\/rewards$/);
  if (userRewardsMatch && method === 'GET') {
    const userId = parseInt(userRewardsMatch[1]);
    return res.json(db.redeemedRewards.filter(r => r.userId === userId));
  }

  // USERS - Get orders
  const userOrdersMatch = url.match(/^\/users\/(\d+)\/orders$/);
  if (userOrdersMatch && method === 'GET') {
    const userId = parseInt(userOrdersMatch[1]);
    return res.json(db.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  // CATEGORIES
  if (url === '/categories' && method === 'GET') {
    return res.json(db.categories);
  }

  // PRODUCTS
  if (url.startsWith('/products') && method === 'GET') {
    const urlObj = new URL(req.url, 'http://localhost');
    const categoryId = urlObj.searchParams.get('categoryId');
    let products = db.products;
    if (categoryId) {
      products = products.filter(p => p.categoryId === parseInt(categoryId));
    }
    return res.json(products);
  }

  // PRODUCTS - Update
  const productMatch = url.match(/^\/products\/(\d+)$/);
  if (productMatch && method === 'PATCH') {
    const idx = db.products.findIndex(p => p.id === parseInt(productMatch[1]));
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...body };
      return res.json(db.products[idx]);
    }
    return res.status(404).json({ error: 'Product not found' });
  }

  // REWARDS
  if (url === '/rewards' && method === 'GET') {
    return res.json(db.rewards);
  }

  // REWARDS - Redeem
  if (url === '/rewards/redeem' && method === 'POST') {
    const user = db.users.find(u => u.id === body.userId);
    const reward = db.rewards.find(r => r.id === body.rewardId);
    if (!user || !reward) {
      return res.status(404).json({ success: false, message: 'Non trouvé' });
    }
    if (user.points < reward.pointsCost) {
      return res.status(400).json({ success: false, message: 'Points insuffisants' });
    }
    const userIdx = db.users.findIndex(u => u.id === body.userId);
    db.users[userIdx].points -= reward.pointsCost;
    const redeemedReward = {
      id: db.redeemedRewards.length + 1,
      userId: body.userId,
      rewardId: body.rewardId,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      status: 'available',
      code: `RW-${Date.now().toString(36).toUpperCase()}`,
      redeemedAt: new Date().toISOString()
    };
    db.redeemedRewards.push(redeemedReward);
    return res.json({ success: true, reward: redeemedReward, remainingPoints: db.users[userIdx].points });
  }

  // ORDERS - Get all
  if (url === '/orders' && method === 'GET') {
    const orders = db.orders.map(order => {
      const user = db.users.find(u => u.id === order.userId);
      return { ...order, userName: user ? user.name : 'Client', userPhone: user ? user.phone : '' };
    });
    return res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  // ORDERS - Create
  if (url === '/orders' && method === 'POST') {
    const pointsEarned = Math.floor(body.total * 4);
    const newOrder = {
      id: db.orders.length + 1,
      orderCode: generateOrderCode(),
      userId: body.userId || null,
      items: body.items,
      total: body.total,
      pointsEarned,
      usedRewards: body.usedRewards || [],
      status: 'pending',
      type: body.type || 'click-collect',
      pickupTime: body.pickupTime || null,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    db.orders.push(newOrder);
    if (body.usedRewards) {
      body.usedRewards.forEach(rewardId => {
        const idx = db.redeemedRewards.findIndex(r => r.id === rewardId);
        if (idx !== -1) db.redeemedRewards[idx].status = 'pending';
      });
    }
    return res.status(201).json(newOrder);
  }

  // ORDERS - Get by code
  const orderCodeMatch = url.match(/^\/orders\/code\/(.+)$/);
  if (orderCodeMatch && method === 'GET') {
    const order = db.orders.find(o => o.orderCode === orderCodeMatch[1]);
    if (order) {
      const user = db.users.find(u => u.id === order.userId);
      const itemsWithDetails = order.items.map(item => {
        const product = db.products.find(p => p.id === item.productId);
        return { ...item, name: product ? product.name : 'Produit' };
      });
      return res.json({
        ...order,
        items: itemsWithDetails,
        userName: user ? user.name : 'Client',
        userPhone: user ? user.phone : '',
        userPoints: user ? user.points : 0
      });
    }
    return res.status(404).json({ error: 'Order not found' });
  }

  // ORDERS - Update status
  const orderMatch = url.match(/^\/orders\/(\d+)$/);
  if (orderMatch && method === 'PATCH') {
    const idx = db.orders.findIndex(o => o.id === parseInt(orderMatch[1]));
    if (idx !== -1) {
      db.orders[idx].status = body.status;
      if (body.status === 'completed') {
        db.orders[idx].completedAt = new Date().toISOString();
        if (db.orders[idx].userId) {
          const userIdx = db.users.findIndex(u => u.id === db.orders[idx].userId);
          if (userIdx !== -1) db.users[userIdx].points += db.orders[idx].pointsEarned;
        }
        if (db.orders[idx].usedRewards) {
          db.orders[idx].usedRewards.forEach(rewardId => {
            const rIdx = db.redeemedRewards.findIndex(r => r.id === rewardId);
            if (rIdx !== -1) {
              db.redeemedRewards[rIdx].status = 'used';
              db.redeemedRewards[rIdx].usedAt = new Date().toISOString();
            }
          });
        }
      }
      return res.json(db.orders[idx]);
    }
    return res.status(404).json({ error: 'Order not found' });
  }

  // STATS
  if (url === '/stats' && method === 'GET') {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = db.orders.filter(o => o.createdAt.slice(0, 10) === today);
    return res.json({
      totalOrders: db.orders.length,
      todayOrders: todayOrders.length,
      pendingOrders: db.orders.filter(o => o.status === 'pending').length,
      preparingOrders: db.orders.filter(o => o.status === 'preparing').length,
      readyOrders: db.orders.filter(o => o.status === 'ready').length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
      totalRevenue: db.orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0),
      totalUsers: db.users.filter(u => u.role === 'client').length
    });
  }

  // EVENTS - Get all
  if (url === '/events' && method === 'GET') {
    return res.json(db.events);
  }

  // EVENTS - Create
  if (url === '/events' && method === 'POST') {
    const newEvent = {
      id: db.events.length + 1,
      title: body.title,
      description: body.description || '',
      discount: body.discount,
      startDate: body.startDate,
      endDate: body.endDate,
      image: body.image || null,
      createdAt: new Date().toISOString()
    };
    db.events.push(newEvent);
    return res.status(201).json(newEvent);
  }

  // EVENTS - Delete
  const eventDeleteMatch = url.match(/^\/events\/(\d+)$/);
  if (eventDeleteMatch && method === 'DELETE') {
    const eventId = parseInt(eventDeleteMatch[1]);
    const idx = db.events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      db.events.splice(idx, 1);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Event not found' });
  }

  return res.status(404).json({ error: 'Not found' });
}
