// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', loadProductsFromCart());

// Variable globale pour stocker les produits
let total =0;

function openDB() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 1);
 
    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
            db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cart")) {
         
            db.createObjectStore("cart", { keyPath: "id" });
        }
    };
    
    return dbRequest;
}


// Fonction asynchrone pour charger les produits depuis IndexedDB
function loadProductsFromCart() {
    // 1. Ouvrir la connexion à la base de données
    const dbRequest = openDB();
    
    
    // 3. En cas de succès de l'ouverture
    dbRequest.onsuccess = () => {
            const db = dbRequest.result;
            const transaction = db.transaction(["cart"], "readonly");
            const store = transaction.objectStore("cart");
            const req = store.getAll();

            req.onsuccess = () => {      // Correction : utiliser l'événement onsuccess de la requête
                p = req.result;    // Correction : utiliser request.result
                displayCartItem(p);    // Afficher les produits
            };

            transaction.oncomplete = () => {
                console.log("load products from db");
            };
        };
    
        // 4. Gérer les erreurs
        dbRequest.onerror = (event) => {
            console.error("Erreur de stockage:", open.error);
        };
    }

// Afficher les produits
function displayCartItem(pr) {
    total =0;
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Vider le contenu actuel
    pr.forEach(product => {
        cartContainer.appendChild(createCartItemRow(product));
    });
}



// Créer une carte de produit
function createCartItemRow(item) {
    const template = document.getElementById('cart-item-template');
    const clone = template.content.cloneNode(true);
    
    // Remplir les données
    const row = clone.querySelector('.cart-item');
    const img = row.querySelector('img');
    const name = row.querySelector('.product-name');
    const price = row.querySelector('.product-price');
    const quantity = row.querySelector('.quantity');
    const itemTotal = row.querySelector('.item-total');
   
    // Mettre les données du produit
    img.src = item.image_url;
    img.alt = item.name;
    name.textContent = item.name;
    price.textContent = `${item.price} dh`;
    quantity.textContent = item.quantity;
    itemTotal.textContent = `${item.price * item.quantity} dh`;
    total += (item.price * item.quantity);
    document.getElementById("total-amount").textContent=total;
    // Ajouter les événements
    const decreaseBtn = row.querySelector('.decrease');
    const increaseBtn = row.querySelector('.increase');
    const removeBtn = row.querySelector('.remove-btn');
    
    decreaseBtn.onclick = () => updateQuantity(item.id, item.quantity - 1);
    increaseBtn.onclick = () => updateQuantity(item.id, item.quantity + 1);
    removeBtn.onclick = () => removeFromCart(item.id);
    
    return row;
}

// Fonction pour mettre à jour la quantité d'un produit dans le panier

function updateQuantity(productId, newQuantity) {
    if (newQuantity == 0) {
        return;
    }

    const dbRequest = openDB();
    
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction(["cart"], "readwrite");
        const store = transaction.objectStore("cart");
        
        const itemReq = store.get(productId);
       
        itemReq.onsuccess = () => {
        const item = itemReq.result;     
        item.quantity = newQuantity;
        store.put(item);
        }
        transaction.oncomplete = () => {
            loadProductsFromCart();
        };
    };
}

// Fonction pour supprimer un article du panier
function removeFromCart(productId) {
    console.log("removing"+productId);
    const dbRequest = openDB();
    
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction(["cart"], "readwrite");
        const store = transaction.objectStore("cart");
        
        // Supprimer l'article
        const request = store.delete(productId);
        
        request.onsuccess = () => {
            console.log("Produit supprimé du panier");
            loadProductsFromCart();
        };
        
        request.onerror = () => {
            console.error("Erreur lors de la suppression du produit");
        };
    };
}





