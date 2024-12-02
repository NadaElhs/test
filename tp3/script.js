// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', getProducts());

// Variable globale pour stocker les produits
let products = [];


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



async function getProducts() {
    fetch('https://fake-coffee-api.vercel.app/api')
        .then(response => {  return response.json();  }) 
        .then(data => {
            products = data;
            console.log(products);
            // Stockage dans IndexedDB
            addProductsToDB(products);
            displayProducts(products);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des produits:", error);
            loadProductsFromDB();
            
        });
}

function addProductsToDB(products) {
    const dbRequest = openDB();
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction(["products"], "readwrite"); 
        const store = transaction.objectStore("products"); 
        //  Parcourir et ajouter chaque produit dans l'object store
        products.forEach(product => {
            store.put(product); // Utiliser 'put' pour ajouter ou mettre à jour les produits
        });

        transaction.oncomplete = () => {
            console.log("Produits ajoutés avec succès à IndexedDB.");
        };

        transaction.onerror = (event) => {
            console.error("Erreur lors de l'ajout des produits:", event.target.error);
        };
    };
    dbRequest.onerror = (event) => {
        console.error("Erreur lors de l'ouverture de la base de données:", event.target.error);
    };
}


// Fonction asynchrone pour charger les produits depuis IndexedDB
function loadProductsFromDB() {
    const dbRequest = openDB();
        dbRequest.onsuccess = () => {
            const db = dbRequest.result;
            const transaction = db.transaction(["products"], "readonly");
            const store = transaction.objectStore("products");
            const req = store.getAll(); // récupérer  les produits stockés

            req.onsuccess = () => {      // utiliser l'événement onsuccess de la requête
                products = req.result;    // utiliser request.result
                displayProducts(products);    // Afficher les produits
            };

            transaction.oncomplete = () => {
                
                console.log("load products from db");
            };
        };
        dbRequest.onerror = (event) => {
            console.error("Erreur de stockage:", open.error);
        };
    }

// Fonction simple pour ajouter au panier
function addToCart(productId) {
    const dbReq = openDB();
    
    dbReq.onsuccess = () => {
        const db = dbReq.result;
        const transaction = db.transaction(["cart"], "readwrite");
        const store = transaction.objectStore("cart");
        
            let product_detail= products.find(p => p.id == productId);

            // Créer l'objet à stocker dans le panier
            const cartItem = {
                id: productId,
                image_url: product_detail.image_url,
                name:product_detail.name,
                price: product_detail.price,
                quantity: 1
            };
            
            // Ajouter au panier
            store.put(cartItem);
            
            transaction.oncomplete = () => {
                console.log("Produit ajouté au panier");
            };
        
    };
    
    dbReq.onerror = () => {
        console.error("Erreur d'ajout au panier");
    };
}






// Créer une carte de produit
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.title}"  >
        <h3>${product.name}</h3>
        <div class="product-info">
        <h4 class="price">${product.price}dh </h4>
        <p class="description">${product.description}</p>
        <button onclick="addToCart('${product.id}')" class="add-to-cart">+</button>
        </div>
    `;
    return card;
}

// Afficher les produits
function displayProducts(products) {
    const grid = document.querySelector('.product-content');
    grid.innerHTML = '';
    products.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}


// Mode view
const container = document.querySelector('.product-content');
const gridIcon = document.getElementById('grid');
const listIcon = document.getElementById('list');

// Fonction pour passer en vue grille
function setGridView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.flexWrap = 'wrap';
    container.style.gap = '20px';
    container.style.justifyContent = 'flex-start';
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.maxWidth = '300px';
    });


}

// Fonction pour passer en vue liste
function setListView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    
    document.querySelectorAll('.product-card').forEach(card => {
        
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.maxWidth = '100%';
        card.style.alignItems = 'center';
        card.style.gap = '20px';
    });

    document.querySelectorAll('.product-card img ').forEach(img => {
        img.style.maxWidth="200px";
    });
    
    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.style.alignSelf  = 'flex-end';
    });

}

// Ajouter les écouteurs d'événements aux icônes
gridIcon.addEventListener('click', setGridView);
listIcon.addEventListener('click', setListView);

// Initialiser la vue par défaut (grille)
setGridView();




// Fonction pour filtrer les produits
function filterProducts() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
    );
    displayProducts(filteredProducts);
}

// Écouteur d'événement pour le champ de recherche
document.getElementById('search-input').addEventListener('input', filterProducts);




