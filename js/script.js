$(function () {
  $("#navbarToggle").blur(function () {
    if (window.innerWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });
});

(function (global) {
  var dc = {};

  // Use local paths - adjust these to match your file structure
  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl = "data/categories.json"; // You need to create this
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl = "data/menu_items_"; // Base URL for menu items
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Insert HTML
  function insertHtml(selector, html) {
    var targetElem = document.querySelector(selector);
    if (targetElem) {
      targetElem.innerHTML = html;
    }
  }

  function showLoading(selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  }

  function insertProperty(string, propName, propValue) {
    if (!propValue) propValue = "";
    var propToReplace = "{{" + propName + "}}";
    return string.replace(new RegExp(propToReplace, "g"), propValue);
  }

  function switchMenuToActive() {
    // Remove active from home button
    var homeBtn = document.querySelector("#navHomeButton");
    if (homeBtn) {
      homeBtn.className = homeBtn.className.replace(/active/g, "");
    }
    
    // Add active to menu button
    var menuBtn = document.querySelector("#navMenuButton");
    if (menuBtn && menuBtn.className.indexOf("active") === -1) {
      menuBtn.className += " active";
    }
  }

  // Initialize on page load
  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtmlUrl,
      function (homeHtml) {
        insertHtml("#main-content", homeHtml);
      },
      false
    );
  });

  // Load menu categories when Menu button is clicked
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      function (categories) {
        buildAndShowCategoriesHTML(categories);
      },
      true // Parse JSON
    );
  };

  // Load menu items for a specific category
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + ".json",
      function (menuItems) {
        buildAndShowMenuItemsHTML(menuItems);
      },
      true // Parse JSON
    );
  };

  function buildAndShowCategoriesHTML(categories) {
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (titleHtml) {
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            switchMenuToActive();
            var categoriesViewHtml = 
              titleHtml +
              '<section class="row">';
            
            // Loop through categories
            for (var i = 0; i < categories.length; i++) {
              var html = categoryHtml;
              var name = "" + categories[i].name;
              var short_name = categories[i].short_name;
              
              html = insertProperty(html, "name", name);
              html = insertProperty(html, "short_name", short_name);
              categoriesViewHtml += html;
            }
            
            categoriesViewHtml += "</section>";
            insertHtml("#main-content", categoriesViewHtml);
          },
          false // Don't parse as JSON
        );
      },
      false // Don't parse as JSON
    );
  }

  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (titleHtml) {
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (itemHtml) {
            switchMenuToActive();
            var menuItemsViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              titleHtml,
              itemHtml
            );
            insertHtml("#main-content", menuItemsViewHtml);
          },
          false // Don't parse as JSON
        );
      },
      false // Don't parse as JSON
    );
  }

  function buildMenuItemsViewHtml(categoryMenuItems, titleHtml, itemHtml) {
    titleHtml = insertProperty(
      titleHtml,
      "name",
      categoryMenuItems.category.name
    );
    titleHtml = insertProperty(
      titleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions || ""
    );

    var finalHtml = titleHtml + '<section class="row">';
    var items = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;

    for (var i = 0; i < items.length; i++) {
      var html = itemHtml;
      html = insertProperty(html, "short_name", items[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", items[i].price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        items[i].small_portion_name
      );
      html = insertItemPrice(html, "price_large", items[i].price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        items[i].large_portion_name
      );
      html = insertProperty(html, "name", items[i].name);
      html = insertProperty(html, "description", items[i].description);

      // Add clearfix after every other item for medium and large screens
      if (i % 2 !== 0) {
        html += 
          '<div class="clearfix visible-lg-block visible-md-block"></div>';
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  function insertItemPrice(html, propName, price) {
    if (!price) {
      return insertProperty(html, propName, "");
    }
    
    var priceText = "$" + price.toFixed(2);
    return insertProperty(html, propName, priceText);
  }

  function insertItemPortionName(html, propName, portionName) {
    if (!portionName) {
      return insertProperty(html, propName, "");
    }
    
    var portionText = "(" + portionName + ")";
    return insertProperty(html, propName, portionText);
  }

  global.$dc = dc;
})(window);
