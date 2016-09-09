var searchFields = ['name', 'description', 'category'];
var cart = [];
var orders = [];
var customer = {
  shipping: [],
  payment: [],
  login: []
};
var currentOrder = {};

var navbar = document.getElementById("navbar");
navbar.addEventListener('click', function(e) {
  var currentView;
  switch (e.target.id) {
    case 'brand':
      searchBar.value = '';
      swap('view', 'view-home');
      break;
    case 'search-btn':
      if(e.target.value) {
        clear('search-content');
        var results = search(products, searchFields, e.target.value);
        currentView = view(results, 'view-search').id;
        swap('view', currentView);
      }
      break;
    case 'cart-btn':
      clear('cart-content');
      var aside = document.getElementById('cart-aside');
      if (aside.classList.contains('hidden')){
        aside.classList.remove('hidden');
      }
      currentView = view(cart, 'view-cart').id;
      swap('view', currentView);
      break;
    case 'hist-btn':
      clear('history-content');
      currentView = view(orders, 'view-history').id;
      swap('view', currentView);
      break;
      default:
  }
});

var searchBar = document.getElementById('search-bar');
searchBar.addEventListener('keyup', function(e) {
  if (e.target.value && e.which === 13 || e.keyCode === 13) {
    clear('search-content');
    var results = search(products, searchFields, e.target.value);
    var currentView = view(results, 'view-search').id;
    swap('view', currentView);
  }
})

var searchView = document.getElementById('view-search');
searchView.addEventListener('click', function(e) {
  clear('product-content');
  for (var i=0; i<products.length; i++) {
    if (e.target.getAttribute('data-id') === products[i].id) {
      var currentView = view(products[i], 'view-product').id;
      swap('view', currentView)
    }
  }
})

var productView = document.getElementById('view-product');
productView.addEventListener('click', function(e) {
  for (var i=0; i<products.length; i++) {
    if (e.target.getAttribute('data-id') === products[i].id) {
      toCart(products[i]);
    }
  }
})

var cartView = document.getElementById('view-cart');
cartView.addEventListener('change', function(e) {
  for (var i=0; i<cart.length; i++) {
    if (e.target.getAttribute('data-quant-id') === cart[i].id) {
      cart[i].quantity = e.target.value;
      var subtotal = document.getElementById('cart-sub-value');
      subtotal.textContent = priceFormat(calculate(cart));
    }
  }
})
cartView.addEventListener('click', function(e) {
  for (var i=0; i<cart.length; i++) {
    if (e.target.getAttribute('data-remove-id') === cart[i].id) {
          cart.splice(i, 1);
          clear('cart-content');
          view(cart, 'view-cart');
    }
  }
  if (e.target.id === 'cart-sub-btn') {
    clear('summary-content');
    var currentView = view(cart, 'view-checkout').id;
    swap('view', currentView);
  }
})

var checkoutView = document.getElementById('view-checkout');
checkoutView.addEventListener('blur', function(e) {
  validate(e.target);
}, true);

checkoutView.addEventListener('change', function(e) {
  if (e.target.id === 'billing-checkbox') {
    var sources = $( '#shipping-form').find('input[name]');
    var targets = $( e.target.form ).find('input[name]');
    for (var i=0; i<targets.length; i++) {
      for (var k=0; k<sources.length; k++) {
        if (targets[i].getAttribute('name') === sources[k].getAttribute('name')) {
          if (e.target.checked) {
            $( targets[i] ).val($( sources[k] ).val());
          }
          else {
            $( targets[i] ).val("");
          }
        }
      }
    }
  }
});

checkoutView.addEventListener('click', function(e) {
  switch (e.target.id) {
    case 'ship-submit':
      if (e.target.form.checkValidity()) {
        e.preventDefault();
        currentOrder.shipping = (save(e.target.form.id, 'name'));
        var $elSummary;
        for (var prop in currentOrder.shipping) {
            $elSummary = $('<div>');
            $elSummary.text(currentOrder.shipping[prop]);
            if (prop === 'city' ) {
              $elSummary.addClass('inline-div');
              $elSummary.append(',');
            }
            else if (prop === 'state' || prop === 'zip') {
              $elSummary.addClass('inline-div');
            }
            $elSummary.appendTo($('#shipping-summary'));
        }
        toggle(['shipping-summary', 'shipping-update', 'shipping-form']);
      }
      break;
    case 'pay-submit':
      if (e.target.form.checkValidity()) {
        currentOrder.payment = (save(e.target.form.id, 'name'));
        e.preventDefault();
        var $elSummary = $('<div>');
        $elSummary.text('Payment information has been saved')
        $elSummary.appendTo($('#payment-summary'));
        toggle(['payment-summary', 'payment-update', 'payment-form']);
      }
      break;
    case 'shipping-update':
      clear('shipping-summary');
      toggle(['shipping-summary', 'shipping-update', 'shipping-form']);
      break;
    case 'payment-update':
      clear('payment-summary');
      toggle(['payment-summary', 'payment-update', 'payment-form']);
      break;
    case 'order-btn':
      var shipping = document.getElementById('shipping-form');
      var payment = document.getElementById('payment-form');
      if (shipping.checkValidity() && payment.checkValidity()) {
        ordered();
        cart = [];
        var $orderMsg = $('<div>').addClass('order-confirmation').text('Order has been placed successfully');
        $orderMsg.appendTo($('checkout-summary'));
      }
      break;
    default:
  }
});

function save(source, property) {
  var form = {};
  var $inputs = $( '#' + source ).find('input[name]');
  for (var i=0; i<$inputs.length; i++) {
    var key = $inputs[i].getAttribute(property);
    var value = $inputs[i].value;
    form[key] = value;
  }
  return form;
}

function validate(element) {
  if (!element.checkValidity()) {
    if(!element.classList.contains('form-input-invalid')) {
      element.classList.add('form-input-invalid');
    }
  }
  else {
    if (element.classList.contains('form-input-invalid')) {
      element.classList.remove('form-input-invalid');
    }
  }
}

function search(products, fields, criteria) {
  var matches = [];
  var added;
  for (var i=0; i<products.length; i++) {
    added = false;
    for (var k=0; k<fields.length; k++) {
      if (products[i][fields[k]].toLowerCase().indexOf(criteria.toLowerCase()) === -1) {
        continue;
      } else {
        if (added) {
          continue;
        } else {
          matches.push(products[i])
          added = true;
        }
      }
    }
  }
  return matches;
}

function toCart(product) {
  if (cart.length === 0) {
    cart.push(product);
    cart[0].quantity = 1;
  }
  else {
    var found = false;
    for (var i=0; i<cart.length; i++) {
      if (product.id === cart[i].id) {
        found = true;
        cart[i].quantity++;
        break;
      }
    }
    if(!found) {
      cart.push(product);
      cart[cart.length - 1].quantity = 1;
    }
  }
}

function element(tagname, classes, text, attribute) {
  var el = document.createElement(tagname);
  if(typeof classes === 'object') {
    for (var i=0; i<classes.length; i++) {
      el.classList.add(classes[i]);
    }
  }
  else if (classes) {
    el.classList.add(classes);
  }
  if(text) {
    el.textContent = text;
  }
  if(attribute) {
    el.setAttribute(attribute[0], attribute[1]);
  }
  return el;
}

function view(items, view) {
  var elItems = create(items, view);
  var elView = document.getElementById(view)
  var elContent = $( 'div[id=' + view + ']' ).find('.main')[0];
  switch (view) {
    case 'view-home':
      break;
    case 'view-search':
      var count = document.getElementById('result-count');
      count.textContent = elItems.length;
      break;
    case 'view-product':
      break;
    case 'view-cart':
      if(cart.length === 0) {
        var aside = document.getElementById('cart-aside')
        aside.classList.add('hidden');
        var empty = element('div', 'empty-message', 'Your Cart is Currently Empty');
        elContent.appendChild(empty);
      }
      else {
        var title = element('div','', 'Shopping Cart', ['id', 'cart-title']);
        elContent.appendChild(title);
        var subtotal = document.getElementById('cart-sub-value');
        subtotal.textContent = priceFormat(calculate(cart));
        break;
      }
      break;
    case 'view-checkout':
      var itemsTotal = calculate(cart);
      var taxTotal = itemsTotal * 8 / 100;
      var itemsValue = document.getElementById('summary-items-value');
      itemsValue.textContent = priceFormat(itemsTotal);
      var taxValue = document.getElementById('summary-tax-value');
      taxValue.textContent = priceFormat(taxTotal);
      var totalValue = document.getElementById('summary-total-value');
      totalValue.textContent = priceFormat(itemsTotal + taxTotal);
      break;
    case 'view-history':
      elContent.appendChild(element('div', 'hist-title', 'Order History'));
      break;
    default:
  }
  append(elContent, elItems);
  return elView;
}

function create(items, view) {
  var img;
  var name;
  var price;
  var descrip;
  var elItems = [];
  var elItem;
  if (Array.isArray(items)) {
    for (var i=0; i<items.length; i++) {
      if(view === 'view-search' || view === 'view-cart' || view === 'view-checkout') {
        img = element('img', '', '', ['src', items[i].img]);
        name = element('div', '', items[i].name);
        price = element('div', '', priceFormat(items[i].price));
        descrip = element('div', '', items[i].description);
        switch (view) {
          // case 'view-home':
          //   break;
          case 'view-search':
            img.classList.add('result-img');
            name.classList.add('result-name');
            name.setAttribute('data-id', items[i].id);
            price.classList.add('result-price');
            var resultText = element('div', 'result-text');
            append(resultText, [name, price]);
            elItem = element('div', 'result');
            append(elItem, [img, resultText]);
            break;
          case 'view-cart':
            img.classList.add('cart-img');
            name.classList.add('cart-name');
            price.classList.add('cart-price');
            var cartText = element('div', 'cart-text');
            append(cartText, [name, price]);
            var quantLabel = element('div', 'quant-label', 'Quantity');
            var quantSection = element('div', 'inline-div');
            append(quantSection, [quantLabel, quantBtn(items[i]), removeBtn(items[i])])
            elItem = element('div', 'cart-item');
            append(elItem, [img, cartText, quantSection]);
            break;
          case 'view-checkout':
            img.classList.add('review-img');
            name.classList.add('review-name');
            price.classList.add('review-price');
            var quantity = element('div', 'review-quant', 'Quantity: ' + cart[i].quantity);
            var reviewText = element('div','review-text');
            append(reviewText, [name, price, quantity]);
            var subLabel = element('span','', 'Subtotal: ');
            var subValue = element('span', 'review-sub-value', priceFormat(cart[i].quantity * cart[i].price));
            var sub = element('div', 'review-sub');
            append(sub, [subLabel, subValue])
            elItem = element('div', 'review');
            append(elItem, [img, reviewText, sub]);
            break;
          default:
        }
        elItems.push(elItem);
      }
      //history view uses an array of order objects with different properties than those above
      else {
        elItem = element('div', ['hist-order', 'col-md-9'], '');
        var date = element('div', 'hist-date');
        append(date, [
          element('div', 'hist-date-label', 'Order Submitted:'),
          element('div', 'hist-date-content', items[i].submitted.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}))
        ]);
        var total = element('div', 'hist-total');
        append(total, [
          element('div', 'hist-total-label', 'Total:'),
          element('div', 'hist-total-content',
          priceFormat(items[i].total)),
        ]);
        var summary = element('div', 'hist-summary');
        append(summary, [date, total]);
        append(elItem, summary);
        for (var k=0; k<items[i].contents.length; k++) {
          var item = element('div', 'hist-item');
          append(item, element('img', 'hist-item-img', '', ['src', items[i].contents[k].img]));
          var text = element('div', 'hist-item-text');
          append(text, [
            element('div', 'hist-item-name', items[i].contents[k].name),
            element('div', 'hist-item-price', priceFormat(items[i].contents[k].price))
          ]);
          append(item, text);
          append(elItem, item);
        }
        elItems.push(elItem);
      }
    }
    return elItems;
  }
  //product view only uses one object
  else {
    img = element('img', 'product-img', '', ['src', items.img]);
    name = element('div', 'product-name', items.name);
    price = element('div', 'product-price', priceFormat(items.price));
    descrip = element('div', 'product-descr', items.description);
    var cartBtn = element('button', 'add-cart-btn', 'Add to Cart', ['data-id', items.id]);
    var prodDetail = element('div', 'product-detail');
    append(prodDetail, [name, price, descrip, cartBtn]);
    elItem = element('div', 'product-item');
    append(elItem, [img, prodDetail]);
    return elItem;
  }
}

function append(parent, children) {
  if(Array.isArray(children)) {
    for (var i=0; i<children.length; i++) {
      parent.appendChild(children[i]);
    }
  }
  else {
    parent.appendChild(children);
  }
}

function clear(view) {
  var elView = document.getElementById(view);
   while(elView.firstChild) {
    elView.removeChild(elView.firstChild);
  }
}

function swap(attribute, view) {
  var elViews = document.getElementsByClassName(attribute);
  var nextView = document.getElementById(view);
  // if (elViews.length > 0) {
    for (var i=0; i<elViews.length; i++) {
      elViews[i].classList.remove('active');
      elViews[i].classList.add('hidden');
    }
    nextView.classList.remove('hidden');
    nextView.classList.add('active');
  // }
}

function toggle(attribute) {
  var $elView;
  if (Array.isArray(attribute)) {
    for (var i=0; i<attribute.length; i++) {
      $elView = $('#' + attribute[i]);
      if ($elView.hasClass('hidden')) {
        $elView.removeClass('hidden');
      }
      else {
        $elView.addClass('hidden');
      }
    }
  }
  else {
    $elView = $('#' + attribute);
    if ($elView.hasClass('hidden')) {
      $elView.removeClass('hidden');
    }
    else {
      $elView.addClass('hidden');
    }
  }
}

function priceFormat(num) {
  var numFormat = num.toLocaleString('en-US',{style: 'currency', currency: 'USD'});
  return numFormat;
}

function calculate(products) {
  var total = 0;
  for (var i=0; i<products.length; i++) {
    total += products[i].quantity * products[i].price * 100;
  }
  return total / 100;
}

function removeBtn(obj) {
  var remove = element('div', 'remove-btn', 'Remove');
  remove.setAttribute('data-remove-id', obj.id);
  return remove;
}

function quantBtn(item) {
  var quant = document.createElement('select');
  quant.classList.add('quant-btn');
  quant.setAttribute('value', item.quantity);
  quant.setAttribute('data-quant-id', item.id);
  for (var i=1; i<=10; i++) {
    var theOption = document.createElement('option');
    theOption.setAttribute('value', i);
    theOption.textContent = i;
    if (theOption.textContent === item.quantity.toString()) {
      theOption.setAttribute('selected', 'selected');
    }
    quant.appendChild(theOption);
  }
  return quant;
}

function ordered() {
  currentOrder.total = 0;
  currentOrder.submitted = new Date();
  currentOrder.contents = [];
  for (var i=0; i<cart.length; i++) {
    currentOrder.contents.push(cart[i]);
    currentOrder.total += (cart[i].quantity * cart[i].price);
  }
  currentOrder.customer = customer;
  orders.push(currentOrder);
}
